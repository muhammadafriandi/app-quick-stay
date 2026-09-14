// import mongoose from "mongoose";


// const connectDB = async () => {
//   try {
//     mongoose.connection.on('connected', () => console.log("Database Connected"))
//     await mongoose.connect(`${process.env.MONGODB_URI}/hotel-booking`)

//   } catch (error) {
//     // console.log(error.message)
//     console.error("Database connection failed:", error.message);
//     process.exit(1);

//   }
// }

// export default connectDB


import mongoose from "mongoose";

const connectDB = async () => {
  try {
    mongoose.connection.on("connected", () => {
      console.log("Database Connected");
    });

    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: "hotel-booking",
    });
  } catch (error) {
    console.error("Database connection failed:", error.message);
    process.exit(1);
  }
};

export default connectDB;
