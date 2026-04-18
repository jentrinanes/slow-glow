import { useState } from 'react'
import { Plus, TriangleAlert, CalendarCheck, ShieldCheck, Bell, Check, ArrowRight } from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip
} from 'recharts'
import Sidebar from '../components/Sidebar'

const timelineData = [
  { week: 'W1', freq: 1 },
  { week: 'W2', freq: 1 },
  { week: 'W3', freq: 2 },
  { week: 'W4', freq: 2 },
  { week: 'W5', freq: 2 },
  { week: 'W6', freq: 3 },
  { week: 'W7', freq: 3 },
  { week: 'W8', freq: 3 },
]

const TABS = ['Retinoids', 'Vitamin C', 'AHA/BHA']

interface ZoneRow {
  zone: string
  product: string
  frequency: string
  tolerance: 'Good' | 'Sensitive' | 'Poor'
  lastReaction: string
}

const zones: ZoneRow[] = [
  { zone: 'Face (Cheeks/Forehead)', product: 'Tretinoin 0.025% Cream', frequency: '2x/week', tolerance: 'Good', lastReaction: 'None in 3 weeks' },
  { zone: 'Neck', product: 'Retinol 0.3% Serum', frequency: '1x/week', tolerance: 'Sensitive', lastReaction: 'Mild redness (2 days ago)' },
  { zone: 'Chest / Décolletage', product: 'Retinol 0.3% Serum', frequency: '2x/week', tolerance: 'Good', lastReaction: 'None recorded' },
]

