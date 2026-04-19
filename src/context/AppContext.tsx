import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import type { ReactNode } from 'react'
import type {
  User, UserData, Product, RoutineStep, ReactionEntry,
  SkinAnalysisEntry, ProjectPanItem, UserSettings, OnboardingProfile,
} from '../types'

const USERS_KEY = 'sg:users'
const SESSION_KEY = 'sg:session'
const DATA_KEY = (uid: string) => `sg:data:${uid}`

type UsersStore = Record<string, User & { password: string }>

const DEFAULT_SETTINGS: UserSettings = {
  experienceMode: 'guided',
  skinType: 'Combination',
  sensitivities: [],
  warningSensitivity: 2,
  notifExpiry: true,
  notifMilestones: true,
  notifCheckin: false,
}

const EMPTY_DATA: UserData = {
  products: [],
  routineSteps: [],
  reactionEntries: [],
  skinAnalysisEntries: [],
  projectPanItems: [],
  settings: DEFAULT_SETTINGS,
}

function loadUsers(): UsersStore {
  try { return JSON.parse(localStorage.getItem(USERS_KEY) ?? '{}') } catch { return {} }
}

function saveUsers(users: UsersStore) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
}

function loadSession(): string | null {
  return localStorage.getItem(SESSION_KEY)
}

function migrateData(data: UserData): UserData {
  return {
    ...data,
    products: data.products.map(p => ({
      ...p,
      activeIngredients: Array.isArray(p.activeIngredients)
        ? p.activeIngredients
        : p.activeIngredients
          ? (p.activeIngredients as unknown as string).split(',').map((s: string) => s.trim()).filter(Boolean)
          : [],
    })),
  }
}

function loadData(userId: string): UserData {
  try {
    const raw = localStorage.getItem(DATA_KEY(userId))
    if (!raw) return EMPTY_DATA
    return migrateData({ ...EMPTY_DATA, ...JSON.parse(raw) })
  } catch { return EMPTY_DATA }
}

function uid() {
  return crypto.randomUUID()
}

function now() {
  return new Date().toISOString()
}

interface AppContextValue {
  user: User | null
  login: (email: string, password: string) => { success: boolean; error?: string }
  register: (email: string, password: string, name: string) => { success: boolean; error?: string }
  logout: () => void
  completeOnboarding: (profile: OnboardingProfile) => void
  products: Product[]
  addProduct: (p: Omit<Product, 'id' | 'userId' | 'createdAt'>) => Product
  updateProduct: (id: string, updates: Partial<Product>) => void
  deleteProduct: (id: string) => void
  routineSteps: RoutineStep[]
  addRoutineStep: (s: Omit<RoutineStep, 'id' | 'userId'>) => void
  updateRoutineStep: (id: string, updates: Partial<RoutineStep>) => void
  deleteRoutineStep: (id: string) => void
  setRoutineStepOrder: (period: 'AM' | 'PM', ordered: RoutineStep[]) => void
  reactionEntries: ReactionEntry[]
  addReactionEntry: (e: Omit<ReactionEntry, 'id' | 'userId' | 'createdAt'>) => void
  deleteReactionEntry: (id: string) => void
  skinAnalysisEntries: SkinAnalysisEntry[]
  addSkinAnalysisEntry: (e: Omit<SkinAnalysisEntry, 'id' | 'userId' | 'createdAt'>) => void
  projectPanItems: ProjectPanItem[]
  addProjectPanItem: (i: Omit<ProjectPanItem, 'id' | 'userId' | 'createdAt'>) => void
  updateProjectPanItem: (id: string, updates: Partial<ProjectPanItem>) => void
  removeProjectPanItem: (id: string) => void
  settings: UserSettings
  updateSettings: (updates: Partial<UserSettings>) => void
}

