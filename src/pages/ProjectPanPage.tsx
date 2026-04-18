import { useState } from 'react'
import { Plus, X, MoreHorizontal, Clock, PenLine, Droplets, FlaskConical } from 'lucide-react'
import Sidebar from '../components/Sidebar'

interface PanProduct {
  id: string
  category: string
  categoryColor: 'sage' | 'terracotta'
  name: string
  startDate: string
  volumePercent: number
  frequencyLabel: string
  frequencyPercent: number
  estEmpty: string
}

interface FinishedProduct {
  id: string
  name: string
  finishedDate: string
  icon: React.ElementType
}

const initialActive: PanProduct[] = [
  {
    id: '1', category: 'Serum', categoryColor: 'sage', name: 'Niacinamide 10% + Zinc',
    startDate: 'Jan 15, 2024', volumePercent: 20, frequencyLabel: '4x / week',
    frequencyPercent: 57, estEmpty: '~2 weeks',
  },
  {
    id: '2', category: 'Moisturizer', categoryColor: 'terracotta', name: 'Ceramide Barrier Cream',
    startDate: 'Mar 01, 2024', volumePercent: 60, frequencyLabel: 'Daily (AM/PM)',
    frequencyPercent: 100, estEmpty: '~6 weeks',
  },
  {
    id: '3', category: 'Serum', categoryColor: 'sage', name: 'Vitamin C 15% SAP',
    startDate: 'Apr 10, 2024', volumePercent: 80, frequencyLabel: '5x / week',
    frequencyPercent: 71, estEmpty: '~10 weeks',
  },
]

const initialFinished: FinishedProduct[] = [
  { id: 'f1', name: 'Hyaluronic Acid 2%', finishedDate: 'Apr 2024', icon: Droplets },
  { id: 'f2', name: 'Centella Toner', finishedDate: 'Feb 2024', icon: FlaskConical },
  { id: 'f3', name: 'AHA 7% Toning Solution', finishedDate: 'Jan 2024', icon: Droplets },
  { id: 'f4', name: 'Gentle Cleanser', finishedDate: 'Dec 2023', icon: Droplets },
  { id: 'f5', name: 'Niacinamide 5%', finishedDate: 'Nov 2023', icon: FlaskConical },
]

