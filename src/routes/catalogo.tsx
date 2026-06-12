import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ChevronDown, MessageCircle, Search, ImageOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const WHATSAPP_NUMBER = "556298341044";

export const Route = createFileRoute("/catalogo")({
  head: () => ({
    meta: [
      { title: "Catálogo de Pinças Médicas — VGM Medical" },
      {
        name: "description",
        content:
          "Catálogo completo de pinças cirúrgicas e instrumentos médicos da VGM Medical em Goiânia, Goiás.",
      },
    ],
  }),
  component: CatalogPage,
});

type Product = {
  id: string;
  name: string;
  description: string;
  category: string;
  image_url: string | null;
  sort_order: number;
};

function whatsappLink(message: string) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

async function fetchProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select("id, name, description, category, image_url, sort_order")
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

function ProductRow({ p, isOpen, onToggle }: { p: Product; isOpen: boolean; onToggle: () => void }) {
  const imgUrl = useSignedImage(isOpen ? p.image_url : null);
  return (
    <li>
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition hover:bg-secondary/50"
        aria-expanded={isOpen}
      >
        <div className="min-w-0">
          <div className="text-sm font-semibold text-foreground">{p.name}</div>
          {p.description && (
            <div className="mt-0.5 truncate text-xs text-muted-foreground">{p.description}</div>
          )}
        </div>
        <ChevronDown
          className={`h-5 w-5 shrink-0 text-muted-foreground transition-transform ${isOpen ? "rotate-180 text-primary" : ""}`}
        />
      </button>
      {isOpen && (
        <div className="grid gap-5 border-t border-border bg-secondary/30 p-5 sm:grid-cols-[220px_1fr] sm:items-center">
          <div className="grid h-[200px] place-items-center overflow-hidden rounded-xl border border-border bg-white">
            {p.image_url ? (
              imgUrl ? (
                <img
                  src={imgUrl}
                  alt={p.name}
                  loading="lazy"
                  className="h-full w-full object-contain p-4"
                />
              ) : (
                <div className="text-xs text-muted-foreground">Carregando…</div>
              )
            ) : (
              <ImageOff className="h-8 w-8 text-muted-foreground" />
            )}
          </div>
          <div>
            <div className="text-base font-bold">{p.name}</div>
            {p.description && <p className="mt-1 text-sm text-muted-foreground">{p.description}</p>}
            <a
              href={whatsappLink(`Olá! Tenho interesse no produto: ${p.name}. Pode me enviar mais informações?`)}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2 rounded-full bg-[image:var(--gradient-primary)] px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-soft)] transition hover:opacity-90"
            >
              <MessageCircle className="h-4 w-4" /> Consultar no WhatsApp
            </a>
          </div>
        </div>
      )}
    </li>
  );
}

function CatalogPage() {
  const [openId, setOpenId] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const { data: products = [], isLoading, error } = useQuery({
    queryKey: ["products"],
    queryFn: fetchProducts,
  });

  const filtered = useMemo(
    () =>
      products.filter(
        (p) =>
          p.name.toLowerCase().includes(query.toLowerCase()) ||
          p.category.toLowerCase().includes(query.toLowerCase()),
      ),
    [products, query],
  );

  const grouped = useMemo(
    () =>
      filtered.reduce<Record<string, Product[]>>((acc, p) => {
        (acc[p.category] ||= []).push(p);
        return acc;
      }, {}),
    [filtered],
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-[image:var(--gradient-primary)] text-primary-foreground shadow-[var(--shadow-soft)]">
              <span className="text-sm font-extrabold tracking-tight">VGM</span>
            </div>
            <div className="leading-tight">
              <div className="text-sm font-bold tracking-tight">VGM Medical</div>
              <div className="text-[11px] text-muted-foreground">Goiânia · GO</div>
            </div>
          </Link>
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold transition hover:bg-secondary"
          >
            <ArrowLeft className="h-4 w-4" /> Início
          </Link>
        </div>
      </header>

      <section className="border-b border-border/60 bg-[image:var(--gradient-hero)]">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:py-16">
          <span className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Catálogo completo</span>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
            Nossa linha de pinças médicas
          </h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            Clique no nome do produto para visualizar a imagem. Solicite orçamento direto pelo WhatsApp.
          </p>
          <div className="relative mt-6 max-w-md">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar produto ou categoria..."
              className="w-full rounded-full border border-border bg-white/90 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        {isLoading && <p className="text-center text-muted-foreground">Carregando produtos…</p>}
        {error && <p className="text-center text-destructive">Erro ao carregar o catálogo.</p>}
        {!isLoading && !error && Object.keys(grouped).length === 0 && (
          <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center">
            <p className="text-muted-foreground">
              {products.length === 0
                ? "Nenhum produto cadastrado ainda."
                : "Nenhum produto encontrado para esta busca."}
            </p>
          </div>
        )}
        {Object.entries(grouped).map(([category, items]) => (
          <section key={category} className="mb-10">
            <h2 className="mb-4 text-lg font-bold tracking-tight text-primary">{category}</h2>
            <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-soft)]">
              {items.map((p) => (
                <ProductRow
                  key={p.id}
                  p={p}
                  isOpen={openId === p.id}
                  onToggle={() => setOpenId(openId === p.id ? null : p.id)}
                />
              ))}
            </ul>
          </section>
        ))}
      </main>
    </div>
  );
}
