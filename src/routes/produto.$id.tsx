import { createFileRoute, Link, notFound, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ImageOff, Minus, Plus, ShoppingCart, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/lib/cart-context";
import logo from "@/assets/vgm-logo-new.jpeg.asset.json";

export const Route = createFileRoute("/produto/$id")({
  head: ({ params }) => ({
    meta: [
      { title: `Produto — VGM Medical` },
      { name: "description", content: `Detalhes do produto ${params.id} no catálogo VGM Medical.` },
    ],
  }),
  component: ProductPage,
  errorComponent: ({ error }) => (
    <div className="grid min-h-screen place-items-center px-4 text-center">
      <div>
        <h1 className="text-2xl font-bold">Erro ao carregar produto</h1>
        <p className="mt-2 text-muted-foreground">{error.message}</p>
        <Link to="/catalogo" className="mt-6 inline-flex rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground">
          Voltar ao catálogo
        </Link>
      </div>
    </div>
  ),
  notFoundComponent: () => (
    <div className="grid min-h-screen place-items-center px-4 text-center">
      <div>
        <h1 className="text-2xl font-bold">Produto não encontrado</h1>
        <Link to="/catalogo" className="mt-6 inline-flex rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground">
          Voltar ao catálogo
        </Link>
      </div>
    </div>
  ),
});

function ZoomImage({ src, alt }: { src: string; alt: string }) {
  const [origin, setOrigin] = useState("50% 50%");
  const [zoomed, setZoomed] = useState(false);
  return (
    <div
      className="h-full w-full overflow-hidden"
      onMouseMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - r.left) / r.width) * 100;
        const y = ((e.clientY - r.top) / r.height) * 100;
        setOrigin(`${x}% ${y}%`);
      }}
      onMouseEnter={() => setZoomed(true)}
      onMouseLeave={() => setZoomed(false)}
    >
      <img
        src={src}
        alt={alt}
        style={{ transformOrigin: origin }}
        className={`h-full w-full object-contain p-8 transition-transform duration-200 ease-out ${
          zoomed ? "scale-[2.2] cursor-zoom-in" : "scale-100"
        }`}
      />
    </div>
  );
}

type ProductDetail = {

  id: string;
  name: string;
  description: string;
  category: string;
  image_url: string | null;
  image_urls: string[];
  additional_info: string;
};

