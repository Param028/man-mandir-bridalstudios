import mongoose, { Schema, Document } from 'mongoose';

export interface IPhotoOfWeek extends Document {
  title: string;
  thumbnail: string;
  thumbnailPublicId: string;
  order: number;
  isActive: boolean;
  createdAt: Date;
}

const PhotoOfWeekSchema = new Schema<IPhotoOfWeek>(
  {
    title: {
      type: String,
      required: true,
    },
    thumbnail: {
      type: String,
      required: true,
    },
    thumbnailPublicId: {
      type: String,
      required: true,
    },
    order: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const PhotoOfWeek =
  mongoose.models.PhotoOfWeek ||
  mongoose.model<IPhotoOfWeek>('PhotoOfWeek', PhotoOfWeekSchema);

export default PhotoOfWeek;
