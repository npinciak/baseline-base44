import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { EDITS, EXTRA_SCREENS, NEW_UNITS } from './curriculumContent.ts';
import { LESSON_REWARD } from '../../shared/coinEconomy.ts';

// Convert a Lexical JSON string to plain HTML
function lexicalToHtml(raw: string | null | undefined): string {
  if (!raw) return '';
  let parsed: any;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return raw;
  }
  if (!parsed?.root?.children) return raw;

  function nodeToHtml(node: any): string {
    if (!node) return '';
    if (node.type === 'text') {
      let t = node.text || '';
      // Lexical format bitmask: 1=bold, 2=italic, 4=strikethrough, 8=underline, 16=code
      if (node.format & 1) t = `<strong>${t}</strong>`;
      if (node.format & 2) t = `<em>${t}</em>`;
      if (node.format & 8) t = `<u>${t}</u>`;
      if (node.format & 4) t = `<s>${t}</s>`;
      if (node.format & 16) t = `<code>${t}</code>`;
      return t;
    }
    if (node.type === 'linebreak') return '<br>';
    if (node.type === 'link') {
      const url = node.fields?.url || node.url || '#';
      const children = (node.children || []).map(nodeToHtml).join('');
      return `<a href="${url}" target="_blank" rel="noopener noreferrer">${children}</a>`;
    }
    const children = (node.children || []).map(nodeToHtml).join('');
    switch (node.type) {
      case 'heading': return `<h${node.tag?.replace('h','') || 2}>${children}</h${node.tag?.replace('h','') || 2}>`;
      case 'list': return node.listType === 'number' ? `<ol>${children}</ol>` : `<ul>${children}</ul>`;
      case 'listitem': return `<li>${children}</li>`;
      case 'quote': return `<blockquote>${children}</blockquote>`;
      case 'paragraph': return `<p>${children}</p>`;
      default: return children;
    }
  }

  try {
    return (parsed.root.children || []).map(nodeToHtml).join('');
  } catch {
    return raw;
  }
}

function toScreen(c: any, unitId: string) {
  return {
    id: String(c.id),
    module_id: unitId,
    title: c.title || 'Untitled',
    lesson_type: c.content_type === 'question' ? 'quiz' : c.content_type === 'key_takeaway' ? 'flashcard' : 'text',
    content_type: c.content_type,
    text_content: lexicalToHtml(c.text_content),
    text_cta: c.text_cta || 'Next',
    question_prompt: lexicalToHtml(c.question_prompt),
    correct_answer: c.correct_answer,
    explanation: lexicalToHtml(c.explanation),
    takeaway_text: lexicalToHtml(c.takeaway_text),
    takeaway_icon: c.takeaway_icon,
    xp_reward: c.points || 5,
    order_index: c.order_position || 0,
    is_published: true,
  };
}

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const paras = (v: string | string[]) => [].concat(v as any).map((t: string) => `<p>${esc(t)}</p>`).join('');
const parseChoices = (list: string[]) => ({
  options: list.map(c => c.replace(/^\*/, '')),
  correct: (list.find(c => c.startsWith('*')) || '').slice(1),
});

// Apply audited copy and attach real answer choices (CMS choices unless the edit replaces them).
function applyEdit(screen: any, edit: any, cmsChoices: any[] = []) {
  const s = { ...screen };
  if (s.content_type === 'question') {
    if (edit?.choices) {
      const { options, correct } = parseChoices(edit.choices);
      s.options = options; s.correct_answer = correct;
    } else if (cmsChoices.length) {
      s.options = cmsChoices.map(c => c.text);
      s.correct_answer = cmsChoices.find(c => c.is_correct)?.text ?? s.correct_answer;
    }
  }
  if (!edit) return s;
  if (edit.title) s.title = edit.title;
  if (edit.text) s.text_content = paras(edit.text);
  if (edit.q) s.question_prompt = paras(edit.q);
  if (edit.e) s.explanation = paras(edit.e);
  if (edit.k) s.takeaway_text = paras(edit.k);
  return s;
}

// Build a screen that doesn't exist in the CMS from a spec in curriculumContent.
function fromSpec(spec: any, id: string, unitId: string) {
  const content_type = spec.type === 'question' ? 'question' : spec.type === 'takeaway' ? 'key_takeaway' : 'text_card';
  const base = toScreen({ id, title: spec.title, content_type, points: content_type === 'question' ? 100 : content_type === 'text_card' ? 1 : 5, takeaway_icon: 'lightbulb' }, unitId);
  return applyEdit({ ...base, question_type: content_type === 'question' ? 'multiple_choice' : null }, spec);
}

// Returns one "module" per lesson unit: a text card plus the question and takeaway that follow it.
// Chapter grouping and order live in the app's curriculum map.
export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const headers = {
      'apikey': serviceKey,
      'Authorization': `Bearer ${serviceKey}`,
      'Accept-Profile': 'payload_cms',
      'Content-Type': 'application/json',
    };

    const [contents, choices] = await Promise.all([
      fetch(`${supabaseUrl}/rest/v1/lesson_contents?order=id.asc`, { headers, signal: AbortSignal.timeout(15000) }).then(r => r.json()),
      fetch(`${supabaseUrl}/rest/v1/lesson_contents_choices?order=_parent_id.asc,_order.asc`, { headers, signal: AbortSignal.timeout(15000) }).then(r => r.json()),
    ]);
    if (!Array.isArray(contents)) return Response.json({ modules: [] });
    const choicesByParent: Record<string, any[]> = {};
    for (const ch of Array.isArray(choices) ? choices : []) (choicesByParent[ch._parent_id] ||= []).push(ch);

    // Group every screen under the nearest preceding text card. The whole audited curriculum is live,
    // so draft status in the CMS no longer hides a unit.
    const units: { head: any; items: any[] }[] = [];
    for (const c of contents) {
      if (c.content_type === 'text_card') units.push({ head: c, items: [] });
      if (units.length) units[units.length - 1].items.push(c);
    }

    const cmsModules = units.map(({ head, items }) => {
      const unitId = String(head.id);
      const screens = items.map(c => applyEdit(toScreen(c, unitId), EDITS[c.id], choicesByParent[c.id]));
      (EXTRA_SCREENS[head.id] || []).forEach((s, i) => screens.push(fromSpec(s, `${unitId}-x${i + 1}`, unitId)));
      return {
        id: unitId,
        title: EDITS[head.id]?.title || head.title || 'Untitled Lesson',
        lessons: screens,
      };
    });
    const newModules = NEW_UNITS.map(u => ({
      id: u.id,
      title: u.title,
      lessons: [
        fromSpec({ type: 'text', title: u.title, text: u.text }, `${u.id}-1`, u.id),
        fromSpec({ type: 'question', title: `${u.title} Quiz`, q: u.q, choices: u.choices, e: u.e }, `${u.id}-2`, u.id),
        fromSpec({ type: 'takeaway', title: `${u.title} - Key Takeaway`, k: u.k }, `${u.id}-3`, u.id),
      ],
    }));

    const modules = [...cmsModules, ...newModules].map((m, idx) => ({
      ...m,
      description: '',
      order_index: idx,
      xp_reward: LESSON_REWARD,
      is_published: true,
    }));

    return Response.json({ modules });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}