import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const BOOTSTRAP_EMAIL = "phelippecorreia@gmail.com";
const BOOTSTRAP_PASSWORD = "Ph123963741*";

/**
 * Idempotent bootstrap: if there are zero admins, create the configured
 * primary administrator. Safe to call repeatedly — it becomes a no-op as
 * soon as an admin exists.
 */
export const bootstrapInitialAdmin = createServerFn({ method: "POST" }).handler(
  async () => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { count, error: countErr } = await supabaseAdmin
      .from("user_roles")
      .select("*", { count: "exact", head: true })
      .eq("role", "admin");
    if (countErr) throw new Error(countErr.message);
    if ((count ?? 0) > 0) return { created: false };

    // Find or create the bootstrap user.
    let userId: string | null = null;
    const { data: list, error: listErr } = await supabaseAdmin.auth.admin.listUsers({
      page: 1,
      perPage: 200,
    });
    if (listErr) throw new Error(listErr.message);
    const existing = list.users.find(
      (u) => u.email?.toLowerCase() === BOOTSTRAP_EMAIL.toLowerCase(),
    );
    if (existing) {
      userId = existing.id;
    } else {
      const { data: created, error: createErr } =
        await supabaseAdmin.auth.admin.createUser({
          email: BOOTSTRAP_EMAIL,
          password: BOOTSTRAP_PASSWORD,
          email_confirm: true,
        });
      if (createErr) throw new Error(createErr.message);
      userId = created.user?.id ?? null;
    }
    if (!userId) throw new Error("Falha ao obter ID do usuário inicial.");

    const { error: roleErr } = await supabaseAdmin
      .from("user_roles")
      .insert({ user_id: userId, role: "admin" });
    if (roleErr && !roleErr.message.includes("duplicate")) throw new Error(roleErr.message);

    return { created: true };
  },
);

/**
 * Admin-only: create a new user with email/password and grant admin role.
 */
export const createAdminUser = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { email: string; password: string }) => {
    const email = String(d?.email ?? "").trim().toLowerCase();
    const password = String(d?.password ?? "");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("E-mail inválido.");
    if (password.length < 6) throw new Error("A senha precisa ter pelo menos 6 caracteres.");
    return { email, password };
  })
  .handler(async ({ data, context }) => {
    // Verify caller is admin (RLS-scoped client + has_role check)
    const { data: isAdmin, error: roleCheckErr } = await context.supabase.rpc(
      "has_role",
      { _user_id: context.userId, _role: "admin" },
    );
    if (roleCheckErr) throw new Error(roleCheckErr.message);
    if (!isAdmin) throw new Error("Apenas administradores podem criar usuários.");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: created, error: createErr } =
      await supabaseAdmin.auth.admin.createUser({
        email: data.email,
        password: data.password,
        email_confirm: true,
      });
    if (createErr) throw new Error(createErr.message);

    const newId = created.user?.id;
    if (!newId) throw new Error("Falha ao criar usuário.");

    const { error: insertErr } = await supabaseAdmin
      .from("user_roles")
      .insert({ user_id: newId, role: "admin" });
    if (insertErr && !insertErr.message.includes("duplicate"))
      throw new Error(insertErr.message);

    return { id: newId, email: data.email };
  });
