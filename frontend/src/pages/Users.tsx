import { useState, useEffect } from 'react'
import { api, User, CreateUserDto, UpdateUserDto } from '../services/api'

export default function Users() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [formData, setFormData] = useState<CreateUserDto>({
    email: '',
    name: '',
  })

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const data = await api.getUsers()
      setUsers(data)
      setError(null)
    } catch (err) {
      setError('Failed to fetch users. Make sure the backend is running.')
      console.error('Fetch users failed:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingUser) {
        await api.updateUser(editingUser.id, formData as UpdateUserDto)
      } else {
        await api.createUser(formData)
      }
      setFormData({ email: '', name: '' })
      setShowForm(false)
      setEditingUser(null)
      fetchUsers()
    } catch (err) {
      setError('Failed to save user')
      console.error('Save user failed:', err)
    }
  }

  const handleEdit = (user: User) => {
    setEditingUser(user)
    setFormData({ email: user.email, name: user.name || '' })
    setShowForm(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this user?')) return
    try {
      await api.deleteUser(id)
      fetchUsers()
    } catch (err) {
      setError('Failed to delete user')
      console.error('Delete user failed:', err)
    }
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingUser(null)
    setFormData({ email: '', name: '' })
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Users</h1>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="btn btn-primary"
          >
            Add User
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-500/20 border border-red-500 rounded-lg p-4 text-red-400">
          {error}
        </div>
      )}

      {/* User Form */}
      {showForm && (
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">
            {editingUser ? 'Edit User' : 'Add New User'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Email</label>
              <input
                type="email"
                className="input"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="user@example.com"
                required
              />
            </div>
            <div>
              <label className="label">Name</label>
              <input
                type="text"
                className="input"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="John Doe"
              />
            </div>
            <div className="flex space-x-3">
              <button type="submit" className="btn btn-primary">
                {editingUser ? 'Update' : 'Create'}
              </button>
              <button type="button" onClick={handleCancel} className="btn btn-secondary">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Users List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : users.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-secondary-400">No users found. Add your first user!</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {users.map((user) => (
            <div key={user.id} className="card flex justify-between items-center">
              <div>
                <h3 className="font-semibold">{user.name || 'Unnamed User'}</h3>
                <p className="text-secondary-400 text-sm">{user.email}</p>
                <p className="text-secondary-500 text-xs mt-1">
                  Created: {new Date(user.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(user)}
                  className="btn btn-secondary text-sm"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(user.id)}
                  className="btn bg-red-600 hover:bg-red-700 text-white text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
