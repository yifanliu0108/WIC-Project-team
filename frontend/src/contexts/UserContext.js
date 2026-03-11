import React, { createContext, useContext, useState, useEffect } from 'react'
import { usersAPI } from '../utils/api'

const UserContext = createContext(null)

export const useUser = () => useContext(UserContext)

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null)

  const loadUser = async () => {
    try {
      const res = await usersAPI.getMyProfile()
      setUser(res.data)
    } catch (err) {
      console.error('failed to load user', err)
      setUser(null)
    }
  }

  useEffect(() => {
    if (localStorage.getItem('token')) {
      loadUser()
    }
  }, [])

  return (
    <UserContext.Provider value={{ user, setUser, loadUser }}>
      {children}
    </UserContext.Provider>
  )
}
