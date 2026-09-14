import dns from "dns";
import express from 'express'
import 'dotenv/config'
import cors from 'cors'
import connectDB from './config/db.js'
import { clerkMiddleware } from '@clerk/express'
import clerkWebhooks from "./conrollers/clerkWebhooks.js";


dns.setServers(["1.1.1.1", "8.8.8.8"]);

const app = express()

connectDB()

//  Clerk webhook MUST receive raw body
app.post(
  "/api/clerk",
  express.raw({ type: "application/json" }),
  clerkWebhooks
);


app.use(cors()) //Enable Cors Origin Resource Sharing


// Middleware
app.use(express.json())
app.use(clerkMiddleware())

// API to listen to Clerk Webhooks
app.use("/api/clerk", clerkWebhooks)

app.get('/', (req, res) => res.send("API is working"))
const PORT = process.env.PORT || 3000

app.listen(PORT, () => console.log(`Server is Runnig on Port ${PORT}`))
