import "@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "@supabase/server";

export default {
  fetch: withSupabase({ auth: ["publishable", "secret"] }, async (req, ctx) => {
    const body = await req.json();
    const { role, email, name, ...details } = body;

    // 1. Create the auth user
    const { data: authUser, error: authError } = await ctx.supabaseAdmin.auth.admin.createUser({
      email,
      email_confirm: true
    });

    if (authError) {
      return Response.json({ error: authError.message }, { status: 400 });
    }

    const userId = authUser.user.id;

    // 2. Insert into users table
    const { error: userError } = await ctx.supabaseAdmin
      .from('users')
      .insert({ id: userId, role });

    if (userError) {
      return Response.json({ error: userError.message }, { status: 400 });
    }

    // 3. Insert into role-specific table
    const table = role === 'student' ? 'students' : 'teachers';
    const { error: detailError } = await ctx.supabaseAdmin
      .from(table)
      .insert({ user_id: userId, name, email, ...details });

    if (detailError) {
      return Response.json({ error: detailError.message }, { status: 400 });
    }

    return Response.json({ success: true, userId });
  }),
};