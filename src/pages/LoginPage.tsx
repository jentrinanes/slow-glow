import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Leaf, Eye, EyeOff, AlertCircle } from 'lucide-react'


export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [hasError] = useState(true)

  return (
    <div className="min-h-screen flex font-sans text-ink bg-cream">

      {/* Form */}
      <div className="w-full flex flex-col items-center justify-center min-h-screen px-6">

        {/* Brand */}
        <Link to="/" className="mb-10 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-sage flex items-center justify-center text-white">
            <Leaf className="w-4 h-4" />
          </div>
          <span className="font-serif font-medium text-xl tracking-wide text-ink">Slow Glow</span>
        </Link>

        <div className="w-full max-w-[420px]">

          {/* Icon */}
          {/*<div className="w-12 h-12 rounded-xl bg-white shadow-sm border border-border-soft flex items-center justify-center mb-6">
            <svg className="w-5 h-5 text-sage" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
          </div>*/}

          <h1 className="text-3xl font-serif font-semibold text-ink mb-2">Welcome back</h1>
          <p className="text-ink/60 text-sm mb-8">Please enter your details to access your routine.</p>

          <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>

            {/* Email */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-ink">Email</label>
              <input
                type="email"
                id="email"
                defaultValue="sarah@example.com"
                placeholder="Enter your email"
                className="w-full py-2.5 bg-transparent border-0 border-b border-border-soft text-ink placeholder:text-ink/30 focus:outline-none focus:border-sage transition-colors"
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-ink">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  defaultValue="wrongpassword"
                  placeholder="••••••••"
                  className={`w-full py-2.5 pr-10 bg-transparent border-0 border-b text-ink placeholder:text-ink/30 focus:outline-none transition-colors ${
                    hasError
                      ? 'border-terracotta focus:border-terracotta'
                      : 'border-border-soft focus:border-sage'
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
              {hasError && (
                <p className="text-terracotta text-xs mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  Incorrect password. Please try again.
                </p>
              )}
            </div>

            {/* Remember + Forgot */}
            <div className="flex items-center justify-between pt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-border-soft accent-sage"
                />
                <span className="text-sm text-ink/60">Remember for 30 days</span>
              </label>
              <a href="#" className="text-sm font-medium text-sage hover:text-ink transition-colors">
                Forgot password?
              </a>
            </div>

            {/* Sign In */}
            <button
              type="submit"
              className="w-full py-3 px-4 rounded-lg text-sm font-medium text-white bg-sage hover:bg-ink transition-colors shadow-sm"
            >
              Sign In
            </button>

            {/* Google */}
            {/*<button
              type="button"
              className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-border-soft rounded-lg text-sm font-medium text-ink bg-white hover:bg-paper transition-colors"
            >
              <GoogleIcon />
              Sign in with Google
            </button>*/}
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
