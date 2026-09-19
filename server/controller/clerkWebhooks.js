// import { Webhook } from "svix"
// import User from "../models/User.js"


// const clerkWebhooks = async (req, res) => {
//   try {
//     // Create a Svix instance with clerk webhook secret.
//     const whook = new Webhook(process.env.CLERK_WEBHOOK_SECRET)

//     // Getting Headers
//     const svixId = req.headers["svix-id"]
//     const svixTimestamp = req.headers["svix-timestamp"]
//     const svixSignature = req.headers["svix-signature"]

//     if (!svixId || !svixTimestamp || !svixSignature) {
//       return res.status(400).json({
//         success: false,
//         message: "Missing Svix headers",
//       })
//     }

//     const headers = {
//       "svix-id": svixId,
//       "svix-timestamp": svixTimestamp,
//       "svix-signature": svixSignature,
//     }



//     // req.body is a Buffer because of express.raw()
//     // const payload = req.body.toString("utf8");
//     const payload = req.body.toString("utf8");
//     await whook.verify(payload, headers);


//     // Verifying Headers
//     // await whook.verify(payload, headers)

//     // Getting data from request body
//     const { data, type } = JSON.parse(payload)
//     const username =
//       `${data.first_name || ""} ${data.last_name || ""}`.trim() ||
//       email.split("@")[0]

//     const userData = {
//       _id: data.id,
//       email,
//       username: username,
//       image: data.image_url || "",
//     }

//     // Switch Cases for different Events
//     switch (type) {
//       case "user.created":

//       case "user.updated": {
//         await User.findByIdAndUpdate(data.id, userData);
//         break;
//       }


//       case "user.deleted": {
//         await User.findByIdAndDelete(data.id);
//         break;
//       }

//       default: console.log(`Unhandled webhook event: ${type}`);
//     }
//     res.status(200).json({ success: true, message: "Webhook Received" })

//   } catch (error) {
//     // console.log(error.message)
//     console.error("Clerk webhook error:", error);

//     res.status(400).json({ success: false, message: error.message })
//   }
// }

// export default clerkWebhooks


import { Webhook } from "svix";
import User from "../models/User.js";
import connectDB from "../config/db.js";

const clerkWebhooks = async (req, res) => {
  try {
    console.log("=================================");
    console.log("Clerk webhook received");
    console.log("=================================");

    // --------------------------------------------------
    // Make sure MongoDB is connected
    // --------------------------------------------------

    await connectDB();

    // --------------------------------------------------
    // Check webhook secret
    // --------------------------------------------------

    const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.error("CLERK_WEBHOOK_SECRET is missing");

      return res.status(500).json({
        success: false,
        message: "Webhook secret is not configured",
      });
    }

    // --------------------------------------------------
    // Create Svix webhook instance
    // --------------------------------------------------

    const whook = new Webhook(webhookSecret);

    // --------------------------------------------------
    // Get Svix headers
    // --------------------------------------------------

    const svixId = req.headers["svix-id"];
    const svixTimestamp = req.headers["svix-timestamp"];
    const svixSignature = req.headers["svix-signature"];

    if (!svixId || !svixTimestamp || !svixSignature) {
      console.error("Missing Svix headers");

      return res.status(400).json({
        success: false,
        message: "Missing Svix headers",
      });
    }

    const headers = {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    };

    // --------------------------------------------------
    // Get raw body
    // --------------------------------------------------

    if (!Buffer.isBuffer(req.body)) {
      console.error("Webhook body is not a Buffer");

      return res.status(400).json({
        success: false,
        message: "Invalid webhook body",
      });
    }

    const payload = req.body.toString("utf8");

    // --------------------------------------------------
    // Verify Svix signature
    // --------------------------------------------------

    await whook.verify(payload, headers);

    console.log("Webhook signature verified");

    // --------------------------------------------------
    // Parse verified payload
    // --------------------------------------------------

    const { data, type } = JSON.parse(payload);

    console.log("Webhook type:", type);
    console.log("Clerk user ID:", data.id);

    // --------------------------------------------------
    // USER CREATED / UPDATED
    // --------------------------------------------------

    if (type === "user.created" || type === "user.updated") {
      // Get primary email if available
      const primaryEmailId = data.primary_email_address_id;

      const primaryEmail = data.email_addresses?.find(
        (email) => email.id === primaryEmailId
      );

      const email =
        primaryEmail?.email_address ||
        data.email_addresses?.[0]?.email_address ||
        "";

      // Create username
      const username =
        `${data.first_name || ""} ${data.last_name || ""}`.trim() ||
        email.split("@")[0] ||
        "User";

      const userData = {
        _id: data.id,
        email,
        username,
        image: data.image_url || "",
      };

      console.log("Saving user:", userData);

      // --------------------------------------------------
      // Upsert user
      // --------------------------------------------------

      const user = await User.findByIdAndUpdate(
        data.id,
        userData,
        {
          new: true,
          upsert: true,
          runValidators: true,
          setDefaultsOnInsert: true,
        }
      );

      console.log(`User ${type} successfully saved`);
      console.log("MongoDB user:", user._id.toString());
    }

    // --------------------------------------------------
    // USER DELETED
    // --------------------------------------------------

    else if (type === "user.deleted") {
      const deletedUser = await User.findByIdAndDelete(data.id);

      if (deletedUser) {
        console.log(`User deleted: ${data.id}`);
      } else {
        console.log(`User not found: ${data.id}`);
      }
    }

    // --------------------------------------------------
    // OTHER EVENTS
    // --------------------------------------------------

    else {
      console.log(`Unhandled Clerk event: ${type}`);
    }

    // --------------------------------------------------
    // SUCCESS
    // --------------------------------------------------

    return res.status(200).json({
      success: true,
      message: "Webhook received",
    });
  } catch (error) {
    console.error("=================================");
    console.error("Clerk webhook error");
    console.error(error);
    console.error("=================================");

    return res.status(400).json({
      success: false,
      message: error.message || "Webhook processing failed",
    });
  }
};

export default clerkWebhooks;
