import { createFileRoute } from "@tanstack/react-router";
import { ProductBrowser } from "@/components/ProductBrowser";

export const Route = createFileRoute("/locacao")({
  head: () => ({
    meta: [
      { title: "Locação de Equipamentos Médicos — VGM Medical" },
      {
        name: "description",
        content:
          "Equipamentos e instrumentais médicos disponíveis para locação na VGM Medical, organizados por especialidade.",
      },
      { property: "og:title", content: "Locação de Equipamentos Médicos — VGM Medical" },
      {
        property: "og:description",
        content: "Equipamentos e instrumentais médicos disponíveis para locação, por especialidade.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: RentalPage,
});

function RentalPage() {
  return (
    <ProductBrowser
      availability="locacao"
      title="LOCAÇÃO"
      subtitle="Equipamentos e instrumentais disponíveis para locação. Escolha uma especialidade e clique no item para ver detalhes."
    />
  );
}
