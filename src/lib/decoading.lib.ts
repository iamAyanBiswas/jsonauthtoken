import type { Runtimes } from "../../types";
const decoading = (runtime: Runtimes, str: string) => {
  // Replace URL-safe characters with standard Base64 characters
  const base64 = str.replace(/-/g, '+').replace(/_/g, '/');

  // Add padding if necessary
  const padding = '='.repeat((4 - base64.length % 4) % 4);
  const base64WithPadding = base64 + padding;

  let decoded: string;

  if (runtime === 'node') {
    // Node.js
    decoded = Buffer.from(base64WithPadding, 'base64').toString('utf8');
  } else {
    // Browser (handles UTF-8)
    decoded = decodeURIComponent(escape(atob(base64WithPadding)));
  }

  return JSON.parse(decoded);
};

export default decoading

