CREATE TYPE public.product_availability AS ENUM ('catalogo', 'locacao', 'fora_de_estoque');

ALTER TABLE public.products
  ADD COLUMN availability public.product_availability NOT NULL DEFAULT 'catalogo';

UPDATE public.products SET availability = 'catalogo';