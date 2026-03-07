# Migration React + TypeScript — Plan d'implémentation

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Migrer le frontend de SkillSwap d'EJS vers React 19 + TypeScript, en convertissant Express en API REST pure progressivement.

**Architecture:** Migration progressive — les routes EJS coexistent avec les routes `/api/*` JSON. Chaque page EJS est remplacée par un composant React, puis la route EJS est supprimée. Vite proxy en dev pour éviter les problèmes CORS et cookies cross-origin.

**Tech Stack:** React 19, TypeScript, Vite, React Router v7, TanStack Query, Zustand, CSS plain, Express (backend), cookies httpOnly JWT

---

## Task 1 : Vite proxy + installation des packages

**Files:**
- Modify: `frontend/vite.config.ts`
- Modify: `frontend/package.json` (via npm install)

**Step 1 : Configurer le proxy Vite**

Modifier `frontend/vite.config.ts` :

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        credentials: true,
      },
      '/uploads': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/socket.io': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        ws: true,
      },
    },
  },
})
```

> Pourquoi : avec `sameSite: 'Strict'` sur les cookies JWT, le navigateur ne les envoie pas sur des requêtes cross-origin. Le proxy Vite fait paraître toutes les requêtes comme same-origin (`localhost:5173` → proxied vers `localhost:3000`).

**Step 2 : Installer les packages**

```bash
cd frontend
npm install @tanstack/react-query zustand
npm install -D @tanstack/react-query-devtools
```

**Step 3 : Vérifier que Vite démarre sans erreur**

```bash
npm run dev
```
Attendu : serveur démarré sur `http://localhost:5173`

**Step 4 : Commit**

```bash
git add frontend/vite.config.ts frontend/package.json frontend/package-lock.json
git commit -m "feat(frontend): configure vite proxy + install tanstack-query and zustand"
```

---

## Task 2 : Créer le Zustand authStore

**Files:**
- Create: `frontend/src/stores/authStore.ts`

**Step 1 : Créer le store**

Créer `frontend/src/stores/authStore.ts` :

```ts
import { create } from 'zustand'

export type AuthUser = {
  id: number
  email: string
  firstname: string
  lastname: string
}

type AuthStore = {
  user: AuthUser | null
  isLoading: boolean
  setUser: (user: AuthUser | null) => void
  setLoading: (loading: boolean) => void
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isLoading: true,
  setUser: (user) => set({ user }),
  setLoading: (loading) => set({ isLoading: loading }),
}))
```

**Step 2 : Commit**

```bash
git add frontend/src/stores/authStore.ts
git commit -m "feat(frontend): add zustand auth store"
```

---

## Task 3 : Créer le client API et les fonctions auth

**Files:**
- Create: `frontend/src/api/client.ts`
- Create: `frontend/src/api/auth.ts`

**Step 1 : Créer le client fetch de base**

Créer `frontend/src/api/client.ts` :

```ts
type ApiError = {
  status: number
  code: string
  message: string
}

export class ApiRequestError extends Error {
  status: number
  code: string

  constructor({ status, code, message }: ApiError) {
    super(message)
    this.status = status
    this.code = code
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(path, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  })

  if (!res.ok) {
    let errorData: ApiError = { status: res.status, code: 'ERROR', message: 'Erreur serveur' }
    try {
      errorData = await res.json()
    } catch { /* ignore */ }
    throw new ApiRequestError(errorData)
  }

  return res.json() as Promise<T>
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  put: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'PUT', body: JSON.stringify(body) }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
}
```

**Step 2 : Créer les fonctions auth**

Créer `frontend/src/api/auth.ts` :

```ts
import { api } from './client'
import type { AuthUser } from '../stores/authStore'

type LoginBody = { email: string; password: string }
type RegisterBody = { firstname: string; lastname: string; email: string; password: string; confirmPassword: string }
type AuthResponse = { user: AuthUser }

export const authApi = {
  me: () => api.get<AuthResponse>('/api/me'),
  login: (body: LoginBody) => api.post<AuthResponse>('/api/auth/login', body),
  register: (body: RegisterBody) => api.post<AuthResponse>('/api/auth/register', body),
  logout: () => api.post<void>('/api/auth/logout'),
}
```

