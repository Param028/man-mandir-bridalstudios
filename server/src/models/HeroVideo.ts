import mongoose, { Schema, Document } from 'mongoose';

export interface IHeroVideo extends Document {
  url: string;
  publicId: string;
  title: string;
  isActive: boolean;
  uploadedAt: Date;
}

const HeroVideoSchema = new Schema<IHeroVideo>(
  {
    url: {
      type: String,
      required: true,
    },
    publicId: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      default: 'Hero Video',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const HeroVideo = mongoose.models.HeroVideo || mongoose.model<IHeroVideo>('HeroVideo', HeroVideoSchema);

export default HeroVideo;
