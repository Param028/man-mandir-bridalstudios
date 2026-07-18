import { Request, Response } from 'express';
import Product from '../models/Product';

const mapProduct = (p: any) => {
  const pObj = p.toObject ? p.toObject() : p;
  const primaryImage = pObj.images?.[0]?.url
    ? (pObj.images[0].url.startsWith('http') ? pObj.images[0].url : `http://localhost:5000${pObj.images[0].url}`)
    : '';
  const secondaryImage = pObj.images?.[1]?.url
    ? (pObj.images[1].url.startsWith('http') ? pObj.images[1].url : `http://localhost:5000${pObj.images[1].url}`)
    : primaryImage;

  return {
    ...pObj,
    id: pObj._id ? pObj._id.toString() : pObj.id,
    active: pObj.status === 'Active',
    isNew: pObj.tags?.includes('new') || pObj.isNew || false,
    isBestSeller: pObj.tags?.includes('bestseller') || pObj.isBestSeller || false,
    rating: pObj.rating || 5.0,
    primaryImage,
    secondaryImage,
    images: pObj.images?.map((img: any) => ({
      ...img,
      url: img.url.startsWith('http') ? img.url : `http://localhost:5000${img.url}`,
    })) || [],
  };
};

// @desc    Get all products
// @route   GET /api/products
// @access  Public (or Admin depending on usage)
export const getProducts = async (req: Request, res: Response) => {
  try {
    const products = await Product.find({});
    const result = products.map(mapProduct);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get a single product by ID
// @route   GET /api/products/:id
// @access  Public
export const getProductById = async (req: Request, res: Response) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      res.json(mapProduct(product));
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
export const createProduct = async (req: Request, res: Response) => {
  try {
    const bodyData = { ...req.body }
    // FormData sends arrays as JSON strings — parse them back
    if (typeof bodyData.sizes === 'string') {
      try { bodyData.sizes = JSON.parse(bodyData.sizes) } catch { bodyData.sizes = [] }
    }
    const product = new Product(bodyData);
    
    // If files were uploaded, add their URLs to the product images array
    if (req.files && Array.isArray(req.files)) {
      const images = req.files.map((file: any, index: number) => ({
        url: `/uploads/products/${file.filename}`,
        isCover: index === 0,
      }));
      product.images = images;
    }

    const createdProduct = await product.save();
    res.status(201).json(mapProduct(createdProduct));
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
export const updateProduct = async (req: Request, res: Response) => {
  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      const bodyData = { ...req.body }
      if (typeof bodyData.sizes === 'string') {
        try { bodyData.sizes = JSON.parse(bodyData.sizes) } catch { bodyData.sizes = [] }
      }
      Object.assign(product, bodyData);

      // Handle new image uploads if provided
      if (req.files && Array.isArray(req.files) && req.files.length > 0) {
        const newImages = req.files.map((file: any) => ({
          url: `/uploads/products/${file.filename}`,
          isCover: false,
        }));
        product.images = [...product.images, ...newImages];
      }

      const updatedProduct = await product.save();
      res.json(mapProduct(updatedProduct));
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      await product.deleteOne();
      res.json({ message: 'Product removed' });
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
