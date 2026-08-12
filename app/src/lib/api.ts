import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from './supabase';

// --- Products API ---

export const getProducts = async () => {
  const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  // Map Supabase fields to frontend Product interface for backward compatibility
  return data.map(p => {
    const rawSizes = p.size || p.sizes || [];
    const stockStr = rawSizes.find((s: any) => typeof s === 'string' && s.startsWith('STOCK:'));
    const stock_quantity = stockStr ? Number(stockStr.split(':')[1]) : (p.is_available ? 10 : 0);
    const filteredSizes = rawSizes.filter((s: any) => typeof s !== 'string' || !s.startsWith('STOCK:'));

    return {
      ...p,
      _id: p.id,
      name: p.title || p.name || 'Unnamed Product',
      primaryImage: p.image_url || p.primaryImage || '/assets/photo-week-1.jpg',
      secondaryImage: p.secondary_image_url || p.secondaryImage || p.image_url || '/assets/photo-week-2.jpg',
      active: p.is_available ?? true,
      sizes: filteredSizes,
      stock_quantity: stock_quantity,
      category_id: p.category_id,
      subcategory_id: p.subcategory_id,
      images: p.images || [],
    };
  });
};

export const createProduct = async (productData: any) => {
  const { data, error } = await supabase.from('products').insert([productData]).select();
  if (error) throw error;
  return data;
};

export const updateProduct = async ({ id, productData }: { id: string; productData: any }) => {
  const { data, error } = await supabase.from('products').update(productData).eq('id', id).select();
  if (error) throw error;
  return data;
};

export const deleteProduct = async (id: string) => {
  const { data, error } = await supabase.from('products').delete().eq('id', id);
  if (error) throw error;
  return data;
};

// --- Categories API ---

export const getCategories = async () => {
  const { data, error } = await supabase.from('categories').select('*').order('created_at', { ascending: true });
  if (error) throw error;
  return data;
};

export const createCategory = async (categoryData: any) => {
  const { data, error } = await supabase.from('categories').insert([categoryData]).select();
  if (error) throw error;
  return data;
};

export const updateCategory = async ({ id, categoryData }: { id: string; categoryData: any }) => {
  const { data, error } = await supabase.from('categories').update(categoryData).eq('id', id).select();
  if (error) throw error;
  return data;
};

export const deleteCategory = async (id: string) => {
  const { data, error } = await supabase.from('categories').delete().eq('id', id);
  if (error) throw error;
  return data;
};

// --- Subcategories API ---

export const getSubcategories = async (categoryId?: string) => {
  let query = supabase.from('subcategories').select('*').order('created_at', { ascending: true });
  if (categoryId) {
    query = query.eq('category_id', categoryId);
  }
  const { data, error } = await query;
  if (error) throw error;
  return data;
};

export const createSubcategory = async (subcategoryData: any) => {
  const { data, error } = await supabase.from('subcategories').insert([subcategoryData]).select();
  if (error) throw error;
  return data;
};

export const updateSubcategory = async ({ id, subcategoryData }: { id: string; subcategoryData: any }) => {
  const { data, error } = await supabase.from('subcategories').update(subcategoryData).eq('id', id).select();
  if (error) throw error;
  return data;
};

export const deleteSubcategory = async (id: string) => {
  const { data, error } = await supabase.from('subcategories').delete().eq('id', id);
  if (error) throw error;
  return data;
};

// React Query Hooks

export const useProducts = () => {
  return useQuery({
    queryKey: ['products'],
    queryFn: getProducts,
  });
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
};

export const placeOrder = async (orderData: any) => {
  const { data, error } = await supabase.rpc('place_order', orderData);
  if (error) throw error;
  return data;
};

export const usePlaceOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: placeOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
};

export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
  });
};

export const useCreateCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
};

export const useUpdateCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
};

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['subcategories'] });
    },
  });
};

export const useSubcategories = (categoryId?: string) => {
  return useQuery({
    queryKey: ['subcategories', categoryId],
    queryFn: () => getSubcategories(categoryId),
  });
};

export const useCreateSubcategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createSubcategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subcategories'] });
    },
  });
};

export const useUpdateSubcategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateSubcategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subcategories'] });
    },
  });
};

export const useDeleteSubcategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteSubcategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subcategories'] });
    },
  });
};

// Utility for file uploads
// Utility for file uploads
import * as tus from 'tus-js-client';

export const uploadFile = async (bucket: string, file: File, onProgress?: (progress: number) => void) => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}-${Math.random()}.${fileExt}`;
  const filePath = `${fileName}`;

  // For small files (like images for products and gallery), use standard upload
  if (bucket !== 'videos') {
    const { error } = await supabase.storage.from(bucket).upload(filePath, file, {
      cacheControl: '3600',
      upsert: true
    });

    if (error) {
      console.error('File upload failed:', error);
      throw error;
    }

    const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
    return data.publicUrl;
  }

  // For large files (like videos), use TUS client for resumable uploads
  return new Promise<string>(async (resolve, reject) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      if (!supabaseUrl) throw new Error('Supabase URL not found');
      
      const endpoint = `${supabaseUrl}/storage/v1/upload/resumable`;
      
      const upload = new tus.Upload(file, {
        endpoint,
        retryDelays: [0, 3000, 5000, 10000, 20000],
        headers: {
          authorization: `Bearer ${session?.access_token || import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'x-upsert': 'true',
        },
        uploadDataDuringCreation: true,
        removeFingerprintOnSuccess: true,
        metadata: {
          bucketName: bucket,
          objectName: filePath,
          contentType: file.type || 'application/octet-stream',
          cacheControl: '3600',
        },
        onSuccess: () => {
          const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
          resolve(data.publicUrl);
        },
        onError: (error) => {
          console.error('TUS upload failed:', error);
          reject(error);
        },
        onProgress: (bytesUploaded, bytesTotal) => {
          if (onProgress) {
            const percentage = Math.round((bytesUploaded / bytesTotal) * 100);
            onProgress(percentage);
          }
        }
      });

      // Start the upload
      upload.findPreviousUploads().then((previousUploads) => {
        if (previousUploads.length) {
          upload.resumeFromPreviousUpload(previousUploads[0]);
        }
        upload.start();
      });
    } catch (error) {
      console.error('File upload failed:', error);
      reject(error);
    }
  });
};
