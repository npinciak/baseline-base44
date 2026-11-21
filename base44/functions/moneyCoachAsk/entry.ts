import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';

const MAX_QUESTION = 500;
const MAX_HISTORY = 2000;
const MAX_CONTEXT = 20000;

// Answers one Money Coach question. The prompt, model and output shape live here so the
// browser can never call the AI service directly or change what it is asked.
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch((e) => (e.status === 401 ? null : Promise.reject(e)));
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const question = String(body?.question ?? '').trim();
    if (!question) return Response.json({ error: 'question is required' }, { status: 400 });
    if (question.length > MAX_QUESTION) return Response.json({ error: 'Question is too long' }, { status: 400 });

    const history = String(body?.history ?? '').slice(0, MAX_HISTORY);
    const context = JSON.stringify(body?.context ?? {}).slice(0, MAX_CONTEXT);
    const isSample = body?.isSample === true;

    const prompt = `You are Baseline's Money Coach for students and young adults. Answer the question using ONLY the context below.
Rules: be friendly and brief (under 100 words). Cite specific numbers or transactions from the context as evidence.
Clearly separate what the data shows from estimates. If the context does not contain enough information, say so plainly.
Never recommend specific investments, never claim to move money or change accounts, and never invent transactions.
${isSample ? 'This is SAMPLE data, mention that once.' : ''}
Also suggest 2 short follow-up questions (under 8 words each) the user might ask next.
Conversation so far:
${history || '(none)'}
Context (JSON): ${context}
Question: ${question}`;

    const res = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: 'object',
        properties: { answer: { type: 'string' }, follow_ups: { type: 'array', items: { type: 'string' } } },
        required: ['answer'],
      },
    });

    return Response.json({
      answer: String(res?.answer ?? ''),
      follow_ups: Array.isArray(res?.follow_ups) ? res.follow_ups.slice(0, 2) : [],
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}