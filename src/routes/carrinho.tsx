import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Minus, Plus, ShoppingCart, Trash2, MessageCircle } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import logo from "@/assets/vgm-logo-new.jpeg.asset.json";

const WHATSAPP_NUMBER = "556298341044";

export const Route = createFileRoute("/carrinho")({
  head: () => ({
    meta: [
      { title: "Carrinho — VGM Medical" },
      { name: "description", content: "Produtos selecionados para orçamento na VGM Medical." },
    ],
  }),
  component: CartPage,
});

function CartPage() {
  const { items, increment, decrement, remove, clear, totalCount } = useCart();

  const catalogItems = items.filter((it) => it.kind !== "locacao");
  const rentalItems = items.filter((it) => it.kind === "locacao");

  const section = (title: string, list: typeof items) =>
    list.length > 0 ? `${title}:\n${list.map((it) => `• ${it.name} — Quantidade: ${it.quantity}`).join("\n")}` : "";

  const whatsappMessage =
    items.length > 0
      ? `Olá! Tenho interesse nos seguintes itens:\n\n${[
          section("COMPRA (Catálogo)", catalogItems),
          section("LOCAÇÃO", rentalItems),
        ]
          .filter(Boolean)
          .join("\n\n")}\n\nPode me enviar mais informações?`
      : "";

  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(whatsappMessage)}`;

  const renderList = (list: typeof items) => (
    <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-soft)]">
      {list.map((it) => (
        <li key={it.id} className="flex flex-wrap items-center justify-between gap-4 p-4 sm:p-5">
          <div className="min-w-0 flex-1">
            <div className="text-sm font-semibold">{it.name}</div>
            <div className="text-xs text-muted-foreground">{it.category}</div>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-border bg-background p-1">
            <button
              type="button"
              onClick={() => decrement(it.id)}
              className="grid h-8 w-8 place-items-center rounded-full text-muted-foreground transition hover:bg-secondary hover:text-foreground"
              aria-label="Diminuir"
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="min-w-[2ch] text-center text-sm font-semibold">{it.quantity}</span>
            <button
              type="button"
              onClick={() => increment(it.id)}
              className="grid h-8 w-8 place-items-center rounded-full text-muted-foreground transition hover:bg-secondary hover:text-foreground"
              aria-label="Aumentar"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
          <button
            type="button"
            onClick={() => remove(it.id)}
            className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium text-destructive transition hover:bg-destructive/10"
          >
            <Trash2 className="h-4 w-4" /> Remover
          </button>
        </li>
      ))}
    </ul>
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4 sm:px-6">
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
          <Link
            to="/catalogo"
            className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold transition hover:bg-secondary"
          >
            <ArrowLeft className="h-4 w-4" /> Catálogo
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <div className="mb-6 flex items-center gap-3">
          <ShoppingCart className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
            Meu carrinho{" "}
            <span className="text-base font-medium text-muted-foreground">
              ({totalCount} {totalCount === 1 ? "item" : "itens"})
            </span>
          </h1>
        </div>

        {items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center">
            <p className="text-muted-foreground">Seu carrinho está vazio.</p>
            <Link
              to="/catalogo"
              className="mt-4 inline-flex items-center gap-2 rounded-full bg-[image:var(--gradient-primary)] px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-soft)] transition hover:opacity-90"
            >
              Ver catálogo
            </Link>
          </div>
        ) : (
          <>
            <div className="space-y-8">
              <section>
                <div className="mb-3 flex items-center gap-2">
                  <h2 className="text-sm font-bold uppercase tracking-[0.18em] text-primary">Catálogo</h2>
                  <span className="rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                    {catalogItems.reduce((s, it) => s + it.quantity, 0)}
                  </span>
                </div>
                {catalogItems.length > 0 ? (
                  renderList(catalogItems)
                ) : (
                  <p className="rounded-2xl border border-dashed border-border bg-card p-6 text-sm text-muted-foreground">
                    Nenhum produto de catálogo adicionado.
                  </p>
                )}
              </section>

              <section>
                <div className="mb-3 flex items-center gap-2">
                  <h2 className="text-sm font-bold uppercase tracking-[0.18em] text-amber-700">Locação</h2>
                  <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-xs font-semibold text-amber-700">
                    {rentalItems.reduce((s, it) => s + it.quantity, 0)}
                  </span>
                </div>
                {rentalItems.length > 0 ? (
                  renderList(rentalItems)
                ) : (
                  <p className="rounded-2xl border border-dashed border-border bg-card p-6 text-sm text-muted-foreground">
                    Nenhum item de locação adicionado.
                  </p>
                )}
              </section>
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={clear}
                className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-medium text-muted-foreground transition hover:bg-secondary"
              >
                Limpar carrinho
              </button>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-[#1ebe57]"
              >
                <MessageCircle className="h-4 w-4" /> Solicitar orçamento no WhatsApp
              </a>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
