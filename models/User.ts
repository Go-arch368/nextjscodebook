import { Schema, model, models, Document, Model } from 'mongoose';

// 1. Define the TypeScript interface
export interface IUser extends Document {
  name: string;
  email: string;
  age?: number;
  createdAt: Date;
  updatedAt: Date;
}

// 2. Create the Schema
const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address'],
    },
    age: {
      type: Number,
      min: [18, 'You must be at least 18 years old'],
      max: [120, 'You cannot be older than 120 years'],
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt automatically
  }
);

// 3. Create and export the Model
const User = (models.User as Model<IUser>) || model<IUser>('User', UserSchema);

export default User;