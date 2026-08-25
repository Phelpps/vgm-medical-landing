import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import heroInstruments from "@/assets/surgical-instruments-hero.jpg.asset.json";
import { useQuery } from "@tanstack/react-query";
import {
  ShieldCheck,
  Truck,
  Award,
  ArrowRight,
  Check,
  ImageOff,
  Wrench,
  Package,
  Star,
} from "lucide-react";
import surgicalImage from "@/assets/surgical-room.jpg";
import logo from "@/assets/vgm-logo-new.jpeg.asset.json";
import russerLogo from "@/assets/russer-logo.png.asset.json";
import endoctusLogo from "@/assets/endoctus-logo.png.asset.json";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "VGM Medical — Equipamentos e Instrumentais Médicos" },
      {
        name: "description",
        content:
          "VGM Medical: equipamentos e instrumentais médicos com +20 anos de experiência, +2000 produtos e assistência técnica especializada.",
      },
      { name: "keywords", content: "equipamentos médicos, instrumentais cirúrgicos, assistência técnica médica, VGM Medical" },
      { property: "og:title", content: "VGM Medical — Equipamentos e Instrumentais Médicos" },
      { property: "og:description", content: "Equipamentos e instrumentais médicos com qualidade certificada e assistência técnica especializada." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/" },
      { property: "og:image", content: surgicalImage },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: Index,
});

type CatalogProduct = {
  id: string;
  name: string;
  description: string;
  category: string;
  image_url: string | null;
  sort_order: number;
  availabilities: string[] | null;
  featured: boolean | null;
};

async function fetchCatalogProducts(): Promise<CatalogProduct[]> {
  const { data, error } = await supabase
    .from("products")
    .select("id, name, description, category, image_url, sort_order, availabilities, featured")
    .order("category", { ascending: true })
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });
  if (error) throw error;
  return (data ?? []) as CatalogProduct[];
}

const HOME_MAX_ITEMS = 8;

