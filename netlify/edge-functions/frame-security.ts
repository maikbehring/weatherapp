const CSP_VALUE =
  "frame-ancestors https://studio.mittwald.de https://*.mittwald.de";
const X_FRAME_VALUE = "allow-from https://studio.mittwald.de";

export default async function frameSecurity(
  request: Request,
  context: {
    next: () => Promise<Response>;
  },
) {
  const response = await context.next();

  const headers = new Headers(response.headers);
  headers.set("Content-Security-Policy", CSP_VALUE);
  headers.set("X-Frame-Options", X_FRAME_VALUE);

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

export const config = {
  path: "/*",
};

