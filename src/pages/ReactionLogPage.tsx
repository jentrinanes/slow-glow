import { useState } from 'react'
import { Download, BookOpen, RefreshCw, Flame, BarChart2, List } from 'lucide-react'
import {
  ComposedChart, Area, Bar, XAxis, YAxis, CartesianGrid,
  ResponsiveContainer, Tooltip, Legend
} from 'recharts'
import Sidebar from '../components/Sidebar'

const chartData = [
  { date: 'May 1',  severity: 1, active: 1 },
  { date: 'May 3',  severity: null, active: 1 },
  { date: 'May 4',  severity: 2, active: null },
  { date: 'May 7',  severity: null, active: 1 },
  { date: 'May 8',  severity: 2, active: null },
  { date: 'May 11', severity: null, active: 1 },
  { date: 'May 12', severity: 7, active: null },
  { date: 'May 15', severity: null, active: 1 },
  { date: 'May 16', severity: 4, active: null },
  { date: 'May 17', severity: null, active: 1 },
  { date: 'May 18', severity: 6, active: null },
]

const SYMPTOMS = ['Dryness', 'Stinging', 'Peeling', 'Breakouts', 'Redness', 'Itching']

const SUSPECTED_PRODUCTS = [
  { id: 'p1', name: 'Tretinoin 0.025% Cream', time: 'Used PM' },
  { id: 'p2', name: 'Vitamin C 15% Serum', time: 'Used AM' },
]

interface LogEntry {
  id: string
  date: string
  zone: string
  symptoms: string[]
  severity: number
  suspectProduct: string
}

const initialEntries: LogEntry[] = [
  { id: '1', date: 'May 16, 2024', zone: 'Face (Cheeks)', symptoms: ['Dryness', 'Peeling'], severity: 4, suspectProduct: 'Tretinoin 0.025%' },
  { id: '2', date: 'May 12, 2024', zone: 'Neck', symptoms: ['Redness', 'Stinging'], severity: 7, suspectProduct: 'Tretinoin 0.025%' },
  { id: '3', date: 'May 08, 2024', zone: 'Face (Chin)', symptoms: ['Breakouts'], severity: 2, suspectProduct: 'AHA/BHA Toner' },
]

function severityColor(v: number) {
  if (v <= 3) return 'bg-sage'
  if (v <= 6) return 'bg-terracotta/60'
  return 'bg-terracotta'
}

function severityLabel(v: number) {
  if (v <= 3) return 'Mild'
  if (v <= 6) return 'Moderate'
  return 'Severe'
}

