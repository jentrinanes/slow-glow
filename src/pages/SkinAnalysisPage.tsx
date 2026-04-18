import { useState } from 'react'
import { Download, Camera } from 'lucide-react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  ResponsiveContainer, Tooltip, Legend
} from 'recharts'
import Sidebar from '../components/Sidebar'

const chartData = {
  '1M': [
    { date: 'May 1',  hydration: 5, redness: 7, texture: 6 },
    { date: 'May 5',  hydration: 6, redness: 6, texture: 6 },
    { date: 'May 10', hydration: 6, redness: 5, texture: 5 },
    { date: 'May 15', hydration: 7, redness: 4, texture: 4 },
    { date: 'May 20', hydration: 8, redness: 4, texture: 3 },
    { date: 'May 24', hydration: 8, redness: 3, texture: 2 },
  ],
  '3M': [
    { date: 'Mar',  hydration: 4, redness: 8, texture: 7 },
    { date: 'Apr',  hydration: 6, redness: 6, texture: 5 },
    { date: 'May',  hydration: 8, redness: 3, texture: 2 },
  ],
  '6M': [
    { date: 'Dec',  hydration: 3, redness: 9, texture: 8 },
    { date: 'Jan',  hydration: 4, redness: 8, texture: 7 },
    { date: 'Feb',  hydration: 5, redness: 7, texture: 6 },
    { date: 'Mar',  hydration: 5, redness: 7, texture: 6 },
    { date: 'Apr',  hydration: 6, redness: 5, texture: 4 },
    { date: 'May',  hydration: 8, redness: 3, texture: 2 },
  ],
}

type TimeRange = '1M' | '3M' | '6M'

interface LogEntry {
  id: string
  date: string
  routine: string
  hydration: number
  redness: number
  texture: number
}

const initialEntries: LogEntry[] = [
  { id: '1', date: 'May 23, 2024', routine: 'Protocol B', hydration: 8, redness: 4, texture: 3 },
  { id: '2', date: 'May 22, 2024', routine: 'Protocol A', hydration: 7, redness: 6, texture: 4 },
  { id: '3', date: 'May 21, 2024', routine: 'Protocol B', hydration: 6, redness: 5, texture: 5 },
]

const photoDiary = [
  {
    id: 'd1', title: 'Week 1 vs Week 4', zone: 'Protocol A',
    before: 'Day 1', after: 'Day 28',
    tags: [{ label: 'Cheeks', color: '' }, { label: 'Texture Improved', color: 'sage' }],
  },
  {
    id: 'd2', title: 'Pre-Purge vs Current', zone: 'Full Face',
    before: 'Pre-Purge', after: 'Today',
    tags: [{ label: 'Full Face', color: '' }, { label: 'Redness Reduced', color: 'terracotta' }],
  },
]

function hydrationLabel(v: number) {
  if (v <= 3) return { text: 'Dry', cls: 'bg-terracotta/10 text-terracotta' }
  if (v <= 5) return { text: 'Balanced', cls: 'bg-paper text-ink/60' }
  if (v <= 7) return { text: 'Optimal', cls: 'bg-sage/10 text-sage' }
  return { text: 'Oily', cls: 'bg-paper text-ink/60' }
}

function rednessLabel(v: number) {
  if (v <= 2) return { text: 'Clear', cls: 'bg-sage/10 text-sage' }
  if (v <= 4) return { text: 'Mild', cls: 'bg-terracotta/10 text-terracotta' }
  if (v <= 7) return { text: 'Moderate', cls: 'bg-terracotta/10 text-terracotta' }
  return { text: 'Severe', cls: 'bg-terracotta/20 text-terracotta' }
}

function textureLabel(v: number) {
  if (v <= 3) return { text: 'Smooth', cls: 'bg-sage/10 text-ink/60' }
  if (v <= 6) return { text: 'Uneven', cls: 'bg-paper text-ink/60' }
  return { text: 'Rough', cls: 'bg-terracotta/10 text-terracotta' }
}

type Breakout = 'None' | 'Mild' | 'Moderate' | 'Severe'

function MetricSlider({
  label, value, onChange, accentColor, min3, mid, max3,
  getLabelFn,
}: {
  label: string
  value: number
  onChange: (v: number) => void
  accentColor: string
  min3: string
  mid: string
  max3: string
  getLabelFn: (v: number) => { text: string; cls: string }
}) {
  const badge = getLabelFn(value)
  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <label className="text-sm font-medium text-ink">{label}</label>
        <span className={`text-xs font-bold px-2 py-0.5 rounded ${badge.cls}`}>{badge.text}</span>
      </div>
      <input
        type="range" min={1} max={10} value={value}
        onChange={e => onChange(Number(e.target.value))}
        style={{ accentColor }}
        className="w-full"
      />
      <div className="flex justify-between text-[10px] text-ink/30 mt-1">
        <span>{min3}</span><span>{mid}</span><span>{max3}</span>
      </div>
    </div>
  )
}

