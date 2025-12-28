import mongoose, { Schema, Document, Model } from "mongoose";

export interface UserDocument extends Document {
  id?: string;
  name?: string;
  email: string;
  password?: string;
  image?: string;
  emailVerified?: Date;
  createdAt?: Date;
  updatedAt?: Date;
  gamertag?: string;
  role?: "admin" | "user";
}

const UserSchema = new Schema<UserDocument>(
  {
    id: { type: String },
    name: { type: String },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    image: { type: String },
    emailVerified: { type: Date },
    createdAt: { type: Date },
    updatedAt: { type: Date },
    gamertag: { type: String, unique: true, sparse: true },
    role: { type: String, enum: ["admin", "user"], default: "user" },
  },
  {
    collection: "user",
    timestamps: false,
    strict: false, // allow fields managed by better-auth
  }
);

const User: Model<UserDocument> =
  mongoose.models.User || mongoose.model<UserDocument>("User", UserSchema, "user");

export default User;

