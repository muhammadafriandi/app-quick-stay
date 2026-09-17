import axios from "axios"
import { createContext, useContext, useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useUser, useAuth } from "@clerk/clerk-react"
import toast from "react-hot-toast"



axios.defaults.baseURL = import.meta.env.VITE_BECKEND_URL

const AppContext = createContext()


export const AppProvider = ({ children }) => {

  const currency = import.meta.env.VITE_CURRENCY || "$"
  const navigate = useNavigate()

  const { user } = useUser()
  const { getToken } = useAuth()

  const [isOwner, setIsOwner] = useState(false)
  const [showHotelReg, setShowHotelReg] = useState(false)
  const [searchedCities, setSearchedCities] = useState([])

  // const fetchUser = async () => {
  //   try {
  //     const token = await getToken()

  //     console.log("TOKEN:", token)

  //     const { data } = await axios.get('/api/user', { headers: { Authorization: `Bearer ${await getToken()}` } })

  //     if (data.success) {
  //       setIsOwner(data.role === "hotelOwner")
  //       setSearchedCities(data.recentSearchedCities)
  //     } else {
  //       // Retry Fetching User Details after 5 second
  //       setTimeout(() => {
  //         fetchUser()
  //       }, 5000)
  //     }

  //   } catch (error) {
  //     toast.error(error.message)
  //   }
  // }

  const fetchUser = async () => {
    try {
      const token = await getToken()

      console.log("TOKEN:", token)

      if (!token) {
        console.log("No Clerk token available")
        return
      }

      const { data } = await axios.get('/api/user', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      console.log("USER RESPONSE:", data)

      if (data.success) {
        setIsOwner(data.role === "hotelOwner")
        setSearchedCities(data.recentSearchedCities || [])
      } else {
        setTimeout(fetchUser, 5000)
      }
    } catch (error) {
      console.error("fetchUser error:", error)
      toast.error(error.response?.data?.message || error.message)
    }
  }


  useEffect(() => {
    if (user) {
      fetchUser()
    }
  }, [user])

  const value = {
    currency, navigate,
    axios, user, getToken,
    isOwner, setIsOwner,
    showHotelReg, setShowHotelReg,
    searchedCities, setSearchedCities
  }

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  )
}

export const useAppContext = () => useContext(AppContext)
