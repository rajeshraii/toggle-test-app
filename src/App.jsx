import { useState, useEffect } from 'react'
import api from './api/axios'

const DEMO_USER = "demo-user-123"

function useFeature(featureId) {
  const [enabled, setEnabled] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!featureId) return
    api.get(`/features/${featureId}/check/${DEMO_USER}`)
      .then(res => setEnabled(res.data))
      .catch(() => setEnabled(false))
      .finally(() => setLoading(false))
  }, [featureId])

  return { enabled, loading }
}

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('toggle_token') || '')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loggedIn, setLoggedIn] = useState(!!localStorage.getItem('toggle_token'))
  const [features, setFeatures] = useState([])
  const [envId, setEnvId] = useState('')
  const [environments, setEnvironments] = useState([])
  const [error, setError] = useState('')

  const login = async () => {
    try {
      const res = await api.post('/auth/login', { email, password })
      localStorage.setItem('toggle_token', res.data.token)
      setToken(res.data.token)
      setLoggedIn(true)
      setError('')
    } catch {
      setError('Login failed')
    }
  }

  useEffect(() => {
    if (!loggedIn) return
    api.get('/environments').then(res => {
      setEnvironments(res.data)
      if (res.data.length > 0) setEnvId(res.data[0].id)
    })
  }, [loggedIn])

  useEffect(() => {
    if (!envId) return
    api.get(`/features/env/${envId}`).then(res => setFeatures(res.data))
  }, [envId])

  const checkFeature = (name) => {
    const f = features.find(f => f.name === name)
    return f?.enabled ?? false
  }

  const getRollout = (name) => {
    const f = features.find(f => f.name === name)
    return f?.rolloutPercentage ?? 0
  }

  if (!loggedIn) {
    return (
      <div style={{ fontFamily: "'DM Sans', sans-serif", background: "#080C14", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <link href="https://fonts.googleapis.com/css2?family=Syne:wght@500;700&family=DM+Sans:wght@400;500&display=swap" rel="stylesheet" />
        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: "2rem", width: 360 }}>
          <div style={{ fontFamily: "'Syne', sans-serif", fontSize: "1.1rem", fontWeight: 700, color: "#fff", marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 7, height: 7, background: "#3B82F6", borderRadius: "50%", boxShadow: "0 0 8px #3B82F6" }} />
            Toggle Test App
          </div>
          {error && <p style={{ color: "#F87171", fontSize: "0.8rem", marginBottom: 10 }}>{error}</p>}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)}
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, padding: "10px 14px", color: "#E2E8F0", fontSize: "0.88rem", outline: "none", fontFamily: "inherit" }} />
            <input placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)}
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, padding: "10px 14px", color: "#E2E8F0", fontSize: "0.88rem", outline: "none", fontFamily: "inherit" }} />
            <button onClick={login}
              style={{ background: "#3B82F6", border: "none", borderRadius: 8, padding: "10px", color: "#fff", fontSize: "0.9rem", cursor: "pointer", fontFamily: "inherit" }}>
              Login
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", background: checkFeature('dark-mode') ? "#080C14" : "#F8FAFC", minHeight: "100vh", color: checkFeature('dark-mode') ? "#E2E8F0" : "#1E293B", transition: "all 0.3s" }}>
      <link href="https://fonts.googleapis.com/css2?family=Syne:wght@500;700&family=DM+Sans:wght@400;500&display=swap" rel="stylesheet" />

      {/* Beta Banner */}
      {checkFeature('beta-banner') && (
        <div style={{ background: "rgba(139,92,246,0.15)", border: "1px solid rgba(139,92,246,0.25)", padding: "8px", textAlign: "center", fontSize: "0.8rem", color: "#A78BFA" }}>
          🚀 You're using the Beta version — features may change!
        </div>
      )}

      {/* Navbar */}
      <nav style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.8rem 2rem", borderBottom: `1px solid ${checkFeature('dark-mode') ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.08)"}`, backdropFilter: "blur(20px)" }}>
        <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: "1rem", display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 7, height: 7, background: "#3B82F6", borderRadius: "50%", boxShadow: "0 0 8px #3B82F6" }} />
          Toggle Test App
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <select value={envId} onChange={e => setEnvId(e.target.value)}
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "5px 10px", color: checkFeature('dark-mode') ? "#E2E8F0" : "#1E293B", fontSize: "0.8rem", outline: "none", cursor: "pointer" }}>
            {environments.map(env => <option key={env.id} value={env.id}>{env.name}</option>)}
          </select>
          <button onClick={() => { localStorage.removeItem('toggle_token'); setLoggedIn(false) }}
            style={{ fontSize: "0.75rem", padding: "5px 12px", borderRadius: 20, border: "1px solid rgba(239,68,68,0.3)", background: "rgba(239,68,68,0.08)", color: "#F87171", cursor: "pointer", fontFamily: "inherit" }}>
            Logout
          </button>
        </div>
      </nav>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "2rem" }}>

        {/* Feature Status Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12, marginBottom: "2rem" }}>
          {features.map(f => (
            <div key={f.id} style={{ background: f.enabled ? "rgba(59,130,246,0.08)" : "rgba(255,255,255,0.03)", border: `1px solid ${f.enabled ? "rgba(59,130,246,0.2)" : "rgba(255,255,255,0.07)"}`, borderRadius: 12, padding: "1rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <span style={{ fontFamily: "'Syne', sans-serif", fontSize: "0.85rem", fontWeight: 500 }}>{f.name}</span>
                <span style={{ fontSize: "0.7rem", padding: "2px 8px", borderRadius: 20, background: f.enabled ? "rgba(59,130,246,0.15)" : "rgba(255,255,255,0.05)", color: f.enabled ? "#60A5FA" : "rgba(255,255,255,0.3)" }}>
                  {f.enabled ? "ON" : "OFF"}
                </span>
              </div>
              <div style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.3)" }}>Rollout: {f.rolloutPercentage}%</div>
            </div>
          ))}
        </div>

        {/* Dark Mode Demo */}
        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: "1.5rem", marginBottom: "1rem" }}>
          <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: "1rem", fontWeight: 600, marginBottom: 8 }}>Dark Mode Feature</h2>
          <p style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.4)" }}>
            {checkFeature('dark-mode') ? "✅ Dark mode is ON — background is dark!" : "⬜ Dark mode is OFF — enable it in your dashboard!"}
          </p>
        </div>

        {/* New Checkout Demo */}
        {checkFeature('new-checkout') ? (
          <div style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)", borderRadius: 14, padding: "1.5rem", marginBottom: "1rem" }}>
            <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: "1rem", fontWeight: 600, color: "#34D399", marginBottom: 8 }}>🆕 New Checkout (Beta)</h2>
            <p style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.4)" }}>You're seeing the new streamlined checkout experience!</p>
            <button style={{ marginTop: 12, background: "#10B981", border: "none", borderRadius: 8, padding: "8px 20px", color: "#fff", fontSize: "0.85rem", cursor: "pointer", fontFamily: "inherit" }}>
              Checkout Now →
            </button>
          </div>
        ) : (
          <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: "1.5rem", marginBottom: "1rem" }}>
            <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: "1rem", fontWeight: 600, marginBottom: 8 }}>Old Checkout</h2>
            <p style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.4)" }}>Standard checkout experience.</p>
            <button style={{ marginTop: 12, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "8px 20px", color: "#E2E8F0", fontSize: "0.85rem", cursor: "pointer", fontFamily: "inherit" }}>
              Proceed to Checkout
            </button>
          </div>
        )}

        {/* New Pricing Demo */}
        {checkFeature('new-pricing') && (
          <div style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: 14, padding: "1.5rem" }}>
            <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: "1rem", fontWeight: 600, color: "#FCD34D", marginBottom: 8 }}>🎉 New Pricing Available!</h2>
            <p style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.4)" }}>Check out our new pricing plans — better value than ever!</p>
          </div>
        )}
      </div>
    </div>
  )
}