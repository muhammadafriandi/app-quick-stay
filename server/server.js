import express from "express";
import cors from "cors";
import "dotenv/config";

import connectDB from "./config/db.js";
import { clerkMiddleware } from "@clerk/express";

import clerkWebhooks from "./controller/clerkWebhooks.js";
import connectCloudinary from "./controller/cloudinary.js";

import roomRouter from "./routes/roomRoutes.js";
import hotelRouter from "./routes/hotelRoutes.js";
import bookingRouter from "./routes/bookingRoutes.js";
import userRouter from "./routes/userRoutes.js";

const app = express();

// --------------------------------------------------
// CORS
// --------------------------------------------------

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

// --------------------------------------------------
// CLERK WEBHOOK
// IMPORTANT:
// This MUST come before express.json()
// because Svix needs the raw request body.
// --------------------------------------------------

app.use(
  "/api/clerk",
  express.raw({
    type: "application/json",
  }),
  clerkWebhooks
);

// --------------------------------------------------
// NORMAL MIDDLEWARE
// --------------------------------------------------

app.use(express.json());

app.use(clerkMiddleware());

// --------------------------------------------------
// HEALTH CHECK
// --------------------------------------------------

app.get("/", (req, res) => {
  res.status(200).send("API is working");
});

// --------------------------------------------------
// ROUTES
// --------------------------------------------------

app.use("/api/user", userRouter);
app.use("/api/hotels", hotelRouter);
app.use("/api/rooms", roomRouter);
app.use("/api/bookings", bookingRouter);

// --------------------------------------------------
// LOCAL SERVER
// --------------------------------------------------

const PORT = process.env.PORT || 3000;

if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

// --------------------------------------------------
// INITIAL CONNECTIONS
// --------------------------------------------------

connectDB()
  .then(() => {
    console.log("MongoDB initialization complete");
  })
  .catch((error) => {
    console.error("MongoDB initialization failed:", error.message);
  });

connectCloudinary();

export default app;
