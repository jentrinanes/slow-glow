import { useState } from 'react'
import { Flame, TriangleAlert, HourglassIcon, Clock, ArrowUpRight, Smile, Frown } from 'lucide-react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip
} from 'recharts'
import Sidebar from '../components/Sidebar'

const progressionData = [
  { week: 'W1', frequency: 1 },
  { week: 'W2', frequency: 1 },
  { week: 'W3', frequency: 2 },
  { week: 'W4', frequency: 2 },
  { week: 'W5', frequency: 3 },
  { week: 'W6', frequency: 3 },
]

const amSteps = [
  { id: 'am1', name: 'Gentle Cleanser', product: 'Oat So Simple Water Cream', badge: null },
  { id: 'am2', name: 'Vitamin C Serum', product: 'Mad Hippie (10% SAP)', badge: { label: 'Active', color: 'bg-sage/10 text-sage' } },
  { id: 'am3', name: 'Sunscreen SPF 50', product: 'Beauty of Joseon Relief Sun', badge: null },
]

const pmSteps = [
  { id: 'pm1', name: 'Cleansing Balm', product: 'Heimish All Clean Balm', badge: null },
  { id: 'pm2', name: 'Water-based Cleanser', product: 'Krave Matcha Hemp', badge: null },
  { id: 'pm3', name: 'Retinoid', product: 'Differin Gel (0.1% Adapalene)', badge: { label: 'Strong Active', color: 'bg-terracotta/10 text-terracotta' } },
  { id: 'pm4', name: 'Barrier Cream', product: 'Illiyoon Ceramide Ato', badge: null },
]

const expiryItems = [
  { name: 'Vitamin C Serum', pao: '3 Months', daysLeft: 14, urgent: true },
  { name: 'BHA Liquid Exfoliant', pao: '12 Months', daysLeft: 60, urgent: false },
]

const reactions = [
  { mood: 'good', label: 'Clear', date: 'Oct 22', note: 'No stinging after retinoid application. Barrier feels intact.', color: 'bg-sage' },
  { mood: 'bad', label: 'Mild Redness', date: 'Oct 19', note: 'Slight flush on cheeks after Vitamin C. Skipping tomorrow.', color: 'bg-terracotta/80' },
]

