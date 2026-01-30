import { useState, useEffect } from 'react'
import { api } from '../services/api'

interface HealthStatus {
  status: string
  message: string
  timestamp: string
  database: string
}

export default function Home() {
  const [health, setHealth] = useState<HealthStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const data = await api.health()
        setHealth(data)
        setError(null)
      } catch (err) {
        setError('Backend is not running. Start the Crow server first.')
        console.error('Health check failed:', err)
      } finally {
        setLoading(false)
      }
    }

    checkHealth()
  }, [])

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center py-12">
        <h1 className="text-5xl font-bold mb-4">
          Welcome to <span className="text-gradient">Vicrow</span>
        </h1>
        <p className="text-xl text-secondary-400 max-w-2xl mx-auto">
          A modern full-stack framework combining Vite + React frontend, 
          Crow C++ backend, and Prisma database integration.
        </p>
      </div>

      {/* Status Card */}
      <div className="card max-w-xl mx-auto">
        <h2 className="text-lg font-semibold mb-4">Backend Status</h2>
        {loading ? (
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-secondary-400">Checking backend status...</span>
          </div>
        ) : error ? (
          <div className="flex items-center space-x-2 text-red-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            <span>{error}</span>
          </div>
        ) : health ? (
          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-green-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Backend is running</span>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-secondary-400">Status:</span>
                <span className="ml-2 text-secondary-100">{health.status}</span>
              </div>
              <div>
                <span className="text-secondary-400">Database:</span>
                <span className="ml-2 text-secondary-100">{health.database}</span>
              </div>
              <div className="col-span-2">
                <span className="text-secondary-400">Message:</span>
                <span className="ml-2 text-secondary-100">{health.message}</span>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {/* Features Grid */}
      <div className="grid md:grid-cols-3 gap-6 mt-12">
        <div className="card">
          <div className="w-12 h-12 bg-primary-600/20 rounded-lg flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold mb-2">Vite Frontend</h3>
          <p className="text-secondary-400 text-sm">
            Lightning-fast development with HMR, React, and TailwindCSS for modern UI components.
          </p>
        </div>

        <div className="card">
          <div className="w-12 h-12 bg-primary-600/20 rounded-lg flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold mb-2">Crow C++ Backend</h3>
          <p className="text-secondary-400 text-sm">
            High-performance REST API with Crow framework. Fast, efficient, and type-safe.
          </p>
        </div>

        <div className="card">
          <div className="w-12 h-12 bg-primary-600/20 rounded-lg flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold mb-2">Prisma Database</h3>
          <p className="text-secondary-400 text-sm">
            Modern database toolkit with type-safe queries, migrations, and schema management.
          </p>
        </div>
      </div>
    </div>
  )
}
