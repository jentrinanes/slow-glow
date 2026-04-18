import { useState } from 'react'
import {
  Download, Camera, CalendarCheck, ShieldCheck, Droplets,
  Plus, FlaskConical, Flame, TriangleAlert, Clock, FlagTriangleRight, Lightbulb
} from 'lucide-react'
import Sidebar from '../components/Sidebar'

interface TimelineNode {
  month: number
  label: string
  description: string
  badge?: { text: string; color: 'sage' | 'terracotta' }
  completed: boolean
  hasPhoto: boolean
}

const timelineNodes: TimelineNode[] = [
  {
    month: 1, label: 'Month 1: Introduction',
    description: 'Started 0.025% cream 2x/week. Mild flaking expected.',
    badge: { text: 'Routine: Sandwich Method', color: 'sage' },
    completed: true, hasPhoto: true,
  },
  {
    month: 3, label: 'Month 3: The Purge',
    description: 'Increased to 3x/week. Breakouts are normal here. Patience required.',
    badge: { text: 'Reaction Spike Noted', color: 'terracotta' },
    completed: true, hasPhoto: true,
  },
  {
    month: 6, label: 'Month 6: Stabilization',
    description: 'Goal: Daily use. Texture improvements should become visible.',
    completed: false, hasPhoto: false,
  },
  {
    month: 12, label: 'Month 12: Maintenance',
    description: 'Collagen production benefits begin. Assess for strength increase.',
    completed: false, hasPhoto: false,
  },
]

interface NotableEvent {
  id: string
  title: string
  date: string
  description: string
  type: 'active' | 'reaction' | 'warning'
  tags?: string[]
}

const events: NotableEvent[] = [
  {
    id: 'e1', title: 'Introduced Azelaic Acid 15%', date: 'Apr 10', type: 'active',
    description: 'Added to AM routine for hyperpigmentation support. Spot testing on jawline first.',
  },
  {
    id: 'e2', title: 'Barrier Compromise', date: 'Mar 22', type: 'reaction',
    description: 'Experiencing stinging when applying basic moisturizer. Pausing all actives for 5 days.',
    tags: ['Redness', 'Stinging'],
  },
  {
    id: 'e3', title: 'Overload Period Logged', date: 'Feb 14', type: 'warning',
    description: 'Used BHA and Tretinoin on consecutive nights. Noted increased dryness.',
  },
]

const eventStyle = {
  active: { dot: 'bg-sage/10 border-sage', icon: FlaskConical, iconColor: 'text-sage', card: 'bg-paper border-border-soft/50' },
  reaction: { dot: 'bg-terracotta/10 border-terracotta', icon: Flame, iconColor: 'text-terracotta', card: 'bg-white border-border-soft shadow-sm' },
  warning: { dot: 'bg-ink/5 border-border-soft', icon: TriangleAlert, iconColor: 'text-ink/40', card: 'bg-paper border-border-soft/50' },
}

const comparisonOptions = ['Jan 1 vs Today', 'Month 1 vs Month 3']

const PROGRESS_PCT = 33