**Step 3 : Commit**

```bash
git add frontend/src/api/
git commit -m "feat(frontend): add api client and auth api functions"
```

---

## Task 4 : Backend — routes auth JSON

Les controllers actuels font `res.render()` et `res.redirect()`. Il faut ajouter des méthodes JSON parallèles.

**Files:**
- Modify: `app/controllers/authController.js`
- Modify: `app/router.js`

**Step 1 : Ajouter les méthodes JSON dans authController.js**

Dans `app/controllers/authController.js`, ajouter après la méthode `logout` existante :

```js
// ── Méthodes JSON pour l'API React ──────────────────────────────────────────

  async apiLogin(req, res) {
    try {
      const value = await userLoginSchema.validateAsync(req.body, { allowUnknown: true });
      const { email, password } = value;

      const user = await User.findOne({ where: { email } });
      const hashToVerify = user?.password || DUMMY_PASSWORD_HASH;
      const passwordValid = await argon2.verify(hashToVerify, password);

      if (!user || !passwordValid) {
        return res.status(401).json({ status: 401, code: 'INVALID_CREDENTIALS', message: 'Email ou mot de passe incorrect' });
      }

      const token = jwt.sign(
        { id: user.id, email: user.email, firstname: user.firstname, lastname: user.lastname },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES }
      );

      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Strict',
      });

      return res.json({ user: { id: user.id, email: user.email, firstname: user.firstname, lastname: user.lastname } });
    } catch (error) {
      if (error.isJoi) {
        return res.status(400).json({ status: 400, code: 'VALIDATION_ERROR', message: error.details[0].message });
      }
      logger.error('api_login_failed', { error: error?.message || 'Unknown error' });
      return res.status(500).json({ status: 500, code: 'SERVER_ERROR', message: 'Erreur du serveur' });
    }
  },

  async apiRegister(req, res) {
    try {
      const value = await userCreateSchema.validateAsync(req.body, { abortEarly: false });
      const { firstname, lastname, email, password } = value;

      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(409).json({ status: 409, code: 'EMAIL_TAKEN', message: 'Un compte existe déjà avec cet email.' });
      }

      const hashedPassword = await argon2.hash(password);
      const user = await User.create({ firstname, lastname, email, password: hashedPassword });

      const token = jwt.sign(
        { id: user.id, email: user.email, firstname: user.firstname, lastname: user.lastname },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES }
      );

      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Strict',
      });

      return res.status(201).json({ user: { id: user.id, email: user.email, firstname: user.firstname, lastname: user.lastname } });
    } catch (error) {
      if (error.isJoi) {
        const errors = {};
        error.details.forEach(err => { errors[err.path[0]] = err.message; });
        return res.status(400).json({ status: 400, code: 'VALIDATION_ERROR', message: 'Données invalides', errors });
      }
      logger.error('api_register_failed', { error: error?.message || 'Unknown error' });
      return res.status(500).json({ status: 500, code: 'SERVER_ERROR', message: 'Erreur du serveur' });
    }
  },

  apiLogout(req, res) {
    res.clearCookie('token');
    return res.json({ success: true });
  },

  apiMe(req, res) {
    return res.json({ user: req.user });
  },
```

**Step 2 : Ajouter les routes dans router.js**

Dans `app/router.js`, ajouter après la route `router.post("/logout", ...)` :

```js
// ── Routes API JSON (pour React frontend) ──────────────────────────────────
router.post("/api/auth/login", authController.apiLogin);
router.post("/api/auth/register", authController.apiRegister);
router.post("/api/auth/logout", authController.apiLogout);
router.get("/api/me", optionalJWT, authController.apiMe);
```

**Step 3 : Tester manuellement**

Démarrer le serveur (`npm run dev` à la racine) et tester :
```bash
curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"wrongpass"}' | jq
```
Attendu : `{"status":401,"code":"INVALID_CREDENTIALS","message":"..."}`

**Step 4 : Commit**

```bash
git add app/controllers/authController.js app/router.js
git commit -m "feat(api): add JSON auth routes (login, register, logout, me)"
```

