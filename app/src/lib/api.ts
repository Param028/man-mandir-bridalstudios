import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from './supabase';

// --- Products API ---

export const getProducts = async () => {
  const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  // Map Supabase id to _id for backward compatibility in components
  return data.map(p => ({ ...p, _id: p.id }));
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

// Utility for file uploads
// Utility for file uploads
import * as tus from 'tus-js-client';

export const uploadFile = async (bucket: string, file: File, onProgress?: (progress: number) => void) => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}-${Math.random()}.${fileExt}`;
  const filePath = `${fileName}`;

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
