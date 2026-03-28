import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, MessageSquare, Check, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { mockItems, mockLists, mockProducts } from '@/lib/mock-data';
import { api } from '@/lib/api';
import type { Product, ShoppingListDetail } from '@/lib/api';

export default function ShoppingListDetail() {
  const { id } = useParams();
  // const [items, setItems] = useState(mockItems);
  const [showAdd, setShowAdd] = useState(false);
  const [productSearch, setProductSearch] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [commentValue, setCommentValue] = useState('');
  const [listsItems, setListItems] = useState<ShoppingListDetail | null>(null);
  const [items, setItems] = useState([]);
  
  useEffect(() => {
    const fetchList = async () => {
      try {
        const data = await api.getListItems(id);
        setListItems(data);
      } catch (err) {
        console.error("ERROR:", err);
      }
    };

    fetchList();
  }, []);

  useEffect(() => {
    if (listsItems) {
      setItems(listsItems.shopping_list);
    }
  }, [listsItems]);

  if (!listsItems) return <p>Loading...</p>; // show a loading message

  const catalogue = listsItems.catalogue;
  const list = listsItems;

  const suggestions = productSearch.length >= 2
    ? catalogue.filter(p => p.name.toLowerCase().includes(productSearch.toLowerCase()))
    : [];

  const total = items.reduce((sum, i) => sum + (i.totals || 0), 0);

  const toggleDone = (itemId: string) => {
    setItems(prev =>
      prev.map(i =>
        i.list_item_id === itemId
          ? { ...i, status: i.status === 'found' ? 'pending' : 'found' }
          : i
      )
    );
  };

  const deleteItem = (itemId: string) => {
    setItems(prev => prev.filter(i => i.list_item_id !== itemId));
  };

  const saveComment = (itemId: string) => {
    setItems(prev =>
      prev.map(i => i.list_item_id === itemId ? { ...i, comment: commentValue } : i)
    );
    setEditingComment(null);
  };

  const addItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;
    const newItem = {
      list_item_id: `new-${Date.now()}`,
      product_name: selectedProduct.name,
      category: selectedProduct.category,
      quantity_requested: quantity,
      price: selectedProduct.price,
      status: 'pending' as const,
      created_date: new Date().toISOString().split('T')[0],
      totals: (selectedProduct.price || 0) * quantity,
    };
    setItems(prev => [...prev, newItem]);
    setShowAdd(false);
    setProductSearch('');
    setSelectedProduct(null);
    setQuantity(1);
  };

  const statusBadge = (status: string) => {
    const cls = status === 'found' ? 'badge-found' : status === 'missing' ? 'badge-missing' : 'badge-pending';
    return <span className={`badge-status ${cls}`}>{status}</span>;
  };

  return (
    <div>
      <Link to="/lists" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="w-4 h-4" /> Back to Lists
      </Link>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">{list.title}</h1>
          <p className="text-sm text-muted-foreground mt-1">{list.branch}</p>
        </div>
        <Button onClick={() => setShowAdd(!showAdd)} className="gap-2">
          <Plus className="w-4 h-4" /> Add Item
        </Button>
      </div>

      {/* Add item form */}
      {showAdd && (
        <form onSubmit={addItem} className="stat-card mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                className="search-input pl-10"
                placeholder="Search product..."
                value={productSearch}
                onChange={e => { setProductSearch(e.target.value); setSelectedProduct(null); }}
              />
              {suggestions.length > 0 && !selectedProduct && (
                <div className="absolute top-full left-0 right-0 bg-card border rounded-lg mt-1 shadow-[var(--shadow-elevated)] z-10 max-h-40 overflow-y-auto">
                  {suggestions.map(p => (
                    <button
                      key={p.product_id}
                      type="button"
                      onClick={() => { setSelectedProduct(p); setProductSearch(p.name); }}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-muted transition-colors"
                    >
                      <span className="text-foreground">{p.name}</span>
                      <span className="text-muted-foreground ml-2">KES {p.price}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <input
              type="number"
              className="search-input w-24"
              placeholder="Qty"
              value={quantity}
              onChange={e => setQuantity(Number(e.target.value))}
              min={1}
              required
            />
            <Button type="submit" disabled={!selectedProduct}>Add</Button>
          </div>
        </form>
      )}

      {/* Items table */}
      <div className="stat-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="table-header">
              <th className="text-left p-3 w-12">Done</th>
              <th className="text-left p-3">Date</th>
              <th className="text-left p-3">Product</th>
              <th className="text-left p-3">Category</th>
              <th className="text-right p-3">Qty</th>
              <th className="text-right p-3">Price</th>
              <th className="text-left p-3">Status</th>
              <th className="text-left p-3">Comment</th>
              <th className="text-right p-3">Total</th>
              <th className="text-right p-3 w-12"></th>
            </tr>
          </thead>
          <tbody>
            {items.map(item => (
              <tr key={item.list_item_id} className="border-t hover:bg-muted/30 transition-colors">
                <td className="p-3">
                  <button
                    onClick={() => toggleDone(item.list_item_id)}
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors
                      ${item.status === 'found' ? 'bg-primary border-primary' : 'border-input hover:border-primary'}`}
                  >
                    {item.status === 'found' && <Check className="w-3 h-3 text-primary-foreground" />}
                  </button>
                </td>
                <td className="p-3 text-muted-foreground">{item.created_date}</td>
                <td className="p-3 font-medium text-foreground">{item.product_name}</td>
                <td className="p-3 text-muted-foreground">{item.category || '-'}</td>
                <td className="p-3 text-right">{item.quantity_requested}</td>
                <td className="p-3 text-right text-muted-foreground">KES {item.price}</td>
                <td className="p-3">{statusBadge(item.status)}</td>
                <td className="p-3">
                  {editingComment === item.list_item_id ? (
                    <div className="flex gap-1">
                      <input
                        className="search-input h-8 text-xs"
                        value={commentValue}
                        onChange={e => setCommentValue(e.target.value)}
                        autoFocus
                      />
                      <Button size="sm" variant="ghost" onClick={() => saveComment(item.list_item_id)}>Save</Button>
                    </div>
                  ) : (
                    <button
                      onClick={() => { setEditingComment(item.list_item_id); setCommentValue(item.comment || ''); }}
                      className="text-muted-foreground hover:text-foreground text-xs flex items-center gap-1"
                    >
                      {item.comment || <><MessageSquare className="w-3 h-3" /> Add</>}
                    </button>
                  )}
                </td>
                <td className="p-3 text-right font-medium">KES {item.totals?.toLocaleString()}</td>
                <td className="p-3 text-right">
                  <button onClick={() => deleteItem(item.list_item_id)} className="text-muted-foreground hover:text-destructive">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t-2 bg-secondary/10">
              <td colSpan={8} className="p-3 font-display font-semibold text-foreground">TOTAL</td>
              <td className="p-3 text-right font-display font-bold text-foreground">KES {total.toLocaleString()}</td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