---

## Task 5 : Réécrire App.tsx + ProtectedRoute + main.tsx

**Files:**
- Modify: `frontend/src/main.tsx`
- Modify: `frontend/src/App.tsx`
- Create: `frontend/src/components/ProtectedRoute.tsx`

**Step 1 : Corriger main.tsx**

Remplacer le contenu de `frontend/src/main.tsx` :

```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import './index.css'
import App from './App.tsx'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 1000 * 60 * 5,
    },
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </StrictMode>,
)
```

**Step 2 : Créer ProtectedRoute**

Créer `frontend/src/components/ProtectedRoute.tsx` :

```tsx
import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'

type Props = { children: React.ReactNode }

export default function ProtectedRoute({ children }: Props) {
  const { user, isLoading } = useAuthStore()

  if (isLoading) return null

  if (!user) return <Navigate to="/login" replace />

  return <>{children}</>
}
```

**Step 3 : Réécrire App.tsx**

Remplacer le contenu de `frontend/src/App.tsx` :

```tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useEffect } from 'react'
import { useAuthStore } from './stores/authStore'
import { authApi } from './api/auth'
import Navbar from './components/navbar'
import Footer from './components/footer'
import ProtectedRoute from './components/ProtectedRoute'

// Pages (importées au fur et à mesure de la migration)
import Help from './pages/Help/Help'
// import Homepage from './pages/Homepage'    ← décommenter quand prête
// import Login from './pages/Login/Login'    ← décommenter quand prête

function Layout({ children }: { children: React.ReactNode }) {
  const { user } = useAuthStore()
  return (
    <>
      <Navbar user={user} />
      {children}
      <Footer />
    </>
  )
}

export default function App() {
  const { setUser, setLoading } = useAuthStore()

  useEffect(() => {
    authApi.me()
      .then(({ user }) => setUser(user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false))
  }, [setUser, setLoading])

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/help" element={<Layout><Help /></Layout>} />

        {/* Routes protégées — décommenter au fur et à mesure */}
        {/* <Route path="/messages" element={<ProtectedRoute><Layout><Messages /></Layout></ProtectedRoute>} /> */}

        {/* 404 fallback */}
        <Route path="*" element={<Layout><h1>Page introuvable</h1></Layout>} />
      </Routes>
    </BrowserRouter>
  )
}
```

**Step 4 : Vérifier que le frontend compile**

```bash
cd frontend && npm run build
```
Attendu : build réussi sans erreurs TypeScript.

**Step 5 : Commit**

```bash
git add frontend/src/main.tsx frontend/src/App.tsx frontend/src/components/ProtectedRoute.tsx
git commit -m "feat(frontend): setup app router, layout, protected route, auth init"
```

---

## Task 6 : Mettre à jour Navbar pour utiliser authStore

La navbar actuelle reçoit `user` en prop depuis `App.tsx` (via Layout). C'est correct pour le moment. Deux correctifs à faire :

**Files:**
- Modify: `frontend/src/components/navbar/index.tsx` (ou `navbar.tsx`)

**Step 1 : Ajouter `credentials: 'include'` aux fetch de la navbar**

Dans `frontend/src/components/navbar.tsx` (ou `navbar/index.tsx`), remplacer tous les `fetch(...)` par `fetch(..., { credentials: 'include' })` :

```ts
// Avant
fetch('/api/notifications/count')

// Après
fetch('/api/notifications/count', { credentials: 'include' })
```
Faire de même pour `/api/messages/unread-count`, `/api/notifications/recent`, `/api/notifications/read-all`.

**Step 2 : Corriger le logout**

Remplacer :
```ts
await fetch('/api/logout', { method: 'POST' })
```
Par :
```ts
await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
```

**Step 3 : Commit**

```bash
git add frontend/src/components/navbar/
git commit -m "fix(navbar): add credentials to fetch calls, fix logout route"
```

---

## Task 7 : Corriger la page Help

La page a deux problèmes : balise `<body>` dans JSX, et FAQ utilise `data-target` DOM au lieu de state React.

