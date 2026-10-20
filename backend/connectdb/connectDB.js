
const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = {
    conn: null,
    promise: null,
  };
}

const connectDB = async () => {
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  if (!process.env.MONGO_URL) {
    throw new Error("MONGO_URL is not configured");
  }

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(process.env.MONGO_URL)
      .then((mongooseInstance) => {
        console.log("MongoDB connected successfully");
        return mongooseInstance;
      })
      .catch((error) => {
        cached.promise = null;
        throw error;
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
};

module.exports = connectDB;
