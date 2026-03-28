import { mockReports } from '@/lib/mock-data';
import { AlertTriangle, Users, TrendingUp } from 'lucide-react';

export default function Reports() {
  const { deadStock, lazyStaff, popular } = mockReports;

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold text-foreground">Reports</h1>
        <p className="text-sm text-muted-foreground mt-1">Operational insights from customer data</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Dead Stock */}
        <div className="stat-card">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-destructive" />
            </div>
            <div>
              <h2 className="font-display font-semibold text-foreground">Dead Stock</h2>
              <p className="text-xs text-muted-foreground">Products never requested</p>
            </div>
          </div>
          {deadStock.length === 0 ? (
            <p className="text-sm text-muted-foreground">No dead stock found.</p>
          ) : (
            <div className="space-y-2">
              {deadStock.map(item => (
                <div key={item.product_id} className="flex items-center justify-between p-2.5 rounded-lg bg-muted/50">
                  <span className="text-sm text-foreground">{item.name}</span>
                  <span className="text-xs text-muted-foreground font-mono">{item.product_id}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Lazy Staff */}
        <div className="stat-card">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-secondary/20 flex items-center justify-center">
              <Users className="w-5 h-5 text-secondary" />
            </div>
            <div>
              <h2 className="font-display font-semibold text-foreground">Staff Issues</h2>
              <p className="text-xs text-muted-foreground">Stock available but not shelved</p>
            </div>
          </div>
          {lazyStaff.length === 0 ? (
            <p className="text-sm text-muted-foreground">No issues detected.</p>
          ) : (
            <div className="space-y-2">
              {lazyStaff.map((item, i) => (
                <div key={i} className="p-2.5 rounded-lg bg-muted/50">
                  <div className="text-sm font-medium text-foreground">{item.name}</div>
                  <div className="text-xs text-muted-foreground mt-1">{item.comment}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Popular Products */}
        <div className="stat-card">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="font-display font-semibold text-foreground">Popular Products</h2>
              <p className="text-xs text-muted-foreground">Most requested items</p>
            </div>
          </div>
          {popular.length === 0 ? (
            <p className="text-sm text-muted-foreground">No data yet.</p>
          ) : (
            <div className="space-y-2">
              {popular.map((item, i) => (
                <div key={i} className="flex items-center justify-between p-2.5 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-bold">
                      {i + 1}
                    </span>
                    <span className="text-sm text-foreground">{item.name}</span>
                  </div>
                  <span className="text-xs font-medium text-muted-foreground">{item.times_requested}×</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
