import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    const connect = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB connection SUCCESS: ${connect.connection.host}`);
  } catch (error) {
    console.error('MongoDB connection FAIL: ', error.message);
    process.exit(1);
  }
}