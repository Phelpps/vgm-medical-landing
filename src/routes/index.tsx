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
  CalendarDays,
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
};

async function fetchCatalogProducts(): Promise<CatalogProduct[]> {
  const { data, error } = await supabase
    .from("products")
    .select("id, name, description, category, image_url, sort_order")
    .order("category", { ascending: true })
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });
  if (error) throw error;
  return (data ?? []) as CatalogProduct[];
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

function Index() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <main>
        <Hero />
        <Trust />
        <Stats />
        <Catalog />
        <Partners />
        <ServiceCTA />
      </main>
      <SiteFooter />
    </div>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10" style={{ background: "var(--gradient-hero)" }} />
      <div className="absolute inset-0 -z-10 opacity-70 [background-image:radial-gradient(circle_at_top_right,oklch(0.88_0.045_195/0.5),transparent_55%),radial-gradient(circle_at_bottom_left,oklch(0.28_0.025_200/0.18),transparent_55%)]" />
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:gap-12 lg:py-24">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-white/70 px-3 py-1 text-xs font-semibold text-primary backdrop-blur">
            <ShieldCheck className="h-3.5 w-3.5" /> Equipamentos médicos certificados
          </span>
          <h1 className="mt-5 text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
            Equipamentos e instrumentais para{" "}
            <span className="bg-[image:var(--gradient-primary)] bg-clip-text text-transparent">videocirurgia</span> e linha convencional.
          </h1>
          <p className="mt-5 max-w-xl text-base text-muted-foreground sm:text-lg">
            A VGM Medical fornece equipamentos e instrumentais cirúrgicos para hospitais, clínicas e profissionais da saúde — com curadoria técnica, marcas reconhecidas e assistência técnica especializada.
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
              className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-white/80 px-7 py-3.5 text-sm font-semibold text-foreground backdrop-blur transition hover:bg-white"
            >
              Falar com a equipe
            </Link>
          </div>
          <div className="mt-8 flex flex-wrap gap-6 text-sm text-muted-foreground">
            {["Marcas parceiras", "Assistência técnica", "Entrega para todo Brasil"].map((t) => (
              <div key={t} className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" /> {t}
              </div>
            ))}
          </div>
        </div>
        <div className="relative">
          <div className="absolute -inset-4 -z-10 rounded-[2rem] bg-[image:var(--gradient-primary)] opacity-15 blur-2xl" />
          <div className="overflow-hidden rounded-3xl border border-white/60 bg-white shadow-[var(--shadow-card)]">
            <img
              src={heroInstruments.url}
              alt="Pinças e instrumentais cirúrgicos de precisão em ambiente estéril"
              width={1536}
              height={1024}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="absolute -bottom-6 -left-6 hidden h-28 w-28 rounded-full border-4 border-white bg-white shadow-[var(--shadow-card)] sm:block">
            <img src={logo.url} alt="VGM Medical" className="h-full w-full rounded-full object-cover" />
          </div>
        </div>
      </div>
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
      to="/catalogo"
      className="group overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-soft)] transition hover:-translate-y-1 hover:shadow-[var(--shadow-card)]"
    >
      <div className="relative grid aspect-square place-items-center overflow-hidden bg-secondary/50">
        {product.image_url ? (
          imgUrl ? (
            <img src={imgUrl} alt={product.category} loading="lazy"
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
          Ver categoria <ArrowRight className="h-4 w-4" />
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

  const firstByCategory = useMemo(() => {
    const seen = new Map<string, CatalogProduct>();
    for (const p of products) {
      if (!seen.has(p.category)) seen.set(p.category, p);
    }
    return Array.from(seen.values());
  }, [products]);

  return (
    <section id="catalogo" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
      <div className="mb-12 max-w-2xl">
        <span className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Catálogo</span>
        <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
          Soluções integradas em videocirurgia e instrumentais convencionais.
        </h2>
        <p className="mt-3 text-muted-foreground">
          Conheça nossas categorias. Acesse o catálogo completo para ver todos os produtos.
        </p>
      </div>
      {isLoading ? (
        <p className="text-center text-muted-foreground">Carregando categorias…</p>
      ) : firstByCategory.length === 0 ? (
        <p className="text-center text-muted-foreground">Catálogo em breve.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {firstByCategory.map((p) => (
            <CategoryCard key={p.category} product={p} />
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

function Partners() {
  const brands: { name: string; url: string; logo: string }[] = [
    {
      name: "Russer",
      url: "https://www.russer.com/?utm_source=google&gad_campaignid=23480298474&gclid=CjwKCAjw6MPRBhBTEiwAd-7MryNvQezaLfCa_aoqc7_J_MQ6JsyL2t7buoCLxPUzcCqkVPxuaoamKBoCD5AQAvD_BwE&utm_content=b&utm_campaign=bc_search_leads_catalogo2026%2F01%2F21&gad_source=1&utm_medium=cpc&utm_term=russer",
      logo: russerLogo.url,
    },
    { name: "Endoctus", url: "https://doctus.med.br", logo: endoctusLogo.url },
  ];
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
          {brands.map((b) => (
            <a
              key={b.name}
              href={b.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={b.name}
              className="grid h-24 place-items-center rounded-2xl border border-border bg-card px-6 shadow-[var(--shadow-soft)] transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-[var(--shadow-card)]"
            >
              <img src={b.logo} alt={`Logo ${b.name}`} className="max-h-12 w-auto object-contain" />
            </a>
          ))}
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
