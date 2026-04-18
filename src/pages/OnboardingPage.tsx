import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Leaf, Check, Compass, FlaskConical, Info, Droplets, Sun, Feather, RotateCcw, Layers, Waves } from 'lucide-react'
import { useApp } from '../context/AppContext'

type SkinType = 'Dry' | 'Normal' | 'Combination' | 'Oily' | ''
type TrackingMode = 'guided' | 'nerd' | ''
type YesNoUnsure = 'yes' | 'no' | 'unsure' | ''

interface FormData {
  firstName: string
  age: string
  skinType: SkinType
  fitzpatrick: number | null
  concerns: string[]
  contextNotes: string
  trackingMode: TrackingMode
  pregnancy: YesNoUnsure
  prescriptions: 'yes' | 'no' | ''
  barrier: YesNoUnsure
}

const FITZPATRICK = [
  { type: 1, color: '#F9E5D9' },
  { type: 2, color: '#F0D5C2' },
  { type: 3, color: '#D9B49C' },
  { type: 4, color: '#B58B6F' },
  { type: 5, color: '#7B5238' },
  { type: 6, color: '#4A3123' },
]

const CONCERNS = [
  { value: 'acne', label: 'Acne & Blemishes', icon: Droplets },
  { value: 'hyperpigmentation', label: 'Hyperpigmentation', icon: Sun },
  { value: 'sensitivity', label: 'Sensitivity & Redness', icon: Feather },
  { value: 'aging', label: 'Fine Lines & Aging', icon: RotateCcw },
  { value: 'texture', label: 'Uneven Texture', icon: Layers },
  { value: 'dryness', label: 'Severe Dryness', icon: Waves },
]

const STEP_LABELS = ['Basics', 'Skin Concerns', 'Health & Safety']

