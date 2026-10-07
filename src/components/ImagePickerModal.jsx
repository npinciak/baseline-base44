import { useState, useRef } from 'react';
import { X, Search, Check, Loader2, Upload } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function ImagePickerModal({ onSelect, onClose }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selected, setSelected] = useState(null);
  const fileRef = useRef(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    const res = await base44.integrations.custom.call('unsplash', 'get:/search/photos', {
      queryParams: { query: query.trim(), per_page: 20 },
    });
    setResults(res?.data?.results || []);
    setLoading(false);
  };

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadPublicFile({ file });
    setUploading(false);
    onSelect({ url: file_url });
  };

  const handleConfirm = () => {
    if (selected) onSelect(selected);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-end md:items-center justify-center z-[60] p-4">
      <div className="bg-[#0a0a0a] border border-white/10 rounded-3xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-white/10 shrink-0">
          <h3 className="text-lg font-heading font-bold text-white">Pick an Image</h3>
          <button onClick={onClose} className="text-white/50 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 border-b border-white/10 shrink-0 space-y-3">
          <input ref={fileRef} type="file" accept="image/*" onChange={handleUpload} className="hidden" />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-white/[0.05] border border-dashed border-white/20 text-white rounded-xl text-sm font-semibold hover:border-[#2EA0FD] transition-colors disabled:opacity-50"
          >
            {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4 text-[#2EA0FD]" />}
            {uploading ? 'Uploading...' : 'Upload your own photo'}
          </button>
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" />
              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Or search photos..."
                className="w-full bg-white/[0.05] border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#2EA0FD] transition-colors"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="px-4 py-2.5 bg-[#2EFD7A] text-black rounded-xl text-sm font-semibold hover:bg-[#2EFD7A]/90 transition-all disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Search'}
            </button>
          </form>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {results.length === 0 && !loading && (
            <p className="text-center text-sm text-white/50 py-10">Upload a photo or search above</p>
          )}
          <div className="grid grid-cols-4 gap-2">
            {results.map(photo => {
              const isSelected = selected?.url === photo.urls.regular;
              return (
                <button
                  key={photo.id}
                  onClick={() => setSelected({ url: photo.urls.regular, thumb: photo.urls.small, alt: photo.alt_description })}
                  className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all duration-150 ${
                    isSelected ? 'border-[#2EFD7A]' : 'border-transparent hover:border-[#2EA0FD]/60'
                  }`}
                >
                  <img src={photo.urls.small} alt={photo.alt_description} className="w-full h-full object-cover" />
                  {isSelected && (
                    <div className="absolute inset-0 bg-[#2EFD7A]/30 flex items-center justify-center">
                      <div className="w-6 h-6 bg-[#2EFD7A] rounded-full flex items-center justify-center">
                        <Check className="w-3.5 h-3.5 text-black" />
                      </div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="p-4 border-t border-white/10 flex gap-3 shrink-0">
          <button onClick={onClose} className="flex-1 py-2.5 bg-white/10 text-white rounded-xl font-semibold hover:bg-white/15 transition-all text-sm">
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!selected}
            className="flex-1 py-2.5 bg-[#2EFD7A] text-black rounded-xl font-semibold hover:bg-[#2EFD7A]/90 transition-all disabled:opacity-50 text-sm"
          >
            Use This Image
          </button>
        </div>
      </div>
    </div>
  );
}