import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { Eye, EyeOff } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { IMAGES } from '@/lib/images'
import toast from 'react-hot-toast'

type Mode = 'login' | 'register' | 'forgot'

export function AuthPage() {
  const [mode, setMode] = useState<Mode>('login')
  const [showPass, setShowPass] = useState(false)
  const { signIn, signUp, resetPassword, loading } = useAuth()
  const navigate = useNavigate()

  const { register, handleSubmit, watch, formState: { errors }, reset } = useForm<{
    full_name: string; email: string; phone: string; password: string; confirm: string
  }>()

  const onSubmit = async (data: any) => {
    try {
      if (mode === 'login') {
        const ok = await signIn(data.email, data.password)
        if (ok) navigate('/')
        else toast.error('Sign in did not complete; check console and network')
      } else if (mode === 'register') {
        if (data.password !== data.confirm) { toast.error("Passwords don't match"); return }
        await signUp(data.email, data.password, data.full_name, data.phone)
        // After registration, keep the user on the auth screen and switch to login mode
        // so they can sign in after email verification. A toast already instructs them to verify.
        setMode('login')
        reset()
      } else {
        await resetPassword(data.email)
        reset()
        setMode('login')
      }
    } catch {}
  }

  return (
    <div className="min-h-screen bg-[--bg] flex flex-col max-w-[480px] mx-auto">
      {/* Hero banner */}
      <div className="relative h-52 overflow-hidden">
        <img src={IMAGES.coworkHero} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#00355f99] to-[#00355fe6] flex flex-col items-center justify-center text-white text-center px-4">
          <div className="text-4xl mb-2">🌍</div>
          <div className="text-2xl font-extrabold">FuturePath Eswatini</div>
          <div className="text-sm opacity-85 mt-1">Your Career Starts Here</div>
        </div>
      </div>

      <div className="p-5 flex-1">
        <div className="card">
          <h2 className="text-xl font-bold text-[--primary] mb-1">
            {mode === 'login' ? 'Welcome back' : mode === 'register' ? 'Create account' : 'Reset password'}
          </h2>
          <p className="text-sm text-[--on-surf-v] mb-5">
            {mode === 'login' ? 'Sign in to continue your career journey'
              : mode === 'register' ? 'Join thousands of Emaswati youth building their futures'
              : 'Enter your email to receive a reset link'}
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="label">Full Name *</label>
                <input className="input" placeholder="e.g. Sibusiso Dlamini"
                  {...register('full_name', { required: 'Full name is required' })} />
                {errors.full_name && <p className="text-red-500 text-xs mt-1">{errors.full_name.message}</p>}
              </div>
            )}

            <div>
              <label className="label">Email Address *</label>
              <input className="input" type="email" placeholder="you@email.com"
                {...register('email', { required: 'Email is required', pattern: { value: /\S+@\S+\.\S+/, message: 'Invalid email' } })} />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>

            {mode === 'register' && (
              <div>
                <label className="label">Phone Number</label>
                <input className="input" placeholder="+268 7xxx xxxx"
                  {...register('phone')} />
              </div>
            )}

            {mode !== 'forgot' && (
              <div>
                <label className="label">Password *</label>
                <div className="relative">
                  <input className="input pr-10" type={showPass ? 'text' : 'password'} placeholder="••••••••"
                    {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'Min 6 characters' } })} />
                  <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-[--outline]" onClick={() => setShowPass(!showPass)}>
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
              </div>
            )}

            {mode === 'register' && (
              <div>
                <label className="label">Confirm Password *</label>
                <input className="input" type="password" placeholder="••••••••"
                  {...register('confirm', { required: 'Please confirm password' })} />
              </div>
            )}

            <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
              {loading ? 'Please wait…'
                : mode === 'login' ? 'Sign In'
                : mode === 'register' ? 'Create Account'
                : 'Send Reset Link'}
            </button>
          </form>

          {mode === 'login' && (
            <button className="text-xs text-[--primary] font-semibold float-right mt-2" onClick={() => setMode('forgot')}>
              Forgot password?
            </button>
          )}

          <div className="text-center text-sm text-[--on-surf-v] mt-4 clear-both">
            {mode === 'login' ? (
              <>Don't have an account? <button className="text-[--primary] font-semibold" onClick={() => setMode('register')}>Sign up</button></>
            ) : (
              <>Already have an account? <button className="text-[--primary] font-semibold" onClick={() => setMode('login')}>Sign in</button></>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
