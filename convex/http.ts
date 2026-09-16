import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";

const http = httpRouter();

const escapeHtml = (s: string) =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

function page(title: string, inner: string): Response {
  const html = `<!doctype html>
<html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escapeHtml(title)} — Times Tables Fun</title>
<style>
  body{font-family:system-ui,sans-serif;background:#FAF8F3;display:flex;min-height:100vh;
       align-items:center;justify-content:center;margin:0;padding:16px}
  .card{background:#fff;border-radius:16px;box-shadow:0 4px 24px rgba(0,0,0,.08);
        padding:32px;max-width:420px;width:100%;text-align:center}
  h1{color:#242E42;font-size:24px;margin:0 0 12px}
  p{color:#555;line-height:1.5}
  .btns{display:flex;gap:12px;margin-top:24px}
  button{flex:1;padding:14px;border:0;border-radius:12px;font-size:16px;
         font-weight:bold;cursor:pointer}
  .approve{background:#2EC2B3;color:#fff}
  .deny{background:#F4F1EA;color:#555}
</style></head>
<body><div class="card">${inner}</div></body></html>`;
  return new Response(html, {
    status: 200,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}

// GET — confirmation page only. Never mutates state, so email scanners
// prefetching the link can't approve a signup by accident.
http.route({
  path: "/signup-approval",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const token = new URL(request.url).searchParams.get("token") ?? "";
    const user = await ctx.runQuery(internal.users.getByApprovalToken, {
      token,
    });

    if (!user) {
      return page(
        "Link expired",
        `<h1>Link expired</h1><p>This approval link has already been used or is invalid.</p>`,
      );
    }
    if (user.status !== "pending") {
      return page(
        "Already done",
        `<h1>Already ${escapeHtml(user.status)}</h1><p><strong>${escapeHtml(user.name)}</strong>'s account was already handled.</p>`,
      );
    }

    const name = escapeHtml(user.name);
    return page(
      "Approve player?",
      `<h1>Approve ${user.avatar ?? "🦊"} ${name}?</h1>
       <p>A new player signed up on <strong>Times Tables Fun</strong> and is waiting for your approval.</p>
       <form method="POST" action="/signup-approval">
         <input type="hidden" name="token" value="${escapeHtml(token)}">
         <div class="btns">
           <button type="submit" name="action" value="deny" class="deny">Deny</button>
           <button type="submit" name="action" value="approve" class="approve">Approve ⭐</button>
         </div>
       </form>`,
    );
  }),
});

// POST — performs the approve/deny action from the confirmation form.
http.route({
  path: "/signup-approval",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const form = await request.formData();
    const token = String(form.get("token") ?? "");
    const action = form.get("action") === "deny" ? "deny" : "approve";

    const result = await ctx.runMutation(internal.users.resolveApproval, {
      token,
      action,
    });

    if (!result.ok) {
      const msg =
        result.reason === "already_resolved"
          ? `<strong>${escapeHtml(result.name ?? "That player")}</strong>'s account was already handled.`
          : "This link has already been used or is invalid.";
      return page("Already done", `<h1>Nothing to do</h1><p>${msg}</p>`);
    }

    const name = escapeHtml(result.name);
    return result.action === "approve"
      ? page(
          "Approved",
          `<h1>⭐ Approved!</h1><p><strong>${name}</strong> can now sign in and play. Nice one!</p>`,
        )
      : page(
          "Denied",
          `<h1>Denied</h1><p><strong>${name}</strong>'s signup was rejected.</p>`,
        );
  }),
});

export default http;
