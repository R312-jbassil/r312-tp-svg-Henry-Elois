import pb from "../../../utils/pb";
import { Collections } from "../../../utils/pocketbase-types";

export const POST = async ({ request, cookies }) => {
  try {
    // Récupération des infos envoyées depuis le formulaire
    const { email, password, passwordConfirm } = await request.json();

    // Vérifie que les deux mots de passe sont identiques
    if (password !== passwordConfirm) {
      return new Response(
        JSON.stringify({ error: "Les mots de passe ne correspondent pas." }),
        { status: 400 }
      );
    }

    // Crée un nouvel utilisateur dans PocketBase
    const newUser = await pb.collection(Collections.Users).create({
      email,
      password,
      passwordConfirm,
    });

    // Connecte immédiatement l'utilisateur après inscription
    const authData = await pb
      .collection(Collections.Users)
      .authWithPassword(email, password);

    // Enregistre le token d'authentification dans un cookie sécurisé
    cookies.set("pb_auth", pb.authStore.exportToCookie(), {
      path: "/",
      httpOnly: true,
      sameSite: "strict",
      expires: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 an
    });

    // Retourne les infos du nouvel utilisateur
    return new Response(JSON.stringify({ user: authData.record }), {
      status: 200,
    });
  } catch (err) {
    console.error("Erreur d'inscription :", err);
    return new Response(
      JSON.stringify({
        error:
          err?.data?.message ||
          err?.message ||
          "Une erreur est survenue lors de l'inscription.",
      }),
      { status: 400 }
    );
  }
};
