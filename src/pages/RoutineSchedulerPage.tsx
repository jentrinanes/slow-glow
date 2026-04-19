import { useState, useRef } from 'react'
import {
  Sun, Moon, GripVertical, X, Plus, Sprout,
  Droplets, FlaskConical, ShieldCheck, Pipette, Layers, CheckCircle2, Sparkles
} from 'lucide-react'
import Sidebar from '../components/Sidebar'
import { useApp } from '../context/AppContext'
import type { RoutineStep, Product, StepFrequency } from '../types'

// ─── Step types & categories ──────────────────────────────────────────────────

const STEP_TYPES = [
  'Oil Cleanser', 'Gentle Cleanser', 'Exfoliating Cleanser',
  'Toner', 'Essence', 'Serum', 'Eye Cream',
  'Moisturizer', 'Face Oil', 'Sunscreen',
  'Retinoid', 'Exfoliant', 'Mask', 'Spot Treatment', 'Other',
]

const STEP_TYPE_CATEGORIES: Record<string, string[]> = {
  'Oil Cleanser':          ['Cleanser'],
  'Gentle Cleanser':       ['Cleanser'],
  'Exfoliating Cleanser':  ['Cleanser', 'Exfoliant'],
  'Toner':                 ['Toner'],
  'Essence':               ['Toner', 'Serum'],
  'Serum':                 ['Serum'],
  'Eye Cream':             ['Eye Cream'],
  'Moisturizer':           ['Moisturizer'],
  'Face Oil':              ['Moisturizer', 'Serum'],
  'Sunscreen':             ['Sunscreen'],
  'Retinoid':              ['Retinoid', 'Serum'],
  'Exfoliant':             ['Exfoliant', 'Toner', 'Serum'],
  'Mask':                  ['Mask'],
  'Spot Treatment':        ['Serum', 'Other'],
  'Other':                 [],
}

// ─── Schedule helpers ─────────────────────────────────────────────────────────

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

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
  const start = new Date(d.getFullYear(), 0, 0)
  return Math.floor((d.getTime() - start.getTime()) / 86400000)
}

function getActiveFrequency(step: RoutineStep, today: Date): StepFrequency {
  if (!step.introFrequency || !step.introStartDate || step.introWeeks === 0) return step.frequency
  const start = new Date(step.introStartDate)
  const weeksElapsed = (today.getTime() - start.getTime()) / (7 * 24 * 60 * 60 * 1000)
  return weeksElapsed < step.introWeeks ? step.introFrequency : step.frequency
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

function isScheduledToday(step: RoutineStep, today: Date): boolean {
  if (!hasStarted(step, today)) return false
  const freq = getActiveFrequency(step, today)
  switch (freq) {
    case 'daily': return true
    case 'every-other-day': {
      if (step.scheduledStartDate) {
        const start = parseLocalDate(step.scheduledStartDate)
        const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate())
        const daysSinceStart = Math.floor((todayDate.getTime() - start.getTime()) / 86400000)
        return daysSinceStart % 2 === 0
      }
      return getDayOfYear(today) % 2 === 0
    }
    case '1x-week':
    case '2x-week':
    case '3x-week':
      return step.scheduleDays.includes(today.getDay())
  }
}

function formatStartDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}


function shortFreqLabel(freq: StepFrequency, days: number[]): string {
  switch (freq) {
    case 'daily': return ''
    case 'every-other-day': return 'Every other day'
    case '1x-week':
    case '2x-week':
    case '3x-week':
      return days.length > 0
        ? days.sort((a, b) => a - b).map(d => DAY_NAMES[d]).join(' · ')
        : '1–3× / week'
  }
}

// ─── Icon helper ──────────────────────────────────────────────────────────────

