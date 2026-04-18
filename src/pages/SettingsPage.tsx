import { useState } from 'react'
import { X, Plus, Info, FileOutput, Trash2, ChevronRight } from 'lucide-react'
import Sidebar from '../components/Sidebar'

type ExperienceMode = 'guided' | 'nerd'
type SkinType = 'Dry' | 'Combination' | 'Oily' | 'Normal'
type WarningSensitivity = 1 | 2 | 3

const sensitivityLabel: Record<WarningSensitivity, string> = {
  1: 'Relaxed',
  2: 'Moderate',
  3: 'High',
}

const sensitivityColor: Record<WarningSensitivity, string> = {
  1: 'text-sage bg-sage/10',
  2: 'text-ink/60 bg-paper',
  3: 'text-terracotta bg-terracotta/10',
}

interface ToggleProps {
  id: string
  checked: boolean
  onChange: (val: boolean) => void
}

function Toggle({ id, checked, onChange }: ToggleProps) {
  return (
    <button
      id={id}
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${
        checked ? 'bg-sage' : 'bg-border-soft'
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ${
          checked ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  )
}

export default function SettingsPage() {
  const [mode, setMode] = useState<ExperienceMode>('guided')
  const [skinType, setSkinType] = useState<SkinType>('Combination')
  const [sensitivities, setSensitivities] = useState(['Fragrance (Synthetic)', 'Essential Oils', 'Niacinamide > 5%'])
  const [newSensitivity, setNewSensitivity] = useState('')
  const [addingTag, setAddingTag] = useState(false)
  const [warningSensitivity, setWarningSensitivity] = useState<WarningSensitivity>(3)
  const [notifExpiry, setNotifExpiry] = useState(true)
  const [notifMilestones, setNotifMilestones] = useState(true)
  const [notifCheckin, setNotifCheckin] = useState(false)

  function removeSensitivity(tag: string) {
    setSensitivities(prev => prev.filter(s => s !== tag))
  }

  function addSensitivity() {
    const trimmed = newSensitivity.trim()
    if (trimmed && !sensitivities.includes(trimmed)) {
      setSensitivities(prev => [...prev, trimmed])
    }
    setNewSensitivity('')
    setAddingTag(false)
  }

  return (
    <div className="min-h-screen flex bg-cream">
      <Sidebar />

      <main className="flex-1 h-screen overflow-y-auto bg-paper flex flex-col">
        <div className="bg-white border-b border-border-soft px-6 lg:px-8 py-4 sticky top-0 z-20">
          <h1 className="text-2xl font-bold text-ink tracking-tight">Settings</h1>
          <p className="text-sm text-ink/50 mt-1">Manage your experience, health profiles, and data.</p>
        </div>

        <div className="flex-1 p-6 lg:p-8 max-w-[1440px] mx-auto w-full space-y-8">

          {/* Experience Mode */}
          <section
            className="bg-white rounded-2xl border border-border-soft p-6 lg:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
            style={{ boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)' }}
          >
            <div className="max-w-2xl">
              <h2 className="text-xl font-bold text-ink font-serif mb-2">Experience Mode</h2>
              <p className="text-sm text-ink/60 leading-relaxed">
                Choose how Slow Glow presents scientific information. "Guided" uses simple terminology and focuses on basic routines. "Ingredient Nerd" unlocks dense chemical data, precise concentration tracking, and advanced conflict warnings.
              </p>
            </div>
            <div className="flex items-center p-1.5 bg-paper rounded-xl border border-border-soft shrink-0">
              <button
                onClick={() => setMode('guided')}
                className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  mode === 'guided' ? 'bg-white text-ink shadow-sm' : 'text-ink/50 hover:text-ink'
                }`}
              >
                Guided
              </button>
              <button
                onClick={() => setMode('nerd')}
                className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  mode === 'nerd' ? 'bg-white text-ink shadow-sm' : 'text-ink/50 hover:text-ink'
                }`}
              >
                Ingredient Nerd
              </button>
            </div>
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

            {/* Health & Screening */}
            <section
              className="bg-white rounded-2xl border border-border-soft overflow-hidden"
              style={{ boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)' }}
            >
              <div className="p-6 border-b border-border-soft bg-cream">
                <h3 className="text-lg font-bold text-ink font-serif">Health & Screening Profile</h3>
                <p className="text-xs text-ink/50 mt-1">Update your baseline skin profile to adjust interaction warnings.</p>
              </div>

              <div className="p-6 space-y-6">
                {/* Skin Type */}
                <div>
                  <label className="text-sm font-medium text-ink block mb-3">Primary Skin Type</label>
                  <div className="grid grid-cols-4 gap-3">
                    {(['Dry', 'Combination', 'Oily', 'Normal'] as SkinType[]).map(type => (
                      <button
                        key={type}
                        onClick={() => setSkinType(type)}
                        className={`py-2.5 border rounded-lg text-sm font-medium transition-colors ${
                          skinType === type
                            ? 'border-sage bg-sage/10 text-sage'
                            : 'border-border-soft text-ink/60 hover:bg-paper'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sensitivities */}
                <div>
                  <label className="text-sm font-medium text-ink block mb-3">Known Sensitivities</label>
                  <div className="flex flex-wrap gap-2">
                    {sensitivities.map(tag => (
                      <span
                        key={tag}
                        className="px-3 py-1.5 bg-paper border border-border-soft rounded-full text-xs text-ink flex items-center gap-2"
                      >
                        {tag}
                        <button
                          onClick={() => removeSensitivity(tag)}
                          className="text-ink/30 hover:text-terracotta transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}

                    {addingTag ? (
                      <input
                        autoFocus
                        value={newSensitivity}
                        onChange={e => setNewSensitivity(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter') addSensitivity()
                          if (e.key === 'Escape') { setAddingTag(false); setNewSensitivity('') }
                        }}
                        onBlur={addSensitivity}
                        placeholder="Type & press Enter"
                        className="px-3 py-1.5 border border-sage rounded-full text-xs focus:outline-none bg-transparent"
                      />
                    ) : (
                      <button
                        onClick={() => setAddingTag(true)}
                        className="px-3 py-1.5 border border-dashed border-border-soft rounded-full text-xs text-ink/50 hover:border-sage hover:text-sage transition-colors flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" /> Add
                      </button>
                    )}
                  </div>
                </div>

                {/* Warning Sensitivity */}
                <div className="pt-4 border-t border-border-soft">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <label className="text-sm font-medium text-ink block">Interaction Warning Sensitivity</label>
                      <p className="text-[10px] text-ink/50 mt-1">Adjust how quickly we warn you about layering conflicts.</p>
                    </div>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded ${sensitivityColor[warningSensitivity]}`}>
                      {sensitivityLabel[warningSensitivity]}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={3}
                    value={warningSensitivity}
                    onChange={e => setWarningSensitivity(Number(e.target.value) as WarningSensitivity)}
                    className="w-full"
                    style={{ accentColor: '#7D8E7A' }}
                  />
                  <div className="flex justify-between text-[10px] text-ink/40 mt-2">
                    <span>Relaxed (Major Only)</span>
                    <span>Moderate</span>
                    <span>Strict (All Irritants)</span>
                  </div>
                </div>

                {/* Policy note */}
                <div className="bg-paper p-4 rounded-lg border border-border-soft flex gap-3">
                  <Info className="w-4 h-4 text-sage shrink-0 mt-0.5" />
                  <p className="text-xs text-ink/60 leading-relaxed">
                    <strong className="text-ink">Never Hard-Block Policy:</strong> Slow Glow will warn you about severe interactions (e.g., Retinol + AHAs), but you can always dismiss these banners. We document your choices rather than restricting them.
                  </p>
                </div>
              </div>
            </section>

            {/* Right column */}
            <div className="space-y-8">

              {/* Notifications */}
              <section
                className="bg-white rounded-2xl border border-border-soft overflow-hidden"
                style={{ boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)' }}
              >
                <div className="p-6 border-b border-border-soft bg-cream">
                  <h3 className="text-lg font-bold text-ink font-serif">Notifications & Reminders</h3>
                  <p className="text-xs text-ink/50 mt-1">Manage non-intrusive alerts for your routines.</p>
                </div>

                <div className="p-6 space-y-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-ink">Product Expiry Alerts</h4>
                      <p className="text-xs text-ink/50 mt-0.5">Notify me 30 days before PAO (Period After Opening) ends.</p>
                    </div>
                    <Toggle id="notif-expiry" checked={notifExpiry} onChange={setNotifExpiry} />
                  </div>

                  <hr className="border-border-soft" />

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-ink">Routine Milestones</h4>
                      <p className="text-xs text-ink/50 mt-0.5">Quiet notifications when reaching 30/60/90 days of consistent use.</p>
                    </div>
                    <Toggle id="notif-milestones" checked={notifMilestones} onChange={setNotifMilestones} />
                  </div>

                  <hr className="border-border-soft" />

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-ink">Daily Habit Check-in</h4>
                      <p className="text-xs text-ink/50 mt-0.5">A gentle evening reminder to log your skin state.</p>
                    </div>
                    <Toggle id="notif-checkin" checked={notifCheckin} onChange={setNotifCheckin} />
                  </div>
                </div>
              </section>

              {/* Data & Privacy */}
              <section
                className="bg-white rounded-2xl border border-border-soft overflow-hidden"
                style={{ boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)' }}
              >
                <div className="p-6 border-b border-border-soft bg-cream">
                  <h3 className="text-lg font-bold text-ink font-serif">Data & Privacy</h3>
                  <p className="text-xs text-ink/50 mt-1">Your science notebook belongs to you.</p>
                </div>

                <div className="p-6 space-y-4">
                  <button className="w-full flex items-center justify-between p-4 border border-border-soft rounded-xl hover:bg-paper transition-colors group">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-sage/10 flex items-center justify-center">
                        <FileOutput className="w-4 h-4 text-sage" />
                      </div>
                      <div className="text-left">
                        <h4 className="text-sm font-medium text-ink">Export Skin Journey</h4>
                        <p className="text-[10px] text-ink/50 mt-0.5">Download all logs, photos, and routines as PDF/CSV.</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-ink/30 group-hover:text-sage transition-colors" />
                  </button>

                  <button className="w-full flex items-center justify-between p-4 border border-border-soft rounded-xl hover:bg-terracotta/5 transition-colors group">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-terracotta/10 flex items-center justify-center">
                        <Trash2 className="w-4 h-4 text-terracotta" />
                      </div>
                      <div className="text-left">
                        <h4 className="text-sm font-medium text-terracotta">Delete Account & Data</h4>
                        <p className="text-[10px] text-ink/50 mt-0.5">Permanently erase your notebook. This cannot be undone.</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-terracotta/40 group-hover:text-terracotta transition-colors" />
                  </button>
                </div>
              </section>

            </div>
          </div>

        </div>
      </main>
    </div>
  )
}
