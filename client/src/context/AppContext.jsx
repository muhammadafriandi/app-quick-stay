import axios from "axios"
import { createContext, useContext, useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useUser, useAuth } from "@clerk/clerk-react"
import toast from "react-hot-toast"

axios.defaults.baseURL = import.meta.env.VITE_BACKEND_URL

const AppContext = createContext()

export const AppProvider = ({ children }) => {
  const currency = import.meta.env.VITE_CURRENCY || "$"

  const navigate = useNavigate()

  const { user, isLoaded } = useUser()
  const { getToken } = useAuth()

  const [isOwner, setIsOwner] = useState(false)
  const [showHotelReg, setShowHotelReg] = useState(false)
  const [searchedCities, setSearchedCities] = useState([])
  const [isUserLoading, setIsUserLoading] = useState(true)
  const [rooms, setRooms] = useState([])

  const fetchRooms = async () => {
    try {
      const { data } = await axios.get('/api/rooms')

      if (data.success) {
        setRooms(data.rooms)
      } else {
        toast.error(data.message)
      }

    } catch (error) {
      toast.error(error.message)
    }
  }

  const fetchUser = async () => {
    try {
      setIsUserLoading(true)

      const token = await getToken()
      // console.log(token)

      if (!token) {
        setIsOwner(false)
        return
      }

      const { data } = await axios.get("/api/user", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      // console.log(data)

      if (data.success) {
        // Backend role is "owner" or "user"
        setIsOwner(data.role === "owner")
        setSearchedCities(data.recentSearchedCities || [])
      }
      console.log(data.role)

    } catch (error) {
      console.error("fetchUser error:", error)
      console.error(
        "Backend response:",
        error.response?.data
      )

      // Don't show an error while Clerk is still loading
      if (error.response?.status === 404) {
        toast.error("User not found in database")
      } else if (error.response?.status === 401) {
        toast.error("Please login again")
      } else {
        toast.error(
          error.response?.data?.message ||
          "Failed to fetch user information"
        )
      }
    } finally {
      setIsUserLoading(false)
    }
  }

  useEffect(() => {
    if (!isLoaded) return

    if (!user) {
      setIsOwner(false)
      setSearchedCities([])
      return
    }

    fetchUser()
  }, [user, isLoaded])

  useEffect(() => {
    fetchRooms()
  }, [])

  const value = {
    currency, navigate, axios, user, getToken,
    isOwner, setIsOwner,
    showHotelReg, setShowHotelReg,
    searchedCities, setSearchedCities,
    rooms, setRooms,
    isUserLoading
  }

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  )
}

export const useAppContext = () => {
  const context = useContext(AppContext)

  if (!context) {
    throw new Error(
      "useAppContext must be used inside AppProvider"
    )
  }

  return context
}
