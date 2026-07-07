import { CLOUDFLARE_WEB_ANALYTICS_TOKEN, TURNSTILE_SITE_KEY } from "../domain/publicConfig";

function escapeHtml(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function analyticsScript(): string {
  if (!CLOUDFLARE_WEB_ANALYTICS_TOKEN) {
    return "";
  }
  return `<script defer src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon='{"token":"${escapeHtml(
    CLOUDFLARE_WEB_ANALYTICS_TOKEN,
  )}"}'></script>`;
}

function turnstileScript(): string {
  if (!TURNSTILE_SITE_KEY) {
    return "";
  }
  return '<script defer src="https://challenges.cloudflare.com/turnstile/v0/api.js"></script>';
}

export function appShell(): string {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Appeal Compass</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,650;12..96,800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="/styles.css">
    <script type="module" src="/app.js"></script>
    ${turnstileScript()}
    ${analyticsScript()}
  </head>
  <body>
    <main id="app"></main>
  </body>
</html>`;
}
