import { Link } from "@tanstack/react-router";
import { Instagram, Linkedin, MessageCircle } from "lucide-react";
import logo from "@/assets/vgm-logo.png.asset.json";

const WHATSAPP_NUMBER = "556298341044";
function whatsappLink(message: string) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-secondary/40">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-3">
        <div>
          <div className="flex items-center gap-3">
            <img src={logo.url} alt="VGM Medical" width={44} height={44} className="h-11 w-11 rounded-full object-cover" />
            <div>
              <div className="text-sm font-bold">VGM Medical</div>
              <div className="text-xs text-muted-foreground">Equipamentos & Instrumentais</div>
            </div>
          </div>
          <p className="mt-4 max-w-xs text-sm text-muted-foreground">
            Equipamentos e instrumentais médicos com qualidade certificada e assistência técnica especializada.
          </p>
        </div>
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-foreground">Navegação</div>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li><Link to="/catalogo" className="hover:text-primary">Catálogo</Link></li>
            <li><Link to="/sobre" className="hover:text-primary">Sobre nós</Link></li>
            <li><Link to="/contato" className="hover:text-primary">Contato</Link></li>
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
          <span className="flex items-center gap-3">
            <Link to="/auth" className="hover:text-primary">Área restrita</Link>
          </span>
        </div>
      </div>
    </footer>
  );
}