**Files:**
- Modify: `frontend/src/pages/Help/Help.tsx`

**Step 1 : Réécrire Help.tsx**

Remplacer le contenu de `frontend/src/pages/Help/Help.tsx` :

```tsx
import { useState } from 'react'
import './help_page.css'

type FaqItem = { id: string; question: string; answer: string }

const FAQ_ITEMS: FaqItem[] = [
  {
    id: '1',
    question: 'Comment puis-je créer un compte ?',
    answer: "Pour créer un compte sur SkillSwap, clique simplement sur le bouton \"S'inscrire\" en haut à droite de la page d'accueil. Tu peux t'inscrire avec ton adresse e-mail. Une fois ton compte créé, tu pourras compléter ton profil, proposer des compétences, et commencer à échanger avec la communauté !",
  },
  {
    id: '2',
    question: 'Comment modifier mes informations personnelles ?',
    answer: "Pour modifier tes informations personnelles, connecte-toi à ton compte, puis rends-toi dans la section \"Profil\" depuis le menu utilisateur. Tu pourras y mettre à jour ton nom, ta bio, tes disponibilités, tes compétences proposées et toutes les autres informations visibles par la communauté. N'oublie pas d'enregistrer les modifications !",
  },
  {
    id: '3',
    question: 'Est-ce que tout est vraiment gratuit ?',
    answer: "Oui, SkillSwap est entièrement gratuit ! Notre objectif est de permettre aux utilisateurs de partager leurs compétences et d'en apprendre d'autres, sans échange d'argent. Il suffit de proposer une compétence pour en apprendre une autre en retour — tout est basé sur l'échange et l'entraide, sans frais.",
  },
]

export default function Help() {
  const [openId, setOpenId] = useState<string | null>(null)

  return (
    <>
      <div className="ss-help-header">
        <i className="fas fa-question-circle ss-help-header-icon"></i>
        <h1 className="ss-help-title">Besoin d'aide ?</h1>
        <p className="ss-help-subtitle">Nous sommes là pour vous accompagner</p>
      </div>

      <main className="ss-help-main">
        <div className="ss-help-container">

          <div className="ss-help-tip">
            <i className="fas fa-lightbulb ss-help-tip-icon"></i>
            <p className="ss-help-tip-text">
              <strong>Astuce :</strong> Consultez d'abord notre FAQ ci-dessous, vous y trouverez peut-être la réponse à votre question !
            </p>
          </div>

          <section className="ss-help-faq">
            <h2 className="ss-help-section-title">
              <i className="fas fa-comments"></i>
              Questions fréquentes
            </h2>

            {FAQ_ITEMS.map((item) => (
              <div key={item.id} className="ss-help-faq-card">
                <div className="ss-help-faq-header">
                  <p className="ss-help-faq-question">{item.question}</p>
                  <button
                    className="ss-help-faq-toggle"
                    onClick={() => setOpenId(openId === item.id ? null : item.id)}
                  >
                    {openId === item.id ? '−' : '+'}
                  </button>
                </div>
                {openId === item.id && (
                  <div className="ss-help-faq-answer">
                    <p>{item.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </section>

          <section className="ss-help-contact">
            <h2 className="ss-help-section-title">
              <i className="fas fa-envelope"></i>
              Contactez-nous
            </h2>
            <div className="ss-help-contact-grid">
              <div className="ss-help-contact-card">
                <div className="ss-help-contact-icon"><i className="fas fa-envelope"></i></div>
                <div className="ss-help-contact-label">Par email</div>
                <a href="mailto:contact@skillswap.fr" className="ss-help-contact-link">contact@skillswap.fr</a>
                <p className="ss-help-contact-subtext">Réponse sous 24-48h</p>
              </div>
              <div className="ss-help-contact-card">
                <div className="ss-help-contact-icon"><i className="fas fa-phone"></i></div>
                <div className="ss-help-contact-label">Par téléphone</div>
                <a href="tel:+33123456789" className="ss-help-contact-link">01 23 45 67 89</a>
                <p className="ss-help-contact-subtext">Lun-Ven : 9h-18h</p>
              </div>
            </div>
          </section>

        </div>
      </main>
    </>
  )
}
```

