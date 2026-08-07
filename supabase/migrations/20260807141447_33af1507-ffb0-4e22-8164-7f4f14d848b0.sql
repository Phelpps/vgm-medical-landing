ALTER TABLE public.products ADD COLUMN IF NOT EXISTS availabilities public.product_availability[] NOT NULL DEFAULT '{catalogo}'::public.product_availability[];

UPDATE public.products SET availabilities = ARRAY[availability]::public.product_availability[];