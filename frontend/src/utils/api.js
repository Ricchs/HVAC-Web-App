export async function apiFetch(url, options = {}) {
  let response;
  try {
    response = await fetch(url, options);
  } catch (error) {
    if (error.name === "AbortError") throw error;
    throw new Error("Check your connection and try again.");
  }

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    const detail =
      typeof body?.detail === "string"
        ? body.detail
        : (body?.detail?.[0]?.msg ?? "Something went wrong");
    throw new Error(detail.replace("Value error, ", ""));
  }

  return response.json();
}
