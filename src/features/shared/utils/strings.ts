export function getInitials(name: string) {
  if (!name) return "";

  const [firstName = "", lastName = ""] = name.trim().split(" ") ?? [];
  if (!firstName) return "";

  return `${firstName.at(0) ?? ""}${lastName.at(0) ?? firstName.at(1)}`.toUpperCase();
}
