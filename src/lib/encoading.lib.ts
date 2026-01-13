import type { Runtimes } from "../../types";
function encoading(runtime: Runtimes, data: any): string {
  const json = JSON.stringify(data);
  let base64: string;

  if (runtime === 'node') {
    // Node.js
    base64 = Buffer.from(json).toString('base64');
  } else {
    // Browser (handles UTF-8)
    base64 = btoa(unescape(encodeURIComponent(json)));
  }

  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export default encoading