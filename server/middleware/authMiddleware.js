import User from "../models/User.js"


// Middleware to check if user is Authenticated
export const protect = async (req, res, next) => {
  const { userId } = req.auth

  if (!userId) {
    res.json({ success: false, messsage: "Not Authincated" })
  } else {
    const user = await User.findById(userId)
    req.user = user
    next()
  }

}
