
import { Route, Routes, useLocation, Navigate } from "react-router-dom"
import Navbar from "./components/Navbar"
import Home from "./pages/Home"
import AllRooms from "./pages/AllRooms"
import Footer from "./components/Footer"
import RoomDetails from "./pages/RoomDetails"
import MyBookings from "./pages/MyBookings"
import HotelReg from "./components/HotelReg"
import Layout from "./pages/hotelOwner/Layout"
import Dashboard from "./pages/hotelOwner/Dashboard"
import AddRoom from "./pages/hotelOwner/AddRoom"
import ListRoom from "./pages/hotelOwner/ListRoom"
import { Toaster } from "react-hot-toast"
import { useAppContext } from "./context/AppContext"
import Loader from "./components/Loader"


const App = () => {
  const location = useLocation()
  const { showHotelReg, isOwner, isUserLoading, user } = useAppContext()
  // const isOwnerPath = location.pathname.includes("owner")
  const isOwnerPath = location.pathname.startsWith("/owner");


  return (
    <div>
      <Toaster />
      {!isOwnerPath && <Navbar />}
      {showHotelReg && <HotelReg />}
      <div className="min-h-[70vh]">
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/rooms' element={<AllRooms />} />
          <Route path='/rooms/:id' element={<RoomDetails />} />
          <Route path='/my-bookings' element={<MyBookings />} />
          <Route path='/loader/:nextUrl' elemt={<Loader />} />

          <Route path='/owner'
            element={
              isUserLoading ? (
                <div className="min-h-screen flex items-center justify-center">
                  Loading...
                </div>
              ) : user && isOwner ? (
                <Layout />
              ) : (
                <Navigate to="/" replace />
              )
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="add-room" element={<AddRoom />} />
            <Route path="list-room" element={<ListRoom />} />
          </Route>

        </Routes>
      </div>
      <Footer />
    </div>
  )
}

export default App
