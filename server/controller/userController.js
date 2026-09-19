import User from "../models/User.js"

// GET /api/user
export const getUserData = async (req, res) => {
  try {
    const user = req.user;

    return res.status(200).json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        image: user.image,
        role: user.role,
      },

      role: user.role,
      recentSearchedCities: user.recentSearchedCities || [],
    });

  } catch (error) {
    console.error("getUserData error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// POST /api/user/recent-search
export const storeRecentSearchedCities = async (req, res) => {
  try {
    const { recentSearchedCity } = req.body;

    if (!recentSearchedCity) {
      return res.status(400).json({
        success: false,
        message: "City is required",
      });
    }

    const user = req.user;

    if (!user.recentSearchedCities) {
      user.recentSearchedCities = [];
    }

    // Avoid duplicate city
    user.recentSearchedCities = user.recentSearchedCities.filter(
      (city) => city !== recentSearchedCity
    );

    // Add city to the end
    user.recentSearchedCities.push(recentSearchedCity);

    // Keep only the latest 3 cities
    if (user.recentSearchedCities.length > 3) {
      user.recentSearchedCities =
        user.recentSearchedCities.slice(-3);
    }

    await user.save();

    return res.status(201).json({
      success: true,
      message: "City Added",
      recentSearchedCities: user.recentSearchedCities,
    });
  } catch (error) {
    console.error("storeRecentSearchedCities error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

