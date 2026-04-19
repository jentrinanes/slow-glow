import { Flame, TriangleAlert, HourglassIcon, Clock, ArrowUpRight, Smile, Frown, CalendarClock, AlertTriangle } from 'lucide-react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip
} from 'recharts'
import Sidebar from '../components/Sidebar'
import { useApp } from '../context/AppContext'
import type { RoutineStep, Product } from '../types'

// ─── Schedule helpers ─────────────────────────────────────────────────────────

function getTodayInTimezone(tz: string): Date {
  try {
    const str = new Intl.DateTimeFormat('en-CA', { timeZone: tz }).format(new Date())
    const [y, m, d] = str.split('-').map(Number)
    return new Date(y, m - 1, d)
  } catch {
    return new Date()
  }
}

function getDayOfYear(d: Date): number {
  return Math.floor((d.getTime() - new Date(d.getFullYear(), 0, 0).getTime()) / 86400000)
}

function parseLocalDate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

function hasStarted(step: RoutineStep, today: Date): boolean {
  if (!step.scheduledStartDate) return true
  const start = parseLocalDate(step.scheduledStartDate)
  const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  return todayDate >= start
}

function isOnToday(step: RoutineStep, today: Date): boolean {
  if (!hasStarted(step, today)) return false
  const freq = step.frequency ?? 'daily'
  if (freq === 'daily') return true
  if (freq === 'every-other-day') {
    if (step.scheduledStartDate) {
      const start = parseLocalDate(step.scheduledStartDate)
      const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate())
      const daysSinceStart = Math.floor((todayDate.getTime() - start.getTime()) / 86400000)
      return daysSinceStart % 2 === 0
    }
    return getDayOfYear(today) % 2 === 0
  }
  if (freq === '1x-week' || freq === '2x-week' || freq === '3x-week')
    return (step.scheduleDays ?? []).includes(today.getDay())
  return true
}

// ─── Ingredient conflict detection ───────────────────────────────────────────

const INGREDIENT_CATEGORY: Array<{ keywords: string[]; category: string }> = [
  { keywords: ['retinol', 'retinal', 'tretinoin', 'adapalene', 'retinoid', 'tazarotene'], category: 'retinoid' },
  { keywords: ['salicylic acid', 'betaine salicylate', 'bha', 'willow bark'], category: 'bha' },
  { keywords: ['glycolic acid', 'lactic acid', 'mandelic acid', 'aha', 'tartaric acid', 'citric acid', 'malic acid'], category: 'aha' },
  { keywords: ['benzoyl peroxide'], category: 'benzoyl-peroxide' },
  { keywords: ['vitamin c', 'ascorbic acid', 'ethyl ascorbic acid', 'ascorbyl glucoside', 'ascorbyl tetraisopalmitate'], category: 'vitamin-c' },
  { keywords: ['azelaic acid'], category: 'azelaic-acid' },
]

interface ConflictWarning {
  message: string
  tip: string
  severity: 'high' | 'moderate'
  ingredients: string[]
}

const CONFLICT_RULES: Array<{ categories: string[]; message: string; tip: string; severity: 'high' | 'moderate' }> = [
  {
    categories: ['retinoid', 'bha'],
    message: 'Retinoid + BHA scheduled tonight',
    tip: 'Using both together can cause over-exfoliation and barrier damage. Consider alternating nights.',
    severity: 'high',
  },
  {
    categories: ['retinoid', 'aha'],
    message: 'Retinoid + AHA scheduled tonight',
    tip: 'Combining retinoids with AHAs increases irritation risk. Alternate on different nights.',
    severity: 'high',
  },
  {
    categories: ['retinoid', 'benzoyl-peroxide'],
    message: 'Retinoid + Benzoyl Peroxide scheduled tonight',
    tip: 'Benzoyl peroxide can oxidise and deactivate retinoids. Apply at different times or alternate nights.',
    severity: 'high',
  },
  {
    categories: ['bha', 'aha'],
    message: 'AHA + BHA both scheduled',
    tip: 'Multiple exfoliants together can disrupt your skin barrier. Use one at a time.',
    severity: 'moderate',
  },
  {
    categories: ['vitamin-c', 'aha'],
    message: 'Vitamin C + AHA scheduled together',
    tip: 'Both are acidic — layering them may cause stinging and redness. Consider spacing them out.',
    severity: 'moderate',
  },
]

