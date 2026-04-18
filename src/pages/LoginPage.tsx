import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Leaf, Eye, EyeOff, AlertCircle } from 'lucide-react'
import { useApp } from '../context/AppContext'

export default function LoginPage() {
  const { login } = useApp()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const result = login(email.trim(), password)
    setLoading(false)
    if (result.success) {
      navigate('/dashboard')
    } else {
      setError(result.error ?? 'Login failed.')
    }
  }

  return (
    <div className="min-h-screen flex font-sans text-ink bg-cream">
      <div className="w-full flex flex-col items-center justify-center min-h-screen px-6">

        <Link to="/" className="mb-10 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-sage flex items-center justify-center text-white">
            <Leaf className="w-4 h-4" />
          </div>
          <span className="font-serif font-medium text-xl tracking-wide text-ink">Slow Glow</span>
        </Link>

        <div className="w-full max-w-[420px]">
          <h1 className="text-3xl font-serif font-semibold text-ink mb-2">Welcome back</h1>
          <p className="text-ink/60 text-sm mb-8">Please enter your details to access your routine.</p>

          <form className="space-y-6" onSubmit={handleSubmit}>

            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-ink">Email</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="w-full py-2.5 bg-transparent border-0 border-b border-border-soft text-ink placeholder:text-ink/30 focus:outline-none focus:border-sage transition-colors"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-ink">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError('') }}
                  placeholder="••••••••"
                  required
                  className={`w-full py-2.5 pr-10 bg-transparent border-0 border-b text-ink placeholder:text-ink/30 focus:outline-none transition-colors ${
                    error ? 'border-terracotta focus:border-terracotta' : 'border-border-soft focus:border-sage'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-0 top-1/2 -translate-y-1/2 text-ink/40 hover:text-ink transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {error && (
                <p className="text-terracotta text-xs mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {error}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-lg text-sm font-medium text-white bg-sage hover:bg-ink transition-colors shadow-sm disabled:opacity-60"
            >
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-ink/60">
            Don't have an account?{' '}
            <Link to="/register" className="font-medium text-sage hover:text-ink transition-colors">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