export default function MilestonesPage() {
  const [comparison, setComparison] = useState(comparisonOptions[0])

  return (
    <div className="min-h-screen flex font-sans bg-paper">
      <Sidebar />

      <main className="flex-1 h-screen overflow-y-auto flex flex-col relative">

        {/* Toolbar */}
        <div className="bg-white border-b border-border-soft px-6 lg:px-8 py-4 flex items-center justify-between sticky top-0 z-20">
          <div>
            <h1 className="text-2xl font-bold text-ink tracking-tight">Milestones & Journey</h1>
            <p className="text-sm text-ink/50 mt-0.5">Honest expectations and documented progress.</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 bg-white border border-border-soft text-ink rounded-lg text-sm font-medium hover:bg-paper transition-colors flex items-center gap-2">
              <Download className="w-4 h-4" /> Export Journey
            </button>
            <button className="px-4 py-2 bg-sage text-white rounded-lg text-sm font-bold hover:bg-ink transition-colors flex items-center gap-2">
              <Camera className="w-4 h-4" /> New Snapshot
            </button>
          </div>
        </div>

        <div className="flex-1 p-6 lg:p-8 max-w-[1440px] mx-auto w-full space-y-8">

          {/* Journey Timeline */}
          <section className="bg-white rounded-2xl border border-border-soft overflow-hidden"
            style={{ boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)' }}>
            <div className="p-6 border-b border-border-soft flex justify-between items-center bg-cream">
              <div>
                <h2 className="text-lg font-bold text-ink font-serif">The Tretinoin Protocol</h2>
                <p className="text-xs text-ink/50 mt-1">Started: January 1, 2024 • Current: Month 4</p>
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-sage bg-sage/10 px-3 py-1.5 rounded-lg border border-sage/20">
                Active Journey
              </span>
            </div>

            <div className="p-8 overflow-x-auto pb-10">
              <div className="min-w-[900px] relative">
                {/* Connecting line */}
                <div className="absolute top-[45px] left-[48px] right-[48px] h-1 bg-paper rounded-full z-0">
                  <div className="h-full bg-sage rounded-full" style={{ width: `${PROGRESS_PCT}%` }} />
                </div>

                <div className="grid grid-cols-4 gap-4 relative z-10">
                  {timelineNodes.map(node => (
                    <div key={node.month} className={`relative ${!node.completed ? 'opacity-55' : ''}`}>
                      <div className={`w-24 h-24 rounded-full mx-auto flex items-center justify-center border-4 overflow-hidden shadow-sm ${
                        node.completed ? 'border-sage bg-white' : 'border-border-soft bg-paper'
                      }`}>
                        {node.hasPhoto ? (
                          <div className="w-full h-full bg-gradient-to-br from-sage/20 to-sage/5 flex items-center justify-center">
                            <Camera className="w-6 h-6 text-sage/50" />
                          </div>
                        ) : node.month === 12 ? (
                          <FlagTriangleRight className="w-7 h-7 text-ink/25" />
                        ) : (
                          <Clock className="w-7 h-7 text-ink/25" />
                        )}
                      </div>
                      <div className="text-center mt-4">
                        <h4 className={`text-sm font-bold ${node.completed ? 'text-ink' : 'text-ink/50'}`}>
                          {node.label}
                        </h4>
                        <p className={`text-xs mt-1 px-2 leading-relaxed ${node.completed ? 'text-ink/50' : 'text-ink/35'}`}>
                          {node.description}
                        </p>
                        {node.badge && (
                          <div className={`mt-3 inline-block px-2 py-1 rounded text-[10px] font-medium border ${
                            node.badge.color === 'terracotta'
                              ? 'bg-terracotta/5 border-terracotta/20 text-terracotta'
                              : 'bg-paper border-border-soft text-ink/60'
                          }`}>
                            {node.badge.text}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Before/After + Notable Events */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* Progress Comparison */}
            <section className="lg:col-span-2 bg-white rounded-2xl border border-border-soft p-6"
              style={{ boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)' }}>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-ink font-serif">Progress Comparison</h3>
                <select
                  value={comparison}
                  onChange={e => setComparison(e.target.value)}
                  className="text-xs bg-paper border border-border-soft rounded-lg px-3 py-1.5 text-ink focus:outline-none focus:border-sage"
                >
                  {comparisonOptions.map(o => <option key={o}>{o}</option>)}
                </select>
              </div>

              {/* Lighting disclaimer */}
              <div className="bg-terracotta/5 border border-terracotta/20 rounded-lg p-3 mb-6 flex items-start gap-2">
                <Lightbulb className="w-4 h-4 text-terracotta mt-0.5 shrink-0" />
                <p className="text-xs text-ink leading-relaxed">
                  <strong>Lighting Disclaimer:</strong> Ensure photos are taken in identical natural lighting conditions facing the same window. Variations in light can mimic or hide texture changes.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Before */}
                <div className="space-y-3">
                  <div className="relative rounded-xl overflow-hidden border border-border-soft aspect-square bg-paper flex items-center justify-center">
                    <div className="text-center text-ink/20">
                      <Camera className="w-8 h-8 mx-auto mb-2" />
                      <p className="text-xs">Before photo</p>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                      <span className="text-white font-bold text-sm">Before</span>
                    </div>
                  </div>
                  <div className="bg-paper rounded-lg p-3 border border-border-soft/60 space-y-1.5">
                    {[
                      { label: 'Date', value: 'Jan 1, 2024' },
                      { label: 'Active Load', value: 'Minimal' },
                      { label: 'Skin State', value: 'Congested, Dull', color: 'text-terracotta' },
                    ].map(r => (
                      <div key={r.label} className="flex justify-between text-xs">
                        <span className="text-ink/40">{r.label}</span>
                        <span className={`font-medium ${r.color ?? 'text-ink'}`}>{r.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* After */}
                <div className="space-y-3">
                  <div className="relative rounded-xl overflow-hidden border border-border-soft aspect-square bg-paper flex items-center justify-center">
                    <div className="text-center text-ink/20">
                      <Camera className="w-8 h-8 mx-auto mb-2" />
                      <p className="text-xs">Current photo</p>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                      <span className="text-white font-bold text-sm">Current (Month 4)</span>
                    </div>
                  </div>
                  <div className="bg-paper rounded-lg p-3 border border-border-soft/60 space-y-1.5">
                    {[
                      { label: 'Date', value: 'Apr 15, 2024' },
                      { label: 'Active Load', value: 'Tretinoin 3x/wk' },
                      { label: 'Skin State', value: 'Improving, Mildly Dry', color: 'text-sage' },
                    ].map(r => (
                      <div key={r.label} className="flex justify-between text-xs">
                        <span className="text-ink/40">{r.label}</span>
                        <span className={`font-medium ${r.color ?? 'text-ink'}`}>{r.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* Notable Events */}
            <section className="bg-white rounded-2xl border border-border-soft flex flex-col"
              style={{ height: 560, boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)' }}>
              <div className="p-6 border-b border-border-soft shrink-0">
                <h3 className="text-lg font-bold text-ink font-serif">Notable Events</h3>
                <p className="text-xs text-ink/50 mt-1">Variables that may impact progress.</p>
              </div>
              <div className="flex-1 overflow-y-auto p-6 space-y-5">
                {events.map((ev, i) => {
                  const s = eventStyle[ev.type]
                  const Icon = s.icon
                  const isLast = i === events.length - 1
                  return (
                    <div key={ev.id} className="relative pl-7">
                      {!isLast && (
                        <div className="absolute left-[11px] top-7 bottom-[-20px] w-px bg-border-soft" />
                      )}
                      <div className={`absolute left-0 top-1 w-6 h-6 rounded-full border flex items-center justify-center z-10 ${s.dot}`}>
                        <Icon className={`w-2.5 h-2.5 ${s.iconColor}`} />
                      </div>
                      <div className={`rounded-xl p-4 border ${s.card}`}>
                        <div className="flex justify-between items-start mb-1.5">
                          <h4 className="text-sm font-bold text-ink">{ev.title}</h4>
                          <span className="text-[10px] text-ink/40 shrink-0 ml-2">{ev.date}</span>
                        </div>
                        <p className="text-xs text-ink/60 leading-relaxed">{ev.description}</p>
                        {ev.tags && (
                          <div className="mt-2.5 flex gap-1.5 flex-wrap">
                            {ev.tags.map(t => (
                              <span key={t} className="px-2 py-0.5 bg-terracotta/5 text-terracotta text-[10px] font-medium rounded border border-terracotta/20">
                                {t}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>
          </div>

          {/* Journey Metrics */}
          <section className="bg-white rounded-2xl border border-border-soft p-6"
            style={{ boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)' }}>
            <h3 className="text-lg font-bold text-ink font-serif mb-6">Journey Metrics</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

              <div className="bg-paper rounded-xl p-5 border border-border-soft/60 flex flex-col justify-between">
                <div className="flex items-center gap-2 text-ink/40 mb-2">
                  <CalendarCheck className="w-4 h-4" />
                  <span className="text-xs font-medium uppercase tracking-wider">Consistency</span>
                </div>
                <div>
                  <span className="text-3xl font-bold text-ink">86%</span>
                  <p className="text-xs text-ink/40 mt-1">Routine completion rate (last 30 days)</p>
                </div>
              </div>

              <div className="bg-paper rounded-xl p-5 border border-border-soft/60 flex flex-col justify-between">
                <div className="flex items-center gap-2 text-sage mb-2">
                  <ShieldCheck className="w-4 h-4" />
                  <span className="text-xs font-medium uppercase tracking-wider">Barrier Health</span>
                </div>
                <div>
                  <span className="text-3xl font-bold text-ink">Stable</span>
                  <p className="text-xs text-ink/40 mt-1">No reaction spikes in 14 days</p>
                </div>
              </div>

              <div className="bg-paper rounded-xl p-5 border border-border-soft/60 flex flex-col justify-between">
                <div className="flex items-center gap-2 text-terracotta mb-2">
                  <Droplets className="w-4 h-4" />
                  <span className="text-xs font-medium uppercase tracking-wider">Active Load</span>
                </div>
                <div>
                  <span className="text-3xl font-bold text-ink">Moderate</span>
                  <p className="text-xs text-ink/40 mt-1">2 strong actives in rotation</p>
                </div>
              </div>

              <button className="bg-sage/10 rounded-xl p-5 border border-sage/20 flex flex-col items-center justify-center text-center hover:bg-sage/20 transition-colors cursor-pointer">
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center mb-2 shadow-sm text-sage">
                  <Plus className="w-5 h-5" />
                </div>
                <span className="text-sm font-bold text-ink">Log Skin Analysis</span>
              </button>

            </div>
          </section>

        </div>
      </main>
    </div>
  )
}
