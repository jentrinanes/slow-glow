import { Link } from 'react-router-dom'
import {
  Leaf, Microscope, ArrowRight, PlayCircle, FlaskConical,
  Droplets, Flame, MoreHorizontal, Check, BookOpen
} from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer
} from 'recharts'

const barrierData = [
  { week: 'Wk 1', value: 60 },
  { week: 'Wk 2', value: 65 },
  { week: 'Wk 3', value: 58 },
  { week: 'Wk 4', value: 75 },
  { week: 'Wk 5', value: 84 },
]

export default function LandingPage() {
  return (
    <div className="font-sans antialiased relative bg-cream">

      {/* Nav */}
      <nav className="fixed top-0 w-full z-40 bg-cream/80 backdrop-blur-md border-b border-border-soft">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Leaf className="text-sage w-5 h-5" />
            <span className="font-serif text-2xl font-semibold tracking-tight text-ink">Slow Glow</span>
          </div>

          {/*<div className="hidden md:flex items-center gap-8 font-mono text-sm tracking-wide">
            <a href="#philosophy" className="text-ink/70 hover:text-terracotta transition-colors">Philosophy</a>
            <a href="#ingredients" className="text-ink/70 hover:text-terracotta transition-colors">Lab Tracker</a>
            <a href="#project-pan" className="text-ink/70 hover:text-terracotta transition-colors">Project Pan</a>
          </div>*/}

          <div className="flex items-center gap-4 font-mono text-sm">
            <Link to="/login" className="hidden md:block px-4 py-2 text-ink hover:text-sage transition-colors">Log In</Link>
            <Link to="/register" className="bg-terracotta hover:bg-terracotta/90 text-white px-6 py-2.5 rounded-full transition-all shadow-sm hover:shadow-md">
              Start Journal
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-40 pb-24 px-6 min-h-[900px] flex flex-col items-center justify-center relative overflow-hidden">
        <div className="absolute top-1/4 left-10 w-64 h-64 bg-sage/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-10 w-72 h-72 bg-terracotta/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-sage/30 bg-sage/5 text-sage font-mono text-xs mb-8 uppercase tracking-widest">
            <Microscope className="w-3 h-3" />
            <span>The Science of Patience</span>
          </div>

          <h1 className="font-serif text-6xl md:text-7xl lg:text-8xl font-medium leading-tight mb-8 text-ink">
            Skincare is an <br />
            <span className="italic text-sage">experiment.</span>
          </h1>

          <p className="font-sans text-xl text-ink/70 max-w-2xl mx-auto mb-12 leading-relaxed">
            Log ingredients, track usage cycles, and observe real results over time. A digital notebook for the intentional skincare enthusiast.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button className="w-full sm:w-auto bg-ink text-cream hover:bg-ink/90 px-8 py-4 rounded-full font-mono text-sm transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-3">
              Create Your Lab <ArrowRight className="w-4 h-4" />
            </button>
            <button className="w-full sm:w-auto px-8 py-4 rounded-full font-mono text-sm text-ink border border-border-soft hover:border-sage transition-colors flex items-center justify-center gap-3">
              <PlayCircle className="w-4 h-4" /> See How It Works
            </button>
          </div>
        </div>

        {/* Hero UI Preview */}
        <div className="mt-20 w-full max-w-5xl mx-auto relative z-20">
          <div className="bg-white rounded-[24px] p-2 border border-border-soft" style={{ boxShadow: '0 12px 32px -4px rgba(0,0,0,0.08)' }}>
            <div className="bg-paper rounded-[20px] p-6 border border-border-soft/50">
              <div className="flex items-center justify-between mb-8 border-b border-border-soft pb-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-sage/20 flex items-center justify-center text-sage">
                    <FlaskConical className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-serif text-lg font-semibold">Active Cycle: Retinoid Protocol</h3>
                    <p className="font-mono text-xs text-ink/50">Started: Oct 12, 2023 • Week 4</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <span className="px-3 py-1 bg-white rounded-full border border-border-soft font-mono text-xs">Ph 5.5</span>
                  <span className="px-3 py-1 bg-white rounded-full border border-border-soft font-mono text-xs">PM Only</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="col-span-2 bg-white rounded-xl p-6 border border-border-soft shadow-sm">
                  <h4 className="font-mono text-xs text-ink/50 mb-4 uppercase tracking-wider">Skin Barrier Integrity</h4>
                  <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={barrierData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="barrierGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#7D8E7A" stopOpacity={0.15} />
                          <stop offset="95%" stopColor="#7D8E7A" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid vertical={false} stroke="rgba(232,228,217,0.5)" />
                      <XAxis dataKey="week" tick={{ fontFamily: 'Space Mono', fontSize: 10, fill: '#1A1A1A' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontFamily: 'Space Mono', fontSize: 10, fill: '#1A1A1A' }} axisLine={false} tickLine={false} />
                      <Area type="monotone" dataKey="value" stroke="#7D8E7A" strokeWidth={3} fill="url(#barrierGradient)" dot={{ fill: '#FDFBF7', stroke: '#7D8E7A', strokeWidth: 2, r: 4 }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-4">
                  <div className="bg-white rounded-xl p-4 border border-border-soft shadow-sm flex items-center justify-between">
                    <div>
                      <p className="font-mono text-xs text-ink/50 mb-1">Hydration Level</p>
                      <p className="font-serif text-2xl text-sage">84%</p>
                    </div>
                    <Droplets className="text-sage/30 w-7 h-7" />
                  </div>
                  <div className="bg-white rounded-xl p-4 border border-border-soft shadow-sm flex items-center justify-between">
                    <div>
                      <p className="font-mono text-xs text-ink/50 mb-1">Irritation Index</p>
                      <p className="font-serif text-2xl text-terracotta">Low</p>
                    </div>
                    <Flame className="text-terracotta/30 w-7 h-7" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Ingredient Tracking */}
      <section id="ingredients" className="py-24 px-6 bg-paper relative">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="font-serif text-4xl md:text-5xl font-medium mb-6 text-ink">
                Decode your <br />ingredient lists.
              </h2>
              <p className="font-sans text-lg text-ink/70 mb-8 leading-relaxed">
                Stop guessing what works. Log every product in your routine, flag potential irritants, and cross-reference active ingredients to prevent overlapping treatments.
              </p>

              <ul className="space-y-6 font-mono text-sm">
                <li className="flex items-start gap-4">
                  <div className="w-6 h-6 rounded-full bg-sage/20 text-sage flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3 h-3" />
                  </div>
                  <div>
                    <strong className="block text-ink mb-1 font-sans">Conflict Detection</strong>
                    <span className="text-ink/60">Automatically flags when you combine Vitamin C with AHAs.</span>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <div className="w-6 h-6 rounded-full bg-terracotta/20 text-terracotta flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3 h-3" />
                  </div>
                  <div>
                    <strong className="block text-ink mb-1 font-sans">INCI Database Integration</strong>
                    <span className="text-ink/60">Scan labels to instantly break down formulas into understandable data.</span>
                  </div>
                </li>
              </ul>

              <button className="mt-10 text-terracotta font-mono text-sm flex items-center gap-2 hover:gap-3 transition-all">
                Explore the Lab <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="relative">
              <div className="absolute -inset-4 bg-sage/5 rounded-[32px] rotate-2" />
              <div className="bg-white rounded-[24px] p-6 border border-border-soft relative z-10" style={{ boxShadow: '0 12px 32px -4px rgba(0,0,0,0.08)' }}>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-serif text-xl font-semibold">Formula Analysis</h3>
                  <button className="text-ink/40 hover:text-ink"><MoreHorizontal className="w-5 h-5" /></button>
                </div>

                <div className="space-y-4">
                  {[
                    { color: 'bg-sage', name: 'Niacinamide (5%)', desc: 'Barrier Support • Brightening', badge: 'Safe', badgeColor: 'text-sage' },
                    { color: 'bg-terracotta', name: 'Salicylic Acid (BHA)', desc: 'Exfoliant • Pore Clearing', badge: 'Active', badgeColor: 'text-terracotta' },
                    { color: 'bg-ink/20', name: 'Glycerin', desc: 'Humectant • Hydration', badge: 'Base', badgeColor: 'text-ink/50' },
                  ].map((item) => (
                    <div key={item.name} className="p-4 rounded-xl border border-border-soft bg-paper/50 flex items-center justify-between hover:border-sage transition-colors">
                      <div className="flex items-center gap-4">
                        <div className={`w-2 h-10 ${item.color} rounded-full`} />
                        <div>
                          <p className="font-mono text-sm font-bold text-ink">{item.name}</p>
                          <p className="font-sans text-xs text-ink/50">{item.desc}</p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 bg-white rounded text-[10px] font-mono border border-border-soft ${item.badgeColor}`}>
                        {item.badge}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-32 px-6 bg-ink text-cream text-center relative overflow-hidden">
        <div className="max-w-3xl mx-auto relative z-10">
          <BookOpen className="w-10 h-10 text-sage mx-auto mb-6" />
          <h2 className="font-serif text-4xl md:text-5xl font-medium mb-6">
            Ready to start your skincare journal?
          </h2>
          <p className="font-sans text-lg text-cream/70 mb-10 max-w-xl mx-auto">
            Join thousands of intentional enthusiasts tracking their way to healthier skin through data, not hype.
          </p>
          <Link to="/register" className="bg-terracotta text-white hover:bg-terracotta/90 px-8 py-4 rounded-full font-mono text-sm transition-all">
            Register Free Account
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-ink border-t border-cream/10 pt-16 pb-8 px-6 text-cream/60">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <Leaf className="text-sage w-4 h-4" />
            <span className="font-serif text-xl text-cream">Slow Glow</span>
          </div>
          <div className="font-mono text-xs">
            &copy; 2026 Slow Glow. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
