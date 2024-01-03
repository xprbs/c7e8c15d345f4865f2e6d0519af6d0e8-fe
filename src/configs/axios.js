import axios from 'axios'
import authConfig from './auth'
import toast from 'react-hot-toast'

export const backendApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_URL_BACKEND,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json'
  }
})

// Add a request interceptor
backendApi.interceptors.request.use(
  config => {
    const token = window.localStorage.getItem(authConfig.storageTokenKeyName)
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  error => Promise.reject(error)
)

backendApi.interceptors.response.use(
  response => {
    return response
  },
  async error => {
    if (error.response.status === 401 && window.location.pathname !== '/login/') {
      window.localStorage.removeItem(authConfig.userData)
      window.localStorage.removeItem(authConfig.storageTokenKeyName)
      toast.error('Session ended')
      window.location.href = '/login'

      // const token = window.localStorage.getItem(authConfig.storageTokenKeyName)
      // const refreshToken = window.localStorage.getItem(authConfig.onTokenExpiration)
      // let apiResponse = await backendApi.post('/auth/refresh')
      // window.localStorage.setItem(authConfig.storageTokenKeyName, apiResponse.data.accessToken)
      // window.localStorage.setItem(authConfig.onTokenExpiration, apiResponse.data.refresh_token)
      // error.config.headers['Authorization'] = `Bearer ${apiResponse.data.accessToken}`
      // return backendApi(error.config)
    } else {
      return Promise.reject(error)
    }
  }
)
