import mongoose, { Schema, Document } from 'mongoose';

export interface IGalleryItem extends Document {
  photoOfTheWeekId: string;
  url: string;
  publicId: string;
  caption?: string;
  type: 'image' | 'video';
  uploadedAt: Date;
}

const GalleryItemSchema = new Schema<IGalleryItem>(
  {
    photoOfTheWeekId: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
    publicId: {
      type: String,
      required: true,
    },
    caption: {
      type: String,
      default: '',
    },
    type: {
      type: String,
      enum: ['image', 'video'],
      default: 'image',
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

const GalleryItem = mongoose.models.GalleryItem || mongoose.model<IGalleryItem>('GalleryItem', GalleryItemSchema);

export default GalleryItem;