**Step 2 : Vérifier visuellement**

Lancer `npm run dev` dans `frontend/`, aller sur `http://localhost:5173/help`. La FAQ doit s'ouvrir/fermer au clic.

**Step 3 : Commit**

```bash
git add frontend/src/pages/Help/Help.tsx
git commit -m "fix(help): convert FAQ to React state, remove invalid <body> tag"
```

---

## Task 8 : Page Login

**Files:**
- Create: `frontend/src/pages/Login/Login.tsx`
- Create: `frontend/src/pages/Login/login.css` (copier depuis `public/css/` si existe)
- Modify: `frontend/src/App.tsx` (ajouter la route)

**Step 1 : Créer Login.tsx**

Créer `frontend/src/pages/Login/Login.tsx` :

```tsx
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authApi } from '../../api/auth'
import { useAuthStore } from '../../stores/authStore'
import { ApiRequestError } from '../../api/client'

export default function Login() {
  const navigate = useNavigate()
  const setUser = useAuthStore((s) => s.setUser)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      const { user } = await authApi.login({ email, password })
      setUser(user)
      navigate('/')
    } catch (err) {
      if (err instanceof ApiRequestError) {
        setError(err.message)
      } else {
        setError('Erreur de connexion')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main>
      <h1>Connexion</h1>
      <form onSubmit={handleSubmit}>
        {error && <p className="error">{error}</p>}
        <div>
          <label htmlFor="email">Email</label>
          <input
            id="email" type="email" value={email} required
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="password">Mot de passe</label>
          <input
            id="password" type="password" value={password} required
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Connexion…' : 'Se connecter'}
        </button>
      </form>
      <p>Pas encore de compte ? <Link to="/register">S'inscrire</Link></p>
    </main>
  )
}
```

**Step 2 : Ajouter la route dans App.tsx**

```tsx
import Login from './pages/Login/Login'
// Dans <Routes> :
<Route path="/login" element={<Layout><Login /></Layout>} />
```

**Step 3 : Tester**

Aller sur `http://localhost:5173/login`, tenter une connexion avec de mauvais identifiants → message d'erreur. Avec de bons identifiants → redirect vers `/`.

**Step 4 : Supprimer la route EJS login**

Dans `app/router.js`, supprimer :
```js
router.get("/login", authController.renderloginPage);
```

**Step 5 : Commit**

```bash
git add frontend/src/pages/Login/ frontend/src/App.tsx app/router.js
git commit -m "feat: migrate login page to React"
```

---

## Task 9 : Page Register

**Files:**
- Create: `frontend/src/pages/Register/Register.tsx`
- Modify: `frontend/src/App.tsx`

**Step 1 : Créer Register.tsx**

Créer `frontend/src/pages/Register/Register.tsx` :

```tsx
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authApi } from '../../api/auth'
import { useAuthStore } from '../../stores/authStore'
import { ApiRequestError } from '../../api/client'

type FieldErrors = { firstname?: string; lastname?: string; email?: string; password?: string; confirmPassword?: string }

export default function Register() {
  const navigate = useNavigate()
  const setUser = useAuthStore((s) => s.setUser)

  const [form, setForm] = useState({ firstname: '', lastname: '', email: '', password: '', confirmPassword: '' })
  const [errors, setErrors] = useState<FieldErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErrors({})
    setIsSubmitting(true)

    try {
      const { user } = await authApi.register(form)
      setUser(user)
      navigate('/onboarding')
    } catch (err) {
      if (err instanceof ApiRequestError && err.code === 'VALIDATION_ERROR') {
        const data = err as ApiRequestError & { errors?: FieldErrors }
        setErrors((data as any).errors || {})
      } else if (err instanceof ApiRequestError) {
        setErrors({ email: err.message })
      } else {
        setErrors({ email: 'Erreur lors de l\'inscription' })
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main>
      <h1>Inscription</h1>
      <form onSubmit={handleSubmit}>
        {(['firstname', 'lastname', 'email', 'password', 'confirmPassword'] as const).map((field) => (
          <div key={field}>
            <label htmlFor={field}>{field}</label>
            <input
              id={field} name={field} type={field.includes('password') ? 'password' : field === 'email' ? 'email' : 'text'}
              value={form[field]} required onChange={handleChange}
            />
            {errors[field] && <span className="error">{errors[field]}</span>}
          </div>
        ))}
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Inscription…' : "S'inscrire"}
        </button>
      </form>
      <p>Déjà un compte ? <Link to="/login">Se connecter</Link></p>
    </main>
  )
}
```