function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center gap-4 mb-12 border-b border-border-soft pb-6 shrink-0">
      {STEP_LABELS.map((label, i) => {
        const step = i + 1
        const done = step < current
        const active = step === current
        return (
          <div key={step} className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-md flex items-center justify-center font-semibold text-sm transition-colors ${
                active ? 'bg-sage text-white' : done ? 'bg-paper text-sage' : 'bg-paper text-ink/30'
              }`}>
                {done ? <Check className="w-4 h-4" /> : step}
              </div>
              <span className={`text-sm font-medium hidden sm:block transition-colors ${
                active ? 'text-ink' : done ? 'text-ink/50' : 'text-ink/30'
              }`}>{label}</span>
            </div>
            {i < STEP_LABELS.length - 1 && (
              <div className="w-8 h-px bg-border-soft" />
            )}
          </div>
        )
      })}
    </div>
  )
}

function LeftPanel({ step }: { step: number }) {
  const insightCard = step === 2
    ? { icon: '⏳', title: 'Pacing Insight', text: 'Real cellular turnover takes 28–40 days. Meaningful results take weeks, not days. We\'re building a foundation, not a quick fix.' }
    : step === 3
    ? { icon: '🛡️', title: 'Safety First', text: 'Your skin barrier is your first line of defense. We ask these questions to ensure we never recommend tracking routines that could compromise it.' }
    : null

  return (
    <div className="hidden md:flex w-full md:w-[45%] bg-sage/80 relative overflow-hidden flex-col items-center justify-center">
      <img
        src={`/images/onboarding_${step}.png`}
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
      />

      {insightCard && (
        <div className="absolute bottom-10 left-8 right-8 bg-cream/90 backdrop-blur-sm p-5 rounded-2xl border border-border-soft shadow-lg z-10">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-sage/20 flex items-center justify-center shrink-0 text-sage text-lg">
              {insightCard.icon}
            </div>
            <div>
              <h4 className="text-sm font-semibold text-ink mb-1">{insightCard.title}</h4>
              <p className="text-xs text-ink/70 leading-relaxed italic">"{insightCard.text}"</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function Step1({ data, onChange }: { data: FormData; onChange: (d: Partial<FormData>) => void }) {
  const toggleFitzpatrick = (type: number) =>
    onChange({ fitzpatrick: data.fitzpatrick === type ? null : type })

  return (
    <div className="flex-1 flex flex-col">
      <div className="mb-8">
        <p className="text-sm text-ink/50 font-medium mb-2">Step 1/3</p>
        <h1 className="text-3xl font-bold text-ink mb-3 tracking-tight">Let's start with the basics.</h1>
        <p className="text-ink/60 text-sm leading-relaxed max-w-md">
          We use this information to build a scientific baseline for your skin journey. No judgment, just data.
        </p>
      </div>

      <div className="space-y-7 flex-1">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-ink">First Name</label>
            <input
              type="text"
              placeholder="e.g. Jane"
              value={data.firstName}
              onChange={e => onChange({ firstName: e.target.value })}
              className="w-full px-4 py-3 rounded-lg border border-border-soft focus:outline-none focus:border-sage focus:ring-1 focus:ring-sage transition-all text-ink placeholder-ink/30 text-sm"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-ink">Age</label>
            <input
              type="number"
              placeholder="Years"
              value={data.age}
              onChange={e => onChange({ age: e.target.value })}
              className="w-full px-4 py-3 rounded-lg border border-border-soft focus:outline-none focus:border-sage focus:ring-1 focus:ring-sage transition-all text-ink placeholder-ink/30 text-sm"
            />
          </div>
        </div>

        <div className="flex flex-col gap-3 pt-5 border-t border-border-soft/50">
          <label className="text-sm font-medium text-ink">Primary Skin Type</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {(['Dry', 'Normal', 'Combination', 'Oily'] as SkinType[]).map(type => (
              <button
                key={type}
                type="button"
                onClick={() => onChange({ skinType: type })}
                className={`px-4 py-3 rounded-lg border text-sm font-medium transition-all ${
                  data.skinType === type
                    ? 'border-sage bg-sage/10 text-sage'
                    : 'border-border-soft text-ink/60 hover:border-border-soft hover:text-ink'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3 pt-5 border-t border-border-soft/50">
          <div className="flex justify-between items-center">
            <label className="text-sm font-medium text-ink">Fitzpatrick Skin Type</label>
            <button type="button" className="text-xs text-sage hover:underline flex items-center gap-1">
              <Info className="w-3 h-3" /> What's this?
            </button>
          </div>
          <div className="grid grid-cols-6 gap-2">
            {FITZPATRICK.map(({ type, color }) => (
              <button
                key={type}
                type="button"
                onClick={() => toggleFitzpatrick(type)}
                className="flex flex-col items-center gap-1"
              >
                <div
                  className={`h-12 w-full rounded-lg border-2 flex items-center justify-center transition-all ${
                    data.fitzpatrick === type ? 'border-sage shadow-[0_0_0_2px_rgba(141,162,144,0.25)]' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: color }}
                >
                  {data.fitzpatrick === type && (
                    <Check className="w-4 h-4 text-white drop-shadow" />
                  )}
                </div>
                <span className={`text-[10px] font-medium ${data.fitzpatrick === type ? 'text-ink' : 'text-ink/40'}`}>
                  Type {type}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function Step2({ data, onChange }: { data: FormData; onChange: (d: Partial<FormData>) => void }) {
  const toggleConcern = (value: string) => {
    const next = data.concerns.includes(value)
      ? data.concerns.filter(c => c !== value)
      : data.concerns.length < 3
      ? [...data.concerns, value]
      : data.concerns
    onChange({ concerns: next })
  }

  return (
    <div className="flex-1 flex flex-col">
      <div className="mb-8">
        <p className="text-sm text-ink/50 font-medium mb-2">Step 2/3</p>
        <h1 className="text-3xl font-bold text-ink mb-3 tracking-tight">Focus areas & experience.</h1>
        <p className="text-ink/60 text-sm leading-relaxed max-w-md">
          Select your primary concerns to help us tailor your tracking. You can always adjust these later as your skin evolves.
        </p>
      </div>

      <div className="space-y-7 flex-1">
        <div className="flex flex-col gap-4">
          <label className="text-sm font-medium text-ink">
            Primary Concerns <span className="text-ink/40 font-normal">(Select up to 3)</span>
          </label>
          <div className="flex flex-wrap gap-3">
            {CONCERNS.map(({ value, label, icon: Icon }) => {
              const selected = data.concerns.includes(value)
              const disabled = !selected && data.concerns.length >= 3
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => toggleConcern(value)}
                  disabled={disabled}
                  className={`px-5 py-2.5 rounded-full border text-sm font-medium transition-all flex items-center gap-2 ${
                    selected
                      ? 'bg-sage border-sage text-white'
                      : disabled
                      ? 'border-border-soft text-ink/30 cursor-not-allowed'
                      : 'border-border-soft text-ink/70 hover:border-ink/30 hover:text-ink'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 opacity-70" />
                  {label}
                </button>
              )
            })}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-ink">
            Context Notes <span className="text-ink/40 font-normal">(Optional)</span>
          </label>
          <textarea
            rows={2}
            placeholder="e.g. Diagnosed with rosacea, currently using prescription azelaic acid..."
            value={data.contextNotes}
            onChange={e => onChange({ contextNotes: e.target.value })}
            className="w-full px-4 py-3 rounded-lg border border-border-soft focus:outline-none focus:border-sage focus:ring-1 focus:ring-sage transition-all text-ink placeholder-ink/30 text-sm resize-none"
          />
        </div>

        <div className="flex flex-col gap-4 pt-5 border-t border-border-soft/50">
          <div>
            <label className="text-sm font-medium text-ink block mb-1">How do you prefer to track?</label>
            <p className="text-xs text-ink/50">This sets your default dashboard view.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                value: 'guided' as const,
                icon: Compass,
                title: 'Guided Routine',
                desc: 'Simple tracking by product type (cleanser, serum, moisturizer). Best for consistent, straightforward routines.',
              },
              {
                value: 'nerd' as const,
                icon: FlaskConical,
                title: 'Ingredient Nerd',
                desc: 'Track specific actives (Retinol, Vitamin C, Acids), monitor conflicts, and log exact concentrations.',
              },
            ].map(({ value, icon: Icon, title, desc }) => (
              <button
                key={value}
                type="button"
                onClick={() => onChange({ trackingMode: value })}
                className={`text-left p-5 rounded-xl border-2 transition-all ${
                  data.trackingMode === value
                    ? 'border-terracotta bg-terracotta/5'
                    : 'border-border-soft hover:border-terracotta/40'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-full bg-paper flex items-center justify-center">
                    <Icon className="w-5 h-5 text-ink/60" />
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                    data.trackingMode === value ? 'border-terracotta bg-terracotta' : 'border-border-soft'
                  }`}>
                    {data.trackingMode === value && <div className="w-2 h-2 rounded-full bg-white" />}
                  </div>
                </div>
                <h4 className="font-semibold text-ink text-sm mb-1">{title}</h4>
                <p className="text-xs text-ink/50 leading-relaxed">{desc}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

type ScreeningOption<T extends string> = { value: T; label: string }

function ScreeningQuestion<T extends string>({
  question,
  tooltip,
  options,
  value,
  onChange,
  warning,
}: {
  question: string
  tooltip: string
  options: ScreeningOption<T>[]
  value: T | ''
  onChange: (v: T) => void
  warning?: boolean
}) {
  const [showTooltip, setShowTooltip] = useState(false)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <label className="text-sm font-semibold text-ink">{question}</label>
        <div className="relative">
          <button
            type="button"
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            className="text-ink/30 hover:text-ink/60 transition-colors"
          >
            <Info className="w-3.5 h-3.5" />
          </button>
          {showTooltip && (
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-ink text-white text-xs rounded-lg shadow-lg z-20">
              {tooltip}
              <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-ink" />
            </div>
          )}
        </div>
      </div>
      <div className={`grid gap-3 ${options.length === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
        {options.map(opt => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`px-4 py-3 rounded-lg border flex items-center justify-between transition-all text-sm font-medium ${
              value === opt.value
                ? 'border-sage bg-sage/5 text-ink'
                : 'border-border-soft text-ink/60 hover:border-sage/40'
            }`}
          >
            {opt.label}
            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors shrink-0 ml-2 ${
              value === opt.value ? 'border-sage bg-sage' : 'border-border-soft'
            }`}>
              {value === opt.value && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
            </div>
          </button>
        ))}
      </div>
      {warning && value === 'yes' && (
        <div className="bg-terracotta/10 border border-terracotta/20 rounded-lg p-4">
          <div className="flex gap-3">
            <span className="text-terracotta mt-0.5 text-base">⚠️</span>
            <div>
              <p className="text-sm font-medium text-ink mb-1">Caution with Actives</p>
              <p className="text-xs text-ink/60 leading-relaxed">
                Since you're using prescriptions, we recommend tracking only basic hydration routines right now. Adding OTC actives can compromise your barrier.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function Step3({ data, onChange }: { data: FormData; onChange: (d: Partial<FormData>) => void }) {
  return (
    <div className="flex-1 flex flex-col">
      <div className="mb-8">
        <p className="text-sm text-ink/50 font-medium mb-2">Step 3/3</p>
        <h1 className="text-3xl font-bold text-ink mb-3 tracking-tight">Health screening.</h1>
        <p className="text-ink/60 text-sm leading-relaxed max-w-md">
          To ensure your tracking is safe and effective, we need to know about any underlying conditions or strong treatments.
        </p>
      </div>

      <div className="space-y-8 flex-1">
        <ScreeningQuestion<'yes' | 'no' | 'unsure'>
          question="Are you currently pregnant or breastfeeding?"
          tooltip="Certain actives like Retinoids and high-strength Salicylic Acid are generally advised against during pregnancy."
          options={[
            { value: 'yes', label: 'Yes' },
            { value: 'no', label: 'No' },
            { value: 'unsure', label: "I'm not sure" },
          ]}
          value={data.pregnancy}
          onChange={v => onChange({ pregnancy: v })}
        />

        <ScreeningQuestion<'yes' | 'no'>
          question="Are you currently using prescription topical treatments?"
          tooltip="Examples: Tretinoin, Accutane, prescription Azelaic Acid, Clindamycin. These heavily impact how you should introduce other actives."
          options={[
            { value: 'yes', label: 'Yes, currently using' },
            { value: 'no', label: 'No prescriptions' },
          ]}
          value={data.prescriptions}
          onChange={v => onChange({ prescriptions: v })}
          warning
        />

        <ScreeningQuestion<'yes' | 'no' | 'unsure'>
          question="Do you suspect your skin barrier is currently impaired?"
          tooltip="Signs include: stinging when applying gentle products, excessive redness, tight/shiny appearance, or sudden severe breakouts."
          options={[
            { value: 'yes', label: 'Yes' },
            { value: 'no', label: 'No' },
            { value: 'unsure', label: "I'm not sure" },
          ]}
          value={data.barrier}
          onChange={v => onChange({ barrier: v })}
        />
      </div>
    </div>
  )
}

export default function OnboardingPage() {
  const navigate = useNavigate()
  const { completeOnboarding } = useApp()
  const [step, setStep] = useState(1)
  const [data, setData] = useState<FormData>({
    firstName: '',
    age: '',
    skinType: '',
    fitzpatrick: null,
    concerns: [],
    contextNotes: '',
    trackingMode: '',
    pregnancy: '',
    prescriptions: '',
    barrier: '',
  })

  const update = (partial: Partial<FormData>) => setData(d => ({ ...d, ...partial }))

  const handleNext = () => {
    if (step < 3) {
      setStep(s => s + 1)
    } else {
      completeOnboarding({
        name: data.firstName,
        age: data.age ? Number(data.age) : null,
        skinType: data.skinType,
        fitzpatrick: data.fitzpatrick,
        concerns: data.concerns,
        contextNotes: data.contextNotes,
        trackingMode: data.trackingMode,
        pregnancy: data.pregnancy,
        prescriptions: data.prescriptions,
        barrier: data.barrier,
      })
      navigate('/dashboard')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 md:p-8 bg-cream font-sans">
      <main className="w-full max-w-[1200px] bg-white rounded-3xl overflow-hidden flex flex-col md:flex-row md:h-[800px]"
        style={{ boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05), 0 8px 10px -6px rgba(0,0,0,0.01)' }}>

        <LeftPanel step={step} />

        <div className="w-full md:w-[55%] flex flex-col p-8 lg:p-12 h-full overflow-y-auto">

          <header className="flex justify-between items-center mb-10 shrink-0">
            <div className="flex items-center gap-2 text-ink font-semibold text-lg">
              <Leaf className="w-5 h-5 text-sage" />
              <span className="font-serif">Slow Glow</span>
            </div>
            <button
              onClick={() => navigate('/dashboard')}
              className="text-sm font-medium text-ink/50 hover:text-ink transition-colors"
            >
              Save & Exit
            </button>
          </header>

          <StepIndicator current={step} />

          {step === 1 && <Step1 data={data} onChange={update} />}
          {step === 2 && <Step2 data={data} onChange={update} />}
          {step === 3 && <Step3 data={data} onChange={update} />}

          <div className="mt-auto pt-8 border-t border-border-soft/60 flex items-center justify-between shrink-0">
            {step > 1 ? (
              <button
                onClick={() => setStep(s => s - 1)}
                className="px-6 py-3 text-sm font-medium text-ink border border-border-soft rounded-lg hover:bg-paper transition-colors"
              >
                Back
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-3">
              {step > 1 && (
                <button
                  onClick={handleNext}
                  className="px-6 py-3 text-sm font-medium text-ink/50 hover:text-ink transition-colors"
                >
                  Skip for now
                </button>
              )}
              <button
                onClick={handleNext}
                className="px-8 py-3 bg-sage hover:bg-ink text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
              >
                {step === 3 ? 'Complete Setup' : 'Next Step'}
              </button>
            </div>
          </div>

        </div>
      </main>
    </div>
  )
}
