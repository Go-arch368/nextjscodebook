// src/lib/dbConnect.ts
import mongoose from 'mongoose';

const MONGODB_URI: string = process.env.MONGODB_URI || 'mongodb+srv://gowthamtj0808:fnCiyg7sRteeRWJp@nextjscluster.hjsrgai.mongodb.net/mydatabase?retryWrites=true&w=majority';

// Define the shape of the cached object
interface MongooseCache {
  conn: mongoose.Mongoose | null;
  promise: Promise<mongoose.Mongoose> | null;
}

// Extend the global object to include mongoose cache
declare global {
  // eslint-disable-next-line no-var
  var mongoose: MongooseCache;
}

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

let cached: MongooseCache = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect(): Promise<mongoose.Mongoose> {
  if (cached.conn) {
    console.log('Using cached MongoDB connection');
    return cached.conn;
  }

  if (!cached.promise) {
    const opts: mongoose.ConnectOptions = {
      bufferCommands: false,
    };

    console.log('Attempting to connect to MongoDB.....');
    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongooseInstance) => {
      console.log('MongoDB connected successfully');
      return mongooseInstance;
    }).catch((error: Error) => {
      console.error('MongoDB connection error:', error.message);
      throw error;
    });
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Failed to establish MongoDB connection:', error.message);
      throw error;
    } else {
      console.error('Failed to establish MongoDB connection:', error);
      throw error;
    }
  }
}

export default dbConnect;