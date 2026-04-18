import { useState, useRef } from 'react'
import {
  Sun, Moon, GripVertical, X, Plus, History, Sprout,
  Droplets, FlaskConical, ShieldCheck, Pipette, Layers, CheckCircle2
} from 'lucide-react'
import Sidebar from '../components/Sidebar'

interface RoutineStep {
  id: string
  stepType: string
  product: string
  icon: React.ElementType
  isActive?: boolean
}

const initialAM: RoutineStep[] = [
  { id: 'am1', stepType: 'Gentle Cleanser', product: 'CeraVe Hydrating Cleanser', icon: Droplets },
  { id: 'am2', stepType: 'Vitamin C Serum', product: 'Timeless 20% Vitamin C + E', icon: Pipette },
  { id: 'am3', stepType: 'Moisturizer', product: 'Vanicream Daily Facial Moisturizer', icon: Layers },
  { id: 'am4', stepType: 'Sunscreen (SPF 50+)', product: 'Beauty of Joseon Relief Sun', icon: ShieldCheck },
]

const initialPM: RoutineStep[] = [
  { id: 'pm1', stepType: 'Oil Cleanser', product: 'Kose Softymo Speedy Cleansing Oil', icon: Droplets },
  { id: 'pm2', stepType: 'Water-based Cleanser', product: 'CeraVe Hydrating Cleanser', icon: Droplets },
  { id: 'pm3', stepType: 'Retinoid', product: 'Tretinoin 0.025% Cream', icon: FlaskConical, isActive: true },
  { id: 'pm4', stepType: 'Heavy Moisturizer', product: 'La Roche-Posay Cicaplast Baume B5', icon: Layers },
]

function useDraggableList(initial: RoutineStep[]) {
  const [items, setItems] = useState(initial)
  const dragIndex = useRef<number | null>(null)

  const onDragStart = (i: number) => { dragIndex.current = i }

  const onDragOver = (e: React.DragEvent, i: number) => {
    e.preventDefault()
    if (dragIndex.current === null || dragIndex.current === i) return
    const next = [...items]
    const [moved] = next.splice(dragIndex.current, 1)
    next.splice(i, 0, moved)
    dragIndex.current = i
    setItems(next)
  }

  const onDragEnd = () => { dragIndex.current = null }

  const remove = (id: string) => setItems(prev => prev.filter(s => s.id !== id))

  const add = (step: RoutineStep) => setItems(prev => [...prev, step])

  return { items, onDragStart, onDragOver, onDragEnd, remove, add }
}

