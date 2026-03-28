import { Link } from 'react-router-dom';
import { ShoppingCart, TrendingUp, AlertTriangle, Package, ArrowRight, Receipt } from 'lucide-react';
import { mockLists, mockReports, mockTrendData } from '@/lib/mock-data';
import { useAuth } from '@/hooks/useAuth';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Dashboard() {
  const { user, hasRole } = useAuth();
  const isManagement = hasRole('manager', 'staff');

  const customerStats = [
    { label: 'My Lists', value: mockLists.length, icon: ShoppingCart, color: 'text-primary' },
    { label: 'Items Tracked', value: '36', icon: Package, color: 'text-primary' },
    { label: 'Total Expenditure', value: '16070', icon: Receipt, color: 'text-primary' },
  ];

  const managementStats = [
    { label: 'Active Lists', value: mockLists.length, icon: ShoppingCart, color: 'text-primary' },
    { label: 'Items Tracked', value: '36', icon: Package, color: 'text-primary' },
    { label: 'Popular Products', value: mockReports.popular.length, icon: TrendingUp, color: 'text-secondary' },
    { label: 'Dead Stock Items', value: mockReports.deadStock.length, icon: AlertTriangle, color: 'text-destructive' },
  ];

  const stats = isManagement ? managementStats : customerStats;

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold text-foreground">
          Welcome back, {user?.name || 'User'}
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          {isManagement ? "Here's your retail overview" : "Here's your shopping overview"}
        </p>
      </div>

      {/* Stats */}
      <div className={`grid ${isManagement ? 'grid-cols-2 lg:grid-cols-4' : 'grid-cols-3'} gap-4 mb-8`}>
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="stat-card">
            <div className="flex items-center justify-between mb-3">
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <div className="font-display text-2xl font-bold text-foreground">{value}</div>
            <div className="text-xs text-muted-foreground mt-1">{label}</div>
          </div>
        ))}
      </div>

      <div className={`grid ${isManagement ? 'lg:grid-cols-3' : 'lg:grid-cols-1'} gap-6`}>
        {/* Chart — management only */}
        {isManagement && (
          <div className="lg:col-span-2 stat-card">
            <h2 className="font-display font-semibold text-foreground mb-4">Monthly Requests</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mockTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="requests" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="fulfilled" fill="hsl(var(--primary) / 0.4)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Recent Lists */}
        <div className="stat-card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold text-foreground">
              {isManagement ? 'Recent Lists' : 'My Recent Lists'}
            </h2>
            <Link to="/lists" className="text-primary text-xs font-medium hover:underline flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-3">
            {mockLists.map(list => (
              <Link
                key={list.id}
                to={`/lists/${list.id}`}
                className="block p-3 rounded-lg border hover:bg-muted/50 transition-colors"
              >
                <div className="font-medium text-sm text-foreground">{list.title}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {list.branch} · {list.item_count} items · KES {list.total?.toLocaleString()}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
