import { useState, useRef } from 'react'
import {
  Sun, Moon, GripVertical, X, Plus, Sprout,
  Droplets, FlaskConical, ShieldCheck, Pipette, Layers, CheckCircle2, Sparkles
} from 'lucide-react'
import Sidebar from '../components/Sidebar'
import { useApp } from '../context/AppContext'
import type { RoutineStep, Product } from '../types'

const STEP_TYPES = [
  'Oil Cleanser', 'Gentle Cleanser', 'Exfoliating Cleanser',
  'Toner', 'Essence', 'Serum', 'Eye Cream',
  'Moisturizer', 'Face Oil', 'Sunscreen',
  'Retinoid', 'Exfoliant', 'Mask', 'Spot Treatment', 'Other',
]

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

interface AddStepSlideOverProps {
  open: boolean
  onClose: () => void
  period: 'AM' | 'PM'
  products: Product[]
  onAdd: (step: Omit<RoutineStep, 'id' | 'userId'>) => void
  nextOrder: number
}

function AddStepSlideOver({ open, onClose, period, products, onAdd, nextOrder }: AddStepSlideOverProps) {
  const empty = { stepType: '', productId: '', productName: '', isActive: false, activeIngredient: '', notes: '' }
  const [form, setForm] = useState(empty)

  const set = (k: keyof typeof form, v: string | boolean) =>
    setForm(f => ({ ...f, [k]: v }))

  const handleProductSelect = (productId: string) => {
    if (!productId) { set('productId', ''); set('productName', ''); return }
    const p = products.find(p => p.id === productId)
    if (p) {
      set('productId', productId)
      set('productName', `${p.name}${p.brand ? ` — ${p.brand}` : ''}`)
      if (p.activeIngredients.length > 0) {
        set('isActive', true)
        set('activeIngredient', p.activeIngredients[0])
      }
    }
  }

  const handleSave = () => {
    if (!form.stepType.trim()) return
    onAdd({
      stepType: form.stepType.trim(),
      productId: form.productId || null,
      productName: form.productName.trim(),
      period,
      order: nextOrder,
      isActive: form.isActive,
      activeIngredient: form.activeIngredient.trim(),
      notes: form.notes.trim(),
    })
    setForm(empty)
    onClose()
  }

  return (
    <>
      <div
        onClick={onClose}
        className={`fixed inset-0 bg-ink/20 backdrop-blur-sm z-40 transition-opacity duration-300 ${open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
      />
      <div className={`fixed inset-y-0 right-0 w-full md:w-[420px] bg-white shadow-2xl z-50 border-l border-border-soft flex flex-col transition-transform duration-300 ${open ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="px-6 py-5 border-b border-border-soft flex items-center justify-between">
          <h2 className="text-lg font-bold text-ink">
            Add {period === 'AM' ? 'AM' : 'PM'} Step
          </h2>
          <button onClick={onClose} className="text-ink/40 hover:text-ink transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          <div>
            <label className="block text-sm font-semibold text-ink mb-1.5">Step Type *</label>
            <select
              value={form.stepType}
              onChange={e => set('stepType', e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-border-soft text-sm text-ink bg-white focus:outline-none focus:border-sage focus:ring-1 focus:ring-sage"
            >
              <option value="">Select type…</option>
              {STEP_TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-ink mb-1.5">Product</label>
            {products.filter(p => p.status === 'active' || p.status === 'upcoming').length > 0 ? (
              <>
                <select
                  value={form.productId}
                  onChange={e => handleProductSelect(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-border-soft text-sm text-ink bg-white focus:outline-none focus:border-sage focus:ring-1 focus:ring-sage mb-2"
                >
                  <option value="">Pick from inventory…</option>
                  {products
                    .filter(p => p.status === 'active' || p.status === 'upcoming')
                    .map(p => (
                      <option key={p.id} value={p.id}>{p.name}{p.brand ? ` — ${p.brand}` : ''}</option>
                    ))}
                </select>
                <p className="text-xs text-ink/40 mb-2 text-center">— or type manually —</p>
              </>
            ) : null}
            <input
              type="text"
              value={form.productName}
              onChange={e => { set('productName', e.target.value); set('productId', '') }}
              placeholder="e.g. CeraVe Hydrating Cleanser"
              className="w-full px-4 py-2.5 rounded-lg border border-border-soft text-sm focus:outline-none focus:border-sage focus:ring-1 focus:ring-sage"
            />
          </div>

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

          {form.isActive && (
            <div>
              <label className="block text-sm font-semibold text-ink mb-1.5">Active Ingredient Name</label>
              <input
                type="text"
                value={form.activeIngredient}
                onChange={e => set('activeIngredient', e.target.value)}
                placeholder="e.g. Retinol 0.3%, Vitamin C 20%"
                className="w-full px-4 py-2.5 rounded-lg border border-border-soft text-sm focus:outline-none focus:border-sage focus:ring-1 focus:ring-sage"
              />
            </div>
          )}

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
            Add Step
          </button>
        </div>
      </div>
    </>
  )
}

function StepList({
  steps,
  accent,
  onDragStart,
  onDragOver,
  onDragEnd,
  onRemove,
}: {
  steps: RoutineStep[]
  accent: 'am' | 'pm'
  onDragStart: (i: number) => void
  onDragOver: (e: React.DragEvent, i: number) => void
  onDragEnd: () => void
  onRemove: (id: string) => void
}) {
  return (
    <ul className="space-y-2 p-2">
      {steps.map((step, i) => {
        const Icon = iconForStep(step.stepType, step.isActive)
        return (
          <li
            key={step.id}
            draggable
            onDragStart={() => onDragStart(i)}
            onDragOver={e => onDragOver(e, i)}
            onDragEnd={onDragEnd}
            className={`flex items-center gap-4 p-3 rounded-xl border group cursor-default transition-colors ${
              step.isActive ? 'bg-sage/5 border-sage/30' : 'bg-paper border-border-soft'
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
                  <span className="text-[10px] font-bold px-1.5 py-0.5 bg-sage/20 text-sage rounded uppercase tracking-wide">
                    {step.activeIngredient || 'Active'}
                  </span>
                )}
              </div>
              {step.productName && (
                <p className="text-xs text-ink/40 mt-0.5 truncate">{step.productName}</p>
              )}
              {step.notes && (
                <p className="text-xs text-ink/30 mt-0.5 truncate italic">{step.notes}</p>
              )}
            </div>
            <button
              onClick={() => onRemove(step.id)}
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
  )
}

export default function RoutineSchedulerPage() {
  const { routineSteps, addRoutineStep, deleteRoutineStep, setRoutineStepOrder, products } = useApp()
  const [slideOver, setSlideOver] = useState<'AM' | 'PM' | null>(null)

  const amSteps = [...routineSteps].filter(s => s.period === 'AM').sort((a, b) => a.order - b.order)
  const pmSteps = [...routineSteps].filter(s => s.period === 'PM').sort((a, b) => a.order - b.order)

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
                <span className="text-lg font-bold text-ink">
                  {routineSteps.filter(s => s.isActive).length}
                </span>
              </div>
              <div className="flex gap-1.5">
                {routineSteps.filter(s => s.isActive).slice(0, 7).map((_, i) => (
                  <div key={i} className="w-8 h-1 rounded-full bg-sage" />
                ))}
                {routineSteps.filter(s => s.isActive).length === 0 && (
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
                  onDragStart={i => onDragStart('AM', i)}
                  onDragOver={(e, i) => onDragOver(e, 'AM', i)}
                  onDragEnd={onDragEnd}
                  onRemove={deleteRoutineStep}
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
                  onDragStart={i => onDragStart('PM', i)}
                  onDragOver={(e, i) => onDragOver(e, 'PM', i)}
                  onDragEnd={onDragEnd}
                  onRemove={deleteRoutineStep}
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

      {slideOver && (
        <AddStepSlideOver
          key={slideOver}
          open={true}
          onClose={() => setSlideOver(null)}
          period={slideOver}
          products={products}
          onAdd={addRoutineStep}
          nextOrder={slideOver === 'AM' ? amSteps.length : pmSteps.length}
        />
      )}
    </div>
  )
}
