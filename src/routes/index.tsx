import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  Phone,
  MapPin,
  Mail,
  Instagram,
  Facebook,
  MessageCircle,
  ShieldCheck,
  Truck,
  Award,
  ArrowRight,
  Check,
} from "lucide-react";
import heroImage from "@/assets/hero-forceps.jpg";
import f1 from "@/assets/forceps-1.jpg";
import f2 from "@/assets/forceps-2.jpg";
import f3 from "@/assets/forceps-3.jpg";
import f4 from "@/assets/forceps-4.jpg";
import f5 from "@/assets/forceps-5.jpg";
import f6 from "@/assets/forceps-6.jpg";

const WHATSAPP_NUMBER = "556298341044";
const PHONE_DISPLAY = "(62) 9834-1044";
const ADDRESS = "Goiânia, Goiás — Brasil";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "VGM Medical — Revendedora de Produtos Médicos em Goiânia" },
      {
        name: "description",
        content:
          "VGM Medical: revendedora de produtos médicos em Goiânia, Goiás. Venda de pinças cirúrgicas e instrumentos hospitalares com qualidade certificada e entrega rápida.",
      },
      { name: "keywords", content: "pinças médicas, instrumentos cirúrgicos, produtos médicos Goiânia, revendedora produtos médicos, VGM Medical" },
      { property: "og:title", content: "VGM Medical — Revendedora de Produtos Médicos" },
      { property: "og:description", content: "Venda de pinças médicas e instrumentos cirúrgicos em Goiânia, Goiás." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/" },
      { property: "og:image", content: heroImage },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "MedicalBusiness",
          name: "VGM Medical",
          description: "Revendedora de produtos médicos e pinças cirúrgicas",
          address: {
            "@type": "PostalAddress",
            addressLocality: "Goiânia",
            addressRegion: "GO",
            addressCountry: "BR",
          },
          areaServed: "Goiânia, Goiás",
        }),
      },
    ],
  }),
  component: Index,
});

const catalog = [
  { name: "Pinça Anatômica", desc: "Em aço inox, ideal para procedimentos delicados.", img: f1 },
  { name: "Pinça de Dissecção", desc: "Precisão para tecidos finos e suturas.", img: f2 },
  { name: "Pinça Kelly Hemostática", desc: "Hemostasia segura em cirurgias gerais.", img: f3 },
  { name: "Porta-Agulhas", desc: "Pegada firme para fios cirúrgicos.", img: f4 },
  { name: "Pinça Adson com Dente", desc: "Tração precisa em tecidos densos.", img: f5 },
  { name: "Pinça Mosquito Curva", desc: "Hemostasia em pequenos vasos.", img: f6 },
];

function whatsappLink(message: string) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

function Index() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main>
        <Hero />
        <Trust />
        <Catalog />
        <About />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}