const AppContext = createContext<AppContextValue | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const userId = loadSession()
    if (!userId) return null
    const users = loadUsers()
    const stored = users[userId]
    if (!stored) return null
    const { password: _, ...u } = stored
    return u
  })

  const [data, setData] = useState<UserData>(() => {
    const userId = loadSession()
    return userId ? loadData(userId) : EMPTY_DATA
  })

  useEffect(() => {
    if (user) localStorage.setItem(DATA_KEY(user.id), JSON.stringify(data))
  }, [user, data])

  const updateData = useCallback((patch: Partial<UserData>) => {
    setData(d => ({ ...d, ...patch }))
  }, [])

  const login = useCallback((email: string, password: string) => {
    const users = loadUsers()
    const stored = Object.values(users).find(u => u.email.toLowerCase() === email.toLowerCase())
    if (!stored) return { success: false, error: 'No account found with that email.' }
    if (stored.password !== password) return { success: false, error: 'Incorrect password. Please try again.' }
    localStorage.setItem(SESSION_KEY, stored.id)
    const { password: _, ...u } = stored
    setUser(u)
    setData(loadData(stored.id))
    return { success: true }
  }, [])

  const register = useCallback((email: string, password: string, name: string) => {
    const users = loadUsers()
    if (Object.values(users).some(u => u.email.toLowerCase() === email.toLowerCase())) {
      return { success: false, error: 'An account with that email already exists.' }
    }
    const newUser: User & { password: string } = {
      id: uid(), email, password, name,
      age: null, skinType: '', fitzpatrick: null,
      concerns: [], contextNotes: '', trackingMode: '',
      pregnancy: '', prescriptions: '', barrier: '',
      onboardingComplete: false, createdAt: now(),
    }
    users[newUser.id] = newUser
    saveUsers(users)
    localStorage.setItem(SESSION_KEY, newUser.id)
    const { password: _, ...u } = newUser
    setUser(u)
    setData(EMPTY_DATA)
    return { success: true }
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(SESSION_KEY)
    setUser(null)
    setData(EMPTY_DATA)
  }, [])

  const completeOnboarding = useCallback((profile: OnboardingProfile) => {
    if (!user) return
    const users = loadUsers()
    const updated: User = {
      ...user, ...profile, onboardingComplete: true,
    }
    users[user.id] = { ...users[user.id], ...updated }
    saveUsers(users)
    setUser(updated)
    updateData({
      settings: {
        ...data.settings,
        skinType: (profile.skinType || 'Combination') as UserSettings['skinType'],
        experienceMode: profile.trackingMode === 'nerd' ? 'nerd' : 'guided',
      },
    })
  }, [user, data.settings, updateData])

  // Products
  const addProduct = useCallback((p: Omit<Product, 'id' | 'userId' | 'createdAt'>) => {
    if (!user) throw new Error('Not authenticated')
    const product: Product = { ...p, id: uid(), userId: user.id, createdAt: now() }
    updateData({ products: [...data.products, product] })
    return product
  }, [user, data.products, updateData])

  const updateProduct = useCallback((id: string, updates: Partial<Product>) => {
    updateData({ products: data.products.map(p => p.id === id ? { ...p, ...updates } : p) })
  }, [data.products, updateData])

  const deleteProduct = useCallback((id: string) => {
    updateData({ products: data.products.filter(p => p.id !== id) })
  }, [data.products, updateData])

  // Routine Steps
  const addRoutineStep = useCallback((s: Omit<RoutineStep, 'id' | 'userId'>) => {
    if (!user) return
    const step: RoutineStep = { ...s, id: uid(), userId: user.id }
    updateData({ routineSteps: [...data.routineSteps, step] })
  }, [user, data.routineSteps, updateData])

  const updateRoutineStep = useCallback((id: string, updates: Partial<RoutineStep>) => {
    updateData({ routineSteps: data.routineSteps.map(s => s.id === id ? { ...s, ...updates } : s) })
  }, [data.routineSteps, updateData])

  const deleteRoutineStep = useCallback((id: string) => {
    updateData({ routineSteps: data.routineSteps.filter(s => s.id !== id) })
  }, [data.routineSteps, updateData])

  const setRoutineStepOrder = useCallback((period: 'AM' | 'PM', ordered: RoutineStep[]) => {
    const others = data.routineSteps.filter(s => s.period !== period)
    updateData({ routineSteps: [...others, ...ordered.map((s, i) => ({ ...s, order: i }))] })
  }, [data.routineSteps, updateData])

  // Reactions
  const addReactionEntry = useCallback((e: Omit<ReactionEntry, 'id' | 'userId' | 'createdAt'>) => {
    if (!user) return
    const entry: ReactionEntry = { ...e, id: uid(), userId: user.id, createdAt: now() }
    updateData({ reactionEntries: [entry, ...data.reactionEntries] })
  }, [user, data.reactionEntries, updateData])

  const deleteReactionEntry = useCallback((id: string) => {
    updateData({ reactionEntries: data.reactionEntries.filter(e => e.id !== id) })
  }, [data.reactionEntries, updateData])

  // Skin Analysis
  const addSkinAnalysisEntry = useCallback((e: Omit<SkinAnalysisEntry, 'id' | 'userId' | 'createdAt'>) => {
    if (!user) return
    const entry: SkinAnalysisEntry = { ...e, id: uid(), userId: user.id, createdAt: now() }
    updateData({ skinAnalysisEntries: [entry, ...data.skinAnalysisEntries] })
  }, [user, data.skinAnalysisEntries, updateData])

  // Project Pan
  const addProjectPanItem = useCallback((i: Omit<ProjectPanItem, 'id' | 'userId' | 'createdAt'>) => {
    if (!user) return
    const item: ProjectPanItem = { ...i, id: uid(), userId: user.id, createdAt: now() }
    updateData({ projectPanItems: [...data.projectPanItems, item] })
  }, [user, data.projectPanItems, updateData])

  const updateProjectPanItem = useCallback((id: string, updates: Partial<ProjectPanItem>) => {
    updateData({ projectPanItems: data.projectPanItems.map(i => i.id === id ? { ...i, ...updates } : i) })
  }, [data.projectPanItems, updateData])

  const removeProjectPanItem = useCallback((id: string) => {
    updateData({ projectPanItems: data.projectPanItems.filter(i => i.id !== id) })
  }, [data.projectPanItems, updateData])

  // Settings
  const updateSettings = useCallback((updates: Partial<UserSettings>) => {
    updateData({ settings: { ...data.settings, ...updates } })
  }, [data.settings, updateData])

  return (
    <AppContext.Provider value={{
      user, login, register, logout, completeOnboarding,
      products: data.products, addProduct, updateProduct, deleteProduct,
      routineSteps: data.routineSteps, addRoutineStep, updateRoutineStep, deleteRoutineStep, setRoutineStepOrder,
      reactionEntries: data.reactionEntries, addReactionEntry, deleteReactionEntry,
      skinAnalysisEntries: data.skinAnalysisEntries, addSkinAnalysisEntry,
      projectPanItems: data.projectPanItems, addProjectPanItem, updateProjectPanItem, removeProjectPanItem,
      settings: data.settings, updateSettings,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used inside AppProvider')
  return ctx
}
