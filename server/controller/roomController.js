import { getAuth } from "@clerk/express";
import Hotel from "../models/Hotel.js";
import Room from "../models/Room.js";
import { v2 as cloudinary } from "cloudinary";



export const createRoom = async (req, res) => {
  try {
    const { userId } = getAuth(req)
    const { roomType, pricePerNight, amenities, } = req.body;

    if (!req.auth?.userId) {
      return res.status(401).json({ success: false, message: "Unauthorized", })
    }

    if (!roomType) {
      return res.status(400).json({ success: false, message: "Room type is required", })
    }

    const price = Number(pricePerNight)

    if (isNaN(price) || price <= 0) {
      return res.status(400).json({ success: false, message: "Please enter a valid room price" })
    }
    console.log("userID", userId)

    const hotel = await Hotel.findOne({ owner: userId })

    if (!hotel) {
      return res.status(404).json({ success: false, message: "No hotel found for this owner" })
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: "Please upload at least one image" })
    }

    let parsedAmenities = [];

    try {
      parsedAmenities = JSON.parse(amenities || "[]")

    } catch (error) {
      return res.status(400).json({ success: false, message: "Invalid amenities format" })
    }

    if (!Array.isArray(parsedAmenities)) {
      return res.status(400).json({ success: false, message: "Amenities must be an array" })
    }

    const uploadImages = req.files.map(async (file) => {
      const response = await cloudinary.uploader.upload(file.path, {
        folder: "hotel-rooms",
      });

      return response.secure_url;
    });

    const images = await Promise.all(uploadImages)

    const room = await Room.create({
      hotel: hotel._id,
      roomType,
      pricePerNight: price,
      amenities: parsedAmenities,
      images,
      isAvailable: true,
    });

    return res.status(201).json({ success: true, message: "Room created successfully", room, })

  } catch (error) {
    console.error("Create room error:", error);
    return res.status(500).json({ success: false, message: error.message, })
  }
}

export const getRooms = async (req, res) => {
  try {
    const rooms = await Room.find({
      isAvailable: true,
    })
      .populate({
        path: "hotel",
        populate: {
          path: "owner",
          select: "name image",
        },
      })
      .sort({
        createdAt: -1,
      });

    return res.status(200).json({ success: true, rooms, })
  } catch (error) {
    console.error("Get rooms error:", error);

    return res.status(500).json({ success: false, message: error.message, })
  }
};


export const getOwnerRooms = async (req, res) => {
  try {

    if (!req.auth?.userId) {
      return res.status(401).json({ success: false, message: "Unauthorized", })
    }

    const { userId } = getAuth(req)

    const hotel = await Hotel.findOne({ owner: userId })

    if (!hotel) {
      return res.status(404).json({ success: false, message: "No hotel found", })
    }

    const rooms = await Room.find({
      hotel: hotel._id,
    })
      .populate("hotel")
      .sort({
        createdAt: -1,
      });

    return res.status(200).json({ success: true, rooms })
  } catch (error) {
    console.error("Get owner rooms error:", error);

    return res.status(500).json({ success: false, message: error.message, })
  }
};

export const toggleRoomAvailability = async (req, res) => {
  try {
    const { roomId } = req.body;

    if (!req.auth?.userId) {
      return res.status(401).json({ success: false, message: "Unauthorized", })
    }
    if (!roomId) {
      return res.status(400).json({ success: false, message: "Room ID is required" })
    }

    const hotel = await Hotel.findOne({ owner: req.auth.userId, });

    if (!hotel) {
      return res.status(404).json({ success: false, message: "Hotel not found" })
    }


    const room = await Room.findOne({ _id: roomId, hotel: hotel._id, })

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found",
      });
    }

    room.isAvailable = !room.isAvailable;

    await room.save();

    return res.status(200).json({
      success: true,
      message: "Room availability updated",
      isAvailable: room.isAvailable,
    });
  } catch (error) {
    console.error("Toggle room availability error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