function Header() {
  const [open, setOpen] = useState(false);
  const links = [
    { href: "/catalogo", label: "Catálogo", route: true as const },
    { href: "#sobre", label: "Sobre" },
    { href: "#contato", label: "Contato" },
  ];
  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <a href="#topo" className="flex items-center gap-2">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-[image:var(--gradient-primary)] text-primary-foreground shadow-[var(--shadow-soft)]">
            <span className="text-sm font-extrabold tracking-tight">VGM</span>
          </div>
          <div className="leading-tight">
            <div className="text-sm font-bold tracking-tight">VGM Medical</div>
            <div className="text-[11px] text-muted-foreground">Goiânia · GO</div>
          </div>
        </a>
        <nav className="hidden items-center gap-8 md:flex">
          {links.map((l) =>
            "route" in l ? (
              <Link key={l.href} to={l.href} className="text-sm font-medium text-muted-foreground transition hover:text-primary">
                {l.label}
              </Link>
            ) : (
              <a key={l.href} href={l.href} className="text-sm font-medium text-muted-foreground transition hover:text-primary">
                {l.label}
              </a>
            ),
          )}
          <a
            href={whatsappLink("Olá! Vim pelo site da VGM Medical e gostaria de mais informações.")}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-[image:var(--gradient-primary)] px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-soft)] transition hover:opacity-90"
          >
            <MessageCircle className="h-4 w-4" /> WhatsApp
          </a>
        </nav>
        <button
          aria-label="Abrir menu"
          onClick={() => setOpen((s) => !s)}
          className="rounded-md p-2 text-foreground md:hidden"
        >
          <div className="space-y-1.5">
            <span className="block h-0.5 w-5 bg-current" />
            <span className="block h-0.5 w-5 bg-current" />
            <span className="block h-0.5 w-5 bg-current" />
          </div>
        </button>
      </div>
      {open && (
        <div className="border-t border-border bg-background md:hidden">
          <div className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-3">
            {links.map((l) =>
              "route" in l ? (
                <Link key={l.href} to={l.href} onClick={() => setOpen(false)} className="rounded-md px-3 py-2 text-sm font-medium hover:bg-secondary">
                  {l.label}
                </Link>
              ) : (
                <a key={l.href} href={l.href} onClick={() => setOpen(false)} className="rounded-md px-3 py-2 text-sm font-medium hover:bg-secondary">
                  {l.label}
                </a>
              ),
            )}
            <a
              href={whatsappLink("Olá! Vim pelo site da VGM Medical.")}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 inline-flex items-center justify-center gap-2 rounded-full bg-[image:var(--gradient-primary)] px-5 py-2.5 text-sm font-semibold text-primary-foreground"
            >
              <MessageCircle className="h-4 w-4" /> Fale no WhatsApp
            </a>
          </div>
        </div>
      )}
    </header>
  );
}

