import { useState, useEffect } from 'react';
import { Heart, Pencil } from 'lucide-react';

export default function GoalWhyCard({ motivation, saving, onSave }) {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(motivation || '');
  useEffect(() => { setText(motivation || ''); }, [motivation]);

  const submit = async () => { await onSave({ motivation: text.trim() }); setEditing(false); };

  return (
    <div className="rounded-2xl border border-pink-400/20 bg-gradient-to-br from-pink-500/[0.08] to-transparent p-5 text-white">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-pink-500/15 flex items-center justify-center"><Heart className="w-4 h-4 text-pink-300" /></div>
          <h3 className="text-sm font-heading font-semibold">Why this matters to me</h3>
        </div>
        {!editing && motivation && (
          <button onClick={() => setEditing(true)} className="text-xs text-white/50 hover:text-white flex items-center gap-1"><Pencil className="w-3 h-3" /> Edit</button>
        )}
      </div>
      {editing || !motivation ? (
        <div className="space-y-3">
          <textarea value={text} onChange={e => setText(e.target.value)} maxLength={500} rows={3} placeholder="Picture the moment you hit this goal. What does it unlock for you?" className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3 text-sm placeholder:text-white/30 focus:outline-none focus:border-pink-300/60 resize-none" />
          <button onClick={submit} disabled={saving || !text.trim()} className="px-4 py-2 rounded-xl bg-pink-400 text-black text-xs font-semibold hover:bg-pink-300 transition-colors disabled:opacity-50">{saving ? 'Saving…' : 'Save my why'}</button>
        </div>
      ) : (
        <p className="text-base leading-relaxed text-white/85 italic">“{motivation}”</p>
      )}
    </div>
  );
}