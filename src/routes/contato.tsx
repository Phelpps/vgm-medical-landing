import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Phone, Mail, MapPin, MessageCircle } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

const WHATSAPP_NUMBER = "556298341044";
const PHONE_DISPLAY = "(62) 9834-1044";

export const Route = createFileRoute("/contato")({
  head: () => ({
    meta: [
      { title: "Contato — VGM Medical" },
      { name: "description", content: "Fale com a VGM Medical pelo WhatsApp, telefone ou e-mail. Atendimento rápido para hospitais, clínicas e profissionais." },
      { property: "og:title", content: "Contato — VGM Medical" },
      { property: "og:description", content: "Fale com nossa equipe pelo WhatsApp, telefone ou e-mail." },
    ],
    links: [{ rel: "canonical", href: "/contato" }],
  }),
  component: ContatoPage,
});

function ContatoPage() {
  const [form, setForm] = useState({ name: "", phone: "", message: "" });
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = `Olá VGM Medical! Sou ${form.name || "—"} (telefone: ${form.phone || "—"}).%0A%0A${form.message}`;
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${text}`, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-24">
        <div className="mb-12 max-w-2xl">
          <span className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Contato</span>
          <h1 className="mt-3 text-4xl font-extrabold tracking-tight sm:text-5xl">Fale com a nossa equipe.</h1>
          <p className="mt-3 text-muted-foreground">
            Envie sua mensagem e responderemos rapidamente pelo WhatsApp.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-soft)] sm:p-8">
            <div>
              <label htmlFor="name" className="text-sm font-semibold">Nome</label>
              <input id="name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="mt-1.5 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                placeholder="Seu nome completo" />
            </div>
            <div>
              <label htmlFor="phone" className="text-sm font-semibold">Telefone</label>
              <input id="phone" required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="mt-1.5 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                placeholder="(62) 90000-0000" />
            </div>
            <div>
              <label htmlFor="message" className="text-sm font-semibold">Mensagem</label>
              <textarea id="message" required rows={5} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })}
                className="mt-1.5 w-full resize-none rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                placeholder="Conte o que você precisa: produto, quantidade, prazo…" />
            </div>
            <button type="submit"
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[image:var(--gradient-primary)] px-7 py-3.5 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-glow)] transition hover:opacity-95">
              <MessageCircle className="h-4 w-4" /> Enviar pelo WhatsApp
            </button>
          </form>

          <div className="space-y-6">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-soft)] sm:p-8">
              <div className="space-y-4">
                <Row icon={Phone} title="Telefone / WhatsApp" value={PHONE_DISPLAY} href={`tel:+${WHATSAPP_NUMBER}`} />
                <Row icon={Mail} title="E-mail" value="vgmmedical.orcamento@outlook.com" href="mailto:vgmmedical.orcamento@outlook.com" />
                <Row icon={MapPin} title="Atendimento" value="Brasil — entregamos para todo o país" />
              </div>
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

function Row({ icon: Icon, title, value, href }: { icon: typeof Phone; title: string; value: string; href?: string }) {
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
  return href ? <a href={href} className="block transition hover:opacity-80">{inner}</a> : inner;
}
