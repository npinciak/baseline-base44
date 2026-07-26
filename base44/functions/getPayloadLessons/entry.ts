import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

// Map lesson code -> topic_tag + difficulty for WindingLearningPath visuals
const CODE_MAP = {
  // Budgeting
  'budget_101': { topic_tag: 'budgeting', difficulty: 'beginner' },
  'budget_201': { topic_tag: 'budgeting', difficulty: 'intermediate' },
  'budget_301': { topic_tag: 'budgeting', difficulty: 'advanced' },
  // Investing
  'invest_101': { topic_tag: 'investing', difficulty: 'beginner' },
  'invest_201': { topic_tag: 'investing', difficulty: 'intermediate' },
  'invest_301': { topic_tag: 'investing', difficulty: 'advanced' },
  // Credit
  'credit_101': { topic_tag: 'credit', difficulty: 'beginner' },
  'credit_201': { topic_tag: 'credit', difficulty: 'intermediate' },
  // Saving
  'saving_101': { topic_tag: 'saving', difficulty: 'beginner' },
  'saving_201': { topic_tag: 'saving', difficulty: 'intermediate' },
  // Debt
  'debt_101': { topic_tag: 'debt', difficulty: 'beginner' },
  'debt_201': { topic_tag: 'debt', difficulty: 'intermediate' },
  // Taxes
  'tax_101': { topic_tag: 'taxes', difficulty: 'beginner' },
  'tax_201': { topic_tag: 'taxes', difficulty: 'intermediate' },
  // Insurance
  'insurance_101': { topic_tag: 'insurance', difficulty: 'beginner' },
  // Retirement
  'retire_101': { topic_tag: 'retirement', difficulty: 'beginner' },
  'retire_201': { topic_tag: 'retirement', difficulty: 'intermediate' },
};

function mapCode(code) {
  if (code && CODE_MAP[code]) return CODE_MAP[code];
  // Try prefix matching (e.g. 'budget_' prefix)
  if (code) {
    const prefix = code.split('_')[0];
    const tagMap = {
      budget: 'budgeting', invest: 'investing', credit: 'credit',
      saving: 'saving', save: 'saving', debt: 'debt', tax: 'taxes',
      insurance: 'insurance', retire: 'retirement',
    };
    if (tagMap[prefix]) {
      return { topic_tag: tagMap[prefix], difficulty: 'beginner' };
    }
  }
  return { topic_tag: 'budgeting', difficulty: 'beginner' };
}

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

    // Fetch all published lessons ordered by order_position
    const lessonsRes = await fetch(
      `${supabaseUrl}/rest/v1/lessons?status=eq.published&order=order_position.asc`,
      { headers }
    );
    const lessons = await lessonsRes.json();

    if (!Array.isArray(lessons) || lessons.length === 0) {
      return Response.json({ modules: [] });
    }

    // Fetch lessons_rels + lesson_contents for all lessons in one query
    const lessonIds = lessons.map(l => l.id).join(',');
    const relsRes = await fetch(
      `${supabaseUrl}/rest/v1/lessons_rels?parent_id=in.(${lessonIds})&select=parent_id,order,lesson_contents_id&order=order.asc`,
      { headers }
    );
    const rels = await relsRes.json();

    // Fetch all referenced lesson_contents that are published
    const contentIds = [...new Set((rels || []).map(r => r.lesson_contents_id).filter(Boolean))];
    let contentsMap = {};

    if (contentIds.length > 0) {
      const contentsRes = await fetch(
        `${supabaseUrl}/rest/v1/lesson_contents?id=in.(${contentIds.join(',')})&status=eq.published`,
        { headers }
      );
      const contents = await contentsRes.json();
      if (Array.isArray(contents)) {
        contents.forEach(c => { contentsMap[c.id] = c; });
      }
    }

    // Build module objects with embedded lessons array
    const modules = lessons.map((lesson, idx) => {
      const { topic_tag, difficulty } = mapCode(lesson.code);

      // Get content blocks for this lesson, ordered by rels.order
      const lessonRels = (rels || []).filter(r => r.parent_id === lesson.id);
      const contentBlocks = lessonRels
        .map(r => contentsMap[r.lesson_contents_id])
        .filter(Boolean);

      return {
        id: String(lesson.id),
        title: lesson.title || 'Untitled Lesson',
        description: lesson.description || '',
        topic_tag,
        difficulty,
        order_index: lesson.order_position || idx,
        xp_reward: contentBlocks.reduce((sum, c) => sum + (c.points || 5), 0) || 100,
        is_published: true,
        lessons: contentBlocks.map(c => ({
          id: String(c.id),
          module_id: String(lesson.id),
          title: c.title || 'Untitled',
          lesson_type: c.content_type === 'question' ? 'quiz' : c.content_type === 'key_takeaway' ? 'flashcard' : 'text',
          content_type: c.content_type,
          // text_card fields
          text_content: c.text_content,
          text_cta: c.text_cta || 'Next',
          // question fields
          question_prompt: c.question_prompt,
          correct_answer: c.correct_answer,
          explanation: c.explanation,
          // key_takeaway fields
          takeaway_text: c.takeaway_text,
          takeaway_icon: c.takeaway_icon,
          // shared
          xp_reward: c.points || 5,
          order_index: c.order_position || 0,
          is_published: true,
        })),
      };
    });

    return Response.json({ modules });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}