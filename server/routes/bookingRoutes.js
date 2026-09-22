import express from "express"
import { protect } from "../middleware/authMiddleware.js"
import { checkAvaibilityAPI, createBooking, getHotelBookings, getUserBookings, stripePayment } from "../controller/bookingController.js"

const bookingRouter = express.Router()

bookingRouter.post('/check-avaibility', checkAvaibilityAPI)
bookingRouter.post('/book', protect, createBooking)
bookingRouter.get('/user', protect, getUserBookings)
bookingRouter.get('/hotel', protect, getHotelBookings)
bookingRouter.post('/stripe-payment', protect, stripePayment)

export default bookingRouter
