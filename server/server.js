import dns from "dns";
import exprees from 'express'
import 'dotenv/config'
import cors from 'cors'
import connectDB from './config/db.js'
import { clerkMiddleware } from '@clerk/express'
import clerkWebhooks from "./conrollers/clerkWebhooks.js";


dns.setServers(["1.1.1.1", "8.8.8.8"]);

const app = exprees()

connectDB()

app.use(cors()) //Enable Cors Origin Resource Sharing


// Middleware
app.use(exprees.json())
app.use(clerkMiddleware())

// API to listen to Clerk Webhooks
app.use("/api/clerk", clerkWebhooks)

app.get('/', (req, res) => res.send("API is working"))
const PORT = process.env.PORT || 3000

app.listen(PORT, () => console.log(`Server is Runnig on Port ${PORT}`))
