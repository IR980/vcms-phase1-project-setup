import mongoose from "mongoose";

import { env } from "./env";

export const connectDB = async (): Promise<void> => {
  try {
    mongoose.set("strictQuery", true);

    await mongoose.connect(env.MONGODB_URI);

    console.log(`✅ MongoDB Connected: ${mongoose.connection.host}`);

    mongoose.connection.on("disconnected", () => {
      console.warn("⚠️ MongoDB disconnected.");
    });

    mongoose.connection.on("error", (error) => {
      console.error("MongoDB Error:", error.message);
    });
  } catch (error) {
    console.error("❌ Database Connection Failed");

    console.error(error);

    process.exit(1);
  }
};

export const disconnectDB = async (): Promise<void> => {
  await mongoose.disconnect();

  console.log("✅ MongoDB connection closed.");
};
