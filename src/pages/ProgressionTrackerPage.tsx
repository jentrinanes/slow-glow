import { useEffect, useMemo, useState } from 'react'
import {
  TriangleAlert, CalendarCheck, ShieldCheck, Bell, Check, ArrowRight,
  FlaskConical, Layers,
} from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip,
} from 'recharts'
import Sidebar from '../components/Sidebar'
import { useApp } from '../context/AppContext'
import type { StepFrequency } from '../types'

// ─── Helpers ──────────────────────────────────────────────────────────────────

const FREQ_PER_WEEK: Record<StepFrequency, number> = {
  'daily': 7,
  'every-other-day': 3.5,
  '3x-week': 3,
  '2x-week': 2,
  '1x-week': 1,
}

const FREQ_LABEL: Record<StepFrequency, string> = {
  'daily': 'Daily',
  'every-other-day': 'Every other day',
  '3x-week': '3× / week',
  '2x-week': '2× / week',
  '1x-week': '1× / week',
}

function getTodayInTimezone(tz: string) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: tz }).format(new Date())
}

function parseLocalDate(iso: string) {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

function weeksBetween(a: Date, b: Date) {
  return Math.max(0, Math.floor((b.getTime() - a.getTime()) / (7 * 24 * 60 * 60 * 1000)))
}

// Classify ingredient into broader category
function classifyIngredient(ing: string): string {
  const l = ing.toLowerCase()
  if (l.includes('tretinoin') || l.includes('retinol') || l.includes('retinal') || l.includes('retinoid')) return 'Retinoid'
  if (l.includes('vitamin c') || l.includes('ascorbic') || l.includes('l-ascorbic')) return 'Vitamin C'
  if (l.includes('aha') || l.includes('bha') || l.includes('glycolic') || l.includes('salicylic') || l.includes('lactic') || l.includes('mandelic')) return 'AHA/BHA'
  if (l.includes('niacinamide')) return 'Niacinamide'
  if (l.includes('peptide')) return 'Peptides'
  return ing
}

// Conflicting ingredient pairs
const CONFLICT_PAIRS: [string, string][] = [
  ['Retinoid', 'AHA/BHA'],
  ['Retinoid', 'Vitamin C'],
]

function toleranceBadge(level: 'Good' | 'Sensitive' | 'Poor') {
  if (level === 'Good') return 'bg-sage/10 text-sage'
  if (level === 'Sensitive') return 'bg-yellow-100 text-yellow-700'
  return 'bg-terracotta/10 text-terracotta'
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

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ProgressionTrackerPage() {
  const { routineSteps, reactionEntries, products, settings } = useApp()

  const todayStr = getTodayInTimezone(settings.timezone)
  const todayDate = parseLocalDate(todayStr)

  const [activeTab, setActiveTab] = useState<string>('')
  const [timeRange, setTimeRange] = useState('Last 3 Months')
  const [reminderTonight, setReminderTonight] = useState(true)
  const [reminderMilestone, setReminderMilestone] = useState(true)

  // ── Derive unique active ingredient tabs from routine steps ────────────────
  const ingredientTabs = useMemo(() => {
    const seen = new Set<string>()
    const result: string[] = []
    routineSteps.forEach(s => {
      if (!s.isActive || !s.activeIngredient) return
      s.activeIngredient.split(',').map(a => a.trim()).filter(Boolean).forEach(raw => {
        const label = classifyIngredient(raw)
        if (!seen.has(label)) { seen.add(label); result.push(label) }
      })
    })
    return result
  }, [routineSteps])

  useEffect(() => {
    if (ingredientTabs.length > 0 && !ingredientTabs.includes(activeTab)) {
      setActiveTab(ingredientTabs[0])
    }
  }, [ingredientTabs, activeTab])

  // ── Steps for selected ingredient ─────────────────────────────────────────
  const selectedSteps = useMemo(() =>
    routineSteps.filter(s => {
      if (!s.isActive || !s.activeIngredient) return false
      return s.activeIngredient.split(',').map(a => classifyIngredient(a.trim())).includes(activeTab)
    }),
    [routineSteps, activeTab]
  )

  // Step with intro phase (for patience meter + timeline)
  const introStep = useMemo(() =>
    selectedSteps.find(s => s.introWeeks > 0 && s.introStartDate) ?? selectedSteps[0] ?? null,
    [selectedSteps]
  )

  // ── Patience meter ────────────────────────────────────────────────────────
  const patience = useMemo(() => {
    if (!introStep) return null
    const startDateStr = introStep.introStartDate ?? introStep.scheduledStartDate
    const startDate = startDateStr ? parseLocalDate(startDateStr) : todayDate
    const elapsed = weeksBetween(startDate, todayDate)
    const totalWeeks = introStep.introWeeks || 8
    const inIntro = elapsed < totalWeeks
    const progress = Math.min(elapsed / totalWeeks, 1)
    const level = progress < 0.25 ? 1 : progress < 0.5 ? 2 : progress < 0.75 ? 3 : progress < 1 ? 4 : 5
    const label = level <= 2 ? 'Early Phase' : level <= 3 ? 'Building Tolerance' : level <= 4 ? 'Steady Progress' : 'Tolerance Established'
    const currentFreq = inIntro && introStep.introFrequency ? introStep.introFrequency : introStep.frequency
    const targetFreq = introStep.frequency
    return { elapsed, totalWeeks, progress, level, label, inIntro, currentFreq, targetFreq, startDate }
  }, [introStep, todayDate])

  // ── Introduction timeline chart data ──────────────────────────────────────
  const timelineData = useMemo(() => {
    if (!introStep) return []
    const startDateStr = introStep.introStartDate ?? introStep.scheduledStartDate
    const startDate = startDateStr ? parseLocalDate(startDateStr) : todayDate
    const weeks = timeRange === 'Last 3 Months' ? 13 : timeRange === 'Last 6 Months' ? 26 : Math.max(26, weeksBetween(startDate, todayDate) + 4)
    const introWeeks = introStep.introWeeks || 0
    const introFreqNum = introStep.introFrequency ? FREQ_PER_WEEK[introStep.introFrequency] : 0
    const fullFreqNum = FREQ_PER_WEEK[introStep.frequency]

    return Array.from({ length: weeks }, (_, i) => {
      const weekLabel = `W${i + 1}`
      const weekDate = new Date(startDate)
      weekDate.setDate(startDate.getDate() + i * 7)
      const inPast = weekDate <= todayDate
      const freq = inPast
        ? (introWeeks > 0 && i < introWeeks ? introFreqNum : fullFreqNum)
        : null
      return { week: weekLabel, freq }
    })
  }, [introStep, todayDate, timeRange])

  // ── Conflict detection ────────────────────────────────────────────────────
  const conflicts = useMemo(() => {
    const active = routineSteps.filter(s => s.isActive && s.activeIngredient)
    const found: string[] = []

    for (let i = 0; i < active.length; i++) {
      for (let j = i + 1; j < active.length; j++) {
        const a = active[i]
        const b = active[j]
        if (a.period !== b.period) continue
        const aClasses = a.activeIngredient.split(',').map(x => classifyIngredient(x.trim()))
        const bClasses = b.activeIngredient.split(',').map(x => classifyIngredient(x.trim()))
        for (const [catA, catB] of CONFLICT_PAIRS) {
          const forward = aClasses.includes(catA) && bClasses.includes(catB)
          const reverse = aClasses.includes(catB) && bClasses.includes(catA)
          if (forward || reverse) {
            const nameA = forward ? catA : catB
            const nameB = forward ? catB : catA
            const key = `${nameA} + ${nameB} in the ${a.period} routine`
            if (!found.includes(key)) found.push(key)
          }
        }
      }
    }
    return found
  }, [routineSteps])

  // ── Body zone tolerance from reaction entries ─────────────────────────────
  const zoneRows = useMemo(() => {
    const zones = new Map<string, { date: string; severity: number; symptoms: string[] }[]>()
    reactionEntries.forEach(e => {
      if (!zones.has(e.zone)) zones.set(e.zone, [])
      zones.get(e.zone)!.push({ date: e.date, severity: e.severity, symptoms: e.symptoms })
    })

    return Array.from(zones.entries()).map(([zone, entries]) => {
      const sorted = [...entries].sort((a, b) => b.date.localeCompare(a.date))
      const latest = sorted[0]
      const daysSince = Math.floor((todayDate.getTime() - parseLocalDate(latest.date).getTime()) / (24 * 60 * 60 * 1000))
      const recentHigh = sorted.filter(e => {
        const d = Math.floor((todayDate.getTime() - parseLocalDate(e.date).getTime()) / (24 * 60 * 60 * 1000))
        return d <= 14 && e.severity >= 4
      }).length
      const tolerance: 'Good' | 'Sensitive' | 'Poor' =
        recentHigh >= 2 ? 'Poor' : recentHigh === 1 || (daysSince <= 7 && latest.severity >= 3) ? 'Sensitive' : 'Good'

      // Find product used in this zone's period
      const linkedProduct = routineSteps.find(s => s.isActive && s.productId)
      const productName = linkedProduct
        ? (products.find(p => p.id === linkedProduct.productId)?.name ?? linkedProduct.productName)
        : '—'

      const lastReactionStr = daysSince === 0
        ? `${latest.symptoms[0] ?? 'Reaction'} (today)`
        : daysSince === 1
          ? `${latest.symptoms[0] ?? 'Reaction'} (yesterday)`
          : `${latest.symptoms[0] ?? 'Reaction'} (${daysSince}d ago)`

      return { zone, productName, tolerance, lastReaction: lastReactionStr }
    })
  }, [reactionEntries, routineSteps, products, todayDate])

  const hasData = ingredientTabs.length > 0

  // ── Resolve product name for selected step ────────────────────────────────
  const stepProductName = useMemo(() => {
    if (!introStep) return null
    if (introStep.productId) {
      const p = products.find(x => x.id === introStep.productId)
      if (p) return p.name
    }
    return introStep.productName || null
  }, [introStep, products])

  return (
    <div className="min-h-screen flex font-sans bg-cream">
      <Sidebar />

      <main className="flex-1 h-screen overflow-y-auto bg-paper flex flex-col relative">

        {/* Toolbar */}
        <div className="sticky top-0 z-20 bg-white border-b border-border-soft px-6 lg:px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-ink tracking-tight">Progression Tracker</h1>
            <p className="text-sm text-ink/50 mt-0.5">Monitor active ingredient introduction and body zone tolerance.</p>
          </div>
        </div>

        <div className="flex-1 p-6 lg:p-8 flex flex-col gap-8 max-w-7xl mx-auto w-full">

          {/* Empty state */}
          {!hasData ? (
            <div className="flex-1 flex flex-col items-center justify-center py-20 text-center">
              <div className="w-14 h-14 rounded-2xl bg-sage/10 flex items-center justify-center mb-4">
                <FlaskConical className="w-6 h-6 text-sage/60" />
              </div>
              <h2 className="text-lg font-bold text-ink mb-2">No active ingredients tracked yet</h2>
              <p className="text-sm text-ink/40 max-w-sm leading-relaxed">
                Add routine steps with active ingredients in the Routine Scheduler to start tracking your introduction progress here.
              </p>
            </div>
          ) : (
            <>
              {/* Tabs */}
              <div className="flex gap-0 border-b border-border-soft overflow-x-auto">
                {ingredientTabs.map(tab => (
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

              {/* Conflict alert */}
              {conflicts.length > 0 && (
                <section
                  className="bg-cream border border-terracotta/30 rounded-2xl p-4 flex items-start gap-4"
                  style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
                >
                  <div className="w-10 h-10 rounded-full bg-terracotta/10 flex items-center justify-center shrink-0 mt-0.5">
                    <TriangleAlert className="w-4 h-4 text-terracotta" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-bold text-ink">Potential Ingredient Conflict Detected</h3>
                    <ul className="mt-1 space-y-0.5">
                      {conflicts.map((c, i) => (
                        <li key={i} className="text-xs text-ink/60 leading-relaxed flex items-center gap-1">
                          <ArrowRight className="w-3 h-3 text-terracotta shrink-0" /> {c}
                        </li>
                      ))}
                    </ul>
                    <p className="text-xs text-ink/40 mt-2">Combining these on the same night increases barrier damage risk. Consider alternating nights.</p>
                  </div>
                </section>
              )}

              {/* Patience Meter + Frequency Stats */}
              {patience ? (
                <section className="grid grid-cols-1 md:grid-cols-3 gap-6">

                  <div
                    className="col-span-1 md:col-span-2 bg-white rounded-2xl border border-border-soft p-6 flex flex-col justify-between"
                    style={{ boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)' }}
                  >
                    <div>
                      <p className="text-xs font-bold text-ink/40 uppercase tracking-wider mb-1">Patience Meter</p>
                      <div className="flex items-end gap-3">
                        <span className="text-3xl font-bold text-ink">Level {patience.level}</span>
                        <span className="text-sm text-sage font-medium mb-1">{patience.label}</span>
                      </div>
                      {stepProductName && (
                        <p className="text-xs text-ink/40 mt-1">{stepProductName}</p>
                      )}
                      <p className="text-xs text-ink/50 mt-2 max-w-sm">
                        {patience.inIntro
                          ? `Week ${patience.elapsed + 1} of ${patience.totalWeeks} in intro phase. Maintaining a slow introduction rate.`
                          : `Intro phase complete after ${patience.totalWeeks} weeks. Now using at full frequency.`}
                      </p>
                    </div>
                    <div className="mt-6">
                      <div className="flex justify-between text-xs text-ink/40 mb-2">
                        <span>Start ({FREQ_LABEL[patience.currentFreq]})</span>
                        <span>Goal ({FREQ_LABEL[patience.targetFreq]})</span>
                      </div>
                      <div className="w-full h-3 bg-paper rounded-full overflow-hidden">
                        <div
                          className="h-full bg-sage rounded-full transition-all duration-700"
                          style={{ width: `${Math.round(patience.progress * 100)}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[10px] text-ink/30 mt-1">
                        <span>Week 1</span>
                        <span>Week {patience.totalWeeks}+</span>
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
                        <p className="text-2xl font-bold text-ink mt-1">{FREQ_LABEL[patience.currentFreq]}</p>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-sage/10 flex items-center justify-center">
                        <CalendarCheck className="w-4 h-4 text-sage" />
                      </div>
                    </div>
                    <div className="h-px bg-border-soft" />
                    <div>
                      <p className="text-xs font-bold text-ink/40 uppercase tracking-wider">Target Frequency</p>
                      <p className="text-sm font-bold text-ink mt-1">
                        {patience.inIntro
                          ? `${FREQ_LABEL[patience.targetFreq]} in ${patience.totalWeeks - patience.elapsed} week${patience.totalWeeks - patience.elapsed !== 1 ? 's' : ''}`
                          : FREQ_LABEL[patience.targetFreq]}
                      </p>
                    </div>
                  </div>
                </section>
              ) : selectedSteps.length > 0 ? (
                <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div
                    className="col-span-1 md:col-span-2 bg-white rounded-2xl border border-border-soft p-6"
                    style={{ boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)' }}
                  >
                    <p className="text-xs font-bold text-ink/40 uppercase tracking-wider mb-1">Current Usage</p>
                    <p className="text-2xl font-bold text-ink mt-1">{FREQ_LABEL[selectedSteps[0].frequency]}</p>
                    <p className="text-xs text-ink/40 mt-2">No intro phase configured. Add one in the Routine Scheduler to enable the Patience Meter.</p>
                  </div>
                  <div
                    className="bg-white rounded-2xl border border-border-soft p-6 flex items-center gap-3"
                    style={{ boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)' }}
                  >
                    <div className="w-10 h-10 rounded-full bg-sage/10 flex items-center justify-center shrink-0">
                      <CalendarCheck className="w-4 h-4 text-sage" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-ink/40 uppercase tracking-wider">{selectedSteps[0].period} Routine</p>
                      <p className="text-sm font-bold text-ink mt-0.5">{selectedSteps[0].productName || activeTab}</p>
                    </div>
                  </div>
                </section>
              ) : null}

              {/* Introduction Timeline */}
              {timelineData.length > 0 && (
                <section
                  className="bg-white rounded-2xl border border-border-soft p-6"
                  style={{ boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)' }}
                >
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-lg font-bold text-ink">Introduction Timeline</h2>
                      <p className="text-xs text-ink/40 mt-0.5">Applications per week over time</p>
                    </div>
                    <select
                      value={timeRange}
                      onChange={e => setTimeRange(e.target.value)}
                      className="bg-paper border-none text-sm text-ink rounded-lg px-3 py-1.5 focus:outline-none"
                    >
                      {['Last 3 Months', 'Last 6 Months', 'All Time'].map(r => (
                        <option key={r}>{r}</option>
                      ))}
                    </select>
                  </div>
                  <div className="h-[260px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={timelineData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="freqGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#7D8E7A" stopOpacity={0.15} />
                            <stop offset="95%" stopColor="#7D8E7A" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid vertical={false} stroke="rgba(229,231,235,0.6)" />
                        <XAxis dataKey="week" tick={{ fontFamily: 'Inter', fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                        <YAxis domain={[0, 8]} ticks={[0, 1, 2, 3, 4, 5, 7]} tickFormatter={v => v === 7 ? 'Daily' : `${v}×`} tick={{ fontFamily: 'Inter', fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                        <Tooltip
                          contentStyle={{ fontFamily: 'Inter', fontSize: 12, border: '1px solid #E8E4D9', borderRadius: 8 }}
                          formatter={(v) => [typeof v === 'number' && v === 7 ? 'Daily' : `${v}× / week`, 'Frequency']}
                        />
                        <Area
                          type="monotone"
                          dataKey="freq"
                          stroke="#7D8E7A"
                          strokeWidth={3}
                          fill="url(#freqGradient)"
                          connectNulls
                          dot={{ fill: '#FDFBF7', stroke: '#7D8E7A', strokeWidth: 2, r: 5 }}
                          activeDot={{ r: 6 }}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </section>
              )}

              {/* Body Zone Tolerance */}
              {zoneRows.length > 0 && (
                <section
                  className="bg-white rounded-2xl border border-border-soft overflow-hidden"
                  style={{ boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)' }}
                >
                  <div className="p-6 border-b border-border-soft">
                    <h2 className="text-lg font-bold text-ink">Body Zone Tolerance</h2>
                    <p className="text-xs text-ink/50 mt-1">Derived from your reaction log entries.</p>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-paper border-b border-border-soft">
                          {['Zone', 'Tolerance', 'Last Reaction'].map(h => (
                            <th key={h} className="px-5 py-3 text-xs font-bold text-ink/40 uppercase tracking-wider whitespace-nowrap">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border-soft">
                        {zoneRows.map(row => (
                          <tr key={row.zone} className="hover:bg-paper/60 transition-colors">
                            <td className="px-5 py-4 text-sm font-medium text-ink">{row.zone}</td>
                            <td className="px-5 py-4">
                              <span className={`px-2 py-1 rounded text-xs font-bold ${toleranceBadge(row.tolerance)}`}>
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
              )}

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
                      'Use the "sandwich method" (moisturizer → active → moisturizer) if experiencing dryness.',
                      'Daily sunscreen is non-negotiable while using retinoids or acids.',
                      'If a new reaction occurs, skip the active for 2–3 nights before resuming.',
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
                  <h3 className="text-sm font-bold text-ink flex items-center gap-2 mb-5">
                    <Bell className="w-4 h-4 text-ink/40" /> Application Reminders
                  </h3>
                  <div className="space-y-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-ink">Tonight's Application</p>
                        <p className="text-xs text-ink/50">
                          {selectedSteps.find(s => s.period === 'PM')
                            ? `${activeTab} is in your PM routine`
                            : 'No PM step for this active'}
                        </p>
                      </div>
                      <Toggle on={reminderTonight} onToggle={() => setReminderTonight(v => !v)} />
                    </div>
                    <div className="h-px bg-border-soft" />
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-ink">Milestone Check-in</p>
                        <p className="text-xs text-ink/50">
                          {patience?.inIntro
                            ? `${patience.totalWeeks - patience.elapsed} week${patience.totalWeeks - patience.elapsed !== 1 ? 's' : ''} until target frequency`
                            : 'Evaluate and adjust as needed'}
                        </p>
                      </div>
                      <Toggle on={reminderMilestone} onToggle={() => setReminderMilestone(v => !v)} />
                    </div>
                  </div>
                </div>

              </section>

              {/* No steps for selected tab */}
              {selectedSteps.length === 0 && (
                <div className="bg-white rounded-2xl border border-border-soft p-10 text-center"
                  style={{ boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)' }}
                >
                  <Layers className="w-8 h-8 text-ink/20 mx-auto mb-3" />
                  <p className="text-sm text-ink/40">No routine steps found for <strong>{activeTab}</strong>.</p>
                </div>
              )}
            </>
          )}

        </div>
      </main>
    </div>
  )
}
