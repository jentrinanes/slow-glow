import { useState } from 'react'
import { Search, Download, Plus, SlidersHorizontal, X, Package } from 'lucide-react'
import Sidebar from '../components/Sidebar'
import { useApp } from '../context/AppContext'
import type { Product } from '../types'

type StatusFilter = 'active' | 'upcoming' | 'paused' | 'finished' | ''

const CATEGORIES = ['Cleanser', 'Toner', 'Serum', 'Moisturizer', 'Sunscreen', 'Exfoliant', 'Retinoid', 'Eye Cream', 'Mask', 'Other']

const statusStyle: Record<Product['status'], string> = {
  active:   'bg-sage/10 text-sage',
  upcoming: 'bg-paper text-ink/60',
  paused:   'bg-terracotta/10 text-terracotta',
  finished: 'bg-ink/5 text-ink/40',
}

const statusLabel: Record<Product['status'], string> = {
  active: 'Active', upcoming: 'Upcoming', paused: 'Paused', finished: 'Finished',
}

function computePao(product: Product): { label: string; percent: number; urgent: boolean } {
  if (product.status === 'upcoming') {
    return { label: 'Unopened', percent: 0, urgent: false }
  }
  if (product.status === 'finished') {
    return { label: 'Finished', percent: 100, urgent: false }
  }
  if (product.paoMonths <= 0) {
    return { label: '—', percent: 0, urgent: false }
  }

  if (product.openedAt) {
    const opened = new Date(product.openedAt).getTime()
    const totalMs = product.paoMonths * 30.44 * 24 * 60 * 60 * 1000
    const elapsed = Date.now() - opened
    const remaining = totalMs - elapsed
    const percent = Math.min(100, Math.round((elapsed / totalMs) * 100))
    if (remaining <= 0) return { label: 'Expired', percent: 100, urgent: true }
    const days = Math.ceil(remaining / (24 * 60 * 60 * 1000))
    const months = Math.floor(days / 30.44)
    const label = days <= 30
      ? `${days} Day${days !== 1 ? 's' : ''} Left`
      : `${months} Mo Left`
    return { label, percent, urgent: days <= 30 }
  }

  if (product.fillPercent !== null && product.fillPercent !== undefined) {
    const remainingMonths = Math.round((product.fillPercent / 100) * product.paoMonths)
    const percent = 100 - product.fillPercent
    const urgent = product.fillPercent <= 25
    const label = remainingMonths <= 0 ? 'Almost gone' : `~${remainingMonths} Mo Left`
    return { label, percent, urgent }
  }

  return { label: 'Date unknown', percent: 0, urgent: false }
}

function paoBarColor(product: Product, urgent: boolean) {
  if (product.status === 'paused') return 'bg-ink/20'
  if (product.status === 'upcoming') return 'bg-border-soft'
  if (product.status === 'finished') return 'bg-ink/10'
  return urgent ? 'bg-terracotta' : 'bg-sage'
}

interface SlideOverProps {
  open: boolean
  onClose: () => void
  onSave: (p: Omit<Product, 'id' | 'userId' | 'createdAt'>) => void
  editing?: Product | null
}