**Step 2 : Ajouter la route + supprimer route EJS**

Dans `App.tsx` :
```tsx
import Register from './pages/Register/Register'
<Route path="/register" element={<Layout><Register /></Layout>} />
```

Dans `app/router.js`, supprimer :
```js
router.get("/register", authController.renderRegisterPage);
```

**Step 3 : Commit**

```bash
git add frontend/src/pages/Register/ frontend/src/App.tsx app/router.js
git commit -m "feat: migrate register page to React"
```

---

## Task 10 : Backend — route API homepage + page Homepage

**Files:**
- Modify: `app/controllers/mainController.js`
- Modify: `app/router.js`
- Modify: `frontend/src/pages/Homepage.tsx`
- Modify: `frontend/src/App.tsx`

**Step 1 : Ajouter la méthode JSON dans mainController.js**

```js
async getHomepage(req, res) {
  try {
    const skills = await Skill.findAll({ attributes: ['id', 'label', 'slug', 'icon'] });

    const topUsers = await User.findAll({
      attributes: {
        include: [
          [sequelize.fn('COALESCE', sequelize.fn('AVG', sequelize.col('received_reviews.rate')), 0), 'avg_reviews']
        ]
      },
      include: [{ model: Review, as: 'received_reviews', attributes: [] }],
      group: ['User.id'],
      order: [[sequelize.literal('avg_reviews'), 'DESC']],
      limit: 3,
      subQuery: false,
    });

    topUsers.forEach(user => {
      user.avg_reviews = Math.round(parseFloat(user.getDataValue('avg_reviews')) || 0);
    });

    return res.json({
      skills: skills.map(s => ({ id: s.id, label: s.label, slug: s.slug, icon: s.icon })),
      topUsers: topUsers.map(u => ({
        id: u.id,
        firstname: u.firstname,
        lastname: u.lastname,
        image: u.image,
        avg_reviews: u.getDataValue('avg_reviews'),
      })),
    });
  } catch (error) {
    logger.error('get_homepage_failed', { error: error?.message || 'Unknown error' });
    return res.status(500).json({ status: 500, code: 'SERVER_ERROR', message: 'Erreur serveur' });
  }
},
```

**Step 2 : Ajouter la route dans router.js**

```js
router.get("/api/homepage", optionalJWT, mainController.getHomepage);
```

**Step 3 : Créer api/homepage.ts**

Créer `frontend/src/api/homepage.ts` :
```ts
import { api } from './client'

export type Skill = { id: number; label: string; slug: string; icon: string }
export type TopUser = { id: number; firstname: string; lastname: string; image: string | null; avg_reviews: number }

export const homepageApi = {
  get: () => api.get<{ skills: Skill[]; topUsers: TopUser[] }>('/api/homepage'),
}
```

**Step 4 : Migrer Homepage.tsx avec TanStack Query**

Remplacer le contenu de `frontend/src/pages/Homepage.tsx` avec un composant qui appelle `useQuery` sur `/api/homepage`. Afficher les compétences et les top users comme dans la page EJS actuelle (lire `views/pages/homepage.ejs` pour la structure HTML).

**Step 5 : Ajouter la route + supprimer route EJS**

Dans `App.tsx` :
```tsx
import Homepage from './pages/Homepage'
<Route path="/" element={<Layout><Homepage /></Layout>} />
```

Dans `app/router.js`, supprimer :
```js
router.get("/", optionalJWT, mainController.renderHomePage);
```

**Step 6 : Commit**

```bash
git add app/controllers/mainController.js app/router.js frontend/src/
git commit -m "feat: migrate homepage to React"
```

---

