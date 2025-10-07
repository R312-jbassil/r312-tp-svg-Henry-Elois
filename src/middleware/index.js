import PocketBase from "pocketbase";

const PB_URL = process.env.PB_URL || "http://127.0.0.1:8090";

// factory : crée une instance fraîche (recommandé pour SSR)
export function createPb() {
  return new PocketBase(PB_URL);
}

// export optionnel d'un singleton pour usage côté client
export const pb = createPb();

export const onRequest = async (context, next) => {
  const cookie = context.cookies.get("pb_auth")?.value;
  if (cookie) {
    pb.authStore.loadFromCookie(cookie);
    if (pb.authStore.isValid) {
      context.locals.user = pb.authStore.record;
    }
  }

  // 🔒 Protection des routes API
  if (context.url.pathname.startsWith("/api/")) {
    if (
      !context.locals.user &&
      context.url.pathname !== "/api/login" &&
      context.url.pathname !== "/api/signup" // ✅ autoriser aussi le signup API
    ) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
      });
    }
    return next();
  }

  // 🧭 Protection des pages normales
  if (!context.locals.user) {
    // ✅ On autorise /login, /signup et /
    if (
      context.url.pathname !== "/login" &&
      context.url.pathname !== "/signup" &&
      context.url.pathname !== "/"
    ) {
      return Response.redirect(new URL("/login", context.url), 303);
    }
  }

  // 🌐 Gestion du changement de langue
  if (context.request.method === "POST") {
    const form = await context.request.formData().catch(() => null);
    const lang = form?.get("language");

    if (lang === "en" || lang === "fr") {
      context.cookies.set("locale", String(lang), {
        path: "/",
        maxAge: 60 * 60 * 24 * 365,
      });
      return Response.redirect(
        new URL(context.url.pathname + context.url.search, context.url),
        303
      );
    }
  }

  const cookieLocale = context.cookies.get("locale")?.value;
  context.locals.lang =
    cookieLocale === "fr" || cookieLocale === "en"
      ? cookieLocale
      : context.preferredLocale ?? "en";

  return next();
};