function iconForStep(stepType: string, isActive: boolean) {
  const t = stepType.toLowerCase()
  if (t.includes('cleanser') || t.includes('wash')) return Droplets
  if (t.includes('sunscreen') || t.includes('spf')) return ShieldCheck
  if (t.includes('moisturizer') || t.includes('cream') || t.includes('oil')) return Layers
  if (t.includes('retinoid') || t.includes('retinol') || t.includes('exfoliant') || t.includes('acid') || isActive) return FlaskConical
  if (t.includes('serum') || t.includes('vitamin c') || t.includes('niacinamide')) return Pipette
  if (t.includes('essence') || t.includes('toner')) return Sparkles
  return Pipette
}

// ─── Step slide-over (add & edit) ────────────────────────────────────────────

interface StepSlideOverProps {
  open: boolean
  onClose: () => void
  period: 'AM' | 'PM'
  products: Product[]
  onAdd: (step: Omit<RoutineStep, 'id' | 'userId'>) => void
  onUpdate: (id: string, updates: Partial<RoutineStep>) => void
  editingStep?: RoutineStep
  nextOrder: number
}

function StepSlideOver({ open, onClose, period, products, onAdd, onUpdate, editingStep, nextOrder }: StepSlideOverProps) {
  const isEdit = !!editingStep

  const buildInitial = () => {
    if (editingStep) return {
      stepType: editingStep.stepType,
      productId: editingStep.productId ?? '',
      productName: editingStep.productName,
      isActive: editingStep.isActive,
      activeIngredient: editingStep.activeIngredient,
      notes: editingStep.notes,
      frequency: editingStep.frequency,
      scheduleDays: editingStep.scheduleDays,
      scheduledStartDate: editingStep.scheduledStartDate ?? '',
    }
    return {
      stepType: '', productId: '', productName: '',
      isActive: false, activeIngredient: '', notes: '',
      frequency: 'daily' as StepFrequency,
      scheduleDays: [] as number[],
      scheduledStartDate: '',
    }
  }

  const [form, setForm] = useState(buildInitial)

  type FormState = ReturnType<typeof buildInitial>
  const set = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm(f => ({ ...f, [k]: v }))

  const toggleDay = (d: number) =>
    setForm(f => ({
      ...f,
      scheduleDays: f.scheduleDays.includes(d)
        ? f.scheduleDays.filter(x => x !== d)
        : [...f.scheduleDays, d],
    }))

  const handleProductSelect = (productId: string) => {
    if (!productId) { set('productId', ''); set('productName', ''); set('scheduledStartDate', ''); return }
    const p = products.find(p => p.id === productId)
    if (p) {
      set('productId', productId)
      set('productName', `${p.name}${p.brand ? ` — ${p.brand}` : ''}`)
      if (p.activeIngredients.length > 0) {
        set('isActive', true)
        set('activeIngredient', p.activeIngredients.join(', '))
      }
      if (p.status === 'paused' && !form.scheduledStartDate) {
        const nextWeek = new Date()
        nextWeek.setDate(nextWeek.getDate() + 7)
        set('scheduledStartDate', nextWeek.toISOString().slice(0, 10))
      }
    }
  }

  const handleSave = () => {
    if (!form.stepType.trim()) return
    const payload = {
      stepType: form.stepType.trim(),
      productId: form.productId || null,
      productName: form.productName.trim(),
      period,
      isActive: form.isActive,
      activeIngredient: form.activeIngredient.trim(),
      notes: form.notes.trim(),
      frequency: form.frequency,
      scheduleDays: form.scheduleDays,
      introFrequency: null,
      introWeeks: 0,
      introStartDate: null,
      scheduledStartDate: form.scheduledStartDate || null,
    }
    if (isEdit && editingStep) {
      onUpdate(editingStep.id, payload)
    } else {
      onAdd({ ...payload, order: nextOrder })
    }
    onClose()
  }

  const needsDays = form.frequency === '1x-week' || form.frequency === '2x-week' || form.frequency === '3x-week'

  return (
    <>
      <div
        onClick={onClose}
        className={`fixed inset-0 bg-ink/20 backdrop-blur-sm z-40 transition-opacity duration-300 ${open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
      />
      <div className={`fixed inset-y-0 right-0 w-full md:w-[440px] bg-white shadow-2xl z-50 border-l border-border-soft flex flex-col transition-transform duration-300 ${open ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="px-6 py-5 border-b border-border-soft flex items-center justify-between">
          <h2 className="text-lg font-bold text-ink">{isEdit ? 'Edit' : 'Add'} {period} Step</h2>
          <button onClick={onClose} className="text-ink/40 hover:text-ink transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-5">

          {/* Step Type */}
          <div>
            <label className="block text-sm font-semibold text-ink mb-1.5">Step Type *</label>
            <select
              value={form.stepType}
              onChange={e => { set('stepType', e.target.value); set('productId', ''); set('productName', '') }}
              className="w-full px-4 py-2.5 rounded-lg border border-border-soft text-sm text-ink bg-white focus:outline-none focus:border-sage focus:ring-1 focus:ring-sage"
            >
              <option value="">Select type…</option>
              {STEP_TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>

          {/* Product */}
          <div>
            <label className="block text-sm font-semibold text-ink mb-1.5">Product</label>
            {(() => {
              const allowed = form.stepType ? (STEP_TYPE_CATEGORIES[form.stepType] ?? []) : []
              const active = products.filter(p =>
                (p.status === 'active' || p.status === 'upcoming') &&
                (allowed.length === 0 || allowed.includes(p.category))
              )
              const paused = products.filter(p =>
                p.status === 'paused' &&
                (allowed.length === 0 || allowed.includes(p.category))
              )
              if (active.length === 0 && paused.length === 0 && form.stepType) {
                return <p className="text-xs text-ink/40 py-2">No matching products in inventory for this step type.</p>
              }
              return (
                <select
                  value={form.productId}
                  onChange={e => handleProductSelect(e.target.value)}
                  disabled={!form.stepType}
                  className="w-full px-4 py-2.5 rounded-lg border border-border-soft text-sm text-ink bg-white focus:outline-none focus:border-sage focus:ring-1 focus:ring-sage disabled:opacity-50"
                >
                  <option value="">{form.stepType ? 'Pick from inventory…' : 'Select a step type first'}</option>
                  {active.map(p => (
                    <option key={p.id} value={p.id}>{p.name}{p.brand ? ` — ${p.brand}` : ''}</option>
                  ))}
                  {paused.length > 0 && active.length > 0 && (
                    <option disabled>── Paused ──</option>
                  )}
                  {paused.map(p => (
                    <option key={p.id} value={p.id}>{p.name}{p.brand ? ` — ${p.brand}` : ''} (Paused)</option>
                  ))}
                </select>
              )
            })()}
          </div>

          {/* Active ingredient toggle */}
          <div className="flex items-center justify-between py-3 px-4 rounded-lg border border-border-soft bg-paper/50">
            <div>
              <p className="text-sm font-semibold text-ink">Active Ingredient</p>
              <p className="text-xs text-ink/50 mt-0.5">Mark if this step contains a tracked active.</p>
            </div>
            <button
              type="button"
              onClick={() => set('isActive', !form.isActive)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${form.isActive ? 'bg-sage' : 'bg-border-soft'}`}
            >
              <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ${form.isActive ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
          </div>

          {/* Active ingredient pills */}
          {form.isActive && (
            <div>
              <label className="block text-sm font-semibold text-ink mb-1.5">Active Ingredient Name</label>
              {form.activeIngredient ? (
                <div className="flex flex-wrap gap-2">
                  {form.activeIngredient.split(',').map(s => s.trim()).filter(Boolean).map(ingredient => (
                    <span key={ingredient} className="px-3 py-1 bg-sage/10 text-sage text-xs font-medium rounded-full border border-sage/20">
                      {ingredient}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-ink/40 italic">No actives detected — select a product with active ingredients.</p>
              )}
            </div>
          )}

          {/* ── Schedule ──────────────────────────────────────────────── */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-ink mb-1.5">Frequency</label>
              <select
                value={form.frequency}
                onChange={e => { set('frequency', e.target.value as StepFrequency); set('scheduleDays', []) }}
                className="w-full px-4 py-2.5 rounded-lg border border-border-soft text-sm text-ink bg-white focus:outline-none focus:border-sage focus:ring-1 focus:ring-sage"
              >
                <option value="daily">Every day</option>
                <option value="every-other-day">Every other day</option>
                <option value="1x-week">1× per week</option>
                <option value="2x-week">2× per week</option>
                <option value="3x-week">3× per week</option>
              </select>
            </div>

            {needsDays && (
              <div>
                <label className="block text-sm font-semibold text-ink mb-2">
                  Which day{form.frequency !== '1x-week' ? 's' : ''}?
                </label>
                <div className="flex gap-1.5">
                  {DAY_NAMES.map((name, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => toggleDay(i)}
                      className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-colors ${
                        form.scheduleDays.includes(i)
                          ? 'bg-sage text-white'
                          : 'bg-paper text-ink/50 border border-border-soft hover:border-sage hover:text-sage'
                      }`}
                    >
                      {name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-ink mb-1.5">
                Start Date
                <span className="text-ink/30 font-normal text-xs ml-2">leave blank to start today</span>
              </label>
              <input
                type="date"
                value={form.scheduledStartDate}
                onChange={e => set('scheduledStartDate', e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-border-soft text-sm text-ink bg-white focus:outline-none focus:border-sage focus:ring-1 focus:ring-sage"
              />
              {form.scheduledStartDate && (
                <button
                  type="button"
                  onClick={() => set('scheduledStartDate', '')}
                  className="mt-1.5 text-xs text-ink/40 hover:text-terracotta transition-colors"
                >
                  Clear — start immediately
                </button>
              )}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-semibold text-ink mb-1.5">Notes</label>
            <textarea
              rows={2}
              value={form.notes}
              onChange={e => set('notes', e.target.value)}
              placeholder="e.g. Apply 2–3 drops, wait 5 min before next step"
              className="w-full px-4 py-2.5 rounded-lg border border-border-soft text-sm focus:outline-none focus:border-sage focus:ring-1 focus:ring-sage resize-none"
            />
          </div>
        </div>

        <div className="p-6 border-t border-border-soft bg-paper/50 flex gap-3">
          <button onClick={onClose} className="flex-1 px-4 py-2.5 border border-border-soft rounded-lg text-sm font-medium text-ink bg-white hover:bg-paper transition-colors">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!form.stepType.trim()}
            className="flex-1 px-4 py-2.5 bg-sage text-white rounded-lg text-sm font-medium hover:bg-ink transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isEdit ? 'Save Changes' : 'Add Step'}
          </button>
        </div>
      </div>
    </>
  )
}

// ─── Step list ────────────────────────────────────────────────────────────────

function StepList({
  steps, accent, today,
  onDragStart, onDragOver, onDragEnd, onRemove, onEdit,
}: {
  steps: RoutineStep[]
  accent: 'am' | 'pm'
  today: Date
  onDragStart: (i: number) => void
  onDragOver: (e: React.DragEvent, i: number) => void
  onDragEnd: () => void
  onRemove: (id: string) => void
  onEdit: (step: RoutineStep) => void
}) {
  const activeSteps = steps.filter(s => s.isActive && hasStarted(s, today))

  // Deduplicate ingredient names; ingredient is "on" if ANY step with it is scheduled today
  const ingredientMap = new Map<string, boolean>()
  activeSteps.forEach(s => {
    const on = isScheduledToday(s, today)
    s.activeIngredient.split(',').map(a => a.trim()).filter(Boolean).forEach(ing => {
      ingredientMap.set(ing, (ingredientMap.get(ing) ?? false) || on)
    })
  })
  const scheduledIngredients = [...ingredientMap.entries()].filter(([, v]) => v).map(([k]) => k)
  const skippedIngredients = [...ingredientMap.entries()].filter(([, v]) => !v).map(([k]) => k)

  return (
    <>
      {/* Today's Focus strip — only if there are actives with a non-daily schedule */}
      {activeSteps.some(s => getActiveFrequency(s, today) !== 'daily') && (
        <div className="px-4 py-2.5 mb-1 flex items-start justify-between gap-3 border-b border-border-soft">
          <span className="text-xs font-bold text-ink/40 uppercase tracking-wider shrink-0 mt-0.5">
            {accent === 'am' ? 'This Morning' : 'Tonight'}
          </span>
          <div className="flex flex-wrap gap-1.5 justify-end">
            {scheduledIngredients.map(ing => (
              <span key={ing} className="px-2 py-0.5 rounded-full text-xs font-medium bg-sage/10 text-sage border border-sage/20">
                {ing}
              </span>
            ))}
            {skippedIngredients.map(ing => (
              <span key={ing} className="px-2 py-0.5 rounded-full text-xs font-medium bg-paper text-ink/30 border border-border-soft line-through">
                {ing}
              </span>
            ))}
          </div>
        </div>
      )}

      <ul className="space-y-2 p-2">
        {steps.map((step, i) => {
          const Icon = iconForStep(step.stepType, step.isActive)
          const started = hasStarted(step, today)
          const scheduled = started && isScheduledToday(step, today)
          const freqLabel = shortFreqLabel(getActiveFrequency(step, today), step.scheduleDays)
          const inIntro = step.introFrequency !== null && step.introStartDate !== null && step.introWeeks > 0
            && ((today.getTime() - new Date(step.introStartDate).getTime()) / (7 * 24 * 60 * 60 * 1000)) < step.introWeeks

          return (
            <li
              key={step.id}
              draggable
              onDragStart={() => onDragStart(i)}
              onDragOver={e => onDragOver(e, i)}
              onDragEnd={onDragEnd}
              onClick={() => onEdit(step)}
              className={`flex items-center gap-4 p-3 rounded-xl border group cursor-pointer transition-all hover:shadow-sm ${
                !started
                  ? 'opacity-50 bg-paper border-dashed border-border-soft'
                  : step.isActive
                    ? 'bg-sage/5 border-sage/30'
                    : 'bg-paper border-border-soft'
              }`}
            >
              <div className="text-ink/20 hover:text-ink/60 px-1 cursor-grab active:cursor-grabbing shrink-0">
                <GripVertical className="w-4 h-4" />
              </div>
              <div className={`w-10 h-10 rounded-lg bg-white flex items-center justify-center shrink-0 ${
                step.isActive ? 'border border-sage/30' : 'border border-border-soft'
              }`}>
                <Icon className={`w-4 h-4 ${step.isActive ? 'text-sage' : 'text-ink/30'}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-xs font-bold ${accent === 'am' ? 'text-sage' : 'text-ink/40'}`}>
                    Step {i + 1}
                  </span>
                  <span className="text-sm font-semibold text-ink">{step.stepType}</span>
                  {step.isActive && (
                    step.activeIngredient
                      ? step.activeIngredient.split(',').map(a => a.trim()).filter(Boolean).map(ing => (
                          <span key={ing} className="text-[10px] font-bold px-1.5 py-0.5 bg-sage/20 text-sage rounded uppercase tracking-wide">
                            {ing}
                          </span>
                        ))
                      : <span className="text-[10px] font-bold px-1.5 py-0.5 bg-sage/20 text-sage rounded uppercase tracking-wide">Active</span>
                  )}
                  {!started && step.scheduledStartDate && (
                    <span className="text-[10px] font-medium px-1.5 py-0.5 bg-terracotta/10 text-terracotta rounded border border-terracotta/20">
                      Starts {formatStartDate(step.scheduledStartDate)}
                    </span>
                  )}
                  {started && !scheduled && step.frequency !== 'daily' && (
                    <span className="text-[10px] font-medium px-1.5 py-0.5 bg-border-soft text-ink/40 rounded">
                      Skip {accent === 'am' ? 'today' : 'tonight'}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  {step.productName && (
                    <p className="text-xs text-ink/40 truncate">{step.productName}</p>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                  {freqLabel && (
                    <span className="text-[10px] text-ink/40 font-medium">
                      {inIntro ? `Intro: ${freqLabel}` : freqLabel}
                    </span>
                  )}
                  {step.notes && (
                    <p className="text-xs text-ink/30 truncate italic">{step.notes}</p>
                  )}
                </div>
              </div>
              <button
                onClick={e => { e.stopPropagation(); onRemove(step.id) }}
                className="opacity-0 group-hover:opacity-100 text-ink/30 hover:text-terracotta transition-all px-1 shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </li>
          )
        })}
        {steps.length === 0 && (
          <li className="text-center py-10 text-sm text-ink/30">No steps yet. Add one above.</li>
        )}
      </ul>
    </>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function RoutineSchedulerPage() {
  const { routineSteps, addRoutineStep, updateRoutineStep, deleteRoutineStep, setRoutineStepOrder, products, settings } = useApp()
  const [slideOver, setSlideOver] = useState<'AM' | 'PM' | null>(null)
  const [editingStep, setEditingStep] = useState<RoutineStep | null>(null)

  const closeSlideOver = () => { setSlideOver(null); setEditingStep(null) }
  const today = getTodayInTimezone(settings.timezone)

  const amSteps = [...routineSteps].filter(s => s.period === 'AM').sort((a, b) => a.order - b.order)
  const pmSteps = [...routineSteps].filter(s => s.period === 'PM').sort((a, b) => a.order - b.order)

  const uniqueActives = [...new Set(
    routineSteps
      .filter(s => s.isActive && s.activeIngredient && hasStarted(s, today))
      .flatMap(s => s.activeIngredient.split(',').map(a => a.trim()).filter(Boolean))
  )]

  const dragIndex = useRef<number | null>(null)
  const dragPeriod = useRef<'AM' | 'PM' | null>(null)

  const onDragStart = (period: 'AM' | 'PM', i: number) => {
    dragIndex.current = i
    dragPeriod.current = period
  }

  const onDragOver = (e: React.DragEvent, period: 'AM' | 'PM', i: number) => {
    e.preventDefault()
    if (dragIndex.current === null || dragIndex.current === i || dragPeriod.current !== period) return
    const steps = period === 'AM' ? [...amSteps] : [...pmSteps]
    const [moved] = steps.splice(dragIndex.current, 1)
    steps.splice(i, 0, moved)
    dragIndex.current = i
    setRoutineStepOrder(period, steps)
  }

  const onDragEnd = () => { dragIndex.current = null; dragPeriod.current = null }

  return (
    <div className="min-h-screen flex font-sans bg-paper">
      <Sidebar />

      <main className="flex-1 h-screen overflow-y-auto flex flex-col relative">

        <div className="bg-white border-b border-border-soft px-6 lg:px-8 py-4 flex items-center justify-between sticky top-0 z-20">
          <div>
            <h1 className="text-2xl font-bold text-ink tracking-tight">Routine Scheduler</h1>
            <p className="text-sm text-ink/50 mt-0.5">
              {amSteps.length} AM · {pmSteps.length} PM steps
            </p>
          </div>
        </div>

        <div className="flex-1 p-6 lg:p-8 flex flex-col gap-8 max-w-7xl mx-auto w-full">

          {/* Patience & Progress */}
          <section
            className="bg-white rounded-2xl border border-border-soft p-6 flex flex-col md:flex-row items-center justify-between gap-6"
            style={{ boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)' }}
          >
            <div>
              <h2 className="text-base font-bold text-ink flex items-center gap-2">
                <Sprout className="w-4 h-4 text-sage" /> Patience & Progress
              </h2>
              <p className="text-sm text-ink/50 mt-2 max-w-md">
                {routineSteps.length === 0
                  ? 'Add your first steps to start building your routine.'
                  : `You have ${amSteps.length + pmSteps.length} steps across your AM and PM routines. Consistency is key — results take weeks, not days.`}
              </p>
            </div>
            <div className="flex flex-col items-end shrink-0">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-bold text-ink/40 uppercase tracking-widest">Actives</span>
                <span className="text-lg font-bold text-ink">{uniqueActives.length}</span>
              </div>
              <div className="flex gap-1.5">
                {uniqueActives.slice(0, 7).map((_, i) => (
                  <div key={i} className="w-8 h-1 rounded-full bg-sage" />
                ))}
                {uniqueActives.length === 0 && (
                  <div className="text-xs text-ink/30">No actives tracked yet</div>
                )}
              </div>
            </div>
          </section>

          {/* AM / PM Split */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

            {/* AM */}
            <section className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-ink flex items-center gap-2">
                  <Sun className="w-4 h-4 text-terracotta" /> AM Routine
                </h3>
                <button
                  onClick={() => setSlideOver('AM')}
                  className="text-sm font-medium text-sage hover:text-ink transition-colors flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" /> Add Step
                </button>
              </div>
              <div
                className="bg-white rounded-2xl border border-terracotta/20 p-2 min-h-[360px]"
                style={{ boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)' }}
              >
                <StepList
                  steps={amSteps}
                  accent="am"
                  today={today}
                  onDragStart={i => onDragStart('AM', i)}
                  onDragOver={(e, i) => onDragOver(e, 'AM', i)}
                  onDragEnd={onDragEnd}
                  onRemove={deleteRoutineStep}
                  onEdit={setEditingStep}
                />
              </div>
            </section>

            {/* PM */}
            <section className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-ink flex items-center gap-2">
                  <Moon className="w-4 h-4 text-ink/50" /> PM Routine
                </h3>
                <button
                  onClick={() => setSlideOver('PM')}
                  className="text-sm font-medium text-sage hover:text-ink transition-colors flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" /> Add Step
                </button>
              </div>
              <div
                className="bg-white rounded-2xl border border-border-soft p-2 min-h-[360px]"
                style={{ boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)' }}
              >
                <StepList
                  steps={pmSteps}
                  accent="pm"
                  today={today}
                  onDragStart={i => onDragStart('PM', i)}
                  onDragOver={(e, i) => onDragOver(e, 'PM', i)}
                  onDragEnd={onDragEnd}
                  onRemove={deleteRoutineStep}
                  onEdit={setEditingStep}
                />
              </div>
            </section>
          </div>

          {/* Post-Routine Log */}
          <section className="border-t border-border-soft pt-8">
            <div className="bg-cream rounded-2xl border border-border-soft p-6 flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold text-ink tracking-wide">Post-Routine Log</h3>
                <p className="text-xs text-ink/50 mt-1">Document any immediate reactions or sensitivities.</p>
              </div>
              <div className="flex gap-3 flex-wrap">
                <button className="px-4 py-2 bg-sage/10 text-ink rounded-lg text-sm font-medium hover:bg-sage/20 transition-colors border border-sage/20 flex items-center gap-2">
                  <span className="text-base">😳</span> Log Redness
                </button>
                <button className="px-4 py-2 bg-sage/10 text-ink rounded-lg text-sm font-medium hover:bg-sage/20 transition-colors border border-sage/20 flex items-center gap-2">
                  <span className="text-base">🔥</span> Log Irritation
                </button>
                <button className="px-4 py-2 bg-white text-ink rounded-lg text-sm font-medium hover:bg-paper transition-colors border border-border-soft flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-sage" /> Routine Clear
                </button>
              </div>
            </div>
          </section>

        </div>
      </main>

      {(slideOver || editingStep) && (
        <StepSlideOver
          key={editingStep?.id ?? slideOver ?? 'new'}
          open={true}
          onClose={closeSlideOver}
          period={editingStep?.period ?? slideOver!}
          products={products}
          onAdd={addRoutineStep}
          onUpdate={(id, updates) => { updateRoutineStep(id, updates); closeSlideOver() }}
          editingStep={editingStep ?? undefined}
          nextOrder={
            (editingStep?.period ?? slideOver) === 'AM' ? amSteps.length : pmSteps.length
          }
        />
      )}
    </div>
  )
}
