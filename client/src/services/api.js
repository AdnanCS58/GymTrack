
import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
})

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('gymtrack_token')

    console.log('API Request:', config.url)
    console.log('Token exists:', Boolean(token))

    if (token) {
      config.headers.set('Authorization', `Bearer ${token}`)
    }

    return config
  },
  (error) => Promise.reject(error)
)

export default api
