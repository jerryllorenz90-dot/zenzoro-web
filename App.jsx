import React, { useState } from 'react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export default function App() {
  const [status, setStatus] = useState('idle')
  const [price, setPrice] = useState(null)

  async function checkStatus() {
    setStatus('loading')
    try {
      const r = await fetch(`${API_URL}/api/status`)
      const j = await r.json()
      setStatus(JSON.stringify(j))
    } catch (e) {
      setStatus('error')
    }
  }

  async function getPrice() {
    setPrice('loading')
    try {
      const r = await fetch(`${API_URL}/api/price`)
      const j = await r.json()
      setPrice(JSON.stringify(j))
    } catch (e) {
      setPrice('error')
    }
  }

  return (
    <div className="app">
      <header className="hero">
        <div className="logo">ⓩ</div>
        <h1>Zenzoro</h1>
        <p>Reinventing the future of finance</p>
      </header>

      <main className="panel">
        <div className="controls">
          <button onClick={checkStatus}>Check Server Status</button>
          <button onClick={getPrice}>Get BTC Price</button>
        </div>
        <div className="output">
          <h3>Server Status</h3>
          <pre>{status}</pre>
          <h3>BTC Price</h3>
          <pre>{price}</pre>
        </div>
      </main>

      <footer className="foot">
        <small>Demo mockup asset: {mockupPath()}</small>
      </footer>
    </div>
  )
}

function mockupPath() {
  return "/mnt/data/A_mockup_of_Zenzoro's_mobile_finance_app_dashboard.png"
}
