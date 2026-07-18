export function getMediaUrl(path: string | undefined): string {
  if (!path) return "";
  if (path.startsWith("blob:") || path.startsWith("http")) return path;

  const baseUrl = (import.meta.env.VITE_API_URL ?? "http://localhost:8000/api/v1").replace(/\/api\/v1\/?$/, "");
  
  // Clean up the path, stripping leading slash and 'uploads/portfolio/'
  const cleanPath = path.replace(/^\/?uploads\/portfolio\//, "").replace(/^\/?/, "");
  
  return `${baseUrl}/portfolio/media/${cleanPath}`;
}