function AddToPanSlideOver({ open, onClose, onAdd }: {
  open: boolean
  onClose: () => void
  onAdd: (p: PanProduct) => void
}) {
  const [name, setName] = useState('')
  const [category, setCategory] = useState('Serum')
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10))
  const [volume, setVolume] = useState(100)

  const handleSave = () => {
    if (!name.trim()) return
    onAdd({
      id: String(Date.now()),
      category,
      categoryColor: ['Moisturizer', 'Sunscreen'].includes(category) ? 'terracotta' : 'sage',
      name: name.trim(),
      startDate: new Date(startDate).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      volumePercent: volume,
      frequencyLabel: 'Not set',
      frequencyPercent: 0,
      estEmpty: 'TBD',
    })
    setName('')
    setCategory('Serum')
    setVolume(100)
    onClose()
  }

  return (
    <>
      <div onClick={onClose} className={`fixed inset-0 bg-ink/20 backdrop-blur-sm z-40 transition-opacity duration-300 ${open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`} />
      <div className={`fixed inset-y-0 right-0 w-full md:w-[420px] bg-white shadow-2xl z-50 border-l border-border-soft flex flex-col transition-transform duration-300 ${open ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="px-6 py-5 border-b border-border-soft flex items-center justify-between">
          <h2 className="text-lg font-bold text-ink">Add to Pan</h2>
          <button onClick={onClose} className="text-ink/40 hover:text-ink transition-colors"><X className="w-5 h-5" /></button>
        </div>
        <div className="flex-1 p-6 space-y-5 overflow-y-auto">
          <div>
            <label className="block text-sm font-semibold text-ink mb-1.5">Product Name</label>
            <input type="text" placeholder="e.g. Niacinamide 10% + Zinc" value={name} onChange={e => setName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-border-soft text-sm focus:outline-none focus:border-sage focus:ring-1 focus:ring-sage" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-ink mb-1.5">Category</label>
              <select value={category} onChange={e => setCategory(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-border-soft text-sm text-ink bg-white focus:outline-none focus:border-sage">
                {['Serum', 'Moisturizer', 'Cleanser', 'Toner', 'Sunscreen', 'Exfoliant', 'Retinoid'].map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-ink mb-1.5">Start Date</label>
              <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-border-soft text-sm text-ink focus:outline-none focus:border-sage" />
            </div>
          </div>
          <div>
            <div className="flex justify-between mb-2">
              <label className="block text-sm font-semibold text-ink">Starting Volume</label>
              <span className="text-sm font-bold text-ink">{volume}%</span>
            </div>
            <input type="range" min={5} max={100} step={5} value={volume} onChange={e => setVolume(Number(e.target.value))}
              style={{ accentColor: '#7D8E7A' }} className="w-full" />
            <div className="flex justify-between text-[10px] text-ink/30 mt-1">
              <span>Nearly empty</span><span>Full</span>
            </div>
          </div>
        </div>
        <div className="p-6 border-t border-border-soft bg-paper/50 flex gap-3">
          <button onClick={onClose} className="flex-1 px-4 py-2.5 border border-border-soft rounded-lg text-sm font-medium text-ink bg-white hover:bg-paper transition-colors">Cancel</button>
          <button onClick={handleSave} className="flex-1 px-4 py-2.5 bg-sage text-white rounded-lg text-sm font-medium hover:bg-ink transition-colors">Add to Pan</button>
        </div>
      </div>
    </>
  )
}

function ProductCard({ product, onMarkEmpty }: { product: PanProduct; onMarkEmpty: (id: string) => void }) {
  const isSage = product.categoryColor === 'sage'
  return (
    <div className="bg-white rounded-2xl border border-border-soft p-6 hover:shadow-md transition-shadow"
      style={{ boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)' }}>
      <div className="flex justify-between items-start mb-4">
        <div>
          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded ${
            isSage ? 'bg-sage/10 text-sage' : 'bg-terracotta/10 text-terracotta'
          }`}>{product.category}</span>
          <h3 className="text-base font-bold text-ink mt-2">{product.name}</h3>
          <p className="text-xs text-ink/40">Started: {product.startDate}</p>
        </div>
        <button className="text-ink/30 hover:text-ink transition-colors">
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <div className="flex justify-between text-xs font-medium mb-1.5">
            <span className="text-ink/50">Volume Remaining</span>
            <span className="text-ink">~{product.volumePercent}%</span>
          </div>
          <div className="h-2 w-full bg-paper rounded-full overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{
                width: `${product.volumePercent}%`,
                background: isSage
                  ? 'linear-gradient(90deg, #7D8E7A 0%, rgba(141,162,144,0.7) 100%)'
                  : 'linear-gradient(90deg, #C27059 0%, rgba(194,112,89,0.7) 100%)',
              }}
            />
          </div>
        </div>
        <div>
          <div className="flex justify-between text-xs font-medium mb-1.5">
            <span className="text-ink/50">Usage Frequency</span>
            <span className="text-ink">{product.frequencyLabel}</span>
          </div>
          <div className="h-2 w-full bg-paper rounded-full overflow-hidden">
            <div className="h-full bg-ink/70 rounded-full" style={{ width: `${product.frequencyPercent}%` }} />
          </div>
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-border-soft flex justify-between items-center">
        <span className="text-xs text-ink/40 flex items-center gap-1">
          <Clock className="w-3 h-3" /> Est. empty in {product.estEmpty}
        </span>
        <button onClick={() => onMarkEmpty(product.id)} className="text-xs font-bold text-terracotta hover:underline">
          Mark Empty
        </button>
      </div>
    </div>
  )
}

