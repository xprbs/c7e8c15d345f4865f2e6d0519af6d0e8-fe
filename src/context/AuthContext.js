// ** React Imports
import { createContext, useEffect, useState } from 'react'

// ** Next Import
import { useRouter } from 'next/router'

// ** Axios
import axios from 'axios'

// ** Config
import authConfig from 'src/configs/auth'
import { backendApi } from 'src/configs/axios'

import toast from 'react-hot-toast'

// ** Defaults
const defaultProvider = {
  user: null,
  loading: true,
  setUser: () => null,
  setLoading: () => Boolean,
  login: () => Promise.resolve(),
  logout: () => Promise.resolve(),
  userMenu: null,
  setUserMenu: null
}
const AuthContext = createContext(defaultProvider)

const AuthProvider = ({ children }) => {
  // ** States
  const [user, setUser] = useState(defaultProvider.user)
  const [loading, setLoading] = useState(defaultProvider.loading)
  const [userMenu, setUserMenu] = useState(defaultProvider.userMenu)

  // ** Hooks
  const router = useRouter()
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = window.localStorage.getItem(authConfig.storageTokenKeyName)
      if (storedToken) {
        setLoading(true)

        await backendApi
          .get('/auth/user-profile')
          .then(async response => {
            setLoading(false)
            await InitUserMenu()
            setUser({ ...response.data.userData })
          })
          .catch(() => {
            localStorage.removeItem(authConfig.userData)
            localStorage.removeItem(authConfig.refreshToken)
            localStorage.removeItem(authConfig.accessToken)
            setUser(null)
            setLoading(false)
            if (authConfig.onTokenExpiration === 'logout' && !router.pathname.includes('login')) {
              router.replace('/login')
            }
          })
      } else {
        setLoading(false)
      }
    }
    initAuth()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleLogin = (params, errorCallback) => {
    backendApi
      .post('/auth/login', params)
      .then(async response => {
        params.rememberMe
          ? window.localStorage.setItem(authConfig.storageTokenKeyName, response.data.accessToken)
          : null
        const returnUrl = router.query.returnUrl
        setUser({ ...response.data.userData })
        params.rememberMe
          ? window.localStorage.setItem(authConfig.userData, JSON.stringify(response.data.userData))
          : null
        const redirectURL = returnUrl && returnUrl !== '/' ? returnUrl : '/'
        await InitUserMenu()
        router.replace(redirectURL)
      })
      .catch(err => {
        if (errorCallback) errorCallback(err)
      })
  }

  const handleLogout = () => {
    backendApi
      .post('/auth/logout')
      .then(() => {
        setUser(null)
        window.localStorage.removeItem(authConfig.userData)
        window.localStorage.removeItem(authConfig.storageTokenKeyName)
        router.push('/login')
        toast.success('You are signed out')
      })
      .catch(err => {
        toast.error(`Error sign out ${err.message}`)
      })
  }

  const InitUserMenu = async () => {
    const storedToken = window.localStorage.getItem(authConfig.storageTokenKeyName)
    if (storedToken) {
      await backendApi
        .post('/web/user-access')
        .then(response => {
          setLoading(false)
          setUserMenu(response.data)
        })
        .catch(error => {
          localStorage.removeItem(authConfig.userData)
          localStorage.removeItem(authConfig.onTokenExpiration)
          localStorage.removeItem(authConfig.storageTokenKeyName)
          setLoading(false)
          setUser(null)
          handleLogout()
        })
    } else {
      setLoading(false)
    }
  }

  const values = {
    user,
    loading,
    setUser,
    setLoading,
    userMenu,
    setUserMenu,
    login: handleLogin,
    logout: handleLogout
  }

  return <AuthContext.Provider value={values}>{children}</AuthContext.Provider>
}

export { AuthContext, AuthProvider }
