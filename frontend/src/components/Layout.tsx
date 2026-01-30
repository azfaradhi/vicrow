import { Outlet, Link, useLocation } from 'react-router-dom'

const navigation = [
  { name: 'Home', path: '/' },
  { name: 'Users', path: '/users' },
  { name: 'About', path: '/about' },
]

export default function Layout() {
  const location = useLocation()

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-secondary-800 border-b border-secondary-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">V</span>
              </div>
              <span className="text-xl font-bold text-gradient">Vicrow</span>
            </Link>

            {/* Navigation */}
            <nav className="flex space-x-1">
              {navigation.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    location.pathname === item.path
                      ? 'bg-primary-600 text-white'
                      : 'text-secondary-300 hover:text-white hover:bg-secondary-700'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Outlet />
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-secondary-800 border-t border-secondary-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <p className="text-secondary-400 text-sm">
              © 2026 Vicrow Framework. Built with Vite, Crow & Prisma.
            </p>
            <div className="flex space-x-4">
              <a href="https://github.com" className="text-secondary-400 hover:text-white transition-colors">
                GitHub
              </a>
              <a href="#" className="text-secondary-400 hover:text-white transition-colors">
                Docs
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
