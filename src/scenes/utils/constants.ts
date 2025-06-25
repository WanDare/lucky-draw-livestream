let baseUrl = import.meta.env.VITE_API_URL as string;

if (
  typeof window !== "undefined" &&
  location.protocol === "https:" &&
  baseUrl.startsWith("http://")
) {
  baseUrl = baseUrl.replace("http://", "https://");
}

export const API_BASE_URL = baseUrl;
