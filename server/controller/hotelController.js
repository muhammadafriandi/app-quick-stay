import Hotel from "../models/Hotel.js"
import User from "../models/User.js"


export const registerHotel = async (req, res) => {
  try {
    const { name, address, contact, city } = req.body
    const owner = req.user._id

    // Check if User Already Register
    const hotel = await Hotel.findOne({ owner })
    if (hotel) {
      return res.status(409).json({ success: false, message: "Hotel Already Register" })
    }

    await Hotel.create({ name, address, contact, city, owner })

    await User.findByIdAndUpdate(owner, { role: "hotelOwner" })
    res.status(202).json({ success: true, message: "Hotel Registered Successfully" })

  } catch (error) {
    res.status(400).json({ success: fasle, message: error.message })
  }
}
