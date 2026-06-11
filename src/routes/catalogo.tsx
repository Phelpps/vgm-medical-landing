import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, ChevronDown, MessageCircle, Search } from "lucide-react";
import f1 from "@/assets/forceps-1.jpg";
import f2 from "@/assets/forceps-2.jpg";
import f3 from "@/assets/forceps-3.jpg";
import f4 from "@/assets/forceps-4.jpg";
import f5 from "@/assets/forceps-5.jpg";
import f6 from "@/assets/forceps-6.jpg";

const WHATSAPP_NUMBER = "556298341044";

export const Route = createFileRoute("/catalogo")({
  head: () => ({
    meta: [
      { title: "Catálogo de Pinças Médicas — VGM Medical" },
      {
        name: "description",
        content:
          "Catálogo completo de pinças cirúrgicas e instrumentos médicos da VGM Medical em Goiânia, Goiás. Clique no produto para ver a imagem.",
      },
      { property: "og:title", content: "Catálogo — VGM Medical" },
      { property: "og:description", content: "Catálogo completo de pinças médicas em Goiânia, Goiás." },
    ],
  }),
  component: CatalogPage,
});

type Product = { name: string; desc: string; img: string; category: string };

const products: Product[] = [
  // Pinças Anatômicas
  { name: "Pinça Anatômica 14cm", desc: "Aço inox, ponta lisa.", img: f1, category: "Pinças Anatômicas" },
  { name: "Pinça Anatômica 16cm", desc: "Aço inox, ponta lisa.", img: f1, category: "Pinças Anatômicas" },
  { name: "Pinça Anatômica 18cm", desc: "Aço inox, ponta lisa.", img: f1, category: "Pinças Anatômicas" },
  { name: "Pinça Anatômica 20cm", desc: "Aço inox, ponta lisa, longa.", img: f1, category: "Pinças Anatômicas" },
  // Dissecção
  { name: "Pinça de Dissecção 14cm", desc: "Precisão para tecidos finos.", img: f2, category: "Pinças de Dissecção" },
  { name: "Pinça de Dissecção 16cm", desc: "Precisão para tecidos finos.", img: f2, category: "Pinças de Dissecção" },
  { name: "Pinça de Dissecção c/ Dente 14cm", desc: "Tração firme em tecidos.", img: f2, category: "Pinças de Dissecção" },
  { name: "Pinça de Dissecção c/ Dente 16cm", desc: "Tração firme em tecidos.", img: f2, category: "Pinças de Dissecção" },
  // Kelly
  { name: "Pinça Kelly Reta 14cm", desc: "Hemostasia em cirurgias gerais.", img: f3, category: "Pinças Hemostáticas Kelly" },
  { name: "Pinça Kelly Curva 14cm", desc: "Hemostasia em cirurgias gerais.", img: f3, category: "Pinças Hemostáticas Kelly" },
  { name: "Pinça Kelly Reta 16cm", desc: "Hemostasia em cirurgias gerais.", img: f3, category: "Pinças Hemostáticas Kelly" },
  { name: "Pinça Kelly Curva 16cm", desc: "Hemostasia em cirurgias gerais.", img: f3, category: "Pinças Hemostáticas Kelly" },
  // Porta-Agulhas
  { name: "Porta-Agulhas Mayo-Hegar 14cm", desc: "Pegada firme para fios cirúrgicos.", img: f4, category: "Porta-Agulhas" },
  { name: "Porta-Agulhas Mayo-Hegar 16cm", desc: "Pegada firme para fios cirúrgicos.", img: f4, category: "Porta-Agulhas" },
  { name: "Porta-Agulhas Mayo-Hegar 18cm", desc: "Pegada firme para fios cirúrgicos.", img: f4, category: "Porta-Agulhas" },
  { name: "Porta-Agulhas Mathieu 14cm", desc: "Trava automática.", img: f4, category: "Porta-Agulhas" },
  // Adson
  { name: "Pinça Adson c/ Dente 12cm", desc: "Tração precisa em tecidos densos.", img: f5, category: "Pinças Adson" },
  { name: "Pinça Adson s/ Dente 12cm", desc: "Manipulação delicada.", img: f5, category: "Pinças Adson" },
  { name: "Pinça Adson-Brown 12cm", desc: "Múltiplos dentes finos.", img: f5, category: "Pinças Adson" },
  // Mosquito
  { name: "Pinça Mosquito Reta 12cm", desc: "Hemostasia em pequenos vasos.", img: f6, category: "Pinças Mosquito" },
  { name: "Pinça Mosquito Curva 12cm", desc: "Hemostasia em pequenos vasos.", img: f6, category: "Pinças Mosquito" },
  { name: "Pinça Halsted Mosquito 14cm", desc: "Hemostasia delicada.", img: f6, category: "Pinças Mosquito" },
  { name: "Pinça Crile Reta 14cm", desc: "Hemostasia geral.", img: f3, category: "Pinças Mosquito" },
  { name: "Pinça Crile Curva 14cm", desc: "Hemostasia geral.", img: f3, category: "Pinças Mosquito" },
];

function whatsappLink(message: string) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

function CatalogPage() {
  const [openName, setOpenName] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      p.category.toLowerCase().includes(query.toLowerCase()),
  );

  const grouped = filtered.reduce<Record<string, Product[]>>((acc, p) => {
    (acc[p.category] ||= []).push(p);
    return acc;
  }, {});

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
        {Object.keys(grouped).length === 0 && (
          <p className="text-center text-muted-foreground">Nenhum produto encontrado.</p>
        )}
        {Object.entries(grouped).map(([category, items]) => (
          <section key={category} className="mb-10">
            <h2 className="mb-4 text-lg font-bold tracking-tight text-primary">{category}</h2>
            <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-soft)]">
              {items.map((p) => {
                const isOpen = openName === p.name;
                return (
                  <li key={p.name}>
                    <button
                      type="button"
                      onClick={() => setOpenName(isOpen ? null : p.name)}
                      className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition hover:bg-secondary/50"
                      aria-expanded={isOpen}
                    >
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-foreground">{p.name}</div>
                        <div className="mt-0.5 truncate text-xs text-muted-foreground">{p.desc}</div>
                      </div>
                      <ChevronDown
                        className={`h-5 w-5 shrink-0 text-muted-foreground transition-transform ${isOpen ? "rotate-180 text-primary" : ""}`}
                      />
                    </button>
                    {isOpen && (
                      <div className="grid gap-5 border-t border-border bg-secondary/30 p-5 sm:grid-cols-[220px_1fr] sm:items-center">
                        <div className="overflow-hidden rounded-xl border border-border bg-white">
                          <img
                            src={p.img}
                            alt={p.name}
                            loading="lazy"
                            width={512}
                            height={512}
                            className="h-full w-full object-contain p-4"
                          />
                        </div>
                        <div>
                          <div className="text-base font-bold">{p.name}</div>
                          <p className="mt-1 text-sm text-muted-foreground">{p.desc}</p>
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
              })}
            </ul>
          </section>
        ))}
      </main>
    </div>
  );
}
