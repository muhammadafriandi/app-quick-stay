import express from "express"
import cors from "cors"
import "dotenv/config"

import connectDB from "./config/db.js"
import { clerkMiddleware } from "@clerk/express"

import clerkWebhooks from "./controller/clerkWebhooks.js"
import connectCloudinary from "./config/cloudinary.js"

import roomRouter from "./routes/roomRoutes.js"
import hotelRouter from "./routes/hotelRoutes.js"
import bookingRouter from "./routes/bookingRoutes.js"
import userRouter from "./routes/userRoutes.js"
import { stripeWebhooks } from "./controller/stripeWebhooks.js"

const app = express()

app.use(express.json());
app.use(cors({ origin: true, credentials: true }))
// app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }))

app.post('/api/stripe/webhook', express.raw({ type: " application/json" }), stripeWebhooks)

// Midddleware
app.use("/api/clerk", express.raw({ type: "application/json", }), clerkWebhooks)
app.use(express.json())
app.use(clerkMiddleware())

app.get("/", (req, res) => {
  res.status(200).send("API is working")
})

// Routes
app.use("/api/user", userRouter)
app.use("/api/hotels", hotelRouter)
app.use("/api/rooms", roomRouter)
app.use("/api/bookings", bookingRouter)

const PORT = process.env.PORT || 3000

if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
  })
}

connectDB()
  .then(() => {
    console.log("MongoDB initialization complete")
  })
  .catch((error) => {
    console.error("MongoDB initialization failed:", error.message)
  })

connectCloudinary()

export default app
