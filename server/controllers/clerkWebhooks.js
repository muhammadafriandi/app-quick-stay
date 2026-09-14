// import User from "../models/User.js"
// import { Webhook } from "svix"



// const clerkWebhooks = async (req, res) => {
//   try {
//     // Create a Svix instance with clerk webhooks secret
//     const whook = new Webhook(process.env.CLERK_WEBHOOKS_SECRET)

//     // Getting Headers
//     const headers = {
//       "svix-id": req.headers["svix-id"],
//       "svix-timestamp": req.headers["svix-timestamp"],
//       "svix-signature": req.headers["svix-signature"]
//     }

//     // req.body is a Buffer because of express.raw()
//     const payload = req.body.toString();

//     await whook.verify(payload, headers)

//     // Getting Data from requset body
//     const { data, type } = JSON.parse(payload)

//     const userData = {
//       _id: data.id,
//       email: data.email.addresses?.[0]?.email_address || "",
//       // username: data.first_name + " " + data.last_name,
//       username: `${data.first_name || ""} ${data.last_name || ""}`.trim() ||
//         "User",
//       image: data.image_url || "",
//     }

//     // Switch cases for different Events
//     switch (type) {
//       case "user.created": {
//         await User.create(userData);
//         break;
//       }

//       case "user.updated": {
//         await User.findByIdAndUpdate(data.id, userData);
//         break;
//       }

//       default:
//         break;
//     }

//     res.status(200).json({ success: true, message: "Webhook Received" })

//   } catch (error) {
//     console.log(error.message)
//     res.status(400).json({ success: false, message: error.message })
//   }
// }

// export default clerkWebhooks
import User from "../models/User.js";
import { verifyWebhook } from "@clerk/express/webhooks";

const clerkWebhooks = async (req, res) => {
  try {
    const evt = await verifyWebhook(req, {
      signingSecret: process.env.CLERK_WEBHOOKS_SECRET,
    });

    const { data, type } = evt;

    const userData = {
      _id: data.id,
      email: data.email_addresses?.[0]?.email_address || "",
      username:
        `${data.first_name || ""} ${data.last_name || ""}`.trim() ||
        "User",
      image: data.image_url || "",
    };

    switch (type) {
      case "user.created":
        await User.create(userData);
        break;

      case "user.updated":
        await User.findByIdAndUpdate(data.id, userData);
        break;

      case "user.deleted":
        await User.findByIdAndDelete(data.id);
        break;

      default:
        console.log(`Unhandled Clerk event: ${type}`);
    }

    res.status(200).json({
      success: true,
      message: "Webhook received",
    });
  } catch (error) {
    console.error("Clerk webhook error:", error);

    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export default clerkWebhooks;
