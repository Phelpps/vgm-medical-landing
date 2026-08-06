import { createFileRoute } from "@tanstack/react-router";
import { ProductBrowser } from "@/components/ProductBrowser";

export const Route = createFileRoute("/catalogo")({
  head: () => ({
    meta: [
      { title: "Catálogo de Equipamentos Médicos — VGM Medical" },
      {
        name: "description",
        content:
          "Catálogo completo de equipamentos e instrumentais médicos da VGM Medical organizados por especialidade.",
      },
      { property: "og:title", content: "Catálogo de Equipamentos Médicos — VGM Medical" },
      {
        property: "og:description",
        content: "Equipamentos e instrumentais médicos por especialidade.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CatalogPage,
});

function CatalogPage() {
  return (
    <ProductBrowser
      availability="catalogo"
      title="CATÁLOGO"
      subtitle="Escolha uma especialidade ao lado para explorar os produtos. Clique no item para ver detalhes."
    />
  );
}
