export function isValidURL(string: string) {
  let url;
  try {
    url = new URL(string);
  } catch (_) {
    return false;
  }

  return url.protocol === "http:" || url.protocol === "https:";
}

export function isValidHex(hex: string) {
  return /^(#)?([a-fA-F0-9]{3}|[a-fA-F0-9]{6})$/.test(hex);
}
