import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ArrowLeft, LogOut, Plus, Pencil, Trash2, Save, X, Upload, ImageOff, UserPlus, KeyRound, Mail, Image as ImageIcon, Building2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { createAdminUser } from "@/lib/admin-users.functions";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin — VGM Medical" }, { name: "robots", content: "noindex" }] }),
  component: AdminPage,
});

type Product = {
  id: string;
  name: string;
  description: string;
  category: string;
  image_url: string | null;
  sort_order: number;
};

type Draft = {
  id?: string;
  name: string;
  description: string;
  category: string;
  image_url: string | null;
  sort_order: number;
  file?: File | null;
};

const EMPTY: Draft = { name: "", description: "", category: "", image_url: null, sort_order: 0, file: null };

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

  const { data: products = [] } = useQuery({
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
    const paths = products.map((p) => p.image_url).filter((p): p is string => !!p);
    if (paths.length === 0) {
      setSignedThumbs({});
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
      const payload = {
        name: d.name.trim(),
        description: d.description.trim(),
        category: d.category.trim() || "Geral",
        image_url,
        sort_order: d.sort_order,
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
      if (p.image_url) await supabase.storage.from("product-images").remove([p.image_url]);
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
        {draft && (
          <ProductForm
            draft={draft}
            onChange={setDraft}
            onCancel={() => setDraft(null)}
            onSave={() => saveMutation.mutate(draft)}
            saving={saveMutation.isPending}
            error={saveMutation.error?.message}
          />
        )}

        <ul className="mt-6 divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
          {products.length === 0 && (
            <li className="p-8 text-center text-muted-foreground">Nenhum produto cadastrado.</li>
          )}
          {products.map((p) => (
            <li key={p.id} className="flex items-center gap-4 px-4 py-3">
              <div className="grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-lg border border-border bg-white">
                {p.image_url && signedThumbs[p.image_url] ? (
                  <img src={signedThumbs[p.image_url]} alt="" className="h-full w-full object-contain" />
                ) : (
                  <ImageOff className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold">{p.name}</div>
                <div className="truncate text-xs text-muted-foreground">
                  {p.category}
                  {p.description ? ` · ${p.description}` : ""}
                </div>
              </div>
              <button
                onClick={() => setDraft({ ...p, file: null })}
                className="rounded-md p-2 text-muted-foreground hover:bg-secondary hover:text-foreground"
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
            </li>
          ))}
        </ul>
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
        <Field label="Categoria">
          <input
            value={draft.category}
            onChange={(e) => onChange({ ...draft, category: e.target.value })}
            placeholder="Ex.: Pinças Anatômicas"
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </Field>
        <Field label="Descrição" full>
          <textarea
            value={draft.description}
            onChange={(e) => onChange({ ...draft, description: e.target.value })}
            rows={2}
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
        <Field label="Imagem">
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

