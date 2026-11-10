
import api from './api'

export const getWorkoutAnalytics = async () => {
  const response = await api.get('/analytics')
  return response.data
}