function categorise(ingredient: string): string | null {
  const lower = ingredient.toLowerCase()
  for (const { keywords, category } of INGREDIENT_CATEGORY) {
    if (keywords.some(k => lower.includes(k))) return category
  }
  return null
}

function detectConflicts(activeIngredients: string[]): ConflictWarning[] {
  const categoryMap = new Map<string, string[]>() // category → matching ingredient names
  for (const ing of activeIngredients) {
    const cat = categorise(ing)
    if (cat) {
      if (!categoryMap.has(cat)) categoryMap.set(cat, [])
      categoryMap.get(cat)!.push(ing)
    }
  }

  return CONFLICT_RULES
    .filter(rule => rule.categories.every(c => categoryMap.has(c)))
    .map(rule => ({
      ...rule,
      ingredients: rule.categories.flatMap(c => categoryMap.get(c) ?? []),
    }))
}

// ─── PAO helper ───────────────────────────────────────────────────────────────

function daysUntilExpiry(product: Product): number | null {
  if (!product.openedAt) return null
  const expiry = new Date(product.openedAt)
  expiry.setMonth(expiry.getMonth() + product.paoMonths)
  return Math.ceil((expiry.getTime() - Date.now()) / 86400000)
}

// ─── Focus label ──────────────────────────────────────────────────────────────

function computeFocus(steps: RoutineStep[], period: 'AM' | 'PM'): string {
  const has = (t: string) => steps.some(s => s.stepType.toLowerCase().includes(t.toLowerCase()))
  if (period === 'AM') {
    const parts: string[] = []
    if (has('sunscreen')) parts.push('Protection')
    if (has('serum') || has('essence') || has('toner')) parts.push('Treatment')
    if (has('moisturizer') || has('cream')) parts.push('Hydration')
    return parts.slice(0, 2).join(' & ') || 'Morning Care'
  } else {
    const parts: string[] = []
    if (has('retinoid') || has('exfoliant')) parts.push('Repair')
    if (has('serum') || has('essence')) parts.push('Renewal')
    if (has('moisturizer') || has('cream') || has('oil')) parts.push('Recovery')
    return parts.slice(0, 2).join(' & ') || 'Evening Care'
  }
}

// ─── Routine step card ────────────────────────────────────────────────────────

function resolveProductName(step: RoutineStep, products: Product[]): string {
  if (step.productId) {
    const p = products.find(x => x.id === step.productId)
    if (p) return p.brand ? `${p.name} — ${p.brand}` : p.name
  }
  return step.productName
}

