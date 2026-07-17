// Centraliza a lógica de exibição do nome do usuário.
// Regra: nunca mostrar o email completo. Preferir nome escolhido pelo usuário.

type AnyUser =
  | {
      email?: string | null;
      user_metadata?: Record<string, any> | null;
    }
  | null
  | undefined;

const isEmailLike = (value?: string | null): boolean => {
  if (!value) return true;
  return value.includes("@");
};

const cleanName = (value?: string | null): string | null => {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (isEmailLike(trimmed)) return null;
  return trimmed;
};

/**
 * Retorna o melhor nome para exibir:
 * 1. display_name do profile (se não for um email)
 * 2. metadata: display_name, full_name, name, username (se não for email)
 * 3. parte antes do @ do email
 * 4. "Usuário"
 */
export function resolveDisplayName(
  profileDisplayName: string | null | undefined,
  user: AnyUser
): string {
  const fromProfile = cleanName(profileDisplayName);
  if (fromProfile) return fromProfile;

  const meta = user?.user_metadata || {};
  const fromMeta =
    cleanName(meta.display_name) ||
    cleanName(meta.full_name) ||
    cleanName(meta.name) ||
    cleanName(meta.username);
  if (fromMeta) return fromMeta;

  const email = user?.email || "";
  const localPart = email.split("@")[0];
  if (localPart) return localPart;

  return "Usuário";
}

/** Inicial para o avatar fallback. */
export function initialFromName(name: string): string {
  return (name || "U").trim().charAt(0).toUpperCase() || "U";
}
