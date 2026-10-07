import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Link2, Loader2, X } from 'lucide-react';

export default function ConnectBankButton({ onConnected, className = 'w-fit whitespace-nowrap' }) {
  const [loading, setLoading] = useState(false);
  const [widgetUrl, setWidgetUrl] = useState(null);
  const [error, setError] = useState(null);

  const handleConnect = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await base44.functions.invoke('getMxOAuthUrl', {});
      const url = res.data?.widget_url;
      if (!url) throw new Error(res.data?.error || 'No widget URL returned');
      setWidgetUrl(url);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setWidgetUrl(null);
    onConnected?.();
  };

  return (
    <>
      <button
        onClick={handleConnect}
        disabled={loading}
        className={`flex items-center justify-center gap-2 px-4 py-2 bg-[#2EFD7A] text-black rounded-xl font-semibold text-sm hover:bg-[#2EFD7A]/90 hover:scale-[1.03] active:scale-95 transition-all disabled:opacity-50 ${className}`}
      >
        {loading ? <Loader2 className="w-4 h-4 shrink-0 animate-spin" /> : <Link2 className="w-4 h-4 shrink-0" />}
        {loading ? 'Connecting...' : 'Connect Bank Account'}
      </button>
      {error && <p className="text-xs text-red-400 mt-1">{error}</p>}

      {/* Widget modal */}
      {widgetUrl && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="relative bg-neutral-950 border border-white/10 rounded-2xl overflow-hidden w-full max-w-lg h-[700px] max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
              <span className="text-sm font-semibold text-white">Connect Your Bank</span>
              <button onClick={handleClose} className="text-white/50 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <iframe
              src={widgetUrl}
              className="flex-1 w-full border-0"
              title="MX Connect Widget"
              allow="clipboard-write"
            />
          </div>
        </div>
      )}
    </>
  );
}