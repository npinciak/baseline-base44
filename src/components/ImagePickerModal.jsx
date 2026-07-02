import { useState } from 'react';
import { X, Search, Check, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function ImagePickerModal({ onSelect, onClose }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(null);

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

  const handleConfirm = () => {
    if (selected) onSelect(selected);
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-end md:items-center justify-center z-[60] p-4">
      <div className="bg-card border border-border rounded-3xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border shrink-0">
          <h3 className="text-lg font-heading font-bold">Pick an Image</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="p-4 border-b border-border shrink-0">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search images..."
                autoFocus
                className="w-full bg-secondary border border-border rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-primary transition-colors"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="px-4 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:bg-primary/90 transition-all disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Search'}
            </button>
          </div>
        </form>

        {/* Results grid */}
        <div className="flex-1 overflow-y-auto p-4">
          {results.length === 0 && !loading && (
            <p className="text-center text-sm text-muted-foreground py-10">Search for an image above</p>
          )}
          <div className="grid grid-cols-4 gap-2">
            {results.map(photo => {
              const isSelected = selected?.url === photo.urls.small;
              return (
                <button
                  key={photo.id}
                  onClick={() => setSelected({ url: photo.urls.regular, thumb: photo.urls.small, alt: photo.alt_description })}
                  className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all duration-150 ${
                    isSelected ? 'border-primary' : 'border-transparent hover:border-primary/40'
                  }`}
                >
                  <img src={photo.urls.small} alt={photo.alt_description} className="w-full h-full object-cover" />
                  {isSelected && (
                    <div className="absolute inset-0 bg-primary/30 flex items-center justify-center">
                      <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                        <Check className="w-3.5 h-3.5 text-primary-foreground" />
                      </div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border flex gap-3 shrink-0">
          <button onClick={onClose} className="flex-1 py-2.5 bg-secondary text-foreground rounded-xl font-semibold hover:bg-secondary/80 transition-all text-sm">
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!selected}
            className="flex-1 py-2.5 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-all disabled:opacity-50 text-sm"
          >
            Use This Image
          </button>
        </div>
      </div>
    </div>
  );
}