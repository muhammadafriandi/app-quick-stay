import Hotel from "../models/Hotel.js";
import User from "../models/User.js";

export const registerHotel = async (req, res) => {
  try {
    const {
      name,
      address,
      contact,
      city,
    } = req.body;

    // ---------------------------------------------
    // Check authentication
    // ---------------------------------------------
    if (!req.auth?.userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const owner = req.auth.userId;

    // ---------------------------------------------
    // Validate fields
    // ---------------------------------------------
    if (!name || !address || !contact || !city) {
      return res.status(400).json({
        success: false,
        message: "Please fill in all hotel details",
      });
    }

    // ---------------------------------------------
    // Check if owner already has hotel
    // ---------------------------------------------
    const existingHotel = await Hotel.findOne({
      owner,
    });

    if (existingHotel) {
      return res.status(409).json({
        success: false,
        message: "Hotel already registered",
      });
    }

    // ---------------------------------------------
    // Create hotel
    // ---------------------------------------------
    const hotel = await Hotel.create({
      name,
      address,
      contact,
      city,
      owner,
    });

    // ---------------------------------------------
    // Update user role
    // ---------------------------------------------
    await User.findByIdAndUpdate(
      owner,
      {
        role: "hotelOwner",
      },
      {
        new: true,
      }
    );

    return res.status(201).json({
      success: true,
      message: "Hotel registered successfully",
      hotel,
    });
  } catch (error) {
    console.error("Register hotel error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
