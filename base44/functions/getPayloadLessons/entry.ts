import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

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

    const res = await fetch(`${supabaseUrl}/rest/v1/lesson_contents?order=id.asc`, { headers });
    const contents = await res.json();
    if (!Array.isArray(contents)) return Response.json({ modules: [] });

    // Group every screen under the nearest preceding text card (regardless of status),
    // then keep only published screens of units whose text card is published.
    const units: { head: any; items: any[] }[] = [];
    for (const c of contents) {
      if (c.content_type === 'text_card') units.push({ head: c, items: [] });
      if (units.length) units[units.length - 1].items.push(c);
    }

    const modules = units
      .filter(u => u.head.status === 'published')
      .map(({ head, items }, idx) => {
        const unitId = String(head.id);
        const published = items.filter(c => c.status === 'published');
        return {
          id: unitId,
          title: head.title || 'Untitled Lesson',
          description: '',
          order_index: idx,
          xp_reward: published.reduce((sum, c) => sum + (c.points || 5), 0) || 100,
          is_published: true,
          lessons: published.map(c => toScreen(c, unitId)),
        };
      });

    return Response.json({ modules });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}