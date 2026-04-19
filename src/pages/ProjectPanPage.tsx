import { useState, useEffect } from 'react'
import {
  Plus, X, PenLine, Droplets, FlaskConical, Layers,
  Package, Target, CalendarClock, CheckCircle2, MoreHorizontal,
  Sun, Sparkles, Zap, Eye, Pipette,
} from 'lucide-react'
import Sidebar from '../components/Sidebar'
import { useApp } from '../context/AppContext'
import type { ProjectPanItem, Product, RoutineStep, StepFrequency } from '../types'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function resolveName(item: ProjectPanItem, products: Product[]): string {
  if (item.productId) {
    const p = products.find(x => x.id === item.productId)
    if (p) return p.name
  }
  return item.productName
}

function resolveBrand(item: ProjectPanItem, products: Product[]): string {
  if (item.productId) {
    const p = products.find(x => x.id === item.productId)
    if (p) return p.brand
  }
  return item.brand
}

const FREQ_LABELS: Record<StepFrequency, string> = {
  'daily': 'Daily',
  'every-other-day': 'Every other day',
  '1x-week': '1× / week',
  '2x-week': '2× / week',
  '3x-week': '3× / week',
}

function getFrequency(item: ProjectPanItem, routineSteps: RoutineStep[]): string | null {
  if (!item.productId) return null
  const step = routineSteps.find(s => s.productId === item.productId && s.isActive)
  return step ? FREQ_LABELS[step.frequency] ?? null : null
}

function iconForCategory(category: string) {
  const c = category.toLowerCase()
  if (c.includes('sunscreen') || c.includes('spf')) return Sun
  if (c.includes('retinoid') || c.includes('retinol')) return Zap
  if (c.includes('exfoliant') || c.includes('exfo') || c.includes('acid')) return Sparkles
  if (c.includes('serum') || c.includes('essence') || c.includes('ampoule')) return FlaskConical
  if (c.includes('toner') || c.includes('mist')) return Pipette
  if (c.includes('eye')) return Eye
  if (c.includes('moisturizer') || c.includes('cream') || c.includes('balm')) return Layers
  if (c.includes('cleanser') || c.includes('wash') || c.includes('gel')) return Droplets
  return Package
}

