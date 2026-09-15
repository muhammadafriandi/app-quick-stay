import express from "express"
import cors from "cors"
import "dotenv/config"
import connectDB from "./config/db.js"
import { clerkMiddleware } from '@clerk/express'
import clerkWebhooks from "./controller/clerkWebhooks.js"



const app = express()

app.use(cors()) //Enable Cross Origin Resource Sharing

app.use(
  "/api/clerk",
  express.raw({ type: "application/json" }),
  clerkWebhooks
);

// Middleware
app.use(express.json())
app.use(clerkMiddleware())


// API to listen to Clerk Webhooks
// app.use("/api/clerk", clerkWebhooks)


app.get("/", (req, res) => res.send("API is working"))

const PORT = process.env.PORT || 3000

// app.listen(PORT, () => console.log(`Server is running on port ${PORT}`))
if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}


connectDB()
export default app
