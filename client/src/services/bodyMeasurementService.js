
import api from './api'

export const createMeasurement = async (measurementData) => {
  const response = await api.post(
    '/body-measurements',
    measurementData
  )

  return response.data
}

export const getMeasurements = async () => {
  const response = await api.get('/body-measurements')

  return response.data
}
