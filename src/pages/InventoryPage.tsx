import { useState } from 'react'
import { Search, Download, Plus, SlidersHorizontal, X } from 'lucide-react'
import Sidebar from '../components/Sidebar'

type Status = 'Active' | 'Upcoming' | 'Paused' | 'Finished'

interface Product {
  id: string
  name: string
  brand: string
  category: string
  status: Status
  paoLabel: string
  paoPercent: number
  paoUrgent: boolean
}

const products: Product[] = [
  { id: '1', name: 'C E Ferulic', brand: 'Skinceuticals', category: 'Serum', status: 'Active', paoLabel: '2 Mo Left', paoPercent: 66, paoUrgent: false },
  { id: '2', name: 'Toleriane Double Repair', brand: 'La Roche-Posay', category: 'Moisturizer', status: 'Active', paoLabel: '14 Days Left', paoPercent: 90, paoUrgent: true },
  { id: '3', name: '2% BHA Liquid Exfoliant', brand: "Paula's Choice", category: 'Exfoliant', status: 'Upcoming', paoLabel: 'Unopened', paoPercent: 0, paoUrgent: false },
  { id: '4', name: 'Differin Gel', brand: 'Galderma', category: 'Retinoid', status: 'Paused', paoLabel: '4 Mo Left', paoPercent: 33, paoUrgent: false },
  { id: '5', name: 'Relief Sun SPF 50+', brand: 'Beauty of Joseon', category: 'Sunscreen', status: 'Active', paoLabel: '3 Mo Left', paoPercent: 50, paoUrgent: false },
  { id: '6', name: 'Hyaluronic Acid 2%', brand: 'The Ordinary', category: 'Serum', status: 'Active', paoLabel: '5 Mo Left', paoPercent: 40, paoUrgent: false },
  { id: '7', name: 'All Clean Balm', brand: 'Heimish', category: 'Cleanser', status: 'Finished', paoLabel: 'Finished', paoPercent: 100, paoUrgent: false },
  { id: '8', name: 'Matcha Hemp Cleanser', brand: 'Krave Beauty', category: 'Cleanser', status: 'Active', paoLabel: '1 Mo Left', paoPercent: 85, paoUrgent: true },
]

const statusStyle: Record<Status, string> = {
  Active: 'bg-sage/10 text-sage',
  Upcoming: 'bg-paper text-ink/60',
  Paused: 'bg-terracotta/10 text-terracotta',
  Finished: 'bg-ink/5 text-ink/40',
}

function paoBarColor(product: Product) {
  if (product.status === 'Paused') return 'bg-ink/20'
  if (product.status === 'Upcoming') return 'bg-border-soft'
  if (product.status === 'Finished') return 'bg-ink/10'
  return product.paoUrgent ? 'bg-terracotta' : 'bg-sage'
}

function AddProductSlideOver({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className={`fixed inset-0 bg-ink/20 backdrop-blur-sm z-40 transition-opacity duration-300 ${open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
      />

      {/* Panel */}
      <div className={`fixed inset-y-0 right-0 w-full md:w-[480px] bg-white shadow-2xl z-50 border-l border-border-soft flex flex-col transition-transform duration-300 ${open ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="px-6 py-5 border-b border-border-soft flex items-center justify-between">
          <h2 className="text-lg font-bold text-ink">Add New Product</h2>
          <button onClick={onClose} className="text-ink/40 hover:text-ink transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          <div>
            <label className="block text-sm font-semibold text-ink mb-1.5">Product Name</label>
            <input type="text" placeholder="e.g. C E Ferulic" className="w-full px-4 py-2.5 rounded-lg border border-border-soft text-sm focus:outline-none focus:border-sage focus:ring-1 focus:ring-sage transition-all" />
          </div>

          <div>
            <label className="block text-sm font-semibold text-ink mb-1.5">Brand</label>
            <input type="text" placeholder="e.g. Skinceuticals" className="w-full px-4 py-2.5 rounded-lg border border-border-soft text-sm focus:outline-none focus:border-sage focus:ring-1 focus:ring-sage transition-all" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-ink mb-1.5">Category</label>
              <select className="w-full px-4 py-2.5 rounded-lg border border-border-soft text-sm text-ink bg-white focus:outline-none focus:border-sage focus:ring-1 focus:ring-sage">
                <option value="">Select...</option>
                {['Cleanser', 'Toner', 'Serum', 'Moisturizer', 'Sunscreen', 'Exfoliant', 'Retinoid', 'Eye Cream', 'Mask'].map(c => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-ink mb-1.5">Status</label>
              <select className="w-full px-4 py-2.5 rounded-lg border border-border-soft text-sm text-ink bg-white focus:outline-none focus:border-sage focus:ring-1 focus:ring-sage">
                <option>Active</option>
                <option>Upcoming</option>
                <option>Paused</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-ink mb-1.5">Open Date</label>
              <input type="date" className="w-full px-4 py-2.5 rounded-lg border border-border-soft text-sm text-ink focus:outline-none focus:border-sage focus:ring-1 focus:ring-sage" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-ink mb-1.5">Expiry Date</label>
              <input type="date" className="w-full px-4 py-2.5 rounded-lg border border-border-soft text-sm text-ink focus:outline-none focus:border-sage focus:ring-1 focus:ring-sage" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-ink mb-1.5">Period After Opening (PAO)</label>
            <div className="flex gap-3">
              <input type="number" placeholder="12" className="w-24 px-4 py-2.5 rounded-lg border border-border-soft text-sm focus:outline-none focus:border-sage focus:ring-1 focus:ring-sage" />
              <select className="flex-1 px-4 py-2.5 rounded-lg border border-border-soft text-sm text-ink bg-white focus:outline-none focus:border-sage focus:ring-1 focus:ring-sage">
                <option>Months</option>
                <option>Weeks</option>
                <option>Years</option>
              </select>
            </div>
            <p className="text-xs text-ink/50 mt-1.5">Found on the open jar symbol on the packaging.</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-ink mb-1.5">Active Ingredients</label>
            <input type="text" placeholder="e.g. Vitamin C, Niacinamide" className="w-full px-4 py-2.5 rounded-lg border border-border-soft text-sm focus:outline-none focus:border-sage focus:ring-1 focus:ring-sage" />
            <p className="text-xs text-ink/50 mt-1.5">Separate multiple ingredients with commas.</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-ink mb-1.5">Notes</label>
            <textarea rows={3} placeholder="Any notes about this product..." className="w-full px-4 py-2.5 rounded-lg border border-border-soft text-sm focus:outline-none focus:border-sage focus:ring-1 focus:ring-sage resize-none" />
          </div>
        </div>

        <div className="p-6 border-t border-border-soft bg-paper/50 flex gap-3">
          <button onClick={onClose} className="flex-1 px-4 py-2.5 border border-border-soft rounded-lg text-sm font-medium text-ink bg-white hover:bg-paper transition-colors">
            Cancel
          </button>
          <button className="flex-1 px-4 py-2.5 bg-sage text-white rounded-lg text-sm font-medium hover:bg-ink transition-colors">
            Save Product
          </button>
        </div>
      </div>
    </>
  )
}

export default function InventoryPage() {
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [slideOverOpen, setSlideOverOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  const toggleSelect = (id: string) => {
    const next = new Set(selected)
    next.has(id) ? next.delete(id) : next.add(id)
    setSelected(next)
  }

  const filtered = products.filter(p => {
    const matchSearch = search === '' ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.brand.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase())
    const matchCategory = categoryFilter === '' || p.category === categoryFilter
    const matchStatus = statusFilter === '' || p.status === statusFilter
    return matchSearch && matchCategory && matchStatus
  })

  return (
    <div className="min-h-screen flex font-sans bg-paper">
      <Sidebar />

      <main className="flex-1 h-screen overflow-y-auto flex flex-col relative">

        {/* Sticky Toolbar */}
        <div className="bg-white border-b border-border-soft px-6 lg:px-8 py-4 flex items-center justify-between sticky top-0 z-10">
          <div>
            <h1 className="text-2xl font-bold text-ink tracking-tight">Product Inventory</h1>
            <p className="text-sm text-ink/50 mt-0.5">Manage your skincare collection and track shelf life.</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 border border-border-soft rounded-lg text-sm font-medium text-ink bg-white hover:bg-paper transition-colors flex items-center gap-2">
              <Download className="w-4 h-4" /> Export
            </button>
            <button
              onClick={() => setSlideOverOpen(true)}
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
                placeholder="Search by product name, brand, or ingredient..."
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
                {['Cleanser', 'Toner', 'Serum', 'Moisturizer', 'Sunscreen', 'Exfoliant', 'Retinoid'].map(c => (
                  <option key={c}>{c}</option>
                ))}
              </select>
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="px-3 py-2.5 rounded-lg border border-border-soft text-sm text-ink bg-white focus:outline-none focus:border-sage min-w-[140px]"
              >
                <option value="">All Statuses</option>
                {(['Active', 'Upcoming', 'Paused', 'Finished'] as Status[]).map(s => (
                  <option key={s}>{s}</option>
                ))}
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
                <button className="text-sm font-medium text-ink hover:text-sage transition-colors px-2">Pause</button>
                <button className="text-sm font-medium text-ink hover:text-sage transition-colors px-2">Mark Finished</button>
                <button className="text-sm font-medium text-terracotta hover:text-terracotta/70 transition-colors px-2">Archive</button>
              </div>
              <button onClick={() => setSelected(new Set())} className="text-ink/40 hover:text-ink px-2 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Product Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map(product => (
              <div
                key={product.id}
                className={`bg-white rounded-2xl border p-5 flex flex-col gap-4 hover:border-border-soft transition-all group cursor-pointer ${
                  selected.has(product.id) ? 'border-sage ring-1 ring-sage' : 'border-border-soft'
                } ${product.status === 'Paused' ? 'bg-paper/50' : ''} ${product.status === 'Upcoming' ? 'opacity-80' : ''}`}
                style={{ boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)' }}
              >
                <div className="flex justify-between items-start">
                  {/* Checkbox */}
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
                    {product.status}
                  </span>
                </div>

                <div>
                  <p className="text-xs font-semibold text-ink/40 uppercase tracking-wider mb-1">{product.category}</p>
                  <h3 className="text-base font-bold text-ink leading-tight mb-1 group-hover:text-sage transition-colors">{product.name}</h3>
                  <p className="text-sm text-ink/60">{product.brand}</p>
                </div>

                <div className="mt-auto pt-4 border-t border-border-soft/60 flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-ink/50">
                      {product.status === 'Upcoming' ? 'Status' : 'PAO Countdown'}
                    </span>
                    <span className={`text-xs font-bold ${product.paoUrgent ? 'text-terracotta' : product.status === 'Finished' ? 'text-ink/40' : 'text-ink'}`}>
                      {product.paoLabel}
                    </span>
                  </div>
                  <div className="w-full bg-border-soft/50 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-1.5 rounded-full transition-all ${paoBarColor(product)}`}
                      style={{ width: `${product.paoPercent}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}

            {filtered.length === 0 && (
              <div className="col-span-full text-center py-16 text-ink/40 text-sm">
                No products match your filters.
              </div>
            )}
          </div>
        </div>
      </main>

      <AddProductSlideOver open={slideOverOpen} onClose={() => setSlideOverOpen(false)} />
    </div>
  )
}