function RoutineStepCard({ step, today, checked, onToggle, products }: {
  step: RoutineStep
  today: Date
  checked: boolean
  onToggle: () => void
  products: Product[]
}) {
  const onToday = isOnToday(step, today)
  const started = hasStarted(step, today)
  const productName = resolveProductName(step, products)

  return (
    <label
      className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer group transition-colors ${
        checked
          ? 'border-border-soft/40 bg-paper/50'
          : !started
            ? 'border-dashed border-border-soft opacity-60'
            : 'border-border-soft/60 hover:border-border-soft'
      }`}
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
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium transition-colors ${checked ? 'text-ink/40 line-through' : 'text-ink group-hover:text-sage'}`}>
          {step.stepType}
        </p>
        {productName && (
          <p className="text-xs text-ink/40 mt-0.5 leading-snug">{productName}</p>
        )}
        {step.isActive && started && (
          <div className="mt-1.5 flex flex-wrap gap-1">
            {onToday
              ? step.activeIngredient.split(',').map(a => a.trim()).filter(Boolean).map(ing => (
                  <span key={ing} className="px-2 py-0.5 rounded text-[10px] font-medium bg-sage/10 text-sage">{ing}</span>
                ))
              : <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-paper text-ink/30">Skip</span>
            }
          </div>
        )}
        {!started && step.scheduledStartDate && (
          <div className="mt-1.5">
            <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-terracotta/10 text-terracotta inline-flex items-center gap-1">
              <CalendarClock className="w-2.5 h-2.5" />
              {parseLocalDate(step.scheduledStartDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
          </div>
        )}
      </div>
    </label>
  )
}

// ─── Static progression data ──────────────────────────────────────────────────

const progressionData = [
  { week: 'W1', frequency: 1 },
  { week: 'W2', frequency: 1 },
  { week: 'W3', frequency: 2 },
  { week: 'W4', frequency: 2 },
  { week: 'W5', frequency: 3 },
  { week: 'W6', frequency: 3 },
]

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { routineSteps, products, reactionEntries, settings, completedSteps, toggleStepComplete } = useApp()
  const today = getTodayInTimezone(settings.timezone)
  const todayStr = new Intl.DateTimeFormat('en-CA', { timeZone: settings.timezone }).format(new Date())

  const isChecked = (stepId: string) => completedSteps[todayStr]?.includes(stepId) ?? false
  const toggle = (stepId: string) => toggleStepComplete(todayStr, stepId)

  // Routine steps sorted by order
  const amSteps = [...routineSteps]
    .filter(s => s.period === 'AM')
    .sort((a, b) => a.order - b.order)
  const pmSteps = [...routineSteps]
    .filter(s => s.period === 'PM')
    .sort((a, b) => a.order - b.order)

  // Unique actives scheduled today (for barrier load + conflict detection)
  const activesToday = [...new Set(
    routineSteps
      .filter(s => s.isActive && s.activeIngredient && isOnToday(s, today))
      .flatMap(s => s.activeIngredient.split(',').map(a => a.trim()).filter(Boolean))
  )]

  const conflicts = detectConflicts(activesToday)

  const barrierLevel =
    activesToday.length === 0 ? null
    : activesToday.length <= 2 ? { label: `Light (${activesToday.length} Active${activesToday.length > 1 ? 's' : ''})`, color: 'text-sage', bg: 'border-sage/30 hover:bg-sage/5', iconBg: 'bg-sage/10', iconColor: 'text-sage' }
    : activesToday.length <= 4 ? { label: `Moderate (${activesToday.length} Actives)`, color: 'text-terracotta', bg: 'border-terracotta/30 hover:bg-terracotta/5', iconBg: 'bg-terracotta/10', iconColor: 'text-terracotta' }
    : { label: `High (${activesToday.length} Actives)`, color: 'text-terracotta font-bold', bg: 'border-terracotta/50 hover:bg-terracotta/5', iconBg: 'bg-terracotta/20', iconColor: 'text-terracotta' }

  // Expiry watchlist: active products with < 60 days left
  const expiryWatchlist = products
    .filter(p => p.status === 'active' && p.openedAt)
    .map(p => ({ ...p, daysLeft: daysUntilExpiry(p) }))
    .filter((p): p is Product & { daysLeft: number } => p.daysLeft !== null && p.daysLeft <= 60)
    .sort((a, b) => a.daysLeft - b.daysLeft)
    .slice(0, 4)

  const recentReactions = reactionEntries.slice(0, 2)

  return (
    <div className="min-h-screen flex font-sans bg-paper">
      <Sidebar />

      <main className="flex-1 h-screen overflow-y-auto p-6 lg:p-8">

        {/* Header */}
        <header className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-2xl font-bold text-ink tracking-tight">Today's Overview</h1>
            <p className="text-sm text-ink/50 mt-1">
              {today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
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
                <p className="text-sm font-bold text-ink">
                  {amSteps.length + pmSteps.length > 0 ? `${amSteps.length + pmSteps.length} Steps` : '—'}
                </p>
              </div>
            </div>

            {/* Barrier Load */}
            {barrierLevel && (
              <div className={`bg-white rounded-xl px-4 py-2 shadow-sm border flex items-center gap-3 ${barrierLevel.bg}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${barrierLevel.iconBg}`}>
                  <TriangleAlert className={`w-4 h-4 ${barrierLevel.iconColor}`} />
                </div>
                <div>
                  <p className="text-xs text-ink/50 font-medium">Barrier Load</p>
                  <p className={`text-sm font-bold ${barrierLevel.color}`}>{barrierLevel.label}</p>
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Conflict warnings */}
        {conflicts.length > 0 && (
          <div className="mb-6 space-y-3">
            {conflicts.map((c, i) => (
              <div
                key={i}
                className={`flex items-start gap-4 px-5 py-4 rounded-2xl border ${
                  c.severity === 'high'
                    ? 'bg-terracotta/5 border-terracotta/30'
                    : 'bg-amber-50 border-amber-200'
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                  c.severity === 'high' ? 'bg-terracotta/15' : 'bg-amber-100'
                }`}>
                  <AlertTriangle className={`w-4 h-4 ${c.severity === 'high' ? 'text-terracotta' : 'text-amber-600'}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold ${c.severity === 'high' ? 'text-terracotta' : 'text-amber-700'}`}>
                    {c.message}
                  </p>
                  <p className="text-xs text-ink/60 mt-0.5 leading-relaxed">{c.tip}</p>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {c.ingredients.map(ing => (
                      <span key={ing} className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                        c.severity === 'high'
                          ? 'bg-terracotta/10 text-terracotta border-terracotta/20'
                          : 'bg-amber-100 text-amber-700 border-amber-200'
                      }`}>
                        {ing}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Bento Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* Left: 7 cols */}
          <div className="lg:col-span-7 flex flex-col gap-6">

            {/* AM / PM Routines */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* AM */}
              <div className="bg-white rounded-2xl border border-border-soft p-6" style={{ boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)' }}>
                <div className="flex justify-between items-center mb-5">
                  <div>
                    <h2 className="text-base font-semibold text-ink">AM Routine</h2>
                    {amSteps.length > 0 && (
                      <p className="text-xs text-ink/50 mt-0.5">Focus: {computeFocus(amSteps, 'AM')}</p>
                    )}
                  </div>
                  <span className="px-2.5 py-1 bg-paper text-ink/60 rounded-md text-xs font-medium">
                    {amSteps.length} {amSteps.length === 1 ? 'Step' : 'Steps'}
                  </span>
                </div>
                {amSteps.length > 0 ? (
                  <div className="space-y-2.5">
                    {amSteps.map(step => (
                      <RoutineStepCard
                        key={step.id}
                        step={step}
                        today={today}
                        checked={isChecked(step.id)}
                        onToggle={() => toggle(step.id)}
                        products={products}
                      />
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-ink/30 text-center py-6">No AM steps yet.</p>
                )}
              </div>

              {/* PM */}
              <div className="bg-white rounded-2xl border border-border-soft p-6" style={{ boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)' }}>
                <div className="flex justify-between items-center mb-5">
                  <div>
                    <h2 className="text-base font-semibold text-ink">PM Routine</h2>
                    {pmSteps.length > 0 && (
                      <p className="text-xs text-ink/50 mt-0.5">Focus: {computeFocus(pmSteps, 'PM')}</p>
                    )}
                  </div>
                  <span className="px-2.5 py-1 bg-paper text-ink/60 rounded-md text-xs font-medium">
                    {pmSteps.length} {pmSteps.length === 1 ? 'Step' : 'Steps'}
                  </span>
                </div>
                {pmSteps.length > 0 ? (
                  <div className="space-y-2.5">
                    {pmSteps.map(step => (
                      <RoutineStepCard
                        key={step.id}
                        step={step}
                        today={today}
                        checked={isChecked(step.id)}
                        onToggle={() => toggle(step.id)}
                        products={products}
                      />
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-ink/30 text-center py-6">No PM steps yet.</p>
                )}
              </div>
            </div>

            {/* Expiry Watchlist */}
            <div className="bg-white rounded-2xl border border-border-soft p-6" style={{ boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)' }}>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-base font-semibold text-ink">Expiry Watchlist</h2>
                <a href="/inventory" className="text-sm text-sage hover:underline font-medium">View Inventory</a>
              </div>
              {expiryWatchlist.length > 0 ? (
                <div className="flex gap-4 overflow-x-auto pb-1">
                  {expiryWatchlist.map(item => (
                    <div
                      key={item.id}
                      className={`min-w-[200px] p-4 rounded-xl border flex flex-col gap-2 ${
                        item.daysLeft <= 14 ? 'border-terracotta/20 bg-cream' : 'border-border-soft bg-white'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <span className={`w-8 h-8 rounded-full flex items-center justify-center ${item.daysLeft <= 14 ? 'bg-terracotta/10' : 'bg-paper'}`}>
                          {item.daysLeft <= 14
                            ? <HourglassIcon className="w-4 h-4 text-terracotta" />
                            : <Clock className="w-4 h-4 text-ink/40" />}
                        </span>
                        <span className={`text-xs font-semibold px-2 py-1 rounded ${
                          item.daysLeft <= 14 ? 'bg-terracotta/10 text-terracotta' : 'bg-paper text-ink/50'
                        }`}>
                          {item.daysLeft <= 0 ? 'Expired' : `${item.daysLeft}d left`}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-ink">{item.name}</p>
                        <p className="text-xs text-ink/50 mt-0.5">{item.brand || 'PAO'}: {item.paoMonths}mo</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-ink/30 text-center py-4">No products expiring soon.</p>
              )}
            </div>
          </div>

          {/* Right: 5 cols */}
          <div className="lg:col-span-5 flex flex-col gap-6">

            {/* Tolerance Progression Chart */}
            <div className="bg-white rounded-2xl border border-border-soft p-6 flex flex-col h-[300px]" style={{ boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)' }}>
              <div className="flex justify-between items-center mb-2">
                <div>
                  <h2 className="text-base font-semibold text-ink">Tolerance Progression</h2>
                  <p className="text-xs text-ink/50">Active introduction over time</p>
                </div>
                <button className="w-8 h-8 rounded-full hover:bg-paper flex items-center justify-center text-ink/40 transition-colors">
                  <ArrowUpRight className="w-4 h-4" />
                </button>
              </div>
              <div className="flex-1 mt-2">
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
                      stroke="#7D8E7A"
                      strokeWidth={3}
                      dot={{ fill: '#FDFBF7', stroke: '#7D8E7A', strokeWidth: 2, r: 5 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Recent Reactions */}
            <div className="bg-white rounded-2xl border border-border-soft p-6 flex-1" style={{ boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)' }}>
              <div className="flex justify-between items-center mb-5">
                <h2 className="text-base font-semibold text-ink">Recent Reactions</h2>
                <a href="/reactions" className="text-sm font-medium text-ink/50 hover:text-sage transition-colors">Add Log</a>
              </div>

              {recentReactions.length > 0 ? (
                <div className="space-y-4 relative before:absolute before:left-4 before:top-0 before:h-full before:w-px before:bg-border-soft/60">
                  {recentReactions.map((r, i) => {
                    const good = r.severity <= 1
                    return (
                      <div key={i} className="relative flex items-start gap-4 pl-2">
                        <div className={`w-8 h-8 rounded-full text-white flex items-center justify-center shrink-0 z-10 shadow-sm ${good ? 'bg-sage' : 'bg-terracotta/80'}`}>
                          {good ? <Smile className="w-4 h-4" /> : <Frown className="w-4 h-4" />}
                        </div>
                        <div className="flex-1 p-3 rounded-xl border border-border-soft/60 bg-white shadow-sm">
                          <div className="flex justify-between items-center mb-1">
                            <span className={`text-xs font-semibold ${good ? 'text-sage' : 'text-terracotta'}`}>
                              {r.severity === 0 ? 'Clear' : r.severity === 1 ? 'Mild' : r.severity === 2 ? 'Moderate' : 'Severe'}
                            </span>
                            <span className="text-[10px] text-ink/40">
                              {new Date(r.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </span>
                          </div>
                          {r.symptoms.length > 0 && (
                            <p className="text-xs text-ink/60 leading-relaxed">{r.symptoms.slice(0, 3).join(', ')}</p>
                          )}
                          {r.notes && (
                            <p className="text-xs text-ink/50 mt-1 italic leading-relaxed line-clamp-2">{r.notes}</p>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <p className="text-sm text-ink/30 text-center py-6">No reactions logged yet.</p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
