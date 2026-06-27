import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Link2, Loader2 } from 'lucide-react';

// Default to Chase (mxbank) for demo; you can expose institutionCode as a prop later
const DEFAULT_INSTITUTION = 'chase';

export default function ConnectBankButton({ institutionCode = DEFAULT_INSTITUTION, onConnected }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleConnect = async () => {
    setLoading(true);
    setError(null);
    try {
      const redirectUri = `${window.location.origin}/money`;
      const res = await base44.functions.invoke('getMxOAuthUrl', {
        institutionCode,
        redirectUri,
      });

      const url = res.data?.oauth_window_uri;
      if (!url) throw new Error(res.data?.error || 'No OAuth URL returned');

      // Open MX OAuth in a popup
      const popup = window.open(url, 'mx_oauth', 'width=600,height=700,left=200,top=100');

      // Poll for popup close
      const poll = setInterval(() => {
        if (!popup || popup.closed) {
          clearInterval(poll);
          setLoading(false);
          onConnected?.();
        }
      }, 1000);
    } catch (e) {
      setError(e.message);
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={handleConnect}
        disabled={loading}
        className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl font-semibold text-sm hover:bg-primary/90 transition-all disabled:opacity-50 w-fit"
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Link2 className="w-4 h-4" />}
        {loading ? 'Connecting...' : 'Connect Bank Account'}
      </button>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}