export default function SkinAnalysisPage() {
  const [timeRange, setTimeRange] = useState<TimeRange>('1M')
  const [entries, setEntries] = useState<LogEntry[]>(initialEntries)

  const [hydration, setHydration] = useState(8)
  const [redness, setRedness] = useState(3)
  const [texture, setTexture] = useState(2)
  const [breakout, setBreakout] = useState<Breakout>('Mild')
  const [routine, setRoutine] = useState('Protocol A (Tretinoin Night)')
  const [zone, setZone] = useState('Full Face')
  const [notes, setNotes] = useState('')

  const handleSave = () => {
    const today = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    const proto = routine.startsWith('Protocol A') ? 'Protocol A' : routine.startsWith('Protocol B') ? 'Protocol B' : 'Protocol C'
    setEntries(prev => [{
      id: String(Date.now()), date: today,
      routine: proto, hydration, redness, texture,
    }, ...prev])
    setNotes('')
  }

  return (
    <div className="min-h-screen flex font-sans bg-paper">
      <Sidebar />

      <main className="flex-1 h-screen overflow-y-auto flex flex-col relative">

        {/* Toolbar */}
        <div className="bg-white border-b border-border-soft px-6 lg:px-8 py-4 flex items-center justify-between sticky top-0 z-20">
          <div>
            <h1 className="text-2xl font-bold text-ink tracking-tight">Skin Analysis Log</h1>
            <p className="text-sm text-ink/50 mt-0.5">Scientific tracking of your skin's daily state.</p>
          </div>
          <button className="px-4 py-2 bg-white border border-border-soft text-ink rounded-lg text-sm font-medium hover:bg-paper transition-colors flex items-center gap-2">
            <Download className="w-4 h-4" /> Export Data
          </button>
        </div>

        <div className="flex-1 p-6 lg:p-8 max-w-[1440px] mx-auto w-full space-y-8">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

            {/* LEFT: Entry Form */}
            <div className="xl:col-span-1">
              <section className="bg-white rounded-2xl border border-border-soft p-6"
                style={{ boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)' }}>
                <div className="mb-6">
                  <h2 className="text-lg font-bold text-ink font-serif">Today's Entry</h2>
                  <p className="text-xs text-ink/40 mt-1">
                    {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>

                <div className="space-y-6">
                  <MetricSlider
                    label="Hydration Level" value={hydration} onChange={setHydration}
                    accentColor="#7D8E7A" min3="Severely Dry" mid="Balanced" max3="Oily"
                    getLabelFn={hydrationLabel}
                  />
                  <MetricSlider
                    label="Redness / Inflammation" value={redness} onChange={setRedness}
                    accentColor="#C27059" min3="Clear" mid="Moderate" max3="Severe"
                    getLabelFn={rednessLabel}
                  />
                  <MetricSlider
                    label="Skin Texture" value={texture} onChange={setTexture}
                    accentColor="#9CA3AF" min3="Smooth" mid="Uneven" max3="Rough"
                    getLabelFn={textureLabel}
                  />

                  {/* Breakout Activity */}
                  <div>
                    <label className="text-sm font-medium text-ink block mb-2">Breakout Activity</label>
                    <div className="grid grid-cols-4 gap-2">
                      {(['None', 'Mild', 'Moderate', 'Severe'] as Breakout[]).map(b => (
                        <button
                          key={b} type="button"
                          onClick={() => setBreakout(b)}
                          className={`py-2 border rounded-lg text-xs font-medium transition-colors ${
                            breakout === b
                              ? 'border-sage bg-sage/10 text-sage'
                              : 'border-border-soft text-ink/50 hover:bg-paper'
                          }`}
                        >
                          {b}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Selects */}
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-ink/40 block mb-1">Routine Version</label>
                      <select value={routine} onChange={e => setRoutine(e.target.value)}
                        className="w-full bg-paper border border-border-soft rounded-lg px-3 py-2 text-sm text-ink focus:outline-none focus:border-sage">
                        {['Protocol A (Tretinoin Night)', 'Protocol B (Recovery Night)', 'Protocol C (Exfoliation)'].map(o => <option key={o}>{o}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-ink/40 block mb-1">Primary Zone</label>
                      <select value={zone} onChange={e => setZone(e.target.value)}
                        className="w-full bg-paper border border-border-soft rounded-lg px-3 py-2 text-sm text-ink focus:outline-none focus:border-sage">
                        {['Full Face', 'Cheeks / Jawline', 'T-Zone', 'Neck'].map(o => <option key={o}>{o}</option>)}
                      </select>
                    </div>
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="text-xs text-ink/40 block mb-1">Scientific Notes</label>
                    <textarea
                      value={notes} onChange={e => setNotes(e.target.value)}
                      rows={3} placeholder="Observations..."
                      className="w-full bg-paper border border-border-soft rounded-lg px-3 py-2 text-sm text-ink focus:outline-none focus:border-sage resize-none placeholder-ink/30"
                    />
                  </div>

                  <button onClick={handleSave}
                    className="w-full py-3 bg-sage text-white rounded-lg text-sm font-bold hover:bg-ink transition-colors">
                    Save Log Entry
                  </button>
                </div>
              </section>
            </div>

            {/* RIGHT: Charts & History */}
            <div className="xl:col-span-2 space-y-8">

              {/* Longitudinal Progress Chart */}
              <section className="bg-white rounded-2xl border border-border-soft p-6"
                style={{ boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)' }}>
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-lg font-bold text-ink font-serif">Longitudinal Progress</h3>
                    <p className="text-xs text-ink/40 mt-1">30-Day Metric Trends</p>
                  </div>
                  <div className="flex gap-2">
                    {(['1M', '3M', '6M'] as TimeRange[]).map(r => (
                      <button key={r} onClick={() => setTimeRange(r)}
                        className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors border ${
                          timeRange === r
                            ? 'bg-paper border-border-soft text-ink'
                            : 'bg-white border-border-soft text-ink/40 hover:text-ink'
                        }`}>
                        {r}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData[timeRange]} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid stroke="rgba(0,0,0,0.05)" vertical={false} />
                      <XAxis dataKey="date" tick={{ fontFamily: 'Inter', fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                      <YAxis domain={[0, 10]} ticks={[0, 2, 4, 6, 8, 10]} tick={{ fontFamily: 'Inter', fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ fontFamily: 'Inter', fontSize: 12, border: '1px solid #E8E4D9', borderRadius: 8 }} />
                      <Legend wrapperStyle={{ fontFamily: 'Inter', fontSize: 12, paddingTop: 16 }} />
                      <Line type="monotone" dataKey="hydration" name="Hydration" stroke="#7D8E7A" strokeWidth={3}
                        dot={{ fill: '#FDFBF7', stroke: '#7D8E7A', strokeWidth: 2, r: 4 }} activeDot={{ r: 6 }} />
                      <Line type="monotone" dataKey="redness" name="Redness" stroke="#C27059" strokeWidth={3}
                        dot={{ fill: '#FDFBF7', stroke: '#C27059', strokeWidth: 2, r: 4 }} activeDot={{ r: 6 }} />
                      <Line type="monotone" dataKey="texture" name="Texture Issues" stroke="#2D2D2D" strokeWidth={2}
                        strokeDasharray="4 3"
                        dot={{ fill: '#FDFBF7', stroke: '#2D2D2D', strokeWidth: 2, r: 3 }} activeDot={{ r: 5 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </section>

              {/* Photo Diary */}
              <section className="bg-white rounded-2xl border border-border-soft p-6"
                style={{ boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)' }}>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold text-ink font-serif">Photo Diary</h3>
                  <button className="text-sm text-sage font-medium hover:underline">View All</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {photoDiary.map(card => (
                    <div key={card.id} className="border border-border-soft rounded-xl p-4 bg-paper">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-xs font-bold text-ink">{card.title}</span>
                        <span className="text-[10px] text-ink/40">{card.zone}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {[card.before, card.after].map(label => (
                          <div key={label} className="relative rounded-lg overflow-hidden aspect-square bg-white border border-border-soft flex items-center justify-center">
                            <div className="text-center text-ink/20">
                              <Camera className="w-5 h-5 mx-auto mb-1" />
                              <p className="text-[10px]">Photo</p>
                            </div>
                            <div className="absolute bottom-0 left-0 right-0 bg-black/50 p-1.5 text-center">
                              <span className="text-[10px] text-white font-medium">{label}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="mt-3 flex gap-2 flex-wrap">
                        {card.tags.map(t => (
                          <span key={t.label} className={`px-2 py-1 rounded text-[10px] font-medium border ${
                            t.color === 'sage' ? 'bg-sage/10 border-sage/20 text-sage'
                            : t.color === 'terracotta' ? 'bg-terracotta/10 border-terracotta/20 text-terracotta'
                            : 'bg-white border-border-soft text-ink/50'
                          }`}>{t.label}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Entry History Table */}
              <section className="bg-white rounded-2xl border border-border-soft overflow-hidden"
                style={{ boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)' }}>
                <div className="p-6 border-b border-border-soft">
                  <h3 className="text-lg font-bold text-ink font-serif">Entry History</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-cream border-b border-border-soft text-xs text-ink/40 uppercase tracking-wider">
                        {['Date', 'Routine', 'Hydration', 'Redness', 'Texture'].map(h => (
                          <th key={h} className="px-5 py-3 font-medium whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border-soft">
                      {entries.map(row => (
                        <tr key={row.id} className="hover:bg-paper/60 transition-colors text-sm text-ink">
                          <td className="px-5 py-4 whitespace-nowrap">{row.date}</td>
                          <td className="px-5 py-4">
                            <span className="px-2 py-1 bg-paper rounded border border-border-soft text-xs">{row.routine}</span>
                          </td>
                          <td className="px-5 py-4">
                            <span className={row.hydration >= 7 ? 'text-sage font-medium' : ''}>{row.hydration}/10</span>
                          </td>
                          <td className="px-5 py-4">
                            <span className={row.redness >= 5 ? 'text-terracotta font-medium' : ''}>{row.redness}/10</span>
                          </td>
                          <td className="px-5 py-4">{row.texture}/10</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