const toleranceStyle: Record<ZoneRow['tolerance'], string> = {
  Good: 'bg-sage/10 text-sage',
  Sensitive: 'bg-yellow-100 text-yellow-700',
  Poor: 'bg-terracotta/10 text-terracotta',
}

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className={`w-10 h-6 rounded-full relative transition-colors shrink-0 ${on ? 'bg-sage' : 'bg-border-soft'}`}
    >
      <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${on ? 'right-1' : 'left-1'}`} />
    </button>
  )
}

export default function ProgressionTrackerPage() {
  const [activeTab, setActiveTab] = useState('Retinoids')
  const [timeRange, setTimeRange] = useState('Last 3 Months')
  const [reminderTonight, setReminderTonight] = useState(true)
  const [reminderMilestone, setReminderMilestone] = useState(true)

  return (
    <div className="min-h-screen flex font-sans bg-paper">
      <Sidebar />

      <main className="flex-1 h-screen overflow-y-auto flex flex-col relative">

        {/* Toolbar */}
        <div className="bg-white border-b border-border-soft px-6 lg:px-8 py-4 flex items-center justify-between sticky top-0 z-10">
          <div>
            <h1 className="text-2xl font-bold text-ink tracking-tight">Progression Tracker</h1>
            <p className="text-sm text-ink/50 mt-0.5">Monitor active ingredient introduction and body zone tolerance.</p>
          </div>
          <button className="px-4 py-2 border border-border-soft rounded-lg text-sm font-medium text-ink bg-white hover:bg-paper transition-colors flex items-center gap-2">
            <Plus className="w-4 h-4" /> Track New Active
          </button>
        </div>

        <div className="flex-1 p-6 lg:p-8 flex flex-col gap-8 max-w-7xl mx-auto w-full">

          {/* Tabs */}
          <div className="flex gap-0 border-b border-border-soft overflow-x-auto">
            {TABS.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors -mb-px ${
                  activeTab === tab
                    ? 'border-sage text-sage font-bold'
                    : 'border-transparent text-ink/50 hover:text-ink'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Overload Alert */}
          <section
            className="bg-cream border border-terracotta/30 rounded-2xl p-4 flex items-start gap-4"
            style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
          >
            <div className="w-10 h-10 rounded-full bg-terracotta/10 flex items-center justify-center shrink-0 mt-0.5">
              <TriangleAlert className="w-4 h-4 text-terracotta" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-bold text-ink">Potential Overload Detected</h3>
              <p className="text-xs text-ink/60 mt-1 leading-relaxed">
                You've logged AHA/BHA usage on the same night as Retinoids. This increases the risk of barrier damage.
              </p>
              <button className="text-xs font-bold text-terracotta mt-2 inline-flex items-center gap-1 hover:underline">
                View Conflict Details <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </section>

          {/* Patience Meter + Frequency Stats */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6">

            <div
              className="col-span-1 md:col-span-2 bg-white rounded-2xl border border-border-soft p-6 flex flex-col justify-between"
              style={{ boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)' }}
            >
              <div>
                <p className="text-xs font-bold text-ink/40 uppercase tracking-wider mb-1">Patience Meter</p>
                <div className="flex items-end gap-3">
                  <span className="text-3xl font-bold text-ink">Level 4</span>
                  <span className="text-sm text-sage font-medium mb-1">Steady Progress</span>
                </div>
                <p className="text-xs text-ink/50 mt-2 max-w-sm">
                  You are successfully maintaining a slow introduction rate. No rapid increases detected.
                </p>
              </div>
              <div className="mt-6">
                <div className="flex justify-between text-xs text-ink/40 mb-2">
                  <span>Start (0.025%)</span>
                  <span>Goal (0.05% Daily)</span>
                </div>
                <div className="w-full h-3 bg-paper rounded-full overflow-hidden">
                  <div className="h-full bg-sage w-[45%] rounded-full" />
                </div>
                <div className="flex justify-between text-[10px] text-ink/30 mt-1">
                  <span>Week 1</span>
                  <span>Week 12+</span>
                </div>
              </div>
            </div>

            <div
              className="bg-white rounded-2xl border border-border-soft p-6 flex flex-col justify-center gap-5"
              style={{ boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)' }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-ink/40 uppercase tracking-wider">Current Frequency</p>
                  <p className="text-2xl font-bold text-ink mt-1">2x / Week</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-sage/10 flex items-center justify-center">
                  <CalendarCheck className="w-4 h-4 text-sage" />
                </div>
              </div>
              <div className="h-px bg-border-soft" />
              <div>
                <p className="text-xs font-bold text-ink/40 uppercase tracking-wider">Next Milestone</p>
                <p className="text-sm font-bold text-ink mt-1">3x / Week in 14 days</p>
              </div>
            </div>
          </section>

          {/* Timeline Chart */}
          <section
            className="bg-white rounded-2xl border border-border-soft p-6"
            style={{ boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)' }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-ink">Introduction Timeline</h2>
              <select
                value={timeRange}
                onChange={e => setTimeRange(e.target.value)}
                className="bg-paper border-none text-sm text-ink rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-sage"
              >
                {['Last 3 Months', 'Last 6 Months', 'All Time'].map(r => (
                  <option key={r}>{r}</option>
                ))}
              </select>
            </div>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={timelineData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="freqGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8DA290" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#8DA290" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} stroke="rgba(229,231,235,0.6)" />
                  <XAxis dataKey="week" tick={{ fontFamily: 'Inter', fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 5]} ticks={[0, 1, 2, 3, 4, 5]} tick={{ fontFamily: 'Inter', fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ fontFamily: 'Inter', fontSize: 12, border: '1px solid #E8E4D9', borderRadius: 8 }}
                    formatter={(v) => [`${v}x / week`, 'Frequency']}
                  />
                  <Area
                    type="monotone"
                    dataKey="freq"
                    stroke="#8DA290"
                    strokeWidth={3}
                    fill="url(#freqGradient)"
                    dot={{ fill: '#FDFBF7', stroke: '#8DA290', strokeWidth: 2, r: 5 }}
                    activeDot={{ r: 6 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </section>

          {/* Body Zone Tracking */}
          <section
            className="bg-white rounded-2xl border border-border-soft overflow-hidden"
            style={{ boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)' }}
          >
            <div className="p-6 border-b border-border-soft flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-ink">Body Zone Tracking</h2>
                <p className="text-xs text-ink/50 mt-1">Monitor tolerance across different areas.</p>
              </div>
              <button className="text-sm text-sage font-medium hover:underline">Edit Zones</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-paper border-b border-border-soft">
                    {['Zone', 'Current Product', 'Frequency', 'Tolerance Level', 'Last Reaction'].map(h => (
                      <th key={h} className="px-5 py-3 text-xs font-bold text-ink/40 uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-soft">
                  {zones.map(row => (
                    <tr key={row.zone} className="hover:bg-paper/60 transition-colors">
                      <td className="px-5 py-4 text-sm font-medium text-ink">{row.zone}</td>
                      <td className="px-5 py-4 text-sm text-ink/60">{row.product}</td>
                      <td className="px-5 py-4 text-sm text-ink/60">{row.frequency}</td>
                      <td className="px-5 py-4">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${toleranceStyle[row.tolerance]}`}>
                          {row.tolerance}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-xs text-ink/40">{row.lastReaction}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Safety Notes + Reminders */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-6">

            <div
              className="bg-cream border border-border-soft rounded-2xl p-6"
              style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
            >
              <h3 className="text-sm font-bold text-ink flex items-center gap-2 mb-4">
                <ShieldCheck className="w-4 h-4 text-sage" /> Safety Rules of Thumb
              </h3>
              <ul className="space-y-3">
                {[
                  'Always apply to completely dry skin to minimize irritation.',
                  'Use the "sandwich method" (moisturizer, active, moisturizer) if experiencing dryness.',
                  'Daily sunscreen is non-negotiable while using retinoids.',
                ].map((rule, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-ink/60">
                    <Check className="w-3.5 h-3.5 text-sage mt-0.5 shrink-0" />
                    {rule}
                  </li>
                ))}
              </ul>
            </div>

            <div
              className="bg-white border border-border-soft rounded-2xl p-6"
              style={{ boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)' }}
            >
              <h3 className="text-sm font-bold text-ink flex items-center gap-2 mb-4">
                <Bell className="w-4 h-4 text-ink/40" /> Application Reminders
              </h3>
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-ink">Tonight's Application</p>
                    <p className="text-xs text-ink/50">Scheduled for PM Routine</p>
                  </div>
                  <Toggle on={reminderTonight} onToggle={() => setReminderTonight(v => !v)} />
                </div>
                <div className="h-px bg-border-soft" />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-ink">Milestone Check-in</p>
                    <p className="text-xs text-ink/50">Remind me to evaluate tolerance</p>
                  </div>
                  <Toggle on={reminderMilestone} onToggle={() => setReminderMilestone(v => !v)} />
                </div>
              </div>
            </div>

          </section>

        </div>
      </main>
    </div>
  )
}
