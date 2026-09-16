import { v } from "convex/values";
import { internalAction } from "./_generated/server";
import { internal } from "./_generated/api";

const escapeHtml = (s: string) =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

/**
 * Emails the admin an approve/deny link when someone signs up.
 * Requires RESEND_API_KEY + ADMIN_EMAIL env vars (convex env set ...).
 * FROM_EMAIL defaults to a verified @antoniosmith.xyz sender.
 */
export const sendSignupApproval = internalAction({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const apiKey = process.env.RESEND_API_KEY;
    const adminEmail = process.env.ADMIN_EMAIL;
    if (!apiKey || !adminEmail) {
      console.warn(
        "Signup approval email skipped: RESEND_API_KEY or ADMIN_EMAIL not set",
      );
      return;
    }

    const signup = await ctx.runQuery(internal.users.getPendingById, {
      userId: args.userId,
    });
    if (!signup) return; // already resolved or token gone

    const baseUrl =
      process.env.CONVEX_SITE_URL ??
      "https://silent-wolf-650.convex.site";
    const approvalUrl = `${baseUrl}/signup-approval?token=${encodeURIComponent(signup.approvalToken)}`;
    const name = escapeHtml(signup.name);
    const from =
      process.env.FROM_EMAIL ??
      "Times Tables Fun <noreply@antoniosmith.xyz>";

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [adminEmail],
        subject: `New player on Times Tables Fun: ${signup.name}`,
        html: `
          <div style="font-family:system-ui,sans-serif;max-width:480px;margin:0 auto;padding:24px">
            <h2 style="color:#2EC2B3;margin:0 0 12px">New player signup ⭐</h2>
            <p style="color:#242E42;font-size:16px">
              <strong>${signup.avatar ?? "🦊"} ${name}</strong> just created an
              account on Times Tables Fun and is waiting for approval.
            </p>
            <a href="${approvalUrl}"
               style="display:inline-block;background:#2EC2B3;color:#fff;font-weight:bold;
                      padding:12px 24px;border-radius:12px;text-decoration:none;margin:8px 0">
              Review this signup →
            </a>
            <p style="color:#888;font-size:13px">
              If you don't recognise this, just ignore it — the account stays locked.
            </p>
          </div>`,
      }),
    });

    if (!res.ok) {
      console.error("Resend error", res.status, await res.text());
    }
  },
});
