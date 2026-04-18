import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Leaf, Eye, EyeOff, Check, X } from 'lucide-react'

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const hasMinLength = password.length >= 8
  const hasSpecialChar = /[^a-zA-Z0-9]/.test(password)
  const passwordMismatch = confirmPassword.length > 0 && password !== confirmPassword

  return (
    <div className="min-h-screen flex font-sans text-ink bg-cream">

      <div className="w-full flex flex-col items-center justify-center px-6 py-12">

        {/* Brand */}
        <Link to="/" className="mb-10 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-sage flex items-center justify-center text-white shadow-sm">
            <Leaf className="w-4 h-4" />
          </div>
          <span className="font-serif font-medium text-xl tracking-wide text-ink">Slow Glow</span>
        </Link>

        <div className="w-full max-w-[420px]">
          <h1 className="text-3xl font-serif font-semibold text-ink mb-2">Begin your journey</h1>
          <p className="text-ink/60 text-sm mb-8">
            Create an account to start tracking your skin's response to minimal, intentional care.
          </p>

          <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>

            {/* Full Name */}
            <div className="space-y-2">
              <label htmlFor="name" className="block text-sm font-medium text-ink">Full Name</label>
              <input
                type="text"
                id="name"
                placeholder="e.g. Sarah Miller"
                className="w-full py-2.5 bg-transparent border-0 border-b border-border-soft text-ink placeholder:text-ink/30 focus:outline-none focus:border-sage transition-colors"
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-ink">Email</label>
              <input
                type="email"
                id="email"
                placeholder="sarah@example.com"
                className="w-full py-2.5 bg-transparent border-0 border-b border-border-soft text-ink placeholder:text-ink/30 focus:outline-none focus:border-sage transition-colors"
              />
            </div>

            {/* Password + Confirm */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-medium text-ink">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full py-2.5 pr-8 bg-transparent border-0 border-b border-border-soft text-ink placeholder:text-ink/30 focus:outline-none focus:border-sage transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-0 top-1/2 -translate-y-1/2 text-ink/40 hover:text-ink transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="confirm-password" className="block text-sm font-medium text-ink">Confirm</label>
                <input
                  type="password"
                  id="confirm-password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`w-full py-2.5 bg-transparent border-0 border-b text-ink placeholder:text-ink/30 focus:outline-none transition-colors ${
                    passwordMismatch ? 'border-terracotta focus:border-terracotta' : 'border-border-soft focus:border-sage'
                  }`}
                />
              </div>
            </div>

            {/* Password Rules */}
            <div className="flex items-center gap-4 text-xs">
              <span className={`flex items-center gap-1.5 ${hasMinLength ? 'text-sage' : 'text-ink/40'}`}>
                <Check className="w-3 h-3" /> 8+ characters
              </span>
              <span className={`flex items-center gap-1.5 ${hasSpecialChar ? 'text-sage' : 'text-terracotta'}`}>
                {hasSpecialChar ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />} 1 special character
              </span>
            </div>

            <hr className="border-border-soft/50" />

            {/* Skin Profile */}
            {/*<div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="block text-sm font-medium text-ink">Skin Profile</label>
                <span className="text-xs text-ink/50 italic">Optional</span>
              </div>
              <p className="text-xs text-ink/60">Select your primary skin type to help tailor your journal.</p>
              <div className="flex flex-wrap gap-2">
                {SKIN_TYPES.map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setSelectedSkinType(type)}
                    className={`px-4 py-1.5 rounded-full border text-sm transition-colors ${
                      selectedSkinType === type
                        ? 'border-sage bg-sage/10 text-ink font-medium'
                        : 'border-border-soft bg-white text-ink/60 hover:border-sage hover:text-sage'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>*/}

            {/* Terms */}
            <div className="pt-2">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 mt-0.5 rounded border-border-soft accent-sage"
                />
                <span className="text-xs text-ink/60 leading-relaxed">
                  I agree to the{' '}
                  <a href="#" className="text-sage hover:text-ink underline underline-offset-2 decoration-sage/30">Terms of Service</a>
                  {' '}and acknowledge the{' '}
                  <a href="#" className="text-sage hover:text-ink underline underline-offset-2 decoration-sage/30">Privacy Policy</a>.
                </span>
              </label>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full py-3.5 px-4 rounded-lg text-sm font-medium text-white bg-sage hover:bg-ink transition-colors shadow-sm"
            >
              Create Account
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-ink/60">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-sage hover:text-ink transition-colors">
              Log in
            </Link>
          </p>
        </div>
      </div>

    </div>
  )
}
