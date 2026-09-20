import { Webhook } from "svix"
import User from "../models/User.js"
import connectDB from "../config/db.js"

const clerkWebhooks = async (req, res) => {
  try {

    await connectDB()

    const webhookSecret = process.env.CLERK_WEBHOOK_SECRET

    if (!webhookSecret) {
      console.error("CLERK_WEBHOOK_SECRET is missing")

      return res.status(500).json({
        success: false,
        message: "Webhook secret is not configured",
      })
    }

    const whook = new Webhook(webhookSecret)

    const svixId = req.headers["svix-id"]
    const svixTimestamp = req.headers["svix-timestamp"]
    const svixSignature = req.headers["svix-signature"]

    if (!svixId || !svixTimestamp || !svixSignature) {
      console.error("Missing Svix headers")

      return res.status(400).json({
        success: false,
        message: "Missing Svix headers",
      })
    }

    const headers = {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }

    if (!Buffer.isBuffer(req.body)) {
      console.error("Webhook body is not a Buffer")

      return res.status(400).json({
        success: false,
        message: "Invalid webhook body",
      })
    }

    const payload = req.body.toString("utf8")

    await whook.verify(payload, headers)

    console.log("Webhook signature verified")

    const { data, type } = JSON.parse(payload)

    console.log("Webhook type:", type)
    console.log("Clerk user ID:", data.id)

    if (type === "user.created" || type === "user.updated") {
      // Get primary email if available
      const primaryEmailId = data.primary_email_address_id

      const primaryEmail = data.email_addresses?.find(
        (email) => email.id === primaryEmailId
      )

      const email =
        primaryEmail?.email_address ||
        data.email_addresses?.[0]?.email_address ||
        ""

      // Create username
      const username =
        `${data.first_name || ""} ${data.last_name || ""}`.trim() ||
        email.split("@")[0]

      const userData = {
        _id: data.id,
        email,
        username,
        image: data.image_url || "",
      }

      console.log("Saving user:", userData)


      const user = await User.findByIdAndUpdate(
        data.id,
        userData,
        {
          new: true,
          upsert: true,
          runValidators: true,
          setDefaultsOnInsert: true,
        }
      )

      console.log(`User ${type} successfully saved`)
      console.log("MongoDB user:", user._id.toString())
    }


    else if (type === "user.deleted") {
      const deletedUser = await User.findByIdAndDelete(data.id)

      if (deletedUser) {
        console.log(`User deleted: ${data.id}`)
      } else {
        console.log(`User not found: ${data.id}`)
      }
    }

    else {
      console.log(`Unhandled Clerk event: ${type}`)
    }

    return res.status(200).json({
      success: true,
      message: "Webhook received",
    })
  } catch (error) {
    console.error("=================================")
    console.error("Clerk webhook error")
    console.error(error)
    console.error("=================================")

    return res.status(400).json({
      success: false,
      message: error.message || "Webhook processing failed",
    })
  }
}

export default clerkWebhooks
