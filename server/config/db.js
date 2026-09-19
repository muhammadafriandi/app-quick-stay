// import mongoose from "mongoose";


// const connectDB = async () => {

//   try {
//     if (mongoose.connection.readyState === 1) {
//       return;
//     }

//     await mongoose.connect(process.env.MONGODB_URI);

//     console.log("Database connected");
//   } catch (error) {
//     console.error("Database connection error:", error.message);
//     throw error;
//   }
// }
// export default connectDB


import mongoose from "mongoose";

const connectDB = async () => {
  try {
    // Already connected
    if (mongoose.connection.readyState === 1) {
      return;
    }

    // Connection is currently being established
    if (mongoose.connection.readyState === 2) {
      return;
    }

    const mongoURI = process.env.MONGODB_URI;

    if (!mongoURI) {
      throw new Error("MONGODB_URI is not configured");
    }

    await mongoose.connect(mongoURI);

    console.log("Database connected");
  } catch (error) {
    console.error("Database connection error:", error.message);
    throw error;
  }
};

export default connectDB;
