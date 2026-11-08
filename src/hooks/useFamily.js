import { useCallback, useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';

/** Family account state + actions. All reads/writes go through the familyAccount function. */
export default function useFamily() {
  const [data, setData] = useState({ family: null, me: null, members: [], pending: [] });
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    const res = await base44.functions.invoke('familyAccount', { action: 'get' });
    setData(res.data);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const run = async (payload) => {
    setBusy(true);
    setError('');
    try {
      const res = await base44.functions.invoke('familyAccount', payload);
      await load();
      return res.data;
    } catch (e) {
      setError(e?.response?.data?.error || 'Something went wrong. Please try again.');
      return null;
    } finally {
      setBusy(false);
    }
  };

  return { ...data, loading, busy, error, run };
}