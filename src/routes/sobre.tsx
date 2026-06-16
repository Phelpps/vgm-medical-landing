import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, ArrowRight, Wrench, Award, Truck, Users } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import logo from "@/assets/vgm-logo.jpeg.asset.json";

export const Route = createFileRoute("/sobre")({
  head: () => ({
    meta: [
      { title: "Sobre nós — VGM Medical" },
      { name: "description", content: "Conheça a VGM Medical: +20 anos de experiência em equipamentos e instrumentais médicos, com assistência técnica e curadoria especializada." },
      { property: "og:title", content: "Sobre a VGM Medical" },
      { property: "og:description", content: "+20 anos fornecendo equipamentos e instrumentais médicos com qualidade e assistência técnica." },
    ],
    links: [{ rel: "canonical", href: "/sobre" }],
  }),
  component: SobrePage,
});

function SobrePage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-24">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <span className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Sobre nós</span>
            <h1 className="mt-3 text-4xl font-extrabold tracking-tight sm:text-5xl">
              Equipamentos médicos com a experiência de quem entende do assunto.
            </h1>
            <p className="mt-5 text-muted-foreground">
              A <strong className="text-foreground">VGM Medical</strong> atua há mais de 20 anos no fornecimento de
              equipamentos e instrumentais cirúrgicos para hospitais, clínicas e profissionais autônomos. Trabalhamos
              com curadoria técnica, marcas reconhecidas e assistência técnica especializada para garantir a sua
              tranquilidade em cada procedimento.
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {[
                { icon: Award, n: "+20 anos", l: "de experiência no setor" },
                { icon: Users, n: "+2000", l: "produtos no catálogo" },
                { icon: Wrench, n: "Assistência", l: "técnica especializada" },
                { icon: Truck, n: "Logística", l: "rápida para todo o Brasil" },
              ].map((s) => (
                <div key={s.l} className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-soft)]">
                  <s.icon className="h-5 w-5 text-primary" />
                  <div className="mt-3 bg-[image:var(--gradient-primary)] bg-clip-text text-2xl font-extrabold text-transparent">
                    {s.n}
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">{s.l}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="relative">
            <div className="absolute -inset-6 -z-10 rounded-[2rem] bg-[image:var(--gradient-primary)] opacity-10 blur-3xl" />
            <div className="overflow-hidden rounded-3xl border border-border bg-card p-10 shadow-[var(--shadow-card)]">
              <img src={logo.url} alt="VGM Medical" className="mx-auto h-56 w-56 rounded-full object-cover" />
              <ul className="mt-8 space-y-4">
                {[
                  "Curadoria técnica de equipamentos e instrumentais.",
                  "Atendimento humano e consultivo.",
                  "Assistência técnica especializada.",
                  "Marcas reconhecidas e parceiras.",
                  "Suporte pós-venda dedicado.",
                ].map((t) => (
                  <li key={t} className="flex items-start gap-3">
                    <div className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[image:var(--gradient-primary)] text-primary-foreground">
                      <Check className="h-3.5 w-3.5" />
                    </div>
                    <span className="text-sm text-foreground">{t}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-16 text-center">
          <Link
            to="/catalogo"
            className="inline-flex items-center gap-2 rounded-full bg-[image:var(--gradient-primary)] px-7 py-3.5 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-soft)] transition hover:opacity-90"
          >
            Ver catálogo completo <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
