import { Webhook } from "svix"
import User from "../models/User.js"

const clerkWebhooks = async (req, res) => {
  try {
    // Create a Svix instance with clerk webhook secret.
    const whook = new Webhook(process.env.CLERK_WEBHOOK_SECRET)

    // Getting Headers
    const headers = {
      "svix-id": req.headers["svix-id"],
      "svix-timestamp": req.headers["svix-timestamp"],
      "svix-signature": req.headers["svix-signature"],
    }

    // req.body is a Buffer because of express.raw()
    // const payload = req.body.toString("utf8");
    const payload = req.body.toString("utf8");
    await whook.verify(payload, headers);


    // Verifying Headers
    // await whook.verify(payload, headers)

    // Getting data from request body
    const { data, type } = JSON.parse(payload)

    const userData = {
      _id: data.id,
      email: data.email_addresses?.[0]?.email_address || "",
      username: `${data.first_name || ""} ${data.last_name || ""}`.trim(),
      image: data.image_url || "",
    }

    // Switch Cases for different Events
    switch (type) {
      case "user.created": {
        await User.create(userData);
        break;
      }

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