function RoutineStep({ name, product, badge, checked, onToggle }: {
  name: string
  product: string
  badge: { label: string; color: string } | null
  checked: boolean
  onToggle: () => void
}) {
  return (
    <label
      className="flex items-start gap-3 p-3 rounded-xl border border-border-soft/60 hover:border-border-soft cursor-pointer group transition-colors"
      onClick={onToggle}
    >
      <div className={`w-5 h-5 rounded-md border-2 mt-0.5 flex items-center justify-center transition-colors shrink-0 ${
        checked ? 'bg-sage border-sage' : 'border-ink/20'
      }`}>
        {checked && (
          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
      </div>
      <div className="flex-1">
        <p className={`text-sm font-medium transition-colors ${checked ? 'text-ink/40 line-through' : 'text-ink group-hover:text-sage'}`}>{name}</p>
        <p className="text-xs text-ink/40 mt-0.5">{product}</p>
      </div>
      {badge && (
        <span className={`px-2 py-0.5 rounded text-[10px] font-medium mt-1 shrink-0 ${badge.color}`}>{badge.label}</span>
      )}
    </label>
  )
}

export default function DashboardPage() {
  const [amChecked, setAmChecked] = useState<Record<string, boolean>>({})
  const [pmChecked, setPmChecked] = useState<Record<string, boolean>>({})

  const toggle = (
    id: string,
    state: Record<string, boolean>,
    setState: React.Dispatch<React.SetStateAction<Record<string, boolean>>>
  ) => setState({ ...state, [id]: !state[id] })

  return (
    <div className="min-h-screen flex font-sans bg-paper">
      <Sidebar />

      <main className="flex-1 h-screen overflow-y-auto p-6 lg:p-8">

        {/* Header */}
        <header className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-2xl font-bold text-ink tracking-tight">Today's Overview</h1>
            <p className="text-sm text-ink/50 mt-1">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
          </div>

          <div className="flex gap-4">
            {/* Streak */}
            <div className="bg-white rounded-xl px-4 py-2 shadow-sm border border-border-soft flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-sage/10 flex items-center justify-center">
                <Flame className="w-4 h-4 text-sage" />
              </div>
              <div>
                <p className="text-xs text-ink/50 font-medium">Routine Streak</p>
                <p className="text-sm font-bold text-ink">14 Days</p>
              </div>
            </div>

            {/* Overload */}
            <button className="bg-white rounded-xl px-4 py-2 shadow-sm border border-terracotta/30 flex items-center gap-3 hover:bg-terracotta/5 transition-colors group">
              <div className="w-8 h-8 rounded-full bg-terracotta/10 flex items-center justify-center group-hover:bg-terracotta/20 transition-colors">
                <TriangleAlert className="w-4 h-4 text-terracotta" />
              </div>
              <div className="text-left">
                <p className="text-xs text-ink/50 font-medium">Barrier Load</p>
                <p className="text-sm font-bold text-terracotta">Moderate (2 Actives)</p>
              </div>
            </button>
          </div>
        </header>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* Left: 7 cols */}
          <div className="lg:col-span-7 flex flex-col gap-6">

            {/* AM / PM Routines */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* AM */}
              <div className="bg-white rounded-2xl border border-border-soft p-6" style={{ boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)' }}>
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-lg font-semibold text-ink">AM Routine</h2>
                    <p className="text-xs text-ink/50">Focus: Protection & Hydration</p>
                  </div>
                  <span className="px-2.5 py-1 bg-paper text-ink/60 rounded-md text-xs font-medium">3 Steps</span>
                </div>
                <div className="space-y-3">
                  {amSteps.map((step) => (
                    <RoutineStep
                      key={step.id}
                      {...step}
                      checked={!!amChecked[step.id]}
                      onToggle={() => toggle(step.id, amChecked, setAmChecked)}
                    />
                  ))}
                </div>
              </div>

              {/* PM */}
              <div className="bg-white rounded-2xl border border-border-soft p-6" style={{ boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)' }}>
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-lg font-semibold text-ink">PM Routine</h2>
                    <p className="text-xs text-ink/50">Focus: Repair & Renewal</p>
                  </div>
                  <span className="px-2.5 py-1 bg-paper text-ink/60 rounded-md text-xs font-medium">4 Steps</span>
                </div>
                <div className="space-y-3">
                  {pmSteps.map((step) => (
                    <RoutineStep
                      key={step.id}
                      {...step}
                      checked={!!pmChecked[step.id]}
                      onToggle={() => toggle(step.id, pmChecked, setPmChecked)}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Expiry Watchlist */}
            <div className="bg-white rounded-2xl border border-border-soft p-6" style={{ boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)' }}>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-ink">Expiry Watchlist</h2>
                <a href="#" className="text-sm text-sage hover:underline font-medium">View Inventory</a>
              </div>
              <div className="flex gap-4 overflow-x-auto pb-1">
                {expiryItems.map((item) => (
                  <div
                    key={item.name}
                    className={`min-w-[200px] p-4 rounded-xl border flex flex-col gap-2 ${
                      item.urgent ? 'border-terracotta/20 bg-cream' : 'border-border-soft bg-white'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <span className={`w-8 h-8 rounded-full flex items-center justify-center ${item.urgent ? 'bg-terracotta/10' : 'bg-paper'}`}>
                        {item.urgent
                          ? <HourglassIcon className="w-4 h-4 text-terracotta" />
                          : <Clock className="w-4 h-4 text-ink/40" />}
                      </span>
                      <span className={`text-xs font-semibold px-2 py-1 rounded ${
                        item.urgent ? 'bg-terracotta/10 text-terracotta' : 'bg-paper text-ink/50'
                      }`}>
                        {item.urgent ? `${item.daysLeft} Days left` : '2 Months'}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-ink">{item.name}</p>
                      <p className="text-xs text-ink/50 mt-0.5">PAO: {item.pao}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: 5 cols */}
          <div className="lg:col-span-5 flex flex-col gap-6">

            {/* Tolerance Progression Chart */}
            <div className="bg-white rounded-2xl border border-border-soft p-6 flex flex-col h-[340px]" style={{ boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)' }}>
              <div className="flex justify-between items-center mb-2">
                <div>
                  <h2 className="text-lg font-semibold text-ink">Tolerance Progression</h2>
                  <p className="text-xs text-ink/50">Adapalene 0.1% Introduction</p>
                </div>
                <button className="w-8 h-8 rounded-full hover:bg-paper flex items-center justify-center text-ink/40 transition-colors">
                  <ArrowUpRight className="w-4 h-4" />
                </button>
              </div>
              <div className="flex-1 mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={progressionData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid vertical={false} stroke="rgba(229,231,235,0.5)" />
                    <XAxis dataKey="week" tick={{ fontFamily: 'Inter', fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                    <YAxis domain={[0, 4]} ticks={[0, 1, 2, 3, 4]} tick={{ fontFamily: 'Inter', fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{ fontFamily: 'Inter', fontSize: 12, border: '1px solid #E8E4D9', borderRadius: 8 }}
                      formatter={(v) => [`${v}x / week`, 'Frequency']}
                    />
                    <Line
                      type="monotone"
                      dataKey="frequency"
                      stroke="#8DA290"
                      strokeWidth={3}
                      dot={{ fill: '#FDFBF7', stroke: '#8DA290', strokeWidth: 2, r: 5 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Recent Reactions */}
            <div className="bg-white rounded-2xl border border-border-soft p-6 flex-1" style={{ boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)' }}>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold text-ink">Recent Reactions</h2>
                <button className="text-sm font-medium text-ink/50 hover:text-ink transition-colors">Add Log</button>
              </div>

              <div className="space-y-4 relative before:absolute before:left-4 before:top-0 before:h-full before:w-px before:bg-border-soft/60">
                {reactions.map((r, i) => (
                  <div key={i} className="relative flex items-start gap-4 pl-2">
                    <div className={`w-8 h-8 rounded-full ${r.color} text-white flex items-center justify-center shrink-0 z-10 shadow-sm`}>
                      {r.mood === 'good'
                        ? <Smile className="w-4 h-4" />
                        : <Frown className="w-4 h-4" />}
                    </div>
                    <div className="flex-1 p-3 rounded-xl border border-border-soft/60 bg-white shadow-sm">
                      <div className="flex justify-between items-center mb-1">
                        <span className={`text-xs font-semibold ${r.mood === 'good' ? 'text-sage' : 'text-terracotta'}`}>{r.label}</span>
                        <span className="text-[10px] text-ink/40">{r.date}</span>
                      </div>
                      <p className="text-xs text-ink/60 leading-relaxed">{r.note}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
