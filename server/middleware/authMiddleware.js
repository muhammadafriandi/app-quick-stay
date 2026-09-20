import { getAuth } from "@clerk/express"
import User from "../models/User.js"

export const protect = async (req, res, next) => {
  try {
    const { userId } = getAuth(req)

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Not Authenticated",
      })
    }

    const user = await User.findById(userId)

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found", })
    }

    req.user = user
    // req.auth = getAuth(req)

    next()

  } catch (error) {
    console.error("Protect middleware error:", error)
    return res.status(401).json({ success: false, message: error.message || "Authentication failed", })
  }
}