function pickHomeProducts(products: CatalogProduct[], availability: string): CatalogProduct[] {
  const inGroup = products.filter((p) => (p.availabilities ?? ["catalogo"]).includes(availability));
  const featured = inGroup.filter((p) => p.featured);
  const rest = inGroup.filter((p) => !p.featured);
  const byCategory = new Map<string, CatalogProduct>();
  for (const p of rest) if (!byCategory.has(p.category)) byCategory.set(p.category, p);
  return [...featured, ...byCategory.values()].slice(0, HOME_MAX_ITEMS);
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

function useSignedImages(paths: string[]) {
  const key = paths.join("|");
  const [urls, setUrls] = useState<string[]>([]);
  useEffect(() => {
    let cancelled = false;
    if (paths.length === 0) {
      setUrls([]);
      return;
    }
    Promise.all(
      paths.map((p) =>
        supabase.storage.from("product-images").createSignedUrl(p, 60 * 60).then(({ data }) => data?.signedUrl ?? null),
      ),
    ).then((results) => {
      if (!cancelled) setUrls(results.filter((u): u is string => !!u));
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  return urls;
}


function Index() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <main>
        <Hero />
        <Trust />
        <Stats />
        <Catalog />
        <Rental />
        <Partners />
        <ServiceCTA />
      </main>
      <SiteFooter />
    </div>
  );
}

function useHeroPaths(): string[] {
  const { data } = useQuery({
    queryKey: ["site_setting", "hero_image_paths_combined"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_settings")
        .select("key,value")
        .in("key", ["hero_image_paths", "hero_image_path"]);
      if (error) throw error;
      const rows = (data ?? []) as { key: string; value: string | null }[];
      const multi = rows.find((r) => r.key === "hero_image_paths")?.value ?? null;
      if (multi) {
        try {
          const parsed = JSON.parse(multi);
          if (Array.isArray(parsed)) return parsed.filter((v): v is string => typeof v === "string");
        } catch {
          return [multi];
        }
      }
      const legacy = rows.find((r) => r.key === "hero_image_path")?.value ?? null;
      return legacy ? [legacy] : [];
    },
  });
  return data ?? [];
}

function Hero() {
  const paths = useHeroPaths();
  const signedUrls = useSignedImages(paths);
  const slides = signedUrls.length > 0 ? signedUrls : [heroInstruments.url];
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (slides.length <= 1) return;
    const id = window.setInterval(() => {
      setIdx((i) => (i + 1) % slides.length);
    }, 15000);
    return () => window.clearInterval(id);
  }, [slides.length]);

  useEffect(() => {
    setIdx(0);
  }, [slides.length]);

  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10" style={{ background: "var(--gradient-hero)" }} />
      <div className="absolute inset-0 -z-10 opacity-70 [background-image:radial-gradient(circle_at_top_right,oklch(0.88_0.045_195/0.5),transparent_55%),radial-gradient(circle_at_bottom_left,oklch(0.28_0.025_200/0.18),transparent_55%)]" />

      {/* Full-width image carousel */}
      <div className="relative h-[60vh] min-h-[480px] w-full sm:h-[65vh] sm:min-h-[560px]">
        {slides.map((src, i) => (
          <img
            key={src + i}
            src={src}
            alt="Equipamentos e instrumentais cirúrgicos VGM Medical"
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${i === idx ? "opacity-100" : "opacity-0"}`}
          />
        ))}
        <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/45 to-transparent" />
      </div>

      {/* Text overlay */}
      <div className="absolute inset-0 flex items-center">
        <div className="mx-auto flex w-full max-w-7xl items-center px-4 py-16 sm:px-6 lg:py-24">
          <div className="max-w-3xl">
            <h1 className="mt-5 text-4xl font-extrabold leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-6xl">
              Equipamentos e instrumentais para{" "}
              <span className="bg-[image:var(--gradient-primary)] bg-clip-text text-transparent">videocirurgia</span> e linha convencional.
            </h1>
            <p className="mt-5 max-w-2xl text-base text-white/90 sm:text-lg">
              A VGM Medical fornece equipamentos e instrumentais cirúrgicos para hospitais, clínicas e profissionais da saúde, marcas reconhecidas e assistência técnica especializada.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/catalogo"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[image:var(--gradient-primary)] px-7 py-3.5 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-glow)] transition hover:scale-[1.02]"
              >
                Ver catálogo <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/contato"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/30 bg-white/20 px-7 py-3.5 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/30"
              >
                Falar com a equipe
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap gap-6 text-sm text-white/80">
              {["Marcas parceiras", "Assistência técnica", "Entrega para todo Brasil"].map((t) => (
                <div key={t} className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" /> {t}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Logo positioned at bottom-right of hero — hidden on mobile/tablet to avoid covering CTAs */}
      <div className="absolute bottom-4 right-4 z-10 hidden lg:block lg:bottom-10 lg:right-8">
        <img
          src={logo.url}
          alt="VGM Medical"
          className="h-auto w-full max-w-[140px] rounded-full object-contain drop-shadow-2xl lg:max-w-[280px]"
        />
      </div>

      {slides.length > 1 && (
        <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 gap-1.5">
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Ir para imagem ${i + 1}`}
              onClick={() => setIdx(i)}
              className={`h-2 rounded-full transition-all ${i === idx ? "w-6 bg-white" : "w-2 bg-white/60 hover:bg-white/80"}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}


function Trust() {
  const items = [
    { icon: ShieldCheck, title: "Qualidade certificada", desc: "Equipamentos e instrumentais de marcas reconhecidas." },
    { icon: Wrench, title: "Assistência técnica", desc: "Suporte e manutenção especializada." },
    { icon: Truck, title: "Entrega rápida", desc: "Logística para todo o Brasil." },
  ];
  return (
    <section className="border-y border-border/60 bg-secondary/40">
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-10 sm:grid-cols-3 sm:px-6">
        {items.map((it) => (
          <div key={it.title} className="flex items-start gap-3">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[image:var(--gradient-primary)] text-primary-foreground">
              <it.icon className="h-5 w-5" />
            </div>
            <div>
              <div className="text-sm font-semibold">{it.title}</div>
              <div className="text-sm text-muted-foreground">{it.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function Stats() {
  const stats = [
    { icon: Package, n: "+2000", l: "produtos no catálogo" },
    { icon: Wrench, n: "Assistência", l: "técnica especializada" },
    { icon: Award, n: "Marcas", l: "parceiras reconhecidas" },
  ];
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <div key={s.l} className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-soft)]">
            <s.icon className="h-6 w-6 text-primary" />
            <div className="mt-3 bg-[image:var(--gradient-primary)] bg-clip-text text-2xl font-extrabold text-transparent">
              {s.n}
            </div>
            <div className="mt-1 text-xs text-muted-foreground">{s.l}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function CategoryCard({ product }: { product: CatalogProduct }) {
  const imgUrl = useSignedImage(product.image_url);
  return (
    <Link
      to="/produto/$id"
      params={{ id: product.id }}
      className="group overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-soft)] transition hover:-translate-y-1 hover:shadow-[var(--shadow-card)]"
    >
      <div className="relative grid aspect-square place-items-center overflow-hidden bg-secondary/50">
        {product.featured && (
          <span className="absolute right-3 top-3 z-10 grid h-8 w-8 place-items-center rounded-full bg-white/90 shadow-[var(--shadow-soft)]">
            <Star className="h-4 w-4 fill-amber-400 text-amber-500" />
          </span>
        )}
        {product.image_url ? (
          imgUrl ? (
            <img src={imgUrl} alt={product.name} loading="lazy"
              className="h-full w-full object-contain p-6 transition duration-500 group-hover:scale-105" />
          ) : (
            <div className="text-xs text-muted-foreground">Carregando…</div>
          )
        ) : (
          <ImageOff className="h-10 w-10 text-muted-foreground" />
        )}
      </div>
      <div className="border-t border-border p-5">
        <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-primary">{product.category}</span>
        <h3 className="mt-1 text-base font-bold tracking-tight">{product.name}</h3>
        {product.description && (
          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{product.description}</p>
        )}
        <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary transition-all group-hover:gap-2.5">
          Ver produto <ArrowRight className="h-4 w-4" />
        </span>
      </div>
    </Link>
  );
}

function Catalog() {
  const { data: products = [], isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: fetchCatalogProducts,
  });

  const highlights = useMemo(() => pickHomeProducts(products, "catalogo"), [products]);


  return (
    <section id="catalogo" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
      <div className="mb-12 max-w-2xl">
        <span className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Catálogo</span>
        <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
          Soluções integradas em videocirurgia e instrumentais convencionais.
        </h2>
        <p className="mt-3 text-muted-foreground">
          Conheça nossas especialidades. Acesse o catálogo completo para ver todos os produtos.
        </p>
      </div>
      {isLoading ? (
        <p className="text-center text-muted-foreground">Carregando produtos…</p>
      ) : highlights.length === 0 ? (
        <p className="text-center text-muted-foreground">Catálogo em breve.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {highlights.map((p) => (
            <CategoryCard key={p.id} product={p} />
          ))}
        </div>
      )}
      <div className="mt-10 text-center">
        <Link
          to="/catalogo"
          className="inline-flex items-center gap-2 rounded-full bg-[image:var(--gradient-primary)] px-7 py-3.5 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-soft)] transition hover:opacity-90"
        >
          Ver catálogo completo <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}

function Rental() {
  const { data: products = [], isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: fetchCatalogProducts,
  });

  const rentalHighlights = useMemo(() => pickHomeProducts(products, "locacao"), [products]);

  return (
    <section id="locacao" className="border-y border-border bg-secondary/30 py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mb-12 max-w-2xl">
          <span className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Locação</span>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
            Equipamentos e instrumentais disponíveis para locação.
          </h2>
          <p className="mt-3 text-muted-foreground">
            Flexibilidade para procedimentos pontuais e demandas temporárias, com suporte técnico VGM.
          </p>
        </div>

        {isLoading ? (
          <p className="text-center text-muted-foreground">Carregando locações…</p>
        ) : rentalHighlights.length === 0 ? (
          <p className="text-center text-muted-foreground">Itens para locação em breve.</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {rentalHighlights.map((p) => (
              <CategoryCard key={p.id} product={p} />
            ))}
          </div>
        )}

        <div className="mt-10 text-center">
          <Link
            to="/locacao"
            className="inline-flex items-center gap-2 rounded-full bg-[image:var(--gradient-primary)] px-7 py-3.5 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-soft)] transition hover:opacity-90"
          >
            Ver itens para locação <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}


type Brand = { id: string; name: string; url: string; logo_url: string | null; sort_order: number };

function BrandLogo({ brand }: { brand: Brand }) {
  const signed = useSignedImage(brand.logo_url);
  const fallback =
    brand.name === "Russer" ? russerLogo.url : brand.name === "Endoctus" ? endoctusLogo.url : null;
  const src = signed ?? fallback;
  return src ? (
    <img src={src} alt={`Logo ${brand.name}`} className="max-h-12 w-auto object-contain" />
  ) : (
    <span className="text-base font-bold tracking-tight text-foreground">{brand.name}</span>
  );
}

function Partners() {
  const { data: brands = [] } = useQuery({
    queryKey: ["partner_brands"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("partner_brands")
        .select("*")
        .order("sort_order")
        .order("name");
      if (error) throw error;
      return (data ?? []) as Brand[];
    },
  });
  return (
    <section className="bg-secondary/30">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="mb-10 text-center">
          <span className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Marcas parceiras</span>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
            Trabalhamos com marcas de confiança.
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
            Parcerias com fabricantes reconhecidos no mercado para entregar a melhor qualidade aos nossos clientes.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {brands.map((b) =>
            b.url ? (
              <a
                key={b.id}
                href={b.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={b.name}
                className="grid h-24 place-items-center rounded-2xl border border-border bg-card px-6 shadow-[var(--shadow-soft)] transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-[var(--shadow-card)]"
              >
                <BrandLogo brand={b} />
              </a>
            ) : (
              <div
                key={b.id}
                className="grid h-24 place-items-center rounded-2xl border border-border bg-card px-6 shadow-[var(--shadow-soft)]"
              >
                <BrandLogo brand={b} />
              </div>
            ),
          )}
          <div className="grid h-24 place-items-center rounded-2xl border border-dashed border-border bg-card/50 text-sm text-muted-foreground">
            e outras
          </div>
        </div>
      </div>
    </section>
  );
}

function ServiceCTA() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
      <div className="overflow-hidden rounded-3xl border border-border bg-[image:var(--gradient-primary)] p-10 text-primary-foreground shadow-[var(--shadow-card)] sm:p-14">
        <div className="grid items-center gap-8 lg:grid-cols-[1fr_auto]">
          <div>
            <span className="text-xs font-bold uppercase tracking-[0.18em] opacity-80">Assistência técnica</span>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
              Realizamos assistência técnica especializada.
            </h2>
            <p className="mt-3 max-w-2xl opacity-90">
              Manutenção e suporte técnico para equipamentos médicos e instrumentais de videocirurgia. Fale conosco para um orçamento.
            </p>
          </div>
          <Link
            to="/contato"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-primary shadow-[var(--shadow-soft)] transition hover:bg-white/90"
          >
            Falar com a equipe <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
