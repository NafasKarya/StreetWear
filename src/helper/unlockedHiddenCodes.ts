// src/helpers/unlockedHiddenCodes.ts
export function getUnlockedCodesMap(): Record<string, string> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem("unlockedHiddenCodesMap") || "{}");
  } catch {
    return {};
  }
}

export function saveUnlockedCodesMap(map: Record<string, string>) {
  if (typeof window !== "undefined") {
    localStorage.setItem("unlockedHiddenCodesMap", JSON.stringify(map));
  }
}

export function unlockCodeFor(uuid: string): string {
  const map = getUnlockedCodesMap();
  return map[uuid] || "";
}