function ProductSlideOver({ open, onClose, onSave, editing }: SlideOverProps) {
  const [form, setForm] = useState({
    name: editing?.name ?? '',
    brand: editing?.brand ?? '',
    category: editing?.category ?? '',
    status: (editing?.status ?? 'active') as Product['status'],
    paoMonths: editing?.paoMonths ?? 12,
    openedAt: editing?.openedAt ?? '',
    fillPercent: editing?.fillPercent ?? null as number | null,
    activeIngredients: editing?.activeIngredients ?? '',
    notes: editing?.notes ?? '',
  })

  const set = (k: keyof typeof form, v: string | number | null) =>
    setForm(f => ({ ...f, [k]: v }))

  const handleSave = () => {
    if (!form.name.trim()) return
    onSave({ ...form, openedAt: form.openedAt || null })
    onClose()
  }

  return (
    <>
      <div
        onClick={onClose}
        className={`fixed inset-0 bg-ink/20 backdrop-blur-sm z-40 transition-opacity duration-300 ${open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
      />
      <div className={`fixed inset-y-0 right-0 w-full md:w-[480px] bg-white shadow-2xl z-50 border-l border-border-soft flex flex-col transition-transform duration-300 ${open ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="px-6 py-5 border-b border-border-soft flex items-center justify-between">
          <h2 className="text-lg font-bold text-ink">{editing ? 'Edit Product' : 'Add New Product'}</h2>
          <button onClick={onClose} className="text-ink/40 hover:text-ink transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          <div>
            <label className="block text-sm font-semibold text-ink mb-1.5">Product Name *</label>
            <input
              type="text"
              value={form.name}
              onChange={e => set('name', e.target.value)}
              placeholder="e.g. C E Ferulic"
              className="w-full px-4 py-2.5 rounded-lg border border-border-soft text-sm focus:outline-none focus:border-sage focus:ring-1 focus:ring-sage transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-ink mb-1.5">Brand</label>
            <input
              type="text"
              value={form.brand}
              onChange={e => set('brand', e.target.value)}
              placeholder="e.g. Skinceuticals"
              className="w-full px-4 py-2.5 rounded-lg border border-border-soft text-sm focus:outline-none focus:border-sage focus:ring-1 focus:ring-sage transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-ink mb-1.5">Category</label>
              <select
                value={form.category}
                onChange={e => set('category', e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-border-soft text-sm text-ink bg-white focus:outline-none focus:border-sage focus:ring-1 focus:ring-sage"
              >
                <option value="">Select…</option>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-ink mb-1.5">Status</label>
              <select
                value={form.status}
                onChange={e => set('status', e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-border-soft text-sm text-ink bg-white focus:outline-none focus:border-sage focus:ring-1 focus:ring-sage"
              >
                <option value="active">Active</option>
                <option value="upcoming">Upcoming</option>
                <option value="paused">Paused</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-semibold text-ink">Open Date</label>
                <button
                  type="button"
                  onClick={() => set('openedAt', new Date().toISOString().slice(0, 10))}
                  className="text-xs text-sage hover:text-ink transition-colors"
                >
                  Use today
                </button>
              </div>
              <input
                type="date"
                value={form.openedAt}
                onChange={e => set('openedAt', e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-border-soft text-sm text-ink focus:outline-none focus:border-sage focus:ring-1 focus:ring-sage"
              />
              <p className="text-xs text-ink/50 mt-1">Leave blank if unknown.</p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-ink mb-1.5">PAO (Months)</label>
              <input
                type="number"
                min={1}
                value={form.paoMonths}
                onChange={e => set('paoMonths', Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-lg border border-border-soft text-sm focus:outline-none focus:border-sage focus:ring-1 focus:ring-sage"
              />
              <p className="text-xs text-ink/50 mt-1">Open jar symbol on packaging.</p>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-sm font-semibold text-ink">Current Fill Level</label>
              {form.fillPercent !== null && (
                <button type="button" onClick={() => set('fillPercent', null)} className="text-xs text-ink/40 hover:text-ink transition-colors">Clear</button>
              )}
            </div>
            <div className="flex gap-2">
              {[{ label: 'Full', value: 100 }, { label: '75%', value: 75 }, { label: '50%', value: 50 }, { label: '25%', value: 25 }, { label: 'Almost empty', value: 10 }].map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => set('fillPercent', opt.value)}
                  className={`flex-1 py-2 rounded-lg border text-xs font-medium transition-colors ${
                    form.fillPercent === opt.value
                      ? 'border-sage bg-sage/10 text-sage'
                      : 'border-border-soft text-ink/60 hover:border-sage/50'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <p className="text-xs text-ink/50 mt-1.5">Optional — helps estimate remaining PAO when open date is unknown.</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-ink mb-1.5">Active Ingredients</label>
            <input
              type="text"
              value={form.activeIngredients}
              onChange={e => set('activeIngredients', e.target.value)}
              placeholder="e.g. Vitamin C, Niacinamide"
              className="w-full px-4 py-2.5 rounded-lg border border-border-soft text-sm focus:outline-none focus:border-sage focus:ring-1 focus:ring-sage"
            />
            <p className="text-xs text-ink/50 mt-1">Separate with commas.</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-ink mb-1.5">Notes</label>
            <textarea
              rows={3}
              value={form.notes}
              onChange={e => set('notes', e.target.value)}
              placeholder="Any notes about this product…"
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
            disabled={!form.name.trim()}
            className="flex-1 px-4 py-2.5 bg-sage text-white rounded-lg text-sm font-medium hover:bg-ink transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {editing ? 'Save Changes' : 'Save Product'}
          </button>
        </div>
      </div>
    </>
  )
}

export default function InventoryPage() {
  const { products, addProduct, updateProduct, deleteProduct } = useApp()
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [slideOverOpen, setSlideOverOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [slideOverKey, setSlideOverKey] = useState(0)

  const openEdit = (p: Product) => { setEditingProduct(p); setSlideOverKey(k => k + 1); setSlideOverOpen(true) }
  const openAdd = () => { setEditingProduct(null); setSlideOverKey(k => k + 1); setSlideOverOpen(true) }
  const handleClose = () => { setSlideOverOpen(false); setEditingProduct(null) }

  const handleSave = (data: Omit<Product, 'id' | 'userId' | 'createdAt'>) => {
    if (editingProduct) {
      updateProduct(editingProduct.id, data)
    } else {
      addProduct(data)
    }
  }
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('')

  const toggleSelect = (id: string) => {
    const next = new Set(selected)
    next.has(id) ? next.delete(id) : next.add(id)
    setSelected(next)
  }

  const filtered = products.filter(p => {
    const matchSearch = search === '' ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.brand.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase()) ||
      p.activeIngredients.toLowerCase().includes(search.toLowerCase())
    const matchCategory = categoryFilter === '' || p.category === categoryFilter
    const matchStatus = statusFilter === '' || p.status === statusFilter
    return matchSearch && matchCategory && matchStatus
  })

  const bulkUpdate = (updates: Partial<Product>) => {
    selected.forEach(id => updateProduct(id, updates))
    setSelected(new Set())
  }

  const bulkDelete = () => {
    selected.forEach(id => deleteProduct(id))
    setSelected(new Set())
  }

  const categories = [...new Set(products.map(p => p.category).filter(Boolean))]

  return (
    <div className="min-h-screen flex font-sans bg-paper">
      <Sidebar />

      <main className="flex-1 h-screen overflow-y-auto flex flex-col relative">

        <div className="bg-white border-b border-border-soft px-6 lg:px-8 py-4 flex items-center justify-between sticky top-0 z-20">
          <div>
            <h1 className="text-2xl font-bold text-ink tracking-tight">Product Inventory</h1>
            <p className="text-sm text-ink/50 mt-0.5">
              {products.length} product{products.length !== 1 ? 's' : ''} · {products.filter(p => p.status === 'active').length} active
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 border border-border-soft rounded-lg text-sm font-medium text-ink bg-white hover:bg-paper transition-colors flex items-center gap-2">
              <Download className="w-4 h-4" /> Export
            </button>
            <button
              onClick={openAdd}
              className="px-4 py-2 bg-sage text-white rounded-lg text-sm font-medium hover:bg-ink transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Add Product
            </button>
          </div>
        </div>

        <div className="flex-1 p-6 lg:p-8 flex flex-col gap-6">

          {/* Search & Filters */}
          <div className="bg-white rounded-xl border border-border-soft p-4 flex flex-col lg:flex-row gap-4 items-center justify-between shadow-sm">
            <div className="relative w-full lg:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink/30" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by name, brand, or ingredient…"
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border-soft text-sm focus:outline-none focus:border-sage focus:ring-1 focus:ring-sage transition-all bg-paper/50"
              />
            </div>
            <div className="flex items-center gap-3 w-full lg:w-auto overflow-x-auto">
              <select
                value={categoryFilter}
                onChange={e => setCategoryFilter(e.target.value)}
                className="px-3 py-2.5 rounded-lg border border-border-soft text-sm text-ink bg-white focus:outline-none focus:border-sage min-w-[140px]"
              >
                <option value="">All Categories</option>
                {(categories.length ? categories : CATEGORIES).map(c => (
                  <option key={c}>{c}</option>
                ))}
              </select>
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value as StatusFilter)}
                className="px-3 py-2.5 rounded-lg border border-border-soft text-sm text-ink bg-white focus:outline-none focus:border-sage min-w-[140px]"
              >
                <option value="">All Statuses</option>
                <option value="active">Active</option>
                <option value="upcoming">Upcoming</option>
                <option value="paused">Paused</option>
                <option value="finished">Finished</option>
              </select>
              <button className="px-4 py-2.5 border border-border-soft rounded-lg text-sm font-medium text-ink bg-white hover:bg-paper transition-colors flex items-center gap-2 whitespace-nowrap">
                <SlidersHorizontal className="w-4 h-4" /> More Filters
              </button>
            </div>
          </div>

          {/* Bulk Actions */}
          {selected.size > 0 && (
            <div className="bg-sage/10 border border-sage/30 rounded-xl p-3 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-sage px-2">{selected.size} Selected</span>
                <div className="h-4 w-px bg-sage/30" />
                <button onClick={() => bulkUpdate({ status: 'paused' })} className="text-sm font-medium text-ink hover:text-sage transition-colors px-2">Pause</button>
                <button onClick={() => bulkUpdate({ status: 'finished' })} className="text-sm font-medium text-ink hover:text-sage transition-colors px-2">Mark Finished</button>
                <button onClick={bulkDelete} className="text-sm font-medium text-terracotta hover:text-terracotta/70 transition-colors px-2">Delete</button>
              </div>
              <button onClick={() => setSelected(new Set())} className="text-ink/40 hover:text-ink px-2 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Product Grid */}
          {products.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-4 py-24 text-center">
              <div className="w-16 h-16 rounded-2xl bg-sage/10 flex items-center justify-center">
                <Package className="w-8 h-8 text-sage" />
              </div>
              <div>
                <p className="text-ink font-semibold mb-1">No products yet</p>
                <p className="text-sm text-ink/50">Add your first product to start tracking shelf life and actives.</p>
              </div>
              <button
                onClick={openAdd}
                className="px-5 py-2.5 bg-sage text-white rounded-lg text-sm font-medium hover:bg-ink transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> Add Product
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filtered.map(product => {
                const pao = computePao(product)
                return (
                  <div
                    key={product.id}
                    className={`bg-white rounded-2xl border p-5 flex flex-col gap-4 hover:border-border-soft transition-all group cursor-pointer ${
                      selected.has(product.id) ? 'border-sage ring-1 ring-sage' : 'border-border-soft'
                    } ${product.status === 'paused' ? 'bg-paper/50' : ''} ${product.status === 'upcoming' ? 'opacity-80' : ''}`}
                    style={{ boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)' }}
                  >
                    <div className="flex justify-between items-start">
                      <button
                        onClick={() => toggleSelect(product.id)}
                        className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors shrink-0 ${
                          selected.has(product.id) ? 'bg-sage border-sage' : 'border-ink/20 hover:border-sage'
                        }`}
                      >
                        {selected.has(product.id) && (
                          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </button>
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${statusStyle[product.status]}`}>
                        {statusLabel[product.status]}
                      </span>
                    </div>

                    <div>
                      <p className="text-xs font-semibold text-ink/40 uppercase tracking-wider mb-1">{product.category}</p>
                      <button
                        onClick={() => openEdit(product)}
                        className="text-base font-bold text-ink leading-tight mb-1 hover:text-sage transition-colors text-left"
                      >
                        {product.name}
                      </button>
                      <p className="text-sm text-ink/60">{product.brand}</p>
                      {product.activeIngredients && (
                        <p className="text-xs text-ink/40 mt-1 truncate">{product.activeIngredients}</p>
                      )}
                    </div>

                    <div className="mt-auto pt-4 border-t border-border-soft/60 flex flex-col gap-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-ink/50">
                          {product.status === 'upcoming' ? 'Status' : 'PAO Countdown'}
                        </span>
                        <span className={`text-xs font-bold ${pao.urgent ? 'text-terracotta' : product.status === 'finished' ? 'text-ink/40' : 'text-ink'}`}>
                          {pao.label}
                        </span>
                      </div>
                      <div className="w-full bg-border-soft/50 rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-1.5 rounded-full transition-all ${paoBarColor(product, pao.urgent)}`}
                          style={{ width: `${pao.percent}%` }}
                        />
                      </div>
                    </div>
                  </div>
                )
              })}

              {filtered.length === 0 && products.length > 0 && (
                <div className="col-span-full text-center py-16 text-ink/40 text-sm">
                  No products match your filters.
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <ProductSlideOver
        key={slideOverKey}
        open={slideOverOpen}
        onClose={handleClose}
        onSave={handleSave}
        editing={editingProduct}
      />
    </div>
  )
}
