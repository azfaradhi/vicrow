export default function About() {
  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <h1 className="text-4xl font-bold text-center">About Vicrow</h1>
      
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">What is Vicrow?</h2>
        <p className="text-secondary-300 leading-relaxed">
          Vicrow is a modern full-stack framework that combines the best of both worlds: 
          the blazing-fast frontend development experience of Vite with React and TailwindCSS, 
          and the high-performance backend capabilities of Crow C++ framework, all connected 
          to a database through Prisma's powerful ORM.
        </p>
      </div>

      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Architecture</h2>
        <div className="space-y-4">
          <div className="border-l-4 border-primary-500 pl-4">
            <h3 className="font-semibold text-primary-400">Frontend (Vite + React)</h3>
            <p className="text-secondary-400 text-sm">
              Port 3000 - Modern React application with TypeScript, TailwindCSS, 
              and React Router for navigation.
            </p>
          </div>
          <div className="border-l-4 border-primary-500 pl-4">
            <h3 className="font-semibold text-primary-400">Backend (Crow C++)</h3>
            <p className="text-secondary-400 text-sm">
              Port 8080 - High-performance REST API built with Crow framework, 
              featuring JSON responses and CORS support.
            </p>
          </div>
          <div className="border-l-4 border-primary-500 pl-4">
            <h3 className="font-semibold text-primary-400">Database (Prisma)</h3>
            <p className="text-secondary-400 text-sm">
              Type-safe database access with Prisma ORM, supporting SQLite, 
              PostgreSQL, MySQL, and more.
            </p>
          </div>
        </div>
      </div>

      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Tech Stack</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[
            { name: 'Vite', version: '5.x' },
            { name: 'React', version: '18.x' },
            { name: 'TypeScript', version: '5.x' },
            { name: 'TailwindCSS', version: '3.x' },
            { name: 'Crow C++', version: '1.x' },
            { name: 'Prisma', version: '5.x' },
          ].map((tech) => (
            <div key={tech.name} className="bg-secondary-700 rounded-lg p-3 text-center">
              <p className="font-medium">{tech.name}</p>
              <p className="text-secondary-400 text-sm">{tech.version}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Getting Started</h2>
        <div className="bg-secondary-900 rounded-lg p-4 font-mono text-sm">
          <div className="space-y-2">
            <p className="text-secondary-400"># Install dependencies</p>
            <p className="text-green-400">npm run setup</p>
            <p className="text-secondary-400"># Start development servers</p>
            <p className="text-green-400">npm run dev</p>
          </div>
        </div>
      </div>
    </div>
  )
}
