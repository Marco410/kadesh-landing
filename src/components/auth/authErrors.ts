/**
 * Mensajes de auth para la persona. Nunca Prisma, GraphQL ni Keystone.
 */
function rawMessage(error: unknown): string {
  if (!error) return "";
  if (typeof error === "string") return error;
  if (error && typeof error === "object") {
    if ("graphQLErrors" in error) {
      const first = (error as { graphQLErrors?: { message?: string }[] })
        .graphQLErrors?.[0]?.message;
      if (first) return first;
    }
    if ("networkError" in error && (error as { networkError?: unknown }).networkError) {
      return "network";
    }
    if (error instanceof Error && error.message) return error.message;
    if ("message" in error && typeof (error as { message: unknown }).message === "string") {
      return (error as { message: string }).message;
    }
  }
  return "";
}

function looksTechnical(message: string): boolean {
  return /prisma|graphql|keystone|unique constraint|econnrefused|failed to fetch|access denied|you cannot|variable "\$/i.test(
    message,
  );
}

export function friendlyAuthError(
  error: unknown,
  fallback = "No se pudo completar. Intenta de nuevo.",
): string {
  const raw = rawMessage(error);
  const lower = raw.toLowerCase();

  if (!raw || lower === "network") {
    return "No hay conexión. Revisa tu internet e intenta de nuevo.";
  }

  if (lower.includes("unique constraint") && lower.includes("email")) {
    return "Ese correo ya tiene una cuenta. Inicia sesión o usa otro.";
  }

  if (lower.includes("unique constraint") && lower.includes("username")) {
    return "No pudimos crear tu usuario. Intenta de nuevo.";
  }

  if (lower.includes("unique constraint")) {
    return "Esos datos ya están en uso. Inicia sesión o cambia el correo.";
  }

  if (lower.includes("password") && (lower.includes("short") || lower.includes("least"))) {
    return "La contraseña debe tener al menos 8 caracteres.";
  }

  if (
    lower.includes("incorrect") ||
    lower.includes("authentication") ||
    lower.includes("password")
  ) {
    return "El correo o la contraseña no coinciden.";
  }

  if (looksTechnical(raw)) {
    return fallback;
  }

  return raw.split("\n")[0].trim() || fallback;
}
