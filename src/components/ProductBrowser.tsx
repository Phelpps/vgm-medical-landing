import { Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Search, ImageOff, ShoppingCart, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/lib/cart-context";
import logo from "@/assets/vgm-logo-new.jpeg.asset.json";

export type Availability = "catalogo" | "locacao" | "fora_de_estoque";

type Product = {
  id: string;
  name: string;
  description: string;
  category: string;
  image_url: string | null;
  sort_order: number;
};

async function fetchProducts(availability: Availability): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select("id, name, description, category, image_url, sort_order")
    .contains("availabilities", [availability])
    .order("category", { ascending: true })
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });
  if (error) throw error;
  return (data ?? []) as Product[];
}

function useSignedImage(path: string | null) {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    let cancelled = false;
    if (!path) {
      setUrl(null);
      return;
    }
    supabase.storage
      .from("product-images")
      .createSignedUrl(path, 60 * 60)
      .then(({ data }) => {
        if (!cancelled) setUrl(data?.signedUrl ?? null);
      });
    return () => {
      cancelled = true;
    };
  }, [path]);
  return url;
}

function HoverZoomImage({ src, alt }: { src: string; alt: string }) {
  const [origin, setOrigin] = useState("50% 50%");
  const [zoomed, setZoomed] = useState(false);
  return (
    <div
      className="h-full w-full overflow-hidden"
      onMouseMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        setOrigin(
          `${((e.clientX - r.left) / r.width) * 100}% ${((e.clientY - r.top) / r.height) * 100}%`,
        );
      }}
      onMouseEnter={() => setZoomed(true)}
      onMouseLeave={() => setZoomed(false)}
    >
      <img
        src={src}
        alt={alt}
        loading="lazy"
        style={{ transformOrigin: origin }}
        className={`h-full w-full object-contain p-6 transition-transform duration-200 ease-out ${
          zoomed ? "scale-[2] cursor-zoom-in" : "scale-100"
        }`}
      />
    </div>
  );
}

function ProductCard({ p }: { p: Product }) {
  const imgUrl = useSignedImage(p.image_url);
  return (
    <Link
      to="/produto/$id"
      params={{ id: p.id }}
      className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-soft)] transition hover:-translate-y-0.5 hover:shadow-lg"
    >
      <div className="grid aspect-square place-items-center overflow-hidden bg-white">
        {p.image_url ? (
          imgUrl ? (
            <HoverZoomImage src={imgUrl} alt={p.name} />
          ) : (
            <div className="text-xs text-muted-foreground">Carregando…</div>
          )
        ) : (
          <ImageOff className="h-10 w-10 text-muted-foreground" />
        )}
      </div>

      <div className="border-t border-border bg-card p-4">
        <div className="text-xs font-semibold uppercase tracking-wider text-primary">
          {p.category}
        </div>
        <div className="mt-1 line-clamp-2 text-sm font-bold text-foreground">{p.name}</div>
        <div className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-primary">
          Ver detalhes <ChevronRight className="h-3.5 w-3.5" />
        </div>
      </div>
    </Link>
  );
}

export function ProductBrowser({
  availability,
  title,
  subtitle,
}: {
  availability: Availability;
  title: string;
  subtitle: string;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const { totalCount } = useCart();

  const { data: products = [], isLoading, error } = useQuery({
    queryKey: ["products", availability],
    queryFn: () => fetchProducts(availability),
  });

  const specialties = useMemo(() => {
    const map = new Map<string, number>();
    for (const p of products) map.set(p.category, (map.get(p.category) ?? 0) + 1);
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [products]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter((p) => {
      if (selected && p.category !== selected) return false;
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        (p.description ?? "").toLowerCase().includes(q)
      );
    });
  }, [products, selected, query]);

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
              to={availability === "locacao" ? "/catalogo" : "/locacao"}
              className="hidden items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold transition hover:bg-secondary sm:inline-flex"
            >
              {availability === "locacao" ? "Catálogo" : "Locação"}
            </Link>
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
              to="/"
              className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold transition hover:bg-secondary"
            >
              <ArrowLeft className="h-4 w-4" /> Início
            </Link>
          </div>
        </div>
      </header>

      <section className="border-b border-border/60 bg-[image:var(--gradient-hero)]">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:py-14">
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-brand-deep sm:text-4xl lg:text-5xl">
            {title}
          </h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">{subtitle}</p>
          <div className="relative mt-6 max-w-md">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar produto ou especialidade..."
              className="w-full rounded-full border border-border bg-white/90 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>
      </section>

      <main className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-soft)]">
            <h2 className="px-2 pb-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Especialidades
            </h2>
            <ul className="space-y-1">
              <li>
                <button
                  type="button"
                  onClick={() => setSelected(null)}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition ${
                    selected === null
                      ? "bg-primary/10 font-semibold text-primary"
                      : "text-foreground hover:bg-secondary"
                  }`}
                >
                  <span>Todas</span>
                  <span className="text-xs text-muted-foreground">{products.length}</span>
                </button>
              </li>
              {specialties.map(([name, count]) => (
                <li key={name}>
                  <button
                    type="button"
                    onClick={() => setSelected(name)}
                    className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition ${
                      selected === name
                        ? "bg-primary/10 font-semibold text-primary"
                        : "text-foreground hover:bg-secondary"
                    }`}
                  >
                    <span className="truncate">{name}</span>
                    <span className="ml-2 shrink-0 text-xs text-muted-foreground">{count}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        <section className="min-w-0">
          <div className="mb-5 flex items-baseline justify-between gap-4">
            <h2 className="text-xl font-bold tracking-tight">
              {selected ?? "Todas as especialidades"}
            </h2>
            <span className="text-sm text-muted-foreground">
              {filtered.length} {filtered.length === 1 ? "produto" : "produtos"}
            </span>
          </div>

          {isLoading && <p className="text-center text-muted-foreground">Carregando produtos…</p>}
          {error && <p className="text-center text-destructive">Erro ao carregar os produtos.</p>}
          {!isLoading && !error && filtered.length === 0 && (
            <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center">
              <p className="text-muted-foreground">
                {products.length === 0
                  ? "Nenhum produto cadastrado ainda."
                  : "Nenhum produto encontrado para esta busca."}
              </p>
            </div>
          )}

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((p) => (
              <ProductCard key={p.id} p={p} />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
