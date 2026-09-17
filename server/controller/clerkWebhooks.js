import { Webhook } from "svix"
import User from "../models/User.js"

const clerkWebhooks = async (req, res) => {
  try {
    // Create a Svix instance with clerk webhook secret.
    const whook = new Webhook(process.env.CLERK_WEBHOOK_SECRET)

    // Getting Headers
    const svixId = req.headers["svix-id"]
    const svixTimestamp = req.headers["svix-timestamp"]
    const svixSignature = req.headers["svix-signature"]

    if (!svixId || !svixTimestamp || !svixSignature) {
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



    // req.body is a Buffer because of express.raw()
    // const payload = req.body.toString("utf8");
    const payload = req.body.toString("utf8");
    await whook.verify(payload, headers);


    // Verifying Headers
    // await whook.verify(payload, headers)

    // Getting data from request body
    const { data, type } = JSON.parse(payload)
    const username =
      `${data.first_name || ""} ${data.last_name || ""}`.trim() ||
      email.split("@")[0]

    const userData = {
      _id: data.id,
      email,
      username: username,
      image: data.image_url || "",
    }

    // Switch Cases for different Events
    switch (type) {
      case "user.created":

      case "user.updated": {
        await User.findByIdAndUpdate(data.id, userData);
        break;
      }


      case "user.deleted": {
        await User.findByIdAndDelete(data.id);
        break;
      }

      default: console.log(`Unhandled webhook event: ${type}`);
    }
    res.status(200).json({ success: true, message: "Webhook Received" })

  } catch (error) {
    // console.log(error.message)
    console.error("Clerk webhook error:", error);

    res.status(400).json({ success: false, message: error.message })
  }
}

export default clerkWebhooks