function Hero() {
  return (
    <section id="topo" className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10" style={{ background: "var(--gradient-hero)" }} />
      <div className="absolute inset-0 -z-10 opacity-60 [background-image:radial-gradient(circle_at_top_right,oklch(0.78_0.13_200/0.35),transparent_50%),radial-gradient(circle_at_bottom_left,oklch(0.62_0.14_220/0.25),transparent_55%)]" />
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:gap-12 lg:py-24">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-white/70 px-3 py-1 text-xs font-semibold text-primary backdrop-blur">
            <ShieldCheck className="h-3.5 w-3.5" /> Produtos médicos certificados
          </span>
          <h1 className="mt-5 text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
            Pinças médicas com{" "}
            <span className="bg-[image:var(--gradient-primary)] bg-clip-text text-transparent">precisão clínica</span> para você.
          </h1>
          <p className="mt-5 max-w-xl text-base text-muted-foreground sm:text-lg">
            A VGM Medical é revendedora de produtos médicos em Goiânia, Goiás. Trabalhamos com pinças cirúrgicas em aço inoxidável de
            alta qualidade, com entrega rápida e atendimento dedicado.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a
              href={whatsappLink("Olá VGM Medical! Quero solicitar um orçamento de pinças médicas.")}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[image:var(--gradient-primary)] px-7 py-3.5 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-glow)] transition hover:scale-[1.02]"
            >
              Solicitar orçamento <ArrowRight className="h-4 w-4" />
            </a>
            <Link
              to="/catalogo"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-white/80 px-7 py-3.5 text-sm font-semibold text-foreground backdrop-blur transition hover:bg-white"
            >
              Ver catálogo
            </Link>
          </div>
          <div className="mt-8 flex flex-wrap gap-6 text-sm text-muted-foreground">
            {["Aço inoxidável", "Entrega para todo Brasil", "Atendimento humano"].map((t) => (
              <div key={t} className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" /> {t}
              </div>
            ))}
          </div>
        </div>
        <div className="relative">
          <div className="absolute -inset-4 -z-10 rounded-[2rem] bg-[image:var(--gradient-primary)] opacity-20 blur-2xl" />
          <div className="overflow-hidden rounded-3xl border border-white/60 bg-white shadow-[var(--shadow-card)]">
            <img
              src={heroImage}
              alt="Pinças médicas em aço inoxidável VGM Medical"
              width={1536}
              height={1024}
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function Trust() {
  const items = [
    { icon: ShieldCheck, title: "Qualidade certificada", desc: "Instrumentos em aço inox cirúrgico." },
    { icon: Truck, title: "Entrega ágil", desc: "Despachamos de Goiânia para todo o Brasil." },
    { icon: Award, title: "Atendimento especialista", desc: "Indicação correta para cada procedimento." },
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

function Catalog() {
  return (
    <section id="catalogo" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
      <div className="mb-12 max-w-2xl">
        <span className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Catálogo</span>
        <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
          Pinças cirúrgicas para cada necessidade.
        </h2>
        <p className="mt-3 text-muted-foreground">
          Conheça uma seleção dos modelos mais procurados. Solicite o catálogo completo via WhatsApp.
        </p>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {catalog.map((p) => (
          <article
            key={p.name}
            className="group overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-soft)] transition hover:-translate-y-1 hover:shadow-[var(--shadow-card)]"
          >
            <div className="relative aspect-square overflow-hidden bg-secondary/50">
              <img
                src={p.img}
                alt={p.name}
                loading="lazy"
                width={768}
                height={768}
                className="h-full w-full object-contain p-6 transition duration-500 group-hover:scale-105"
              />
            </div>
            <div className="border-t border-border p-5">
              <h3 className="text-base font-bold tracking-tight">{p.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{p.desc}</p>
              <a
                href={whatsappLink(`Olá! Tenho interesse no produto: ${p.name}. Pode me enviar mais informações?`)}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:gap-2.5 transition-all"
              >
                Consultar disponibilidade <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function About() {
  return (
    <section id="sobre" className="bg-secondary/30">
      <div className="mx-auto grid max-w-6xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:items-center">
        <div>
          <span className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Sobre nós</span>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
            Confiança goiana para hospitais, clínicas e profissionais.
          </h2>
          <p className="mt-4 text-muted-foreground">
            A <strong className="text-foreground">VGM Medical</strong> nasceu em Goiânia com a missão de oferecer
            instrumentos cirúrgicos de alta precisão a um preço justo. Atendemos hospitais, consultórios e
            profissionais autônomos com curadoria técnica, suporte rápido e logística confiável.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {[
              { n: "100%", l: "Aço inox cirúrgico" },
              { n: "+500", l: "Clientes atendidos" },
              { n: "24h", l: "Resposta no WhatsApp" },
            ].map((s) => (
              <div key={s.l} className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-soft)]">
                <div className="bg-[image:var(--gradient-primary)] bg-clip-text text-2xl font-extrabold text-transparent">
                  {s.n}
                </div>
                <div className="mt-1 text-xs text-muted-foreground">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="relative">
          <div className="absolute -inset-6 -z-10 rounded-[2rem] bg-[image:var(--gradient-primary)] opacity-15 blur-3xl" />
          <div className="rounded-3xl border border-border bg-card p-8 shadow-[var(--shadow-card)]">
            <ul className="space-y-4">
              {[
                "Curadoria técnica de produtos médicos.",
                "Atendimento humano e consultivo.",
                "Logística rápida saindo de Goiânia.",
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
    </section>
  );
}

function Contact() {
  const [form, setForm] = useState({ name: "", phone: "", message: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = `Olá VGM Medical! Sou ${form.name || "—"} (telefone: ${form.phone || "—"}).%0A%0A${form.message}`;
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${text}`, "_blank", "noopener,noreferrer");
  };

  return (
    <section id="contato" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
      <div className="mb-12 max-w-2xl">
        <span className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Contato</span>
        <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
          Fale com a nossa equipe.
        </h2>
        <p className="mt-3 text-muted-foreground">
          Envie sua mensagem e responderemos diretamente pelo WhatsApp.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-soft)] sm:p-8">
          <div>
            <label htmlFor="name" className="text-sm font-semibold">Nome</label>
            <input
              id="name"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="mt-1.5 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              placeholder="Seu nome completo"
            />
          </div>
          <div>
            <label htmlFor="phone" className="text-sm font-semibold">Telefone</label>
            <input
              id="phone"
              required
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="mt-1.5 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              placeholder="(62) 90000-0000"
            />
          </div>
          <div>
            <label htmlFor="message" className="text-sm font-semibold">Mensagem</label>
            <textarea
              id="message"
              required
              rows={5}
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              className="mt-1.5 w-full resize-none rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              placeholder="Conte o que você precisa: produto, quantidade, prazo…"
            />
          </div>
          <button
            type="submit"
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[image:var(--gradient-primary)] px-7 py-3.5 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-glow)] transition hover:opacity-95"
          >
            <MessageCircle className="h-4 w-4" /> Enviar pelo WhatsApp
          </button>
        </form>

        <div className="space-y-6">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-soft)] sm:p-8">
            <div className="space-y-4">
              <ContactRow icon={MapPin} title="Endereço" value={ADDRESS} />
              <ContactRow icon={Phone} title="Telefone" value={PHONE_DISPLAY} href={`tel:+${WHATSAPP_NUMBER}`} />
              <ContactRow icon={Mail} title="E-mail" value="contato@vgmmedical.com.br" href="mailto:contato@vgmmedical.com.br" />
            </div>
          </div>
          <div className="overflow-hidden rounded-2xl border border-border shadow-[var(--shadow-soft)]">
            <iframe
              title="VGM Medical em Goiânia, Goiás"
              src="https://www.google.com/maps?q=Goi%C3%A2nia%2C+Goi%C3%A1s&output=embed"
              loading="lazy"
              className="h-72 w-full border-0"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function ContactRow({ icon: Icon, title, value, href }: { icon: typeof MapPin; title: string; value: string; href?: string }) {
  const inner = (
    <div className="flex items-start gap-3">
      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-secondary text-primary">
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{title}</div>
        <div className="truncate text-sm font-medium text-foreground">{value}</div>
      </div>
    </div>
  );
  return href ? (
    <a href={href} className="block transition hover:opacity-80">{inner}</a>
  ) : (
    inner
  );
}

function Footer() {
  return (
    <footer className="border-t border-border bg-secondary/40">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-[image:var(--gradient-primary)] text-primary-foreground">
              <span className="text-sm font-extrabold">VGM</span>
            </div>
            <div>
              <div className="text-sm font-bold">VGM Medical</div>
              <div className="text-xs text-muted-foreground">Goiânia · Goiás</div>
            </div>
          </div>
          <p className="mt-4 max-w-xs text-sm text-muted-foreground">
            Revendedora de produtos médicos. Pinças cirúrgicas e instrumentos hospitalares com qualidade certificada.
          </p>
        </div>
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-foreground">Navegação</div>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li><a href="#catalogo" className="hover:text-primary">Catálogo</a></li>
            <li><a href="#sobre" className="hover:text-primary">Sobre nós</a></li>
            <li><a href="#contato" className="hover:text-primary">Contato</a></li>
          </ul>
        </div>
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-foreground">Redes sociais</div>
          <div className="mt-4 flex gap-3">
            {[
              { icon: Instagram, href: "https://instagram.com", label: "Instagram" },
              { icon: Facebook, href: "https://facebook.com", label: "Facebook" },
              { icon: MessageCircle, href: whatsappLink("Olá VGM Medical!"), label: "WhatsApp" },
            ].map((s) => (
              <a
                key={s.label}
                href={s.href}
                aria-label={s.label}
                target="_blank"
                rel="noopener noreferrer"
                className="grid h-10 w-10 place-items-center rounded-full border border-border bg-card text-foreground transition hover:bg-[image:var(--gradient-primary)] hover:text-primary-foreground"
              >
                <s.icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>
      </div>
      <div className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-5 text-xs text-muted-foreground sm:flex-row sm:px-6">
          <span>© {new Date().getFullYear()} VGM Medical. Todos os direitos reservados.</span>
          <span>Goiânia · Goiás · Brasil</span>
        </div>
      </div>
    </footer>
  );
}