export default function ReactionLogPage() {
  const [entries, setEntries] = useState<LogEntry[]>(initialEntries)
  const [chartView, setChartView] = useState<'chart' | 'list'>('chart')

  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [zone, setZone] = useState('Face (Cheeks)')
  const [symptoms, setSymptoms] = useState<string[]>(['Dryness', 'Peeling'])
  const [severity, setSeverity] = useState(6)
  const [checkedProducts, setCheckedProducts] = useState<string[]>(['p1'])
  const [notes, setNotes] = useState('')

  const [zoneFilter, setZoneFilter] = useState('All Body Zones')
  const [severityFilter, setSeverityFilter] = useState('All Severities')

  const toggleSymptom = (s: string) =>
    setSymptoms(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])

  const toggleProduct = (id: string) =>
    setCheckedProducts(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])

  const handleSave = () => {
    const suspect = SUSPECTED_PRODUCTS.filter(p => checkedProducts.includes(p.id)).map(p => p.name).join(', ')
    setEntries(prev => [{
      id: String(Date.now()),
      date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      zone,
      symptoms,
      severity,
      suspectProduct: suspect || '—',
    }, ...prev])
    setSymptoms([])
    setSeverity(3)
    setCheckedProducts([])
    setNotes('')
  }

  const filteredEntries = entries.filter(e => {
    const matchZone = zoneFilter === 'All Body Zones'
      || (zoneFilter === 'Face Only' && e.zone.startsWith('Face'))
      || (zoneFilter === 'Neck & Chest' && (e.zone === 'Neck' || e.zone === 'Chest'))
    const matchSeverity = severityFilter === 'All Severities'
      || (severityFilter === 'Moderate to Severe' && e.severity >= 4)
      || (severityFilter === 'Mild Only' && e.severity <= 3)
    return matchZone && matchSeverity
  })

  return (
    <div className="min-h-screen flex font-sans bg-paper">
      <Sidebar />

      <main className="flex-1 h-screen overflow-y-auto flex flex-col relative">

        {/* Toolbar */}
        <div className="bg-white border-b border-border-soft px-6 lg:px-8 py-4 flex items-center justify-between sticky top-0 z-10">
          <div>
            <h1 className="text-2xl font-bold text-ink tracking-tight">Reaction Log</h1>
            <p className="text-sm text-ink/50 mt-0.5">Document symptoms and analyze patterns to prevent barrier damage.</p>
          </div>
          <button className="px-4 py-2 border border-border-soft rounded-lg text-sm font-medium text-ink bg-white hover:bg-paper transition-colors flex items-center gap-2">
            <Download className="w-4 h-4" /> Export Log
          </button>
        </div>

        <div className="flex-1 p-6 lg:p-8 max-w-[1440px] mx-auto w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

            {/* LEFT: Log Entry Form */}
            <div className="lg:col-span-4 flex flex-col gap-6">
              <section
                className="bg-white rounded-2xl border border-border-soft p-6"
                style={{ boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)' }}
              >
                <h2 className="text-lg font-bold text-ink mb-5 border-b border-border-soft pb-4">Log New Reaction</h2>

                <div className="space-y-6">
                  {/* Date + Zone */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-ink/40 uppercase tracking-wider mb-2">Date</label>
                      <input
                        type="date"
                        value={date}
                        onChange={e => setDate(e.target.value)}
                        className="w-full bg-paper border border-border-soft rounded-lg px-3 py-2 text-sm text-ink focus:outline-none focus:border-sage"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-ink/40 uppercase tracking-wider mb-2">Body Zone</label>
                      <select
                        value={zone}
                        onChange={e => setZone(e.target.value)}
                        className="w-full bg-paper border border-border-soft rounded-lg px-3 py-2 text-sm text-ink focus:outline-none focus:border-sage"
                      >
                        {['Face (Cheeks)', 'Face (Forehead)', 'Face (Chin/Jaw)', 'Neck', 'Chest'].map(z => (
                          <option key={z}>{z}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Symptoms */}
                  <div>
                    <label className="block text-xs font-bold text-ink/40 uppercase tracking-wider mb-3">Symptoms Observed</label>
                    <div className="flex flex-wrap gap-2">
                      {SYMPTOMS.map(s => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => toggleSymptom(s)}
                          className={`px-3 py-1.5 rounded-full border text-sm font-medium transition-colors ${
                            symptoms.includes(s)
                              ? 'border-sage bg-sage/10 text-sage'
                              : 'border-border-soft bg-white text-ink/60 hover:border-sage/40'
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Severity Slider */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-xs font-bold text-ink/40 uppercase tracking-wider">Overall Severity</label>
                      <span className="text-sm font-bold text-terracotta">
                        {severityLabel(severity)} ({severity}/10)
                      </span>
                    </div>
                    <div className="px-1 py-3">
                      <input
                        type="range"
                        min={1}
                        max={10}
                        value={severity}
                        onChange={e => setSeverity(Number(e.target.value))}
                        style={{ accentColor: '#C27059' }}
                        className="w-full"
                      />
                      <div className="flex justify-between text-[10px] text-ink/30 mt-1 font-medium">
                        <span>Mild (1)</span>
                        <span>Severe (10)</span>
                      </div>
                    </div>
                  </div>

                  {/* Suspected Products */}
                  <div>
                    <label className="block text-xs font-bold text-ink/40 uppercase tracking-wider mb-2">Suspected Products (Last 24h)</label>
                    <div className="space-y-2">
                      {SUSPECTED_PRODUCTS.map(p => (
                        <label
                          key={p.id}
                          className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                            checkedProducts.includes(p.id) ? 'border-border-soft bg-paper' : 'border-border-soft bg-white hover:bg-paper/60'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={checkedProducts.includes(p.id)}
                            onChange={() => toggleProduct(p.id)}
                            style={{ accentColor: '#7D8E7A' }}
                            className="w-4 h-4 rounded"
                          />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-ink">{p.name}</p>
                            <p className="text-xs text-ink/40">{p.time}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block text-xs font-bold text-ink/40 uppercase tracking-wider mb-2">Clinical Notes (Optional)</label>
                    <textarea
                      rows={3}
                      value={notes}
                      onChange={e => setNotes(e.target.value)}
                      placeholder="Describe specific sensation or context..."
                      className="w-full bg-paper border border-border-soft rounded-lg px-3 py-2 text-sm text-ink focus:outline-none focus:border-sage resize-none placeholder-ink/30"
                    />
                  </div>

                  <button
                    onClick={handleSave}
                    className="w-full bg-sage text-white font-bold py-3 px-4 rounded-lg hover:bg-ink transition-colors"
                  >
                    Save Reaction Log
                  </button>
                </div>
              </section>
            </div>

            {/* RIGHT: Analytics + History */}
            <div className="lg:col-span-8 flex flex-col gap-6">

              {/* Filter Bar */}
              <div
                className="bg-white rounded-2xl border border-border-soft p-4 flex flex-wrap items-center justify-between gap-4"
                style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
              >
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-sm font-medium text-ink/50">Filter by:</span>
                  <select
                    value={zoneFilter}
                    onChange={e => setZoneFilter(e.target.value)}
                    className="bg-paper border-none text-sm text-ink rounded-lg px-3 py-1.5 focus:outline-none font-medium"
                  >
                    {['All Body Zones', 'Face Only', 'Neck & Chest'].map(o => <option key={o}>{o}</option>)}
                  </select>
                  <select
                    value={severityFilter}
                    onChange={e => setSeverityFilter(e.target.value)}
                    className="bg-paper border-none text-sm text-ink rounded-lg px-3 py-1.5 focus:outline-none font-medium"
                  >
                    {['All Severities', 'Moderate to Severe', 'Mild Only'].map(o => <option key={o}>{o}</option>)}
                  </select>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setChartView('chart')}
                    className={`p-2 rounded-lg transition-colors ${chartView === 'chart' ? 'text-sage bg-sage/10' : 'text-ink/40 hover:bg-paper'}`}
                  >
                    <BarChart2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setChartView('list')}
                    className={`p-2 rounded-lg transition-colors ${chartView === 'list' ? 'text-sage bg-sage/10' : 'text-ink/40 hover:bg-paper'}`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Chart */}
              {chartView === 'chart' && (
                <section
                  className="bg-white rounded-2xl border border-border-soft p-6"
                  style={{ boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)' }}
                >
                  <div className="flex items-center justify-between mb-1">
                    <h2 className="text-lg font-bold text-ink">Reaction Frequency & Severity</h2>
                    <span className="text-xs font-bold px-2 py-1 bg-paper rounded text-ink/40">Last 30 Days</span>
                  </div>
                  <p className="text-sm text-ink/50 mb-6">Visualizing symptom spikes against active ingredient usage days.</p>
                  <div className="h-[280px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="severityGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#C27059" stopOpacity={0.2} />
                            <stop offset="95%" stopColor="#C27059" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid vertical={false} stroke="rgba(229,231,235,0.6)" />
                        <XAxis dataKey="date" tick={{ fontFamily: 'Inter', fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                        <YAxis domain={[0, 10]} ticks={[0, 2, 4, 6, 8, 10]} tick={{ fontFamily: 'Inter', fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                        <Tooltip
                          contentStyle={{ fontFamily: 'Inter', fontSize: 12, border: '1px solid #E8E4D9', borderRadius: 8 }}
                        />
                        <Legend
                          wrapperStyle={{ fontFamily: 'Inter', fontSize: 12, paddingTop: 12 }}
                          formatter={v => v === 'severity' ? 'Symptom Severity' : 'Active Applied'}
                        />
                        <Bar dataKey="active" name="active" fill="#8DA290" fillOpacity={0.4} radius={[3, 3, 0, 0]} barSize={16} />
                        <Area
                          type="monotone"
                          dataKey="severity"
                          name="severity"
                          stroke="#C27059"
                          strokeWidth={3}
                          fill="url(#severityGrad)"
                          connectNulls
                          dot={{ fill: '#FDFBF7', stroke: '#C27059', strokeWidth: 2, r: 4 }}
                          activeDot={{ r: 6 }}
                        />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                </section>
              )}

              {/* Education Card */}
              <section className="bg-ink rounded-2xl p-6 relative overflow-hidden">
                <div
                  className="absolute inset-0 opacity-[0.04] pointer-events-none"
                  style={{ backgroundImage: 'linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)', backgroundSize: '20px 20px' }}
                />
                <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <BookOpen className="w-4 h-4 text-cream opacity-60" />
                      <span className="text-xs font-bold text-cream/60 uppercase tracking-wider">Clinical Education</span>
                    </div>
                    <h3 className="text-xl font-bold text-cream mb-3">Purging vs. Irritation</h3>
                    <p className="text-sm text-cream/70 leading-relaxed">
                      Distinguishing between an expected accelerated cell turnover cycle and compromised barrier function is critical for maintaining long-term skin health.
                    </p>
                  </div>
                  <div className="space-y-4">
                    <div className="bg-white/10 rounded-xl p-4 border border-white/10">
                      <h4 className="text-sm font-bold text-cream mb-2 flex items-center gap-2">
                        <RefreshCw className="w-3.5 h-3.5 text-sage" /> Purging (Expected)
                      </h4>
                      <ul className="text-xs text-cream/70 space-y-1.5 list-disc list-inside">
                        <li>Occurs in areas of frequent breakouts.</li>
                        <li>Microcomedones surface faster than usual.</li>
                        <li>Typically resolves within 4–6 weeks.</li>
                        <li>Not accompanied by widespread stinging.</li>
                      </ul>
                    </div>
                    <div className="bg-terracotta/20 rounded-xl p-4 border border-terracotta/30">
                      <h4 className="text-sm font-bold text-cream mb-2 flex items-center gap-2">
                        <Flame className="w-3.5 h-3.5 text-terracotta" /> Irritation (Barrier Damage)
                      </h4>
                      <ul className="text-xs text-cream/70 space-y-1.5 list-disc list-inside">
                        <li>Occurs in new areas, often with redness.</li>
                        <li>Accompanied by stinging from bland moisturizers.</li>
                        <li>Skin feels tight, shiny, or excessively dry.</li>
                        <li>Requires immediate cessation of actives.</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </section>

              {/* Recent Entries Table */}
              <section
                className="bg-white rounded-2xl border border-border-soft overflow-hidden"
                style={{ boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)' }}
              >
                <div className="p-6 border-b border-border-soft">
                  <h2 className="text-lg font-bold text-ink">Recent Entries</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-paper border-b border-border-soft">
                        {['Date', 'Zone', 'Symptoms', 'Severity', 'Suspect Product'].map(h => (
                          <th key={h} className="px-5 py-3 text-xs font-bold text-ink/40 uppercase tracking-wider whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border-soft">
                      {filteredEntries.map(row => (
                        <tr key={row.id} className="hover:bg-paper/60 transition-colors">
                          <td className="px-5 py-4 text-sm font-medium text-ink whitespace-nowrap">{row.date}</td>
                          <td className="px-5 py-4 text-sm text-ink/60">{row.zone}</td>
                          <td className="px-5 py-4">
                            <div className="flex gap-1 flex-wrap">
                              {row.symptoms.map(s => (
                                <span key={s} className="text-[10px] px-2 py-0.5 bg-paper border border-border-soft rounded text-ink/60">{s}</span>
                              ))}
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${severityColor(row.severity)}`} />
                              <span className={`text-sm ${row.severity >= 7 ? 'font-medium text-ink' : 'text-ink/60'}`}>{row.severity}/10</span>
                            </div>
                          </td>
                          <td className="px-5 py-4 text-xs text-ink/40">{row.suspectProduct}</td>
                        </tr>
                      ))}
                      {filteredEntries.length === 0 && (
                        <tr>
                          <td colSpan={5} className="px-5 py-12 text-center text-sm text-ink/30">No entries match your filters.</td>
                        </tr>
                      )}
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
