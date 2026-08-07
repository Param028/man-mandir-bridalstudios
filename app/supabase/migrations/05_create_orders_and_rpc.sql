-- Create orders table
CREATE TABLE public.orders (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    customer_name text NOT NULL,
    customer_email text NOT NULL,
    customer_phone text NOT NULL,
    shipping_address text NOT NULL,
    city text NOT NULL,
    state text NOT NULL,
    pincode text NOT NULL,
    total_amount numeric NOT NULL,
    payment_method text NOT NULL,
    payment_status text DEFAULT 'pending',
    order_status text DEFAULT 'processing',
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create order items table
CREATE TABLE public.order_items (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id uuid REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
    product_id uuid REFERENCES public.products(id) ON DELETE SET NULL,
    product_name text NOT NULL,
    size text,
    color text,
    quantity integer NOT NULL,
    price numeric NOT NULL
);

-- Enable RLS
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users (admin) to read/manage orders
CREATE POLICY "Admin full access orders" ON public.orders FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access order_items" ON public.order_items FOR ALL USING (auth.role() = 'authenticated');

-- Create RPC function to place order and decrement stock atomically
CREATE OR REPLACE FUNCTION place_order(
    p_customer_name text,
    p_customer_email text,
    p_customer_phone text,
    p_shipping_address text,
    p_city text,
    p_state text,
    p_pincode text,
    p_total_amount numeric,
    p_payment_method text,
    p_items jsonb
) RETURNS uuid AS $$
DECLARE
    new_order_id uuid;
    item record;
    current_sizes text[];
    new_sizes text[];
    s text;
    stock_str text;
    current_stock integer;
    new_stock integer;
BEGIN
    -- Insert into orders table
    INSERT INTO public.orders (
        customer_name, customer_email, customer_phone, shipping_address, city, state, pincode, total_amount, payment_method
    ) VALUES (
        p_customer_name, p_customer_email, p_customer_phone, p_shipping_address, p_city, p_state, p_pincode, p_total_amount, p_payment_method
    ) RETURNING id INTO new_order_id;

    -- Iterate through the JSON items
    FOR item IN SELECT * FROM jsonb_to_recordset(p_items) AS x(product_id uuid, product_name text, size text, color text, quantity integer, price numeric)
    LOOP
        -- Insert into order items
        INSERT INTO public.order_items (
            order_id, product_id, product_name, size, color, quantity, price
        ) VALUES (
            new_order_id, item.product_id, item.product_name, item.size, item.color, item.quantity, item.price
        );

        -- Decrement stock in products table
        -- Find the product's current sizes array
        SELECT size INTO current_sizes FROM public.products WHERE id = item.product_id;
        
        IF current_sizes IS NOT NULL THEN
            new_sizes := '{}';
            current_stock := 10; -- fallback stock if not defined
            
            -- Process each element in current_sizes
            FOREACH s IN ARRAY current_sizes LOOP
                IF s LIKE 'STOCK:%' THEN
                    stock_str := split_part(s, ':', 2);
                    current_stock := CAST(stock_str AS integer);
                ELSE
                    new_sizes := array_append(new_sizes, s);
                END IF;
            END LOOP;

            -- Calculate new stock
            new_stock := current_stock - item.quantity;
            IF new_stock < 0 THEN
                new_stock := 0;
            END IF;

            -- Append the new stock to sizes array
            new_sizes := array_append(new_sizes, 'STOCK:' || new_stock);

            -- Update product
            UPDATE public.products 
            SET 
                size = new_sizes,
                is_available = CASE WHEN new_stock > 0 THEN true ELSE false END
            WHERE id = item.product_id;
        END IF;

    END LOOP;

    RETURN new_order_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
