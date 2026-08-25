import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ArrowLeft, LogOut, Plus, Pencil, Trash2, Save, X, Upload, ImageOff, UserPlus, KeyRound, Mail, Image as ImageIcon, Building2, Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { createAdminUser } from "@/lib/admin-users.functions";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin — VGM Medical" }, { name: "robots", content: "noindex" }] }),
  component: AdminPage,
});

type Availability = "catalogo" | "locacao" | "fora_de_estoque";

const AVAILABILITY_OPTIONS: { value: Availability; label: string }[] = [
  { value: "catalogo", label: "Catálogo" },
  { value: "locacao", label: "Locação" },
  { value: "fora_de_estoque", label: "Fora de estoque" },
];

const SHOWCASE_OPTIONS: { value: Exclude<Availability, "fora_de_estoque">; label: string }[] = [
  { value: "catalogo", label: "Catálogo" },
  { value: "locacao", label: "Locação" },
];

const AVAILABILITY_BADGE: Record<Availability, string> = {
  catalogo: "border-primary/30 bg-primary/10 text-primary",
  locacao: "border-amber-500/30 bg-amber-500/10 text-amber-700",
  fora_de_estoque: "border-destructive/30 bg-destructive/10 text-destructive",
};

function normalizeAvailabilities(list: Availability[] | null | undefined, fallback?: Availability): Availability[] {
  const cleaned = (list ?? []).filter((v) => v === "catalogo" || v === "locacao");
  if (cleaned.length > 0) return Array.from(new Set(cleaned));
  if (fallback === "catalogo" || fallback === "locacao") return [fallback];
  return ["fora_de_estoque"];
}

function AvailabilityBadges({ values }: { values: Availability[] }) {
  return (
    <>
      {values.map((value) => {
        const label = AVAILABILITY_OPTIONS.find((o) => o.value === value)?.label ?? value;
        return (
          <span
            key={value}
            className={`inline-flex shrink-0 items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide ${AVAILABILITY_BADGE[value]}`}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-current" />
            {label}
          </span>
        );
      })}
    </>
  );
}

type Product = {
  id: string;
  name: string;
  description: string;
  category: string;
  image_url: string | null;
  image_urls: string[];
  sort_order: number;
  additional_info: string;
  availability: Availability;
  availabilities: Availability[];
  featured: boolean;
};

type Draft = {
  id?: string;
  name: string;
  description: string;
  category: string;
  image_url: string | null;
  image_urls: string[];
  sort_order: number;
  additional_info: string;
  availabilities: Availability[];
  featured: boolean;
  file?: File | null;
  newFiles?: File[];
};

const EMPTY: Draft = { name: "", description: "", category: "", image_url: null, image_urls: [], sort_order: 0, additional_info: "", availabilities: ["catalogo"], featured: false, file: null, newFiles: [] };


function AdminPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [signedThumbs, setSignedThumbs] = useState<Record<string, string>>({});
  const [showNewUser, setShowNewUser] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterAvailability, setFilterAvailability] = useState<string>("all");

  const [searchTerm, setSearchTerm] = useState("");
  const createUser = useServerFn(createAdminUser);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getUser().then(async ({ data }) => {
      if (!mounted) return;
      if (!data.user) {
        navigate({ to: "/auth" });
        return;
      }
      setUserId(data.user.id);
      setUserEmail(data.user.email ?? null);
      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", data.user.id)
        .eq("role", "admin")
        .maybeSingle();
      setIsAdmin(!!roles);
    });
    return () => {
      mounted = false;
    };
  }, [navigate]);

  const { data: products } = useQuery({
    queryKey: ["admin-products"],
    enabled: isAdmin === true,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("category")
        .order("sort_order")
        .order("name");
      if (error) throw error;
      return data as Product[];
    },
  });

  // Build signed thumbnail URLs in batch
  useEffect(() => {
    if (!products) return;
    const paths = products.map((p) => p.image_url).filter((p): p is string => !!p);
    if (paths.length === 0) {
      setSignedThumbs((prev) => (Object.keys(prev).length === 0 ? prev : {}));
      return;
    }
    supabase.storage
      .from("product-images")
      .createSignedUrls(paths, 60 * 60)
      .then(({ data }) => {
        if (!data) return;
        const map: Record<string, string> = {};
        data.forEach((d) => {
          if (d.path && d.signedUrl) map[d.path] = d.signedUrl;
        });
        setSignedThumbs(map);
      });
  }, [products]);

  const saveMutation = useMutation({
    mutationFn: async (d: Draft) => {
      let image_url = d.image_url;
      if (d.file) {
        const ext = d.file.name.split(".").pop() || "jpg";
        const path = `${crypto.randomUUID()}.${ext}`;
        const { error: upErr } = await supabase.storage
          .from("product-images")
          .upload(path, d.file, { contentType: d.file.type });
        if (upErr) throw upErr;
        image_url = path;
      }

      // Upload any additional new images
      const uploadedExtras: string[] = [];
      for (const f of d.newFiles ?? []) {
        const ext = f.name.split(".").pop() || "jpg";
        const path = `${crypto.randomUUID()}.${ext}`;
        const { error: upErr } = await supabase.storage
          .from("product-images")
          .upload(path, f, { contentType: f.type });
        if (upErr) throw upErr;
        uploadedExtras.push(path);
      }
      const image_urls = [...(d.image_urls ?? []), ...uploadedExtras];

      const payload = {
        name: d.name.trim(),
        description: d.description.trim(),
        category: d.category.trim() || "Geral",
        image_url,
        image_urls,
        sort_order: d.sort_order,
        additional_info: d.additional_info,
        availabilities: normalizeAvailabilities(d.availabilities),
        availability: normalizeAvailabilities(d.availabilities)[0],
        featured: !!d.featured,


      };
      if (d.id) {
        const { error } = await supabase.from("products").update(payload).eq("id", d.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("products").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-products"] });
      qc.invalidateQueries({ queryKey: ["products"] });
      setDraft(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (p: Product) => {
      const toRemove = [
        ...(p.image_url ? [p.image_url] : []),
        ...(p.image_urls ?? []),
      ];
      if (toRemove.length) await supabase.storage.from("product-images").remove(toRemove);
      const { error } = await supabase.from("products").delete().eq("id", p.id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-products"] });
      qc.invalidateQueries({ queryKey: ["products"] });
    },
  });

  async function handleSignOut() {
    await supabase.auth.signOut();
    navigate({ to: "/auth" });
  }

  if (isAdmin === null) {
    return <div className="grid min-h-screen place-items-center text-muted-foreground">Carregando…</div>;
  }

  if (isAdmin === false) {
    return (
      <div className="grid min-h-screen place-items-center bg-background px-4">
        <div className="max-w-md rounded-2xl border border-border bg-card p-8 text-center shadow-[var(--shadow-soft)]">
          <h1 className="text-xl font-bold">Acesso não autorizado</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Sua conta ({userId?.slice(0, 8)}…) não tem permissão de administrador. Solicite ao responsável pelo
            site que conceda o acesso.
          </p>
          <p className="mt-3 break-all rounded-md bg-secondary px-3 py-2 font-mono text-xs">
            User ID: {userId}
          </p>
          <button
            onClick={handleSignOut}
            className="mt-6 inline-flex items-center gap-2 rounded-full border border-border bg-background px-5 py-2 text-sm font-semibold hover:bg-secondary"
          >
            <LogOut className="h-4 w-4" /> Sair
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-4">
            <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary">
              <ArrowLeft className="h-4 w-4" /> Site
            </Link>
            <h1 className="text-lg font-bold tracking-tight">Painel admin · Catálogo</h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowNewUser(true)}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-sm font-semibold hover:bg-secondary"
              title="Cadastrar novo administrador"
            >
              <UserPlus className="h-4 w-4" /> <span className="hidden sm:inline">Novo admin</span>
            </button>
            <button
              onClick={() => setDraft({ ...EMPTY })}
              className="inline-flex items-center gap-2 rounded-full bg-[image:var(--gradient-primary)] px-4 py-2 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-soft)] hover:opacity-90"
            >
              <Plus className="h-4 w-4" /> <span className="hidden sm:inline">Novo produto</span>
            </button>
            <button
              onClick={handleSignOut}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-sm font-semibold hover:bg-secondary"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-soft)] sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[image:var(--gradient-primary)] text-primary-foreground">
              <Mail className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Conectado como</div>
              <div className="truncate text-sm font-semibold">{userEmail ?? "—"}</div>
            </div>
          </div>
          <button
            onClick={() => setShowChangePassword(true)}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-sm font-semibold hover:bg-secondary"
          >
            <KeyRound className="h-4 w-4" /> Alterar senha
          </button>
        </div>

        {showChangePassword && (
          <ChangePasswordForm onClose={() => setShowChangePassword(false)} />
        )}

        <HeroImageManager />
        <PartnerBrandsManager />


        {showNewUser && (
          <NewAdminForm
            onClose={() => setShowNewUser(false)}
            onCreate={async (email, password) => {
              await createUser({ data: { email, password } });
            }}
          />
        )}
        {draft && !draft.id && (
          <ProductForm
            draft={draft}
            onChange={setDraft}
            onCancel={() => setDraft(null)}
            onSave={() => saveMutation.mutate(draft)}
            saving={saveMutation.isPending}
            error={saveMutation.error?.message}
          />
        )}


        {(() => {
          const list = products ?? [];
          const categories = Array.from(new Set(list.map((p) => p.category).filter(Boolean))).sort((a, b) => a.localeCompare(b));
          const term = searchTerm.trim().toLowerCase();
          const filtered = list.filter((p) => {
            if (filterCategory !== "all" && p.category !== filterCategory) return false;
            if (filterAvailability !== "all" && !normalizeAvailabilities(p.availabilities, p.availability).includes(filterAvailability as Availability)) return false;
            if (term && !(`${p.name} ${p.description} ${p.category}`.toLowerCase().includes(term))) return false;
            return true;
          });

          return (
            <>
              <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-soft)] sm:flex-row sm:items-center">
                <input
                  type="search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar por nome, descrição ou especialidade…"
                  className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
                <select
                  value={filterAvailability}
                  onChange={(e) => setFilterAvailability(e.target.value)}
                  className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                >
                  <option value="all">Todas as vitrines</option>
                  {AVAILABILITY_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
                <select
                  value={filterCategory}

                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                >
                  <option value="all">Todas as especialidades</option>
                  {categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <div className="text-xs text-muted-foreground sm:whitespace-nowrap">
                  {filtered.length} de {list.length}
                </div>
              </div>

              <ul className="mt-4 divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
                {filtered.length === 0 && (
                  <li className="p-8 text-center text-muted-foreground">
                    {list.length === 0 ? "Nenhum produto cadastrado." : "Nenhum produto encontrado com esses filtros."}
                  </li>
                )}
                {filtered.map((p) => (
                  <li key={p.id}>
                    <div className="flex items-center gap-4 px-4 py-3">
                    <div className="grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-lg border border-border bg-white">
                      {p.image_url && signedThumbs[p.image_url] ? (
                        <img src={signedThumbs[p.image_url]} alt="" className="h-full w-full object-contain" />
                      ) : (
                        <ImageOff className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        {p.featured && (
                          <span title="Em destaque na página principal" className="shrink-0">
                            <Star className="h-4 w-4 fill-amber-400 text-amber-500" />
                          </span>
                        )}
                        <span className="truncate text-sm font-semibold">{p.name}</span>
                        <AvailabilityBadges values={normalizeAvailabilities(p.availabilities, p.availability)} />
                      </div>
                      <div className="truncate text-xs text-muted-foreground">
                        {p.category}
                        {p.description ? ` · ${p.description}` : ""}
                      </div>
                    </div>
                    <button
                      onClick={() =>
                        draft?.id === p.id
                          ? setDraft(null)
                          : setDraft({ ...p, image_urls: p.image_urls ?? [], availabilities: normalizeAvailabilities(p.availabilities, p.availability), featured: !!p.featured, file: null, newFiles: [] })
                      }
                      className={`rounded-md p-2 transition ${draft?.id === p.id ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-secondary hover:text-foreground"}`}
                      title="Editar"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Excluir "${p.name}"?`)) deleteMutation.mutate(p);
                      }}
                      className="rounded-md p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                      title="Excluir"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    </div>
                    {draft?.id === p.id && (
                      <div className="border-t border-border bg-secondary/30 px-4 py-4">
                        <ProductForm
                          draft={draft}
                          onChange={setDraft}
                          onCancel={() => setDraft(null)}
                          onSave={() => saveMutation.mutate(draft)}
                          saving={saveMutation.isPending}
                          error={saveMutation.error?.message}
                        />
                      </div>
                    )}
                  </li>
                ))}

              </ul>
            </>
          );
        })()}
      </main>
    </div>
  );
}

function ProductForm({
  draft,
  onChange,
  onCancel,
  onSave,
  saving,
  error,
}: {
  draft: Draft;
  onChange: (d: Draft) => void;
  onCancel: () => void;
  onSave: () => void;
  saving: boolean;
  error?: string;
}) {
  const [preview, setPreview] = useState<string | null>(null);
  useEffect(() => {
    if (!draft.file) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(draft.file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [draft.file]);

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-soft)]">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-bold">{draft.id ? "Editar produto" : "Novo produto"}</h2>
        <button onClick={onCancel} className="rounded-md p-2 text-muted-foreground hover:bg-secondary">
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Nome">
          <input
            value={draft.name}
            onChange={(e) => onChange({ ...draft, name: e.target.value })}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </Field>
        <Field label="Especialidade">
          <input
            value={draft.category}
            onChange={(e) => onChange({ ...draft, category: e.target.value })}
            placeholder="Ex.: Vídeo Nasofibroscópio"
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </Field>
        <Field label="Onde exibir este produto" full>
          <div className="flex flex-wrap gap-2">
            {SHOWCASE_OPTIONS.map((o) => {
              const current = draft.availabilities ?? [];
              const active = current.includes(o.value);
              return (
                <label
                  key={o.value}
                  className={`inline-flex cursor-pointer items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition ${
                    active ? AVAILABILITY_BADGE[o.value] : "border-border bg-background text-muted-foreground hover:bg-secondary"
                  }`}
                >
                  <input
                    type="checkbox"
                    className="accent-current"
                    checked={active}
                    onChange={() =>
                      onChange({
                        ...draft,
                        availabilities: normalizeAvailabilities(
                          active ? current.filter((v) => v !== o.value) : [...current, o.value],
                        ),
                      })
                    }
                  />
                  {o.label}
                </label>
              );
            })}
            <label
              className={`inline-flex cursor-pointer items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition ${
                normalizeAvailabilities(draft.availabilities)[0] === "fora_de_estoque"
                  ? AVAILABILITY_BADGE.fora_de_estoque
                  : "border-border bg-background text-muted-foreground hover:bg-secondary"
              }`}
            >
              <input
                type="checkbox"
                className="accent-current"
                checked={normalizeAvailabilities(draft.availabilities)[0] === "fora_de_estoque"}
                onChange={() => onChange({ ...draft, availabilities: ["fora_de_estoque"] })}
              />
              Fora de estoque
            </label>
            <label
              className={`inline-flex cursor-pointer items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition ${
                draft.featured
                  ? "border-amber-400/50 bg-amber-400/15 text-amber-700"
                  : "border-border bg-background text-muted-foreground hover:bg-secondary"
              }`}
            >
              <input
                type="checkbox"
                className="accent-current"
                checked={!!draft.featured}
                onChange={() => onChange({ ...draft, featured: !draft.featured })}
              />
              <Star className={`h-4 w-4 ${draft.featured ? "fill-amber-400 text-amber-500" : ""}`} />
              Página Principal
            </label>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Marque Catálogo e Locação juntos para exibir o produto nas duas abas. "Fora de estoque" (nenhuma vitrine marcada) mantém o produto cadastrado, mas oculto no site.
            "Página Principal" destaca o produto na home (estrela dourada).
          </p>
        </Field>


        <Field label="Descrição curta" full>
          <textarea
            value={draft.description}
            onChange={(e) => onChange({ ...draft, description: e.target.value })}
            rows={2}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </Field>
        <Field label="Informações adicionais (exibido na página do produto)" full>
          <textarea
            value={draft.additional_info}
            onChange={(e) => onChange({ ...draft, additional_info: e.target.value })}
            rows={6}
            placeholder="Especificações técnicas, materiais, dimensões, indicações de uso, garantia, etc."
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </Field>
        <Field label="Ordem (menor aparece primeiro)">
          <input
            type="number"
            value={draft.sort_order}
            onChange={(e) => onChange({ ...draft, sort_order: Number(e.target.value) || 0 })}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </Field>
        <Field label="Imagem de capa">
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-border bg-background px-3 py-2 text-sm hover:bg-secondary">
            <Upload className="h-4 w-4" />
            {draft.file ? draft.file.name : draft.image_url ? "Substituir imagem" : "Selecionar imagem"}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => onChange({ ...draft, file: e.target.files?.[0] ?? null })}
            />
          </label>
          {preview && <img src={preview} alt="" className="mt-2 h-24 rounded-md border border-border object-contain" />}
        </Field>
        <Field label="Imagens adicionais (galeria)" full>
          <ExtraImagesEditor
            existing={draft.image_urls ?? []}
            onRemoveExisting={(path: string) =>
              onChange({ ...draft, image_urls: (draft.image_urls ?? []).filter((p) => p !== path) })
            }
            newFiles={draft.newFiles ?? []}
            onAddFiles={(files: File[]) =>
              onChange({ ...draft, newFiles: [...(draft.newFiles ?? []), ...files] })
            }
            onRemoveNewFile={(idx: number) =>
              onChange({ ...draft, newFiles: (draft.newFiles ?? []).filter((_, i) => i !== idx) })
            }
          />
        </Field>
      </div>
      {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
      <div className="mt-5 flex justify-end gap-2">
        <button onClick={onCancel} className="rounded-full border border-border bg-background px-4 py-2 text-sm font-semibold hover:bg-secondary">
          Cancelar
        </button>
        <button
          onClick={onSave}
          disabled={saving || !draft.name.trim()}
          className="inline-flex items-center gap-2 rounded-full bg-[image:var(--gradient-primary)] px-5 py-2 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-soft)] hover:opacity-90 disabled:opacity-50"
        >
          <Save className="h-4 w-4" /> {saving ? "Salvando…" : "Salvar"}
        </button>
      </div>
      
    </div>
  );
}

function ExtraImagesEditor({
  existing,
  onRemoveExisting,
  newFiles,
  onAddFiles,
  onRemoveNewFile,
}: {
  existing: string[];
  onRemoveExisting: (path: string) => void;
  newFiles: File[];
  onAddFiles: (files: File[]) => void;
  onRemoveNewFile: (idx: number) => void;
}) {
  const [signed, setSigned] = useState<Record<string, string>>({});
  useEffect(() => {
    if (existing.length === 0) {
      setSigned((prev) => (Object.keys(prev).length === 0 ? prev : {}));
      return;
    }
    supabase.storage
      .from("product-images")
      .createSignedUrls(existing, 60 * 60)
      .then(({ data }) => {
        if (!data) return;
        const map: Record<string, string> = {};
        data.forEach((d) => {
          if (d.path && d.signedUrl) map[d.path] = d.signedUrl;
        });
        setSigned(map);
      });
  }, [existing]);

  const [previews, setPreviews] = useState<string[]>([]);
  useEffect(() => {
    const urls = newFiles.map((f) => URL.createObjectURL(f));
    setPreviews(urls);
    return () => urls.forEach((u) => URL.revokeObjectURL(u));
  }, [newFiles]);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-3">
        {existing.map((path) => (
          <div key={path} className="relative h-24 w-24 overflow-hidden rounded-md border border-border bg-white">
            {signed[path] ? (
              <img src={signed[path]} alt="" className="h-full w-full object-contain" />
            ) : (
              <div className="grid h-full w-full place-items-center text-xs text-muted-foreground">…</div>
            )}
            <button
              type="button"
              onClick={() => onRemoveExisting(path)}
              className="absolute right-1 top-1 grid h-6 w-6 place-items-center rounded-full bg-black/60 text-white hover:bg-destructive"
              title="Remover"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
        {newFiles.map((f, i) => (
          <div key={`new-${i}`} className="relative h-24 w-24 overflow-hidden rounded-md border border-dashed border-primary/50 bg-white">
            {previews[i] && <img src={previews[i]} alt="" className="h-full w-full object-contain" />}
            <span className="absolute left-1 top-1 rounded bg-primary px-1.5 py-0.5 text-[10px] font-bold text-primary-foreground">
              NOVO
            </span>
            <button
              type="button"
              onClick={() => onRemoveNewFile(i)}
              className="absolute right-1 top-1 grid h-6 w-6 place-items-center rounded-full bg-black/60 text-white hover:bg-destructive"
              title="Remover"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
        <label className="grid h-24 w-24 cursor-pointer place-items-center rounded-md border border-dashed border-border bg-background text-xs text-muted-foreground hover:bg-secondary">
          <div className="flex flex-col items-center gap-1">
            <Upload className="h-4 w-4" />
            Adicionar
          </div>
          <input
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => {
              const files = Array.from(e.target.files ?? []);
              if (files.length) onAddFiles(files);
              e.target.value = "";
            }}
          />
        </label>
      </div>
      <p className="text-xs text-muted-foreground">
        As imagens adicionais aparecem na página do produto como galeria. A capa é a "Imagem de capa" acima.
      </p>
    </div>
  );
}

function Field({ label, children, full }: { label: string; children: React.ReactNode; full?: boolean }) {
  return (
    <div className={full ? "sm:col-span-2" : ""}>
      <label className="text-xs font-semibold text-foreground">{label}</label>
      <div className="mt-1">{children}</div>
    </div>
  );
}

function NewAdminForm({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: (email: string, password: string) => Promise<void>;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setOk(null);
    setBusy(true);
    try {
      await onCreate(email.trim(), password);
      setOk(`Administrador "${email}" criado com sucesso.`);
      setEmail("");
      setPassword("");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Erro ao criar usuário.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mb-4 rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-soft)]">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-bold">Cadastrar novo administrador</h2>
        <button onClick={onClose} className="rounded-md p-2 text-muted-foreground hover:bg-secondary">
          <X className="h-4 w-4" />
        </button>
      </div>
      <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
        <Field label="E-mail">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </Field>
        <Field label="Senha (mínimo 6 caracteres)">
          <input
            type="password"
            autoComplete="new-password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </Field>
        {err && <p className="sm:col-span-2 text-sm text-destructive">{err}</p>}
        {ok && <p className="sm:col-span-2 text-sm text-primary">{ok}</p>}
        <div className="sm:col-span-2 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="rounded-full border border-border bg-background px-4 py-2 text-sm font-semibold hover:bg-secondary">
            Fechar
          </button>
          <button
            type="submit"
            disabled={busy || !email || password.length < 6}
            className="inline-flex items-center gap-2 rounded-full bg-[image:var(--gradient-primary)] px-5 py-2 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-soft)] hover:opacity-90 disabled:opacity-50"
          >
            {busy ? "Criando…" : "Criar administrador"}
          </button>
        </div>
      </form>
    </div>
  );
}

function ChangePasswordForm({ onClose }: { onClose: () => void }) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setOk(null);
    if (password.length < 6) {
      setErr("A senha deve ter ao menos 6 caracteres.");
      return;
    }
    if (password !== confirm) {
      setErr("As senhas não coincidem.");
      return;
    }
    setBusy(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setOk("Senha alterada com sucesso.");
      setPassword("");
      setConfirm("");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Erro ao alterar senha.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mb-4 rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-soft)]">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-bold">Alterar senha</h2>
        <button onClick={onClose} className="rounded-md p-2 text-muted-foreground hover:bg-secondary">
          <X className="h-4 w-4" />
        </button>
      </div>
      <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
        <Field label="Nova senha (mínimo 6 caracteres)">
          <input
            type="password"
            autoComplete="new-password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </Field>
        <Field label="Confirmar nova senha">
          <input
            type="password"
            autoComplete="new-password"
            required
            minLength={6}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </Field>
        {err && <p className="sm:col-span-2 text-sm text-destructive">{err}</p>}
        {ok && <p className="sm:col-span-2 text-sm text-primary">{ok}</p>}
        <div className="sm:col-span-2 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="rounded-full border border-border bg-background px-4 py-2 text-sm font-semibold hover:bg-secondary">
            Fechar
          </button>
          <button
            type="submit"
            disabled={busy || password.length < 6 || password !== confirm}
            className="inline-flex items-center gap-2 rounded-full bg-[image:var(--gradient-primary)] px-5 py-2 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-soft)] hover:opacity-90 disabled:opacity-50"
          >
            {busy ? "Salvando…" : "Salvar nova senha"}
          </button>
        </div>
      </form>
    </div>
  );
}

function useSignedThumb(path: string | null) {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    let cancelled = false;
    if (!path) { setUrl(null); return; }
    supabase.storage.from("product-images").createSignedUrl(path, 3600).then(({ data }) => {
      if (!cancelled) setUrl(data?.signedUrl ?? null);
    });
    return () => { cancelled = true; };
  }, [path]);
  return url;
}

function parseHeroPaths(value: string | null): string[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) return parsed.filter((v) => typeof v === "string");
  } catch {
    return [value];
  }
  return [];
}

function HeroThumb({ path, onRemove, busy }: { path: string; onRemove: () => void; busy: boolean }) {
  const url = useSignedThumb(path);
  return (
    <div className="relative h-24 w-40 shrink-0 overflow-hidden rounded-lg border border-border bg-white">
      {url ? (
        <img src={url} alt="Hero" className="h-full w-full object-cover" />
      ) : (
        <div className="grid h-full w-full place-items-center text-xs text-muted-foreground">…</div>
      )}
      <button
        type="button"
        onClick={onRemove}
        disabled={busy}
        className="absolute right-1 top-1 grid h-6 w-6 place-items-center rounded-full bg-black/60 text-white hover:bg-black/80 disabled:opacity-50"
        aria-label="Remover imagem"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

function HeroImageManager() {
  const qc = useQueryClient();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const { data: setting } = useQuery({
    queryKey: ["site_setting", "hero_image_paths"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_settings")
        .select("key,value")
        .in("key", ["hero_image_paths", "hero_image_path"]);
      if (error) throw error;
      const rows = (data ?? []) as { key: string; value: string | null }[];
      const multi = rows.find((r) => r.key === "hero_image_paths");
      const legacy = rows.find((r) => r.key === "hero_image_path");
      return (multi ?? legacy)?.value ?? null;
    },
  });

  const paths = parseHeroPaths(setting ?? null);

  async function persist(next: string[]) {
    const { error } = await supabase
      .from("site_settings")
      .upsert({ key: "hero_image_paths", value: JSON.stringify(next) }, { onConflict: "key" });
    if (error) throw error;
    qc.invalidateQueries({ queryKey: ["site_setting", "hero_image_paths"] });
    qc.invalidateQueries({ queryKey: ["site_setting", "hero_image_path"] });
  }

  async function handleUpload(files: FileList) {
    setErr(null);
    setBusy(true);
    try {
      const uploaded: string[] = [];
      for (const file of Array.from(files)) {
        const ext = file.name.split(".").pop() || "jpg";
        const path = `_hero/${crypto.randomUUID()}.${ext}`;
        const { error: upErr } = await supabase.storage
          .from("product-images").upload(path, file, { contentType: file.type });
        if (upErr) throw upErr;
        uploaded.push(path);
      }
      await persist([...paths, ...uploaded]);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Erro ao enviar imagem.");
    } finally {
      setBusy(false);
    }
  }

  async function handleRemove(path: string) {
    setErr(null);
    setBusy(true);
    try {
      await supabase.storage.from("product-images").remove([path]);
      await persist(paths.filter((p) => p !== path));
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Erro ao remover imagem.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="mb-4 rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-soft)]">
      <div className="mb-3 flex items-center gap-2">
        <ImageIcon className="h-4 w-4 text-primary" />
        <h2 className="text-base font-bold">Imagem principal (Hero da página inicial)</h2>
      </div>
      <p className="text-sm text-muted-foreground">
        Envie uma ou mais imagens (jpg/png) para o carrossel do topo da página inicial. Formato horizontal recomendado: 1600×900 px. As imagens se alternam automaticamente a cada 15 segundos.
      </p>
      <div className="mt-4 flex flex-wrap gap-3">
        {paths.length === 0 ? (
          <div className="grid h-24 w-40 place-items-center rounded-lg border border-dashed border-border bg-white/60 px-3 text-center text-xs text-muted-foreground">
            Usando imagem padrão
          </div>
        ) : (
          paths.map((p) => (
            <HeroThumb key={p} path={p} busy={busy} onRemove={() => handleRemove(p)} />
          ))
        )}
      </div>
      <label className="mt-4 inline-flex cursor-pointer items-center gap-2 rounded-full bg-[image:var(--gradient-primary)] px-5 py-2 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-soft)] hover:opacity-90">
        <Upload className="h-4 w-4" /> {busy ? "Enviando…" : "Adicionar imagens"}
        <input
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          disabled={busy}
          onChange={(e) => { const f = e.target.files; if (f && f.length) handleUpload(f); e.target.value = ""; }}
        />
      </label>
      {err && <p className="mt-2 text-sm text-destructive">{err}</p>}
    </section>
  );
}


type BrandRow = { id: string; name: string; url: string; logo_url: string | null; sort_order: number };
type BrandDraft = { id?: string; name: string; url: string; sort_order: number; logo_url: string | null; file: File | null };

function PartnerBrandsManager() {
  const qc = useQueryClient();
  const [draft, setDraft] = useState<BrandDraft | null>(null);

  const { data: brands = [] } = useQuery({
    queryKey: ["admin-brands"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("partner_brands").select("*").order("sort_order").order("name");
      if (error) throw error;
      return (data ?? []) as BrandRow[];
    },
  });

  const save = useMutation({
    mutationFn: async (d: BrandDraft) => {
      let logo_url = d.logo_url;
      if (d.file) {
        const ext = d.file.name.split(".").pop() || "png";
        const path = `_brands/${crypto.randomUUID()}.${ext}`;
        const { error: upErr } = await supabase.storage
          .from("product-images").upload(path, d.file, { contentType: d.file.type });
        if (upErr) throw upErr;
        logo_url = path;
      }
      const payload = { name: d.name.trim(), url: d.url.trim(), sort_order: d.sort_order, logo_url };
      if (d.id) {
        const { error } = await supabase.from("partner_brands").update(payload).eq("id", d.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("partner_brands").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-brands"] });
      qc.invalidateQueries({ queryKey: ["partner_brands"] });
      setDraft(null);
    },
  });

  const del = useMutation({
    mutationFn: async (b: BrandRow) => {
      if (b.logo_url) await supabase.storage.from("product-images").remove([b.logo_url]);
      const { error } = await supabase.from("partner_brands").delete().eq("id", b.id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-brands"] });
      qc.invalidateQueries({ queryKey: ["partner_brands"] });
    },
  });

  return (
    <section className="mb-4 rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-soft)]">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Building2 className="h-4 w-4 text-primary" />
          <h2 className="text-base font-bold">Marcas parceiras</h2>
        </div>
        <button
          onClick={() => setDraft({ name: "", url: "", sort_order: brands.length + 1, logo_url: null, file: null })}
          className="inline-flex items-center gap-2 rounded-full bg-[image:var(--gradient-primary)] px-4 py-2 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-soft)] hover:opacity-90"
        >
          <Plus className="h-4 w-4" /> Nova marca
        </button>
      </div>

      {draft && (
        <BrandForm
          draft={draft}
          onChange={setDraft}
          onCancel={() => setDraft(null)}
          onSave={() => save.mutate(draft)}
          saving={save.isPending}
          error={save.error?.message}
        />
      )}

      <ul className="mt-3 divide-y divide-border overflow-hidden rounded-xl border border-border">
        {brands.length === 0 && (
          <li className="bg-card p-5 text-center text-sm text-muted-foreground">Nenhuma marca cadastrada.</li>
        )}
        {brands.map((b) => (
          <BrandRowItem
            key={b.id}
            brand={b}
            onEdit={() => setDraft({ ...b, file: null })}
            onDelete={() => { if (confirm(`Excluir "${b.name}"?`)) del.mutate(b); }}
          />
        ))}
      </ul>
    </section>
  );
}

function BrandRowItem({ brand, onEdit, onDelete }: { brand: BrandRow; onEdit: () => void; onDelete: () => void }) {
  const url = useSignedThumb(brand.logo_url);
  return (
    <li className="flex items-center gap-4 bg-card px-4 py-3">
      <div className="grid h-12 w-20 shrink-0 place-items-center overflow-hidden rounded-md border border-border bg-white">
        {url ? <img src={url} alt="" className="h-full w-full object-contain p-1" /> : <ImageOff className="h-4 w-4 text-muted-foreground" />}
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-semibold">{brand.name}</div>
        <div className="truncate text-xs text-muted-foreground">{brand.url || "(sem link)"}</div>
      </div>
      <button onClick={onEdit} className="rounded-md p-2 text-muted-foreground hover:bg-secondary hover:text-foreground"><Pencil className="h-4 w-4" /></button>
      <button onClick={onDelete} className="rounded-md p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
    </li>
  );
}

function BrandForm({
  draft, onChange, onCancel, onSave, saving, error,
}: {
  draft: BrandDraft;
  onChange: (d: BrandDraft) => void;
  onCancel: () => void;
  onSave: () => void;
  saving: boolean;
  error?: string;
}) {
  const [preview, setPreview] = useState<string | null>(null);
  useEffect(() => {
    if (!draft.file) { setPreview(null); return; }
    const u = URL.createObjectURL(draft.file);
    setPreview(u);
    return () => URL.revokeObjectURL(u);
  }, [draft.file]);

  return (
    <div className="mb-3 rounded-xl border border-border bg-background p-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Nome">
          <input value={draft.name} onChange={(e) => onChange({ ...draft, name: e.target.value })}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
        </Field>
        <Field label="Link (URL)">
          <input value={draft.url} onChange={(e) => onChange({ ...draft, url: e.target.value })} placeholder="https://"
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
        </Field>
        <Field label="Ordem">
          <input type="number" value={draft.sort_order} onChange={(e) => onChange({ ...draft, sort_order: Number(e.target.value) || 0 })}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
        </Field>
        <Field label="Logo">
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-border bg-background px-3 py-2 text-sm hover:bg-secondary">
            <Upload className="h-4 w-4" />
            {draft.file ? draft.file.name : draft.logo_url ? "Substituir logo" : "Selecionar logo"}
            <input type="file" accept="image/*" className="hidden"
              onChange={(e) => onChange({ ...draft, file: e.target.files?.[0] ?? null })} />
          </label>
          {preview && <img src={preview} alt="" className="mt-2 h-16 rounded-md border border-border object-contain" />}
        </Field>
      </div>
      {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
      <div className="mt-4 flex justify-end gap-2">
        <button onClick={onCancel} className="rounded-full border border-border bg-background px-4 py-2 text-sm font-semibold hover:bg-secondary">
          Cancelar
        </button>
        <button onClick={onSave} disabled={saving || !draft.name.trim()}
          className="inline-flex items-center gap-2 rounded-full bg-[image:var(--gradient-primary)] px-5 py-2 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-soft)] hover:opacity-90 disabled:opacity-50">
          <Save className="h-4 w-4" /> {saving ? "Salvando…" : "Salvar"}
        </button>
      </div>
    </div>
  );
}


