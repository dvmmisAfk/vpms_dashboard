// stores the logged in user info and login/logout functions
import { createContext, useContext, useEffect, useState } from 'react'
import { loginUser, fetchMe } from '../api/auth.js'
import api from '../api/client.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(() => localStorage.getItem('token') || '')

  // on first load, restore session if we have a saved token
  useEffect(() => {
    const saved = localStorage.getItem('token')

    // had a bug where 'undefined' string was being stored, this guards against that
    if (!saved || saved === 'undefined' || saved === undefined) return

    api.defaults.headers.common.Authorization = 'Bearer ' + saved

    fetchMe()
      .then(me => setUser(me))
      .catch(() => {
        // token probably expired, clear it
        localStorage.removeItem('token')
        setToken('')
      })
  }, [])

  // save token and user to state and localstorage
  const login = async ({ email, password }) => {
    const res = await loginUser({ email, password })
    localStorage.setItem('token', res.token)
    setToken(res.token)
    api.defaults.headers.common.Authorization = 'Bearer ' + res.token
    setUser(res.user)
    return res.user
  }

  // clear everything
  const logout = () => {
    localStorage.removeItem('token')
    delete api.defaults.headers.common.Authorization
    setToken('')
    setUser(null)
  }

  // use this in components to get user info
  const hasAnyRole = (roles = []) => {
    if (!user) return false
    return roles.includes(user.role)
  }

  const isAuthenticated = !!token && !!user

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated, login, logout, hasAnyRole }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
