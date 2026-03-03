import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    console.log('🔍 Attempting MongoDB connection...')
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000, // Fail fast for debugging
      socketTimeoutMS: 45000,
    });
    
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);    
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️  MongoDB disconnected');
    });
    
    mongoose.connection.on('reconnected', () => {
      console.log('🔄 MongoDB reconnected');
    });
    
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    console.error('🔍 Error details:', {
      name: error.name,
      code: error.code,
      codeName: error.codeName,
    });
    process.exit(1);
  }
};

export default connectDB;
