export function capitalize(str: string, allWords = false): string {
  if (!str) return "";

  if (allWords) {
    return str
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  }

  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}
