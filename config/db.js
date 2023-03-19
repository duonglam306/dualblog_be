import mongoose from 'mongoose';
import dotenv from 'dotenv';
import colors from 'colors';
dotenv.config();

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.DB, {})
        console.log(`MongoDB connected: ${conn.connection.host}`.cyan.underline)
    } catch (error) {
        console.log(`Error: ${error.message}`.red.underline.bold)
        process.exit(1)
    }
}

export default connectDB;