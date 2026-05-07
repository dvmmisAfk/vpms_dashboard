// login page - first thing user sees
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Navigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Eye, EyeOff, ChevronDown } from 'lucide-react'

import { useAuth } from '../../context/AuthContext.jsx'

export default function LoginPage() {
  const { login, isAuthenticated, user } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [showDemo, setShowDemo] = useState(false)

  const { register, handleSubmit, setValue, formState: { errors } } = useForm()

  // send them to the right page if already logged in
  if (isAuthenticated) {
    const dest = user && user.role === 'visitor' ? '/my-pass' : '/dashboard'
    return <Navigate to={dest} replace />
  }

  // call the api then save the token
  const onSubmit = async (values) => {
    setSubmitting(true)
    try {
      const u = await login(values)
      toast.success('Signed in!')
      // navigate based on role
    } catch (e) {
      const msg = e?.response?.data?.message || 'Login failed'
      toast.error(msg)
    } finally {
      setSubmitting(false)
    }
  }

  const fillDemo = (email, password) => {
    setValue('email', email)
    setValue('password', password)
  }

  // these are the test accounts, remove in production
  const demoUsers = [
    { label: 'Admin', email: 'admin@vpms.com', password: 'password123' },
    { label: 'Security', email: 'security@vpms.com', password: 'password123' },
    { label: 'Employee', email: 'employee@vpms.com', password: 'password123' },
    { label: 'Visitor', email: 'visitor@vpms.com', password: 'password123' },
  ]

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md space-y-4">
        <div className="text-center">
          <div className="text-sm text-slate-500">Visitor Pass Management</div>
          <h1 className="mt-1 text-3xl font-black tracking-tight text-slate-800">VPMS</h1>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-bold text-slate-800 mb-1">Sign in</h2>
          <p className="text-sm text-slate-500 mb-4">Contact admin to get access</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <input
                type="email"
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                {...register('email', {
                  required: 'Email is required',
                  pattern: { value: /^\S+@\S+\.\S+$/, message: 'Invalid email' }
                })}
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm pr-10 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  {...register('password', {
                    required: 'Password is required',
                    minLength: { value: 6, message: 'At least 6 characters' }
                  })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg py-2 text-sm disabled:opacity-50"
            >
              {submitting ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4">
          <button
            type="button"
            onClick={() => setShowDemo(v => !v)}
            className="flex items-center gap-2 text-sm font-medium text-slate-600 w-full"
          >
            <ChevronDown size={16} className={`transition-transform ${showDemo ? 'rotate-180' : ''}`} />
            Demo credentials
          </button>

          {showDemo && (
            <div className="mt-3 space-y-2">
              {demoUsers.map(u => (
                <div key={u.label} className="flex items-center justify-between text-xs">
                  <div>
                    <span className="font-semibold text-slate-700">{u.label}:</span>{' '}
                    <span className="text-slate-500">{u.email} / {u.password}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => fillDemo(u.email, u.password)}
                    className="text-indigo-600 font-semibold hover:underline ml-2"
                  >
                    Fill
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
