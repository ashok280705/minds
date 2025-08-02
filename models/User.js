// models/User.js

import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      unique: true,
      required: true,
    },
    password: {
      type: String,

    },
    name: {
      type: String,

    },
    surname: {
      type: String,

    },
    middleName: {

    },
    phoneNumber: {
      type: String,

    },
    emergencyNumber: {
      type: String,

    },
    birthdate: {
      type: Date,

    },
    gender: {
      type: String,
      enum: ["male", "female", "other"],

    },
    language: {
      type: String,
      enum: ["en", "hi", "mr"], // English, Hindi, Marathi
      default: "en",
    },
  },
  {
    timestamps: true, // adds createdAt & updatedAt
  }
);

export default mongoose.models.User || mongoose.model("User", UserSchema);