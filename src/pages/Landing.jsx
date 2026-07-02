import { Link, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { Zap, TrendingUp, BookOpen, Award, ArrowRight, Shield, BarChart2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function Landing() {
  const navigate = useNavigate();

  useEffect(() => {
    base44.auth.isAuthenticated().then(authed => {
      if (authed) navigate('/dashboard', { replace: true });
    });
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <nav className="border-b border-border px-6 py-4 flex items-center justify-between sticky top-0 bg-background/80 backdrop-blur-md z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Zap className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-display font-bold">Baseline</span>
        </div>
        <Link
          to="/onboarding"
          className="px-5 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:bg-primary/90 transition-all duration-200 glow-teal"
        >
          Get Started Free
        </Link>
      </nav>

      {/* Hero */}
      <section className="px-6 pt-24 pb-20 max-w-4xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-8">
          <Zap className="w-4 h-4" />
          Financial literacy made fun
        </div>
        <h1 className="text-5xl md:text-7xl font-display font-extrabold leading-tight mb-6">
          Master money like{' '}
          <span className="text-primary">a game</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
          Learn budgeting, investing, and credit through bite-sized lessons. Track your real spending. Level up your financial life.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/learn"
            className="px-8 py-4 bg-primary text-primary-foreground rounded-2xl text-lg font-bold hover:bg-primary/90 transition-all duration-200 glow-teal flex items-center justify-center gap-2 group"
          >
            Start Learning Free
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            to="/finance"
            className="px-8 py-4 bg-secondary text-foreground rounded-2xl text-lg font-semibold hover:bg-secondary/80 transition-all duration-200 flex items-center justify-center gap-2"
          >
            <BarChart2 className="w-5 h-5" />
            Connect Your Bank
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 py-20 max-w-5xl mx-auto">
        <h2 className="text-3xl font-display font-bold text-center mb-12">Everything you need to win with money</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              icon: BookOpen,
              color: 'text-primary',
              bg: 'bg-primary/10',
              title: 'Structured Learning Path',
              desc: 'Follow a curriculum built for beginners — from budgeting basics to investing fundamentals, one step at a time.',
            },
            {
              icon: Award,
              color: 'text-amber-400',
              bg: 'bg-amber-400/10',
              title: 'Earn XP & Badges',
              desc: 'Stay motivated with daily streaks, experience points, and collectible badges for every milestone.',
            },
            {
              icon: TrendingUp,
              color: 'text-chart-4',
              bg: 'bg-blue-400/10',
              title: 'Real Spending Insights',
              desc: 'Connect your bank accounts and see a beautiful breakdown of where your money actually goes.',
            },
            {
              icon: Shield,
              color: 'text-purple-400',
              bg: 'bg-purple-400/10',
              title: 'Bank-Level Security',
              desc: 'Your data is encrypted and never stored. We use Plaid — the same technology trusted by major apps.',
            },
            {
              icon: Zap,
              color: 'text-primary',
              bg: 'bg-primary/10',
              title: 'Smart Recommendations',
              desc: 'Your spending patterns unlock personalized lessons. Overspending on dining? Learn budgeting strategies.',
            },
            {
              icon: BarChart2,
              color: 'text-amber-400',
              bg: 'bg-amber-400/10',
              title: 'Visual Progress',
              desc: 'Watch your level climb, streaks grow, and financial knowledge compound over time.',
            },
          ].map(({ icon: Icon, color, bg, title, desc }) => (
            <div key={title} className="bg-card border border-border rounded-2xl p-6 hover:border-primary/30 transition-all duration-300 hover:-translate-y-1">
              <div className={`w-12 h-12 rounded-xl ${bg} flex items-center justify-center mb-4`}>
                <Icon className={`w-6 h-6 ${color}`} />
              </div>
              <h3 className="text-lg font-heading font-semibold mb-2">{title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-20">
        <div className="max-w-2xl mx-auto bg-card border border-primary/20 rounded-3xl p-12 text-center glow-teal">
          <h2 className="text-3xl font-display font-bold mb-4">Ready to take control?</h2>
          <p className="text-muted-foreground mb-8">Join thousands of young adults building smarter money habits.</p>
          <Link
            to="/learn"
            className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground rounded-2xl text-lg font-bold hover:bg-primary/90 transition-all duration-200 group"
          >
            Start for Free
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>

      <footer className="border-t border-border px-6 py-8 text-center text-muted-foreground text-sm">
        © 2026 Baseline. Built to make financial literacy accessible to everyone.
      </footer>
    </div>
  );
}