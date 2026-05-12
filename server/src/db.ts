import mongoose from "mongoose";

export const connectDb = async (uri: string) => {
  mongoose.set("strictQuery", true);
  await mongoose.connect(uri);
};
