import User from "../models/User.js"

// GET /api/user
export const getUserData = async (req, res) => {
  try {
    const role = req.user.role
    const recentSearchedCities = req.user.recentSearchedCities
    res.status(200).json({ success: true, recentSearchedCities })

  } catch (error) {
    res.status(400).json({ success: false, message: error.message })
  }
}

// Store user recent searched cities
export const storeRecentSearchedCitites = async (req, res) => {
  try {
    const { recentSearchedCity } = req.body
    const user = await req.user

    if (user.recentSearchedCities.length < 3) {
      user.recentSearchedCities.push(recentSearchedCity)
    } else {
      user.recentSearchedCities.shift()
      user.recentSearchedCities.push(recentSearchedCity)
    }

    await User.save()
    res.status(201).json({ success: true, message: "City Added" })

  } catch (error) {
    res.status(400).json({ success: false, message: error.message })
  }
}
