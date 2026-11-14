import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
export default function AuditDecision({ row, onClose, onSave }) {
  const [decision, setDecision] = useState(row.decision);
  const [note, setNote] = useState(row.note);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const save = async () => { setSaving(true); setError(''); try { await onSave({tool_key:row.key, decision, note}); onClose(); } catch { setError('Could not save this decision. Please try again.'); } finally { setSaving(false); } };
  return <Dialog open onOpenChange={v => !v && !saving && onClose()}><DialogContent><DialogHeader><DialogTitle>{row.label}</DialogTitle></DialogHeader><p className="text-sm text-muted-foreground">{row.audit} Review decisions are planning notes; they do not publish new tools or change live access.</p><label className="text-sm">Decision<select className="block w-full bg-card border border-border rounded-lg p-3 mt-2" value={decision} onChange={e => setDecision(e.target.value)}>{['keep','review','planned','removed'].map(d => <option key={d}>{d}</option>)}</select></label><label className="text-sm">Owner notes<Textarea value={note} maxLength={3000} onChange={e => setNote(e.target.value)}/></label>{error && <p role="alert" className="text-destructive text-sm">{error}</p>}<Button disabled={saving} onClick={save}>{saving ? 'Saving…' : 'Save review decision'}</Button></DialogContent></Dialog>;
}