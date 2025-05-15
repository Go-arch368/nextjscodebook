import { Schema, model, models, Document, Model } from 'mongoose';


export interface IUser extends Document {
  name: string;
  email: string;
  age?: number;
  createdAt: Date;
  updatedAt: Date;
}


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
    timestamps: true, 
  }
);


const User = (models.User as Model<IUser>) || model<IUser>('User', UserSchema);

export default User;