export default function ProjectPanPage() {
  const [active, setActive] = useState<PanProduct[]>(initialActive)
  const [finished, setFinished] = useState<FinishedProduct[]>(initialFinished)
  const [slideOverOpen, setSlideOverOpen] = useState(false)
  const [alertDismissed, setAlertDismissed] = useState(false)
  const [reflectionText, setReflectionText] = useState('')
  const [reflectionSaved, setReflectionSaved] = useState(false)

  const handleMarkEmpty = (id: string) => {
    const product = active.find(p => p.id === id)
    if (!product) return
    setActive(prev => prev.filter(p => p.id !== id))
    setFinished(prev => [{
      id: `f-${id}`,
      name: product.name,
      finishedDate: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      icon: Droplets,
    }, ...prev])
    setReflectionSaved(false)
  }

  const handleAddToActive = (p: PanProduct) => setActive(prev => [...prev, p])

  const handleSaveReflection = () => {
    if (reflectionText.trim()) setReflectionSaved(true)
  }

  return (
    <div className="min-h-screen flex font-sans bg-paper">
      <Sidebar />

      <main className="flex-1 h-screen overflow-y-auto flex flex-col relative">

        {/* Toolbar */}
        <div className="bg-white border-b border-border-soft px-6 lg:px-8 py-4 flex items-center justify-between sticky top-0 z-10">
          <div>
            <h1 className="text-2xl font-bold text-ink tracking-tight">Project Pan</h1>
            <p className="text-sm text-ink/50 mt-0.5">Methodically finish your active products before replacing them.</p>
          </div>
          <button
            onClick={() => setSlideOverOpen(true)}
            className="px-4 py-2 bg-sage text-white rounded-lg text-sm font-bold hover:bg-ink transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Add to Pan
          </button>
        </div>

        <div className="flex-1 p-6 lg:p-8 max-w-[1440px] mx-auto w-full flex flex-col gap-10">

          {/* Duplicate Alert */}
          {!alertDismissed && (
            <div className="bg-terracotta/10 border border-terracotta/30 rounded-xl p-4 flex items-start gap-3">
              <span className="text-terracotta text-base mt-0.5">⚠️</span>
              <div className="flex-1">
                <h4 className="text-sm font-bold text-ink">Duplicate Active Concentration Detected</h4>
                <p className="text-xs text-ink/60 mt-1 leading-relaxed">
                  You recently added a 15% Vitamin C serum, but you already have one in your Active Pan. Consider finishing the current one before opening the new product to prevent oxidation.
                </p>
              </div>
              <button onClick={() => setAlertDismissed(true)} className="text-ink/30 hover:text-ink transition-colors shrink-0">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Active Pan */}
          <section>
            <div className="flex items-center justify-between mb-6 border-b border-border-soft pb-4">
              <h2 className="text-lg font-bold text-ink">
                Active Products (<span className="text-sage">{active.length}</span>)
              </h2>
              <button className="px-3 py-1.5 text-xs font-medium bg-white border border-border-soft rounded-lg text-ink hover:bg-paper transition-colors">
                Sort by: Usage
              </button>
            </div>

            {active.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {active.map(p => (
                  <ProductCard key={p.id} product={p} onMarkEmpty={handleMarkEmpty} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 text-ink/30 text-sm border border-dashed border-border-soft rounded-2xl">
                No active products. Add one to get started.
              </div>
            )}
          </section>

          {/* Reflection Prompt */}
          <section>
            <div className="bg-sage/5 rounded-2xl border border-sage/20 p-8">
              <div className="max-w-2xl">
                <div className="flex items-center gap-2 mb-4">
                  <PenLine className="w-4 h-4 text-sage" />
                  <span className="text-xs font-bold text-sage uppercase tracking-wider">Reflection</span>
                </div>
                <h3 className="font-serif text-2xl text-ink mb-3">Before you replace...</h3>
                <p className="text-sm text-ink/60 mb-6 leading-relaxed">
                  You recently finished your BHA Liquid Exfoliant. Take a moment to reflect on its efficacy before purchasing a replacement. Did it meet your skin goals, or are you seeking a different outcome?
                </p>
                {reflectionSaved ? (
                  <div className="p-4 bg-sage/10 border border-sage/20 rounded-lg text-sm text-sage font-medium">
                    ✓ Reflection saved.
                  </div>
                ) : (
                  <div className="space-y-4">
                    <textarea
                      rows={3}
                      value={reflectionText}
                      onChange={e => setReflectionText(e.target.value)}
                      placeholder="I noticed my pores looked clearer, but it felt slightly drying in winter..."
                      className="w-full bg-white border border-border-soft rounded-lg p-4 text-sm text-ink focus:outline-none focus:border-sage resize-none placeholder-ink/30"
                    />
                    <div className="flex gap-3">
                      <button onClick={handleSaveReflection} className="px-4 py-2 bg-ink text-white rounded-lg text-sm font-bold hover:bg-ink/80 transition-colors">
                        Save Entry
                      </button>
                      <button className="px-4 py-2 bg-white border border-border-soft text-ink rounded-lg text-sm font-medium hover:bg-paper transition-colors">
                        Skip for now
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Empty Gallery */}
          <section>
            <div className="flex items-center justify-between mb-6 border-b border-border-soft pb-4">
              <h2 className="text-lg font-bold text-ink">Empty Gallery Archive</h2>
              <span className="text-xs font-medium px-2 py-1 bg-paper rounded text-ink/40">
                {finished.length} Product{finished.length !== 1 ? 's' : ''} Finished
              </span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {finished.map(f => {
                const Icon = f.icon
                return (
                  <div
                    key={f.id}
                    className="bg-paper border border-border-soft/60 rounded-xl p-4 text-center grayscale opacity-70 hover:grayscale-0 hover:opacity-100 transition-all cursor-pointer"
                  >
                    <div className="w-12 h-12 bg-white rounded-full mx-auto flex items-center justify-center mb-3 shadow-sm">
                      <Icon className="w-5 h-5 text-ink/30" />
                    </div>
                    <h4 className="text-xs font-bold text-ink line-clamp-1">{f.name}</h4>
                    <p className="text-[10px] text-ink/40 mt-1">Finished: {f.finishedDate}</p>
                  </div>
                )
              })}
            </div>
          </section>

        </div>
      </main>

      <AddToPanSlideOver
        open={slideOverOpen}
        onClose={() => setSlideOverOpen(false)}
        onAdd={handleAddToActive}
      />
    </div>
  )
}
