import { useCallback, useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';

/** The user's own category changes. Bank records are never modified; changes are reversible. */
export default function useCategoryOverrides() {
  const [active, setActive] = useState([]);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const me = await base44.auth.me();
    const page = await base44.entities.CategoryOverride.filter({ status: 'active', created_by_id: me.id }, { sort: '-created_date', limit: 200 });
    setActive(page.items);
  }, []);

  useEffect(() => { load(); }, [load]);

  const apply = async (tx, newCategory) => {
    setSaving(true);
    await base44.entities.CategoryOverride.create({
      transaction_id: tx.id, merchant: tx.merchant_name || tx.description, transaction_date: tx.date || undefined,
      original_category: tx.original_category || tx.category, new_category: newCategory, source: 'coach_suggestion', status: 'active',
    });
    await load();
    setSaving(false);
  };

  const revert = async (o) => {
    setSaving(true);
    await base44.entities.CategoryOverride.update(o.id, { status: 'reverted', reverted_at: new Date().toISOString() });
    await load();
    setSaving(false);
  };

  return { active, saving, apply, revert };
}