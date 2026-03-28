import { mockTrendData, mockCategoryData, mockBranchData } from '@/lib/mock-data';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';

const COLORS = ['hsl(153,100%,25%)', 'hsl(33,92%,55%)', 'hsl(210,17%,70%)', 'hsl(0,84%,60%)', 'hsl(153,50%,40%)', 'hsl(33,60%,70%)'];

export default function Analytics() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold text-foreground">Analytics</h1>
        <p className="text-sm text-muted-foreground mt-1">Demand trends and store performance</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        {/* Trend Line */}
        <div className="stat-card">
          <h2 className="font-display font-semibold text-foreground mb-4">Revenue Trend</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={mockTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }}
                  formatter={(value: number) => [`KES ${value.toLocaleString()}`, 'Revenue']}
                />
                <Line type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4, fill: 'hsl(var(--primary))' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Pie */}
        <div className="stat-card">
          <h2 className="font-display font-semibold text-foreground mb-4">Category Distribution</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={mockCategoryData}
                  dataKey="count"
                  nameKey="category"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  label={({ category, percent }) => `${category} ${(percent * 100).toFixed(0)}%`}
                >
                  {mockCategoryData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Fulfillment Rate */}
      <div className="stat-card mb-6">
        <h2 className="font-display font-semibold text-foreground mb-4">Request vs Fulfilled</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={mockTrendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
              <YAxis tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
              <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }} />
              <Bar dataKey="requests" name="Requested" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              <Bar dataKey="fulfilled" name="Fulfilled" fill="hsl(33,92%,55%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Branch Performance Table */}
      <div className="stat-card overflow-x-auto">
        <h2 className="font-display font-semibold text-foreground mb-4">Branch Performance</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="table-header">
              <th className="text-left p-3">Branch</th>
              <th className="text-right p-3">Lists</th>
              <th className="text-right p-3">Items</th>
              <th className="text-right p-3">Revenue</th>
            </tr>
          </thead>
          <tbody>
            {mockBranchData.map(b => (
              <tr key={b.branch} className="border-t hover:bg-muted/30 transition-colors">
                <td className="p-3 font-medium text-foreground">{b.branch}</td>
                <td className="p-3 text-right text-muted-foreground">{b.lists}</td>
                <td className="p-3 text-right text-muted-foreground">{b.items.toLocaleString()}</td>
                <td className="p-3 text-right font-medium text-foreground">KES {b.revenue.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
