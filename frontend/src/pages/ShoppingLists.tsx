import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
// import { mockLists } from '@/lib/mock-data';
import { api } from '@/lib/api';
import LoadingContent from '@/components/Loading';

export default function ShoppingLists() {
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState('');
  const [branch, setBranch] = useState('');
  const [lists, setLists] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLists = async () => {
      setIsLoading(true);
      try {
        const data = await api.getLists();
        setLists(data);
      } catch (err) {
        console.error("ERROR:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLists();
  }, []);

  const filtered = lists.filter(
    l =>
      l.title.toLowerCase().includes(search.toLowerCase()) ||
      (l.branch || "").toLowerCase().includes(search.toLowerCase())
  );
  
  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    api.createList(title, branch); /* — wired to backend */
    setShowCreate(false);
    setTitle('');
    setBranch('');
  };

  if (isLoading) {
    return <LoadingContent />;
  }

  if (!lists || lists.length === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        <ShoppingCart className="w-12 h-12 mx-auto mb-3 opacity-40" />
        <p>No lists found</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Shopping Lists</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your shopping lists</p>
        </div>
        <Button onClick={() => setShowCreate(!showCreate)} className="gap-2">
          <Plus className="w-4 h-4" /> New List
        </Button>
      </div>

      {/* Create form */}
      {showCreate && (
        <form onSubmit={handleCreate} className="stat-card mb-6 flex flex-col sm:flex-row gap-3">
          <input
            className="search-input flex-1"
            placeholder="List title (e.g. Weekly Groceries)"
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
          />
          <input
            className="search-input flex-1"
            placeholder="Branch (e.g. Naivas Westlands)"
            value={branch}
            onChange={e => setBranch(e.target.value)}
            required
          />
          <Button type="submit">Create</Button>
          <Button type="button" variant="ghost" onClick={() => setShowCreate(false)}>Cancel</Button>
        </form>
      )}

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          className="search-input pl-10"
          placeholder="Search lists..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* List cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(list => (
          <Link
            key={list.id}
            to={`/lists/${list.id}`}
            className="stat-card hover:shadow-[var(--shadow-elevated)] transition-shadow group"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center">
                <ShoppingCart className="w-5 h-5 text-primary" />
              </div>
              <span className="text-xs text-muted-foreground">{new Date(list.created_at).toLocaleDateString("en-KE", {year: 'numeric', month: 'short', day: 'numeric',})}</span>
            </div>
            <h3 className="font-display font-semibold text-foreground group-hover:text-primary transition-colors">
              {list.title}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">{list.branch}</p>
            <div className="flex items-center justify-between mt-4 pt-3 border-t text-xs text-muted-foreground">
              <span>{list.item_count} items</span>
              <span className="font-medium text-foreground">KES {list.total?.toLocaleString()}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
