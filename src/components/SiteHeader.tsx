import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { MessageCircle } from "lucide-react";
import logo from "@/assets/vgm-logo.png.asset.json";

const WHATSAPP_NUMBER = "556298341044";

function whatsappLink(message: string) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const links = [
    { to: "/catalogo", label: "Catálogo" },
    { to: "/sobre", label: "Sobre" },
    { to: "/contato", label: "Contato" },
  ] as const;
  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Link to="/" className="flex items-center gap-3">
          <img
            src={logo.url}
            alt="VGM Medical"
            width={48}
            height={48}
            className="h-12 w-12 rounded-full object-cover shadow-[var(--shadow-soft)]"
          />
          <div className="leading-tight">
            <div className="text-sm font-bold tracking-tight">VGM Medical</div>
            <div className="text-[11px] text-muted-foreground">Equipamentos & Instrumentais</div>
          </div>
        </Link>
        <nav className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="text-sm font-medium text-muted-foreground transition hover:text-primary"
              activeProps={{ className: "text-sm font-semibold text-primary" }}
            >
              {l.label}
            </Link>
          ))}
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
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-2 text-sm font-medium hover:bg-secondary"
              >
                {l.label}
              </Link>
            ))}
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