function useSignedImages(paths: string[]) {
  const [urls, setUrls] = useState<Record<string, string>>({});
  const key = paths.join("|");
  useEffect(() => {
    let cancelled = false;
    if (paths.length === 0) {
      setUrls({});
      return;
    }
    supabase.storage
      .from("product-images")
      .createSignedUrls(paths, 60 * 60)
      .then(({ data }) => {
        if (cancelled || !data) return;
        const map: Record<string, string> = {};
        data.forEach((d) => {
          if (d.path && d.signedUrl) map[d.path] = d.signedUrl;
        });
        setUrls(map);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  return urls;
}

function ProductPage() {
  const { id } = Route.useParams();
  const router = useRouter();
  const { add, increment, decrement, getQuantity, totalCount } = useCart();

  const { data: product, isLoading, error } = useQuery({
    queryKey: ["product", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("id, name, description, category, image_url, image_urls, additional_info")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      if (!data) throw notFound();
      return data as ProductDetail;
    },
  });

  const galleryPaths = product
    ? [
        ...(product.image_url ? [product.image_url] : []),
        ...((product.image_urls ?? []).filter((p) => p !== product.image_url)),
      ]
    : [];
  const signed = useSignedImages(galleryPaths);
  const [activePath, setActivePath] = useState<string | null>(null);
  const currentPath = activePath ?? galleryPaths[0] ?? null;
  const imgUrl = currentPath ? signed[currentPath] ?? null : null;
  const qty = product ? getQuantity(product.id) : 0;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2">
            <img
              src={logo.url}
              alt="VGM Medical"
              width={40}
              height={40}
              className="h-10 w-10 rounded-full object-cover shadow-[var(--shadow-soft)]"
            />
            <div className="leading-tight">
              <div className="text-sm font-bold tracking-tight">VGM Medical</div>
              <div className="text-[11px] text-muted-foreground">Equipamentos & Instrumentais</div>
            </div>
          </Link>
          <div className="flex items-center gap-2">
            <Link
              to="/carrinho"
              className="relative inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold transition hover:bg-secondary"
            >
              <ShoppingCart className="h-4 w-4" />
              <span className="hidden sm:inline">Carrinho</span>
              {totalCount > 0 && (
                <span className="grid h-5 min-w-[20px] place-items-center rounded-full bg-primary px-1 text-[11px] font-bold text-primary-foreground">
                  {totalCount}
                </span>
              )}
            </Link>
            <Link
              to="/catalogo"
              className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold transition hover:bg-secondary"
            >
              <ArrowLeft className="h-4 w-4" /> Catálogo
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        {isLoading && <p className="text-center text-muted-foreground">Carregando produto…</p>}
        {error && (
          <div className="text-center">
            <p className="text-destructive">Erro ao carregar.</p>
            <button
              onClick={() => router.invalidate()}
              className="mt-3 rounded-full border border-border px-4 py-2 text-sm"
            >
              Tentar novamente
            </button>
          </div>
        )}
        {product && (
          <>
            <nav className="mb-6 flex items-center gap-1 text-xs text-muted-foreground">
              <Link to="/catalogo" className="hover:text-primary">
                Catálogo
              </Link>
              <ChevronRight className="h-3 w-3" />
              <span className="text-foreground">{product.category}</span>
              <ChevronRight className="h-3 w-3" />
              <span className="truncate text-foreground">{product.name}</span>
            </nav>

            <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
              <div className="flex flex-col gap-3">
                <div className="grid aspect-square place-items-center overflow-hidden rounded-3xl border border-border bg-white shadow-[var(--shadow-soft)]">
                  {galleryPaths.length > 0 ? (
                    imgUrl ? (
                      <ZoomImage src={imgUrl} alt={product.name} />
                    ) : (
                      <div className="text-sm text-muted-foreground">Carregando imagem…</div>
                    )
                  ) : (
                    <ImageOff className="h-12 w-12 text-muted-foreground" />
                  )}
                </div>

                {galleryPaths.length > 1 && (
                  <div className="flex flex-wrap gap-2">
                    {galleryPaths.map((path) => {
                      const isActive = currentPath === path;
                      return (
                        <button
                          key={path}
                          type="button"
                          onClick={() => setActivePath(path)}
                          className={`h-16 w-16 shrink-0 overflow-hidden rounded-lg border bg-white transition ${
                            isActive
                              ? "border-primary ring-2 ring-primary/30"
                              : "border-border hover:border-primary/60"
                          }`}
                          aria-label="Ver imagem"
                        >
                          {signed[path] ? (
                            <img src={signed[path]} alt="" className="h-full w-full object-contain" />
                          ) : (
                            <div className="grid h-full w-full place-items-center text-[10px] text-muted-foreground">…</div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="flex min-w-0 flex-col">
                <span className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
                  {product.category}
                </span>
                <h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">
                  {product.name}
                </h1>
                {product.description && (
                  <p className="mt-4 text-base text-muted-foreground">{product.description}</p>
                )}

                <div className="mt-6">
                  {qty === 0 ? (
                    <button
                      type="button"
                      onClick={() =>
                        add({ id: product.id, name: product.name, category: product.category })
                      }
                      className="inline-flex items-center gap-2 rounded-full bg-[image:var(--gradient-primary)] px-6 py-3 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-soft)] transition hover:opacity-90"
                    >
                      <Plus className="h-4 w-4" /> Adicionar ao carrinho
                    </button>
                  ) : (
                    <div className="inline-flex items-center gap-2 rounded-full border border-border bg-white p-1 shadow-[var(--shadow-soft)]">
                      <button
                        type="button"
                        onClick={() => decrement(product.id)}
                        className="grid h-10 w-10 place-items-center rounded-full text-muted-foreground transition hover:bg-secondary hover:text-foreground"
                        aria-label="Diminuir"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="min-w-[2ch] text-center text-sm font-bold">{qty}</span>
                      <button
                        type="button"
                        onClick={() => increment(product.id)}
                        className="grid h-10 w-10 place-items-center rounded-full bg-[image:var(--gradient-primary)] text-primary-foreground transition hover:opacity-90"
                        aria-label="Aumentar"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>

                {product.additional_info && product.additional_info.trim().length > 0 && (
                  <section className="mt-10 rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-soft)]">
                    <h2 className="text-base font-bold tracking-tight">Informações adicionais</h2>
                    <div className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                      {product.additional_info}
                    </div>
                  </section>
                )}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