## Task 11 : Page Search

La search a déjà `/api/search/talents` et `/api/search/autocomplete` en JSON — pas besoin de modifier le backend.

**Files:**
- Create: `frontend/src/api/search.ts`
- Create: `frontend/src/pages/Search/Search.tsx`
- Modify: `frontend/src/App.tsx`

**Step 1 : Créer api/search.ts**

```ts
import { api } from './client'

export type SearchResult = {
  id: number; firstname: string; lastname: string
  image: string | null; city: string | null
  skills: { id: number; label: string; slug: string }[]
  averageRating: number; reviewCount: number
}

export type SearchResponse = {
  page: number; limit: number; total: number; totalPages: number
  results: SearchResult[]
}

export type SearchFilters = {
  q?: string; city?: string; skills?: number[]
  sort?: 'rating_desc' | 'rating_asc' | 'newest' | 'popular'
  min_rating?: number; page?: number
}

export const searchApi = {
  talents: (filters: SearchFilters) => {
    const params = new URLSearchParams()
    if (filters.q) params.set('q', filters.q)
    if (filters.city) params.set('city', filters.city)
    if (filters.sort) params.set('sort', filters.sort)
    if (filters.min_rating) params.set('min_rating', String(filters.min_rating))
    if (filters.page) params.set('page', String(filters.page))
    filters.skills?.forEach(id => params.append('skills[]', String(id)))
    return api.get<SearchResponse>(`/api/search/talents?${params}`)
  },
  autocomplete: (q: string) =>
    api.get<{ suggestions: { id: number; fullname: string; city: string }[] }>(`/api/search/autocomplete?q=${q}`),
  savedSearches: {
    get: () => api.get<{ searches: any[] }>('/api/search/saved'),
    save: (body: { name: string; filters: SearchFilters }) => api.post('/api/search/save', body),
    delete: (id: number) => api.delete(`/api/search/saved/${id}`),
  },
}
```

**Step 2 : Créer Search.tsx avec TanStack Query**

Lire `views/pages/search.ejs` et `public/js/searchPage.js` pour la structure et la logique. Créer `frontend/src/pages/Search/Search.tsx` avec :
- State local pour les filtres (`q`, `skills`, `sort`, `city`, `min_rating`)
- `useQuery` sur `searchApi.talents(filters)` avec `enabled: true`
- Liste de résultats, pagination
- Autocomplete

**Step 3 : Route + suppression EJS**

Dans `App.tsx` : ajouter `<Route path="/search" element={<Layout><Search /></Layout>} />`

Dans `app/router.js`, supprimer :
```js
router.get("/search", optionalJWT, searchController.getSearchPage);
```

**Step 4 : Commit**

```bash
git add frontend/src/api/search.ts frontend/src/pages/Search/ frontend/src/App.tsx app/router.js
git commit -m "feat: migrate search page to React"
```

---

## Task 12 : Pages Profils

**Files:**
- Modify: `app/controllers/profilController.js` (ajouter méthodes JSON)
- Modify: `app/router.js`
- Create: `frontend/src/api/profil.ts`
- Create: `frontend/src/pages/Profil/ProfilPublic.tsx`
- Create: `frontend/src/pages/Profil/MyProfil.tsx`

**Step 1 : Lire profilController.js** pour comprendre ce que retournent les méthodes existantes.

**Step 2 : Ajouter les routes API**

```js
router.get("/api/user/:id/profil", optionalJWT, profilController.getProfil);          // profil public
router.get("/api/me/profil", verifyJWT, profilController.getMyProfil);                // mon profil
router.put("/api/me/profil", verifyJWT, uploadAvatar, profilController.updateProfile); // mise à jour
router.delete("/api/me/profil", verifyJWT, profilController.deleteProfile);
```

**Step 3 : Créer les pages React**

- `ProfilPublic.tsx` : affiche le profil d'un autre utilisateur (lecture seule)
- `MyProfil.tsx` : formulaire d'édition du profil courant

**Step 4 : Routes + suppression EJS**

```tsx
<Route path="/user/:id/profil" element={<Layout><ProfilPublic /></Layout>} />
<Route path="/mon-profil" element={<ProtectedRoute><Layout><MyProfil /></Layout></ProtectedRoute>} />
```

**Step 5 : Commit**

---

## Task 13 : Pages Skills et Talents

**Files:**
- Modify: `app/controllers/skillController.js`, `talentController.js`
- Create: `frontend/src/api/skills.ts`, `frontend/src/api/talents.ts`
- Create: les 4 pages React

**Pattern pour chaque :**
1. Lire le controller EJS existant
2. Ajouter méthode JSON dans le controller
3. Ajouter route `/api/skills`, `/api/skills/:slug`, `/api/talents`, `/api/talents/:id`
4. Créer page React avec `useQuery`
5. Supprimer route EJS
6. Commit

---

## Task 14 : Messagerie (Socket.io)

**Files:**
- Create: `frontend/src/stores/socketStore.ts`
- Create: `frontend/src/api/messages.ts`
- Create: `frontend/src/pages/Messages/Messages.tsx`
- Create: `frontend/src/pages/Messages/Conversation.tsx`

**Step 1 : Installer socket.io-client**

```bash
cd frontend && npm install socket.io-client
```

**Step 2 : Créer socketStore.ts**

```ts
import { create } from 'zustand'
import { io, Socket } from 'socket.io-client'

type SocketStore = {
  socket: Socket | null
  connect: () => void
  disconnect: () => void
}

export const useSocketStore = create<SocketStore>((set, get) => ({
  socket: null,
  connect: () => {
    if (get().socket) return
    const socket = io({ withCredentials: true, transports: ['websocket'] })
    set({ socket })
  },
  disconnect: () => {
    get().socket?.disconnect()
    set({ socket: null })
  },
}))
```

**Step 3 : Connecter le socket dans App.tsx**

Dans le `useEffect` d'init auth, après `setUser(user)` : appeler `socketStore.connect()`.

**Step 4 : Lire messageController.js** pour voir la structure des données.

**Step 5 : Créer les routes API messages**

```js
router.get("/api/messages", verifyJWT, messageController.getConversations);
router.get("/api/messages/:userId", verifyJWT, messageController.getConversation);
router.post("/api/messages/:userId", verifyJWT, messageController.sendMessage);
```

**Step 6 : Créer les pages React** avec `useQuery` pour la liste et `useInfiniteQuery` ou liste simple pour la conversation. Socket.io pour les nouveaux messages en temps réel.

**Step 7 : Commit**

---

## Task 15 : Notifications

Les routes `/api/notifications/*` existent déjà. Créer simplement la page React.

**Files:**
- Create: `frontend/src/pages/Notifications/Notifications.tsx`

Utiliser `useQuery` sur `/api/notifications/recent` et les mutations pour marquer lu/supprimer.

---

## Task 16 : Onboarding

**Files:**
- Create: `frontend/src/pages/Onboarding/Onboarding.tsx`

L'onboarding soumet un formulaire avec avatar (multipart). Utiliser `FormData` au lieu de JSON pour cette route.

**Route API à ajouter :**
```js
router.get("/api/onboarding/skills", verifyJWT, mainController.getOnboardingData);
router.post("/api/onboarding", verifyJWT, uploadAvatar, mainController.completeOnboarding); // déjà gère JSON redirect → changer en res.json()
```

---

## Task 17 : Pages d'erreur + nettoyage final

**Step 1 : Créer NotFound.tsx**

```tsx
export default function NotFound() {
  return <main><h1>404 — Page introuvable</h1></main>
}
```

Dans `App.tsx`, remplacer le fallback `<h1>Page introuvable</h1>` par `<NotFound />`.

**Step 2 : Nettoyage backend**

- Supprimer `app.set('view engine', 'ejs')` dans `createApp.js`
- Supprimer `app.set('views', ...)` dans `createApp.js`
- Supprimer le dossier `views/` (après vérification que toutes les routes EJS sont supprimées)
- Supprimer `ejs` des dépendances : `npm uninstall ejs`

**Step 3 : Commit final**

```bash
git add -A
git commit -m "chore: remove EJS views and engine, complete migration to React"
```
