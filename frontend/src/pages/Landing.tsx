import { Link } from 'react-router-dom';
import { ShoppingCart, BarChart3, Users, ArrowRight, CheckSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="flex items-center justify-between px-6 lg:px-12 h-16 border-b">
        <div className="flex items-center gap-2">
          <ShoppingCart className="w-7 h-7 text-primary" />
          <span className="font-display font-bold text-xl text-foreground">Naivas</span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login">
            <Button variant="ghost" size="sm">Login</Button>
          </Link>
          <Link to="/register">
            <Button size="sm">Get Started</Button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="px-6 lg:px-12 py-20 lg:py-32 max-w-5xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 bg-accent text-accent-foreground rounded-full px-4 py-1.5 text-sm font-medium mb-6">
          <CheckSquare className="w-4 h-4" />
          Smart Retail Shopping
        </div>
        <h1 className="font-display text-4xl lg:text-6xl font-bold text-foreground leading-tight mb-6">
          Turn Shopping Lists Into
          <span className="text-primary"> Actionable Insights</span>
        </h1>
        <p className="text-muted-foreground text-lg lg:text-xl max-w-2xl mx-auto mb-10 font-body">
          A customer-powered CRM that captures demand before shelves run empty.
          Reduce stock-outs, improve replenishment, and shop smarter.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link to="/register">
            <Button size="lg" className="gap-2">
              Start Shopping <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          <Link to="/login">
            <Button variant="outline" size="lg">Sign In</Button>
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 lg:px-12 pb-20 max-w-5xl mx-auto">
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              icon: ShoppingCart,
              title: 'Smart Shopping Lists',
              desc: 'Create lists with real prices, track items while shopping, and add comments for missing products.',
            },
            {
              icon: BarChart3,
              title: 'Demand Analytics',
              desc: 'See what customers want before they arrive. Identify dead stock and trending products.',
            },
            {
              icon: Users,
              title: 'Staff Insights',
              desc: 'Detect when stock was in-store but not replenished. Hold teams accountable with data.',
            },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="stat-card">
              <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center mb-4">
                <Icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-display font-semibold text-foreground mb-2">{title}</h3>
              <p className="text-sm text-muted-foreground font-body">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t px-6 lg:px-12 py-6 text-center text-sm text-muted-foreground">
        © 2026 Naivas Customer Relationship & Shopping List App
      </footer>
    </div>
  );
}
