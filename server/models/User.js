// import mongoose from "mongoose";


// const userSchema = mongoose.Schema({
//   _id: { type: String, required: true },
//   username: { type: String, required: true },
//   email: { type: String, required: true },
//   image: { type: String, default: "" },
//   role: { type: String, enum: ["user", "owner"], default: "user" },
//   recentSearchedCities: [{ type: String }],
// }, { timestamps: true })

// const User = mongoose.model("User", userSchema)

// export default User


import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
    },

    username: {
      type: String,
      required: true,
    },

    image: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

const User =
  mongoose.models.User || mongoose.model("User", userSchema);

export default User;
