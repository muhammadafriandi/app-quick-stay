import express from "express"
import { protect } from "../middleware/authMiddleware.js"
import { getUserData, storeRecentSearchedCitites } from "../controller/userController.js"

const userRouter = express.Router()

userRouter.get('/', protect, getUserData)
userRouter.post('/store-recent-search', protect, storeRecentSearchedCitites)

export default userRouter
