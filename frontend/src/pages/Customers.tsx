import { useState } from 'react';
import { Search, Users as UsersIcon } from 'lucide-react';

const mockCustomers = [
  { id: '1', name: 'Jane Wanjiku', email: 'jane@example.com', lists: 12, totalSpent: 34500, lastActive: '2026-03-17' },
  { id: '2', name: 'Peter Ochieng', email: 'peter@example.com', lists: 8, totalSpent: 22100, lastActive: '2026-03-16' },
  { id: '3', name: 'Mary Akinyi', email: 'mary@example.com', lists: 15, totalSpent: 48200, lastActive: '2026-03-18' },
  { id: '4', name: 'James Mwangi', email: 'james@example.com', lists: 5, totalSpent: 12800, lastActive: '2026-03-14' },
  { id: '5', name: 'Faith Njeri', email: 'faith@example.com', lists: 20, totalSpent: 56300, lastActive: '2026-03-18' },
];

export default function Customers() {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<string | null>(null);

  const filtered = mockCustomers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) || c.email.toLowerCase().includes(search.toLowerCase())
  );

  const selectedCustomer = mockCustomers.find(c => c.id === selected);

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-foreground">Customers</h1>
        <p className="text-sm text-muted-foreground mt-1">Customer relationship management</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* List */}
        <div className="lg:col-span-1">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              className="search-input pl-10"
              placeholder="Search customers..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            {filtered.map(c => (
              <button
                key={c.id}
                onClick={() => setSelected(c.id)}
                className={`w-full text-left p-3 rounded-lg transition-colors ${
                  selected === c.id ? 'bg-accent border border-primary/20' : 'bg-card border hover:bg-muted/50'
                }`}
              >
                <div className="font-medium text-sm text-foreground">{c.name}</div>
                <div className="text-xs text-muted-foreground">{c.email}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Detail */}
        <div className="lg:col-span-2 stat-card">
          {selectedCustomer ? (
            <div>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="font-display text-xl font-bold text-primary">
                    {selectedCustomer.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div>
                  <h2 className="font-display text-xl font-bold text-foreground">{selectedCustomer.name}</h2>
                  <p className="text-sm text-muted-foreground">{selectedCustomer.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="p-4 rounded-lg bg-muted/50 text-center">
                  <div className="font-display text-2xl font-bold text-foreground">{selectedCustomer.lists}</div>
                  <div className="text-xs text-muted-foreground mt-1">Lists</div>
                </div>
                <div className="p-4 rounded-lg bg-muted/50 text-center">
                  <div className="font-display text-2xl font-bold text-foreground">KES {selectedCustomer.totalSpent.toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground mt-1">Total Spent</div>
                </div>
                <div className="p-4 rounded-lg bg-muted/50 text-center">
                  <div className="font-display text-2xl font-bold text-foreground">{selectedCustomer.lastActive}</div>
                  <div className="text-xs text-muted-foreground mt-1">Last Active</div>
                </div>
              </div>

              <p className="text-sm text-muted-foreground">
                Purchase history and detailed analytics will be available once connected to your backend API.
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <UsersIcon className="w-12 h-12 mb-3 opacity-40" />
              <p>Select a customer to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
