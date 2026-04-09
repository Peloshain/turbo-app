export function parseDataUrl(dataUrl: string) {
  const [meta, base64] = dataUrl.split(",");
  const mimeType = meta.split(":")[1].split(";")[0];
  return { base64, mimeType };
}