function AddStepSlideOver({
  open,
  onClose,
  onAdd,
}: {
  open: boolean
  onClose: () => void
  onAdd: (step: RoutineStep) => void
}) {
  const [stepType, setStepType] = useState('')
  const [product, setProduct] = useState('')

  const handleSave = () => {
    if (!stepType.trim()) return
    onAdd({
      id: `step-${Date.now()}`,
      stepType: stepType.trim(),
      product: product.trim(),
      icon: Pipette,
    })
    setStepType('')
    setProduct('')
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
          <h2 className="text-lg font-bold text-ink">Add Routine Step</h2>
          <button onClick={onClose} className="text-ink/40 hover:text-ink transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 p-6 space-y-5">
          <div>
            <label className="block text-sm font-semibold text-ink mb-1.5">Step Type</label>
            <input
              type="text"
              placeholder="e.g. Toner, Exfoliant, Eye Cream"
              value={stepType}
              onChange={e => setStepType(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-border-soft text-sm focus:outline-none focus:border-sage focus:ring-1 focus:ring-sage"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-ink mb-1.5">Product</label>
            <input
              type="text"
              placeholder="e.g. Paula's Choice BHA Liquid Exfoliant"
              value={product}
              onChange={e => setProduct(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-border-soft text-sm focus:outline-none focus:border-sage focus:ring-1 focus:ring-sage"
            />
          </div>
        </div>
        <div className="p-6 border-t border-border-soft bg-paper/50 flex gap-3">
          <button onClick={onClose} className="flex-1 px-4 py-2.5 border border-border-soft rounded-lg text-sm font-medium text-ink bg-white hover:bg-paper transition-colors">
            Cancel
          </button>
          <button onClick={handleSave} className="flex-1 px-4 py-2.5 bg-sage text-white rounded-lg text-sm font-medium hover:bg-ink transition-colors">
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
        const Icon = step.icon
        const isActive = step.isActive
        return (
          <li
            key={step.id}
            draggable
            onDragStart={() => onDragStart(i)}
            onDragOver={e => onDragOver(e, i)}
            onDragEnd={onDragEnd}
            className={`flex items-center gap-4 p-3 rounded-xl border group cursor-default transition-colors ${
              isActive
                ? 'bg-sage/5 border-sage/30'
                : 'bg-paper border-border-soft hover:border-border-soft'
            }`}
          >
            <div className="drag-handle text-ink/20 hover:text-ink/60 px-1 cursor-grab active:cursor-grabbing shrink-0">
              <GripVertical className="w-4 h-4" />
            </div>
            <div className={`w-10 h-10 rounded-lg bg-white flex items-center justify-center shrink-0 ${
              isActive ? 'border border-sage/30' : 'border border-border-soft'
            }`}>
              <Icon className={`w-4 h-4 ${isActive ? 'text-sage' : 'text-ink/30'}`} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-xs font-bold ${isActive ? 'text-sage' : accent === 'am' ? 'text-sage' : 'text-ink/40'}`}>
                  Step {i + 1}
                </span>
                <span className="text-sm font-semibold text-ink">{step.stepType}</span>
                {isActive && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 bg-sage/20 text-sage rounded uppercase tracking-wide">
                    Active
                  </span>
                )}
              </div>
              <p className="text-xs text-ink/40 mt-0.5 truncate">{step.product}</p>
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

const STREAK_DAYS = 7
const STREAK_DONE = 5

export default function RoutineSchedulerPage() {
  const am = useDraggableList(initialAM)
  const pm = useDraggableList(initialPM)
  const [slideOver, setSlideOver] = useState<'am' | 'pm' | null>(null)

  return (
    <div className="min-h-screen flex font-sans bg-paper">
      <Sidebar />

      <main className="flex-1 h-screen overflow-y-auto flex flex-col relative">

        {/* Toolbar */}
        <div className="bg-white border-b border-border-soft px-6 lg:px-8 py-4 flex items-center justify-between sticky top-0 z-10">
          <div>
            <h1 className="text-2xl font-bold text-ink tracking-tight">Routine Scheduler</h1>
            <p className="text-sm text-ink/50 mt-0.5">Design your daily and alternating regimens.</p>
          </div>
          <button className="px-4 py-2 border border-border-soft rounded-lg text-sm font-medium text-ink bg-white hover:bg-paper transition-colors flex items-center gap-2">
            <History className="w-4 h-4" /> History
          </button>
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
                Consistency is key. You've maintained your core hydration routine for 14 consecutive days. Skin barrier repair takes time.
              </p>
            </div>
            <div className="flex flex-col items-end shrink-0">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-bold text-ink/40 uppercase tracking-widest">Current Streak</span>
                <span className="text-lg font-bold text-ink">14 Days</span>
              </div>
              <div className="flex gap-1.5">
                {Array.from({ length: STREAK_DAYS }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-8 h-1 rounded-full ${i < STREAK_DONE ? 'bg-sage' : 'bg-border-soft'}`}
                  />
                ))}
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
                  onClick={() => setSlideOver('am')}
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
                  steps={am.items}
                  accent="am"
                  onDragStart={am.onDragStart}
                  onDragOver={am.onDragOver}
                  onDragEnd={am.onDragEnd}
                  onRemove={am.remove}
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
                  onClick={() => setSlideOver('pm')}
                  className="text-sm font-medium text-sage hover:text-ink transition-colors flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" /> Add Step
                </button>
              </div>
              <div
                className="bg-white rounded-2xl border border-border-soft p-2 min-h-[360px]"
                style={{ boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)' }}
              >
                <div className="px-4 py-3 mb-1 flex items-center justify-between border-b border-border-soft">
                  <span className="text-xs font-bold text-ink/40 uppercase tracking-wider">Tonight's Focus</span>
                  <span className="px-3 py-1 bg-sage/10 text-sage rounded-full text-xs font-bold border border-sage/20">
                    Retinol Night (Mon/Thu)
                  </span>
                </div>
                <StepList
                  steps={pm.items}
                  accent="pm"
                  onDragStart={pm.onDragStart}
                  onDragOver={pm.onDragOver}
                  onDragEnd={pm.onDragEnd}
                  onRemove={pm.remove}
                />
              </div>
            </section>
          </div>

          {/* Post-Routine Log */}
          <section className="border-t border-border-soft pt-8">
            <div
              className="bg-cream rounded-2xl border border-border-soft p-6 flex flex-col md:flex-row items-center justify-between gap-4"
            >
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

      <AddStepSlideOver
        open={slideOver !== null}
        onClose={() => setSlideOver(null)}
        onAdd={step => {
          if (slideOver === 'am') am.add(step)
          else if (slideOver === 'pm') pm.add(step)
        }}
      />
    </div>
  )
}
