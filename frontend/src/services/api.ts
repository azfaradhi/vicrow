import axios from 'axios'

const API_BASE = '/api'

export interface User {
  id: number
  email: string
  name: string | null
  createdAt: string
  updatedAt: string
}

export interface CreateUserDto {
  email: string
  name?: string
}

export interface UpdateUserDto {
  email?: string
  name?: string
}

export interface HealthResponse {
  status: string
  message: string
  timestamp: string
  database: string
}

const axiosInstance = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
})

export const api = {
  // Health check
  health: async (): Promise<HealthResponse> => {
    const response = await axiosInstance.get('/health')
    return response.data
  },

  // Users CRUD
  getUsers: async (): Promise<User[]> => {
    const response = await axiosInstance.get('/users')
    return response.data
  },

  getUser: async (id: number): Promise<User> => {
    const response = await axiosInstance.get(`/users/${id}`)
    return response.data
  },

  createUser: async (data: CreateUserDto): Promise<User> => {
    const response = await axiosInstance.post('/users', data)
    return response.data
  },

  updateUser: async (id: number, data: UpdateUserDto): Promise<User> => {
    const response = await axiosInstance.put(`/users/${id}`, data)
    return response.data
  },

  deleteUser: async (id: number): Promise<void> => {
    await axiosInstance.delete(`/users/${id}`)
  },
}

export default api
