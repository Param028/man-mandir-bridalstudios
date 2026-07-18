import mongoose, { Schema, Document } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  sku: string;
  productCode: string;
  category: string;
  subCategory?: string;
  designer?: string;
  occasion?: string[];
  description: string;
  shortDescription?: string;
  price: number;
  discountPrice?: number;
  costPrice?: number;
  gst: number;
  stockQuantity: number;
  sizes: string[];
  colors: string[];
  fabric?: string;
  careInstructions?: string;
  weight?: number;
  tags?: string[];
  seoTitle?: string;
  seoDescription?: string;
  metaKeywords?: string[];
  images: { url: string; isCover: boolean }[];
  status: 'Active' | 'Draft' | 'Archived' | 'Out of Stock';
}

const productSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    sku: { type: String, required: true, unique: true },
    productCode: { type: String, required: true },
    category: { type: String, required: true },
    subCategory: { type: String },
    designer: { type: String },
    occasion: [{ type: String }],
    description: { type: String, required: true },
    shortDescription: { type: String },
    price: { type: Number, required: true },
    discountPrice: { type: Number },
    costPrice: { type: Number },
    gst: { type: Number, required: true, default: 0 },
    stockQuantity: { type: Number, required: true, default: 0 },
    sizes: [{ type: String }],
    colors: [{ type: String }],
    fabric: { type: String },
    careInstructions: { type: String },
    weight: { type: Number },
    tags: [{ type: String }],
    seoTitle: { type: String },
    seoDescription: { type: String },
    metaKeywords: [{ type: String }],
    images: [
      {
        url: { type: String, required: true },
        isCover: { type: Boolean, default: false },
      },
    ],
    status: {
      type: String,
      enum: ['Active', 'Draft', 'Archived', 'Out of Stock'],
      default: 'Draft',
    },
  },
  {
    timestamps: true,
  }
);

const Product = mongoose.model<IProduct>('Product', productSchema);
export default Product;