function formatDate(iso: string): string {
  if (!iso) return ''
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function formatMonthYear(iso: string): string {
  if (!iso) return ''
  const [y, m] = iso.split('-').map(Number)
  return new Date(y, m - 1, 1).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}

// ─── Slide-over ───────────────────────────────────────────────────────────────

const CATEGORIES = ['Serum', 'Moisturizer', 'Cleanser', 'Toner', 'Sunscreen', 'Exfoliant', 'Retinoid', 'Eye Cream', 'Other']

interface SlideOverForm {
  productId: string
  productName: string
  brand: string
  category: string
  usagePercent: number
  targetDate: string
  notes: string
  alreadyFinished: boolean
  finishedAt: string
}

function PanSlideOver({ open, onClose, products, editingItem, onAdd, onUpdate, onRemove }: {
  open: boolean
  onClose: () => void
  products: Product[]
  editingItem: ProjectPanItem | null
  onAdd: (item: Omit<ProjectPanItem, 'id' | 'userId' | 'createdAt'>) => void
  onUpdate: (id: string, updates: Partial<ProjectPanItem>) => void
  onRemove: (id: string) => void
}) {
  const isEdit = !!editingItem

  const today = new Date().toISOString().slice(0, 10)

  const blank = (): SlideOverForm => ({
    productId: '', productName: '', brand: '',
    category: 'Serum', usagePercent: 100, targetDate: '', notes: '',
    alreadyFinished: false, finishedAt: today,
  })

  const [form, setForm] = useState<SlideOverForm>(blank)

  useEffect(() => {
    if (open) {
      if (editingItem) {
        setForm({
          productId: editingItem.productId ?? '',
          productName: editingItem.productName,
          brand: editingItem.brand,
          category: editingItem.category,
          usagePercent: editingItem.usagePercent,
          targetDate: editingItem.targetDate,
          notes: editingItem.notes,
          alreadyFinished: editingItem.finished,
          finishedAt: editingItem.finishedAt ?? today,
        })
      } else {
        setForm(blank())
      }
    }
  }, [open])

  const set = <K extends keyof SlideOverForm>(k: K, v: SlideOverForm[K]) =>
    setForm(prev => ({ ...prev, [k]: v }))

  const linked = products.find(p => p.id === form.productId)
  const displayName = linked ? linked.name : form.productName
  const canSave = displayName.trim().length > 0

  const handleSave = () => {
    if (!canSave) return
    const name = linked ? linked.name : form.productName.trim()
    const brand = linked ? linked.brand : form.brand.trim()
    const category = form.category || (linked?.category ?? 'Serum')

    if (isEdit && editingItem) {
      onUpdate(editingItem.id, {
        productId: form.productId || null,
        productName: name,
        brand,
        category,
        usagePercent: form.usagePercent,
        targetDate: form.targetDate,
        notes: form.notes,
      })
    } else {
      onAdd({
        productId: form.productId || null,
        productName: name,
        brand,
        category,
        usagePercent: form.alreadyFinished ? 0 : form.usagePercent,
        targetDate: form.targetDate,
        notes: form.notes,
        journal: '',
        finished: form.alreadyFinished,
        finishedAt: form.alreadyFinished ? form.finishedAt : null,
      })
    }
    onClose()
  }

  const activeProducts = products.filter(p => p.status === 'active' || p.status === 'upcoming')

  return (
    <>
      <div
        onClick={onClose}
        className={`fixed inset-0 bg-ink/20 backdrop-blur-sm z-40 transition-opacity duration-300 ${open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
      />
      <div className={`fixed inset-y-0 right-0 w-full md:w-[440px] bg-white shadow-2xl z-50 border-l border-border-soft flex flex-col transition-transform duration-300 ${open ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="px-6 py-5 border-b border-border-soft flex items-center justify-between">
          <h2 className="text-lg font-bold text-ink">{isEdit ? 'Edit Pan Item' : 'Add to Pan'}</h2>
          <button onClick={onClose} className="text-ink/40 hover:text-ink transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 p-6 space-y-5 overflow-y-auto">

          {/* Link to inventory */}
          <div>
            <label className="block text-sm font-semibold text-ink mb-1.5">Link to Inventory</label>
            <select
              value={form.productId}
              onChange={e => {
                const pid = e.target.value
                set('productId', pid)
                if (pid) {
                  const p = products.find(x => x.id === pid)
                  if (p) {
                    set('category', p.category || 'Serum')
                    if (p.fillPercent != null) set('usagePercent', p.fillPercent)
                  }
                }
              }}
              className="w-full px-4 py-2.5 rounded-lg border border-border-soft text-sm text-ink bg-white focus:outline-none focus:border-sage"
            >
              <option value="">— Enter manually —</option>
              {activeProducts.map(p => (
                <option key={p.id} value={p.id}>{p.name}{p.brand ? ` — ${p.brand}` : ''}</option>
              ))}
            </select>
            <p className="text-[10px] text-ink/40 mt-1">Linking syncs the product name and enables PAO tracking.</p>
          </div>

          {/* Manual name + brand (only if not linked) */}
          {!form.productId && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-ink mb-1.5">Product Name</label>
                <input
                  type="text"
                  placeholder="e.g. Niacinamide 10% + Zinc"
                  value={form.productName}
                  onChange={e => set('productName', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-border-soft text-sm focus:outline-none focus:border-sage focus:ring-1 focus:ring-sage"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-ink mb-1.5">Brand</label>
                <input
                  type="text"
                  placeholder="e.g. The Ordinary"
                  value={form.brand}
                  onChange={e => set('brand', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-border-soft text-sm focus:outline-none focus:border-sage"
                />
              </div>
            </div>
          )}

          {/* Category */}
          <div>
            <label className="block text-sm font-semibold text-ink mb-1.5">Category</label>
            <select
              value={form.category}
              onChange={e => set('category', e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-border-soft text-sm text-ink bg-white focus:outline-none focus:border-sage"
            >
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>

          {/* Already finished toggle */}
          {!isEdit && (
            <div className="py-3 border-y border-border-soft space-y-3">
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <span className="text-sm font-semibold text-ink">This product is already empty</span>
                  <p className="text-xs text-ink/40 mt-0.5">Logs it directly to your Empty Gallery.</p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={form.alreadyFinished}
                  onClick={() => set('alreadyFinished', !form.alreadyFinished)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${form.alreadyFinished ? 'bg-terracotta' : 'bg-border-soft'}`}
                >
                  <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ${form.alreadyFinished ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </label>
              {form.alreadyFinished && (
                <div>
                  <label className="block text-sm font-semibold text-ink mb-1.5">Date Finished</label>
                  <input
                    type="date"
                    value={form.finishedAt}
                    onChange={e => set('finishedAt', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-border-soft text-sm text-ink focus:outline-none focus:border-sage"
                  />
                </div>
              )}
            </div>
          )}

          {/* Fill level */}
          <div className={form.alreadyFinished ? 'opacity-40 pointer-events-none' : ''}>
            <div className="flex justify-between mb-2">
              <label className="block text-sm font-semibold text-ink">
                {isEdit ? 'Current Fill Level' : 'Starting Fill Level'}
              </label>
              <span className="text-sm font-bold text-ink">{form.usagePercent}%</span>
            </div>
            <input
              type="range" min={5} max={100} step={5}
              value={form.usagePercent}
              onChange={e => set('usagePercent', Number(e.target.value))}
              disabled={form.alreadyFinished}
              className="w-full"
              style={{ accentColor: '#C27059' }}
            />
            <div className="flex justify-between text-[10px] text-ink/30 mt-1">
              <span>Nearly empty</span><span>Full</span>
            </div>
          </div>

          {/* Target date */}
          <div className={form.alreadyFinished ? 'opacity-40 pointer-events-none' : ''}>
            <label className="block text-sm font-semibold text-ink mb-1.5">
              Target Finish Date <span className="font-normal text-ink/40">(optional)</span>
            </label>
            <input
              type="date"
              value={form.targetDate}
              onChange={e => set('targetDate', e.target.value)}
              disabled={form.alreadyFinished}
              className="w-full px-4 py-2.5 rounded-lg border border-border-soft text-sm text-ink focus:outline-none focus:border-sage disabled:bg-paper"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-semibold text-ink mb-1.5">
              Notes <span className="font-normal text-ink/40">(optional)</span>
            </label>
            <textarea
              rows={3}
              value={form.notes}
              onChange={e => set('notes', e.target.value)}
              placeholder="Why this product? Any goals?"
              className="w-full px-4 py-2.5 rounded-lg border border-border-soft text-sm text-ink focus:outline-none focus:border-sage resize-none placeholder-ink/30"
            />
          </div>
        </div>

        <div className="p-6 border-t border-border-soft bg-paper/50 space-y-3">
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-border-soft rounded-lg text-sm font-medium text-ink bg-white hover:bg-paper transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!canSave}
              className="flex-1 px-4 py-2.5 bg-sage text-white rounded-lg text-sm font-medium hover:bg-ink transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isEdit ? 'Save Changes' : form.alreadyFinished ? 'Add to Gallery' : 'Add to Pan'}
            </button>
          </div>
          {isEdit && editingItem && (
            <button
              onClick={() => { onRemove(editingItem.id); onClose() }}
              className="w-full px-4 py-2 text-xs font-medium text-terracotta hover:text-white hover:bg-terracotta border border-terracotta/30 hover:border-terracotta rounded-lg transition-colors"
            >
              Remove from Pan
            </button>
          )}
        </div>
      </div>
    </>
  )
}

// ─── Product card ─────────────────────────────────────────────────────────────

function ProductCard({ item, products, routineSteps, onEdit, onMarkEmpty }: {
  item: ProjectPanItem
  products: Product[]
  routineSteps: RoutineStep[]
  onEdit: (item: ProjectPanItem) => void
  onMarkEmpty: (item: ProjectPanItem) => void
}) {
  const name = resolveName(item, products)
  const brand = resolveBrand(item, products)
  const freq = getFrequency(item, routineSteps)
  const Icon = iconForCategory(item.category)
  const fill = item.usagePercent

  const fillColor = fill <= 20
    ? 'linear-gradient(90deg, #C27059 0%, rgba(194,112,89,0.6) 100%)'
    : fill <= 50
      ? 'linear-gradient(90deg, #C27059 0%, rgba(194,112,89,0.7) 100%)'
      : 'linear-gradient(90deg, #7D8E7A 0%, rgba(125,142,122,0.7) 100%)'

  const started = item.createdAt
    ? new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : null

  return (
    <div
      className="bg-white rounded-2xl border border-border-soft p-6 hover:shadow-md transition-shadow cursor-pointer group"
      style={{ boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)' }}
      onClick={() => onEdit(item)}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className="w-9 h-9 rounded-lg bg-paper border border-border-soft flex items-center justify-center shrink-0 mt-0.5">
            <Icon className="w-4 h-4 text-ink/40" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-sage/10 text-sage">
              {item.category}
            </span>
            <h3 className="text-sm font-bold text-ink mt-1.5 leading-snug">{name}</h3>
            {brand && <p className="text-xs text-ink/40 mt-0.5">{brand}</p>}
            {started && <p className="text-xs text-ink/30 mt-0.5">Added {started}</p>}
          </div>
        </div>
        <button
          onClick={e => { e.stopPropagation(); onEdit(item) }}
          className="opacity-0 group-hover:opacity-100 text-ink/30 hover:text-ink transition-all shrink-0 ml-2"
        >
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>

      {/* Fill level */}
      <div className="mb-3">
        <div className="flex justify-between text-xs font-medium mb-1.5">
          <span className="text-ink/50">Fill Remaining</span>
          <span className={`font-bold ${fill <= 20 ? 'text-terracotta' : 'text-ink'}`}>{fill}%</span>
        </div>
        <div className="h-2 w-full bg-paper rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all" style={{ width: `${fill}%`, background: fillColor }} />
        </div>
      </div>

      {/* Meta row */}
      <div className="flex flex-wrap gap-2 mt-3">
        {freq && (
          <span className="text-[10px] text-ink/50 bg-paper px-2 py-0.5 rounded font-medium">{freq}</span>
        )}
        {item.targetDate && (
          <span className="text-[10px] text-terracotta/80 bg-terracotta/5 border border-terracotta/15 px-2 py-0.5 rounded font-medium flex items-center gap-1">
            <Target className="w-2.5 h-2.5" />
            By {formatDate(item.targetDate)}
          </span>
        )}
      </div>

      {item.notes && (
        <p className="text-xs text-ink/40 mt-3 leading-snug italic line-clamp-2">{item.notes}</p>
      )}

      <div className="mt-4 pt-4 border-t border-border-soft flex justify-between items-center">
        {fill <= 20 ? (
          <span className="text-xs text-terracotta font-medium flex items-center gap-1">
            <CalendarClock className="w-3 h-3" /> Almost empty!
          </span>
        ) : (
          <span className="text-xs text-ink/30">&nbsp;</span>
        )}
        <button
          onClick={e => { e.stopPropagation(); onMarkEmpty(item) }}
          className="text-xs font-bold text-terracotta hover:text-ink transition-colors"
        >
          Mark Empty
        </button>
      </div>
    </div>
  )
}

// ─── Reflection section ───────────────────────────────────────────────────────

function ReflectionSection({ item, products, onSave }: {
  item: ProjectPanItem
  products: Product[]
  onSave: (id: string, journal: string) => void
}) {
  const [text, setText] = useState(item.journal)
  const [saved, setSaved] = useState(false)
  const name = resolveName(item, products)

  const handleSave = () => {
    if (!text.trim()) return
    onSave(item.id, text.trim())
    setSaved(true)
  }

  return (
    <section>
      <div className="bg-sage/5 rounded-2xl border border-sage/20 p-8">
        <div className="max-w-2xl">
          <div className="flex items-center gap-2 mb-4">
            <PenLine className="w-4 h-4 text-sage" />
            <span className="text-xs font-bold text-sage uppercase tracking-wider">Reflection</span>
          </div>
          <h3 className="font-serif text-2xl text-ink mb-3">Before you replace…</h3>
          <p className="text-sm text-ink/60 mb-6 leading-relaxed">
            You finished your <strong className="text-ink">{name}</strong>. Take a moment to reflect before purchasing a replacement — did it meet your skin goals?
          </p>
          {saved ? (
            <div className="p-4 bg-sage/10 border border-sage/20 rounded-lg text-sm text-sage font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" /> Reflection saved.
            </div>
          ) : (
            <div className="space-y-4">
              <textarea
                rows={3}
                value={text}
                onChange={e => setText(e.target.value)}
                placeholder="I noticed my pores looked clearer, but it felt slightly drying in winter…"
                className="w-full bg-white border border-border-soft rounded-lg p-4 text-sm text-ink focus:outline-none focus:border-sage resize-none placeholder-ink/30"
              />
              <div className="flex gap-3">
                <button
                  onClick={handleSave}
                  disabled={!text.trim()}
                  className="px-4 py-2 bg-ink text-white rounded-lg text-sm font-bold hover:bg-ink/80 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Save Entry
                </button>
                <button
                  onClick={() => setSaved(true)}
                  className="px-4 py-2 bg-white border border-border-soft text-ink rounded-lg text-sm font-medium hover:bg-paper transition-colors"
                >
                  Skip for now
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

// ─── Reflection slide-over ────────────────────────────────────────────────────

function ReflectionSlideOver({ item, products, open, onClose, onSave }: {
  item: ProjectPanItem | null
  products: Product[]
  open: boolean
  onClose: () => void
  onSave: (id: string, journal: string) => void
}) {
  const [text, setText] = useState('')

  useEffect(() => {
    if (open && item) setText(item.journal ?? '')
  }, [open, item])

  if (!item) return null

  const name = resolveName(item, products)
  const brand = resolveBrand(item, products)
  const Icon = iconForCategory(item.category)

  const handleSave = () => {
    onSave(item.id, text.trim())
    onClose()
  }

  return (
    <>
      <div
        onClick={onClose}
        className={`fixed inset-0 bg-ink/20 backdrop-blur-sm z-40 transition-opacity duration-300 ${open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
      />
      <div className={`fixed inset-y-0 right-0 w-full md:w-[440px] bg-white shadow-2xl z-50 border-l border-border-soft flex flex-col transition-transform duration-300 ${open ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="px-6 py-5 border-b border-border-soft flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PenLine className="w-4 h-4 text-sage" />
            <h2 className="text-lg font-bold text-ink">Reflection</h2>
          </div>
          <button onClick={onClose} className="text-ink/40 hover:text-ink transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 p-6 overflow-y-auto space-y-6">
          {/* Product summary */}
          <div className="flex items-start gap-3 p-4 bg-paper rounded-xl border border-border-soft">
            <div className="w-10 h-10 bg-white rounded-lg border border-border-soft flex items-center justify-center shrink-0">
              <Icon className="w-4 h-4 text-ink/30" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-ink leading-snug">{name}</h3>
              {brand && <p className="text-xs text-ink/40 mt-0.5">{brand}</p>}
              {item.finishedAt && (
                <p className="text-xs text-ink/30 mt-0.5">Finished {formatDate(item.finishedAt)}</p>
              )}
            </div>
          </div>

          {/* Journal */}
          <div>
            <label className="block text-sm font-semibold text-ink mb-1.5">
              Did it meet your skin goals?
            </label>
            <p className="text-xs text-ink/40 mb-3">
              Reflect before purchasing a replacement — what worked, what didn't.
            </p>
            <textarea
              rows={6}
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="I noticed my pores looked clearer, but it felt slightly drying in winter…"
              className="w-full bg-white border border-border-soft rounded-lg p-4 text-sm text-ink focus:outline-none focus:border-sage resize-none placeholder-ink/30"
            />
          </div>
        </div>

        <div className="px-6 py-4 border-t border-border-soft flex gap-3">
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-2.5 bg-ink text-white rounded-lg text-sm font-bold hover:bg-ink/80 transition-colors"
          >
            Save Reflection
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2.5 border border-border-soft text-ink rounded-lg text-sm font-medium hover:bg-paper transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ProjectPanPage() {
  const {
    projectPanItems, addProjectPanItem, updateProjectPanItem, removeProjectPanItem,
    products, routineSteps,
  } = useApp()

  const [slideOverOpen, setSlideOverOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<ProjectPanItem | null>(null)
  const [markEmptyTarget, setMarkEmptyTarget] = useState<ProjectPanItem | null>(null)
  const [reflectionItem, setReflectionItem] = useState<ProjectPanItem | null>(null)

  const active = projectPanItems.filter(i => !i.finished).sort((a, b) => a.usagePercent - b.usagePercent)
  const finished = projectPanItems.filter(i => i.finished).sort((a, b) =>
    (b.finishedAt ?? '').localeCompare(a.finishedAt ?? '')
  )

  // Most recently finished item without a journal entry
  const pendingReflection = finished.find(i => !i.journal)

  const openAdd = () => { setEditingItem(null); setSlideOverOpen(true) }
  const openEdit = (item: ProjectPanItem) => { setEditingItem(item); setSlideOverOpen(true) }

  const handleMarkEmpty = (item: ProjectPanItem) => {
    updateProjectPanItem(item.id, {
      finished: true,
      finishedAt: new Date().toISOString().slice(0, 10),
      usagePercent: 0,
    })
    setMarkEmptyTarget(null)
  }


  const handleSaveReflection = (id: string, journal: string) => {
    updateProjectPanItem(id, { journal })
  }

  return (
    <div className="min-h-screen flex font-sans bg-cream">
      <Sidebar />

      <main className="flex-1 h-screen overflow-y-auto bg-paper flex flex-col">

        {/* Toolbar */}
        <div className="bg-white border-b border-border-soft px-6 lg:px-8 py-4 flex items-center justify-between sticky top-0 z-20">
          <div>
            <h1 className="text-2xl font-bold text-ink tracking-tight">Project Pan</h1>
            <p className="text-sm text-ink/50 mt-0.5">Methodically finish your active products before replacing them.</p>
          </div>
          <button
            onClick={openAdd}
            className="px-4 py-2 bg-sage text-white rounded-lg text-sm font-bold hover:bg-ink transition-colors flex items-center gap-2 shadow-sm"
          >
            <Plus className="w-4 h-4" /> Add to Pan
          </button>
        </div>

        <div className="flex-1 p-6 lg:p-8 max-w-[1440px] mx-auto w-full flex flex-col gap-10">

          {/* Mark Empty confirmation banner */}
          {markEmptyTarget && (
            <div className="bg-terracotta/5 border border-terracotta/30 rounded-xl p-4 flex items-center justify-between gap-4">
              <p className="text-sm text-ink">
                Mark <strong>{resolveName(markEmptyTarget, products)}</strong> as finished?
              </p>
              <div className="flex gap-2 shrink-0">
                <button
                  onClick={() => setMarkEmptyTarget(null)}
                  className="px-3 py-1.5 text-xs font-medium border border-border-soft rounded-lg bg-white text-ink hover:bg-paper transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleMarkEmpty(markEmptyTarget)}
                  className="px-3 py-1.5 text-xs font-bold bg-terracotta text-white rounded-lg hover:bg-ink transition-colors"
                >
                  Yes, mark empty
                </button>
              </div>
            </div>
          )}

          {/* Active Pan */}
          <section>
            <div className="flex items-center justify-between mb-6 border-b border-border-soft pb-4">
              <h2 className="text-lg font-bold text-ink">
                Active Pan <span className="text-sage ml-1">{active.length}</span>
              </h2>
              {active.length > 0 && (
                <span className="text-xs text-ink/40 font-medium">Sorted by fill — lowest first</span>
              )}
            </div>

            {active.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {active.map(item => (
                  <ProductCard
                    key={item.id}
                    item={item}
                    products={products}
                    routineSteps={routineSteps}
                    onEdit={openEdit}
                    onMarkEmpty={i => setMarkEmptyTarget(i)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 border border-dashed border-border-soft rounded-2xl">
                <Package className="w-8 h-8 text-ink/20 mx-auto mb-3" />
                <p className="text-sm text-ink/30">No active pan items. Add a product to get started.</p>
              </div>
            )}
          </section>

          {/* Reflection prompt for most recently finished item without journal */}
          {pendingReflection && (
            <ReflectionSection
              item={pendingReflection}
              products={products}
              onSave={handleSaveReflection}
            />
          )}

          {/* Empties Gallery */}
          {finished.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-6 border-b border-border-soft pb-4">
                <h2 className="text-lg font-bold text-ink">Empties Gallery</h2>
                <span className="text-xs font-medium px-2 py-1 bg-paper rounded text-ink/40">
                  {finished.length} finished
                </span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {finished.map(item => {
                  const Icon = iconForCategory(item.category)
                  const name = resolveName(item, products)
                  const brand = resolveBrand(item, products)
                  return (
                    <div
                      key={item.id}
                      className="bg-paper border border-border-soft/60 rounded-xl p-4 text-center grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all cursor-pointer group"
                      onClick={() => setReflectionItem(item)}
                    >
                      <div className="w-12 h-12 bg-white rounded-full mx-auto flex items-center justify-center mb-3 shadow-sm">
                        <Icon className="w-5 h-5 text-ink/30 group-hover:text-sage transition-colors" />
                      </div>
                      <h4 className="text-xs font-bold text-ink line-clamp-2 leading-snug">{name}</h4>
                      {brand && <p className="text-[10px] text-ink/40 mt-0.5 truncate">{brand}</p>}
                      {item.finishedAt && (
                        <p className="text-[10px] text-ink/30 mt-1">
                          {formatMonthYear(item.finishedAt)}
                        </p>
                      )}
                      {item.journal && (
                        <div className="mt-2">
                          <span className="text-[10px] bg-sage/10 text-sage px-1.5 py-0.5 rounded">✓ Reflected</span>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </section>
          )}
        </div>
      </main>

      <PanSlideOver
        open={slideOverOpen}
        onClose={() => { setSlideOverOpen(false); setEditingItem(null) }}
        products={products}
        editingItem={editingItem}
        onAdd={addProjectPanItem}
        onUpdate={updateProjectPanItem}
        onRemove={removeProjectPanItem}
      />

      <ReflectionSlideOver
        open={!!reflectionItem}
        item={reflectionItem}
        products={products}
        onClose={() => setReflectionItem(null)}
        onSave={handleSaveReflection}
      />
    </div>
  )
}
