import fs from "node:fs";
import http from "node:http";
import WebSocket from "ws";

const targetUrl = process.argv[2] ?? "https://storyloom-fwngklrd.manus.space";
const imagePath = process.argv[3] ?? "/home/ubuntu/upload/pasted_file_iXoGb6_image.png";

const json = await new Promise((resolve, reject) => {
  http.get("http://127.0.0.1:9222/json", response => {
    let body = "";
    response.on("data", chunk => { body += chunk; });
    response.on("end", () => resolve(JSON.parse(body)));
  }).on("error", reject);
});
const page = json.find(item => item.type === "page");
if (!page?.webSocketDebuggerUrl) throw new Error("No managed browser page found");
const socket = new WebSocket(page.webSocketDebuggerUrl);
let nextId = 0;
const pending = new Map();
socket.on("message", raw => {
  const message = JSON.parse(raw.toString());
  if (message.id && pending.has(message.id)) {
    pending.get(message.id)(message);
    pending.delete(message.id);
  }
});
const call = (method, params = {}) => new Promise((resolve, reject) => {
  const id = ++nextId;
  pending.set(id, message => message.error ? reject(new Error(JSON.stringify(message.error))) : resolve(message.result));
  socket.send(JSON.stringify({ id, method, params }));
});
await new Promise(resolve => socket.once("open", resolve));
await call("Page.enable");
await call("DOM.enable");
await call("Page.navigate", { url: targetUrl });
await new Promise(resolve => setTimeout(resolve, 1800));

const evaluate = async expression => (await call("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true })).result?.value;
const inputNodeId = await evaluate("document.querySelector('input[type=file]') ? document.querySelector('input[type=file]').getAttribute('data-cdp-node') : null");
const documentNode = await call("DOM.getDocument", { depth: -1 });
const query = await call("DOM.querySelector", { nodeId: documentNode.root.nodeId, selector: "input[type=file]" });
if (!query.nodeId) throw new Error("Upload input was not found");
await call("DOM.setFileInputFiles", { nodeId: query.nodeId, files: [imagePath] });
await new Promise(resolve => setTimeout(resolve, 700));
await evaluate(`(() => { const field = document.querySelector('textarea'); if (!field) return false; const setter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value').set; setter.call(field, 'Book more qualified calls for my coaching offer'); field.dispatchEvent(new Event('input', { bubbles: true })); field.dispatchEvent(new Event('change', { bubbles: true })); return true; })()`);
await evaluate(`(() => { const button = [...document.querySelectorAll('button')].find(item => item.textContent?.includes('Create stories')); button?.click(); return Boolean(button); })()`);
await new Promise(resolve => setTimeout(resolve, 9000));
await evaluate(`(() => { const button = [...document.querySelectorAll('button')].find(item => item.textContent?.trim() === 'Luxury'); button?.click(); return Boolean(button); })()`);
await new Promise(resolve => setTimeout(resolve, 400));
await evaluate(`(() => { const labels = [...document.querySelectorAll('label')]; const badge = labels.find(item => item.textContent?.includes('Badge / eyebrow')); const cta = labels.find(item => item.textContent?.includes('CTA button')); badge?.querySelector('button')?.click(); cta?.querySelector('button')?.click(); return { badge: Boolean(badge), cta: Boolean(cta) }; })()`);
await new Promise(resolve => setTimeout(resolve, 500));
await evaluate(`(() => { const button = [...document.querySelectorAll('button')].find(item => item.textContent?.trim() === 'Export'); button?.click(); return Boolean(button); })()`);
await new Promise(resolve => setTimeout(resolve, 2200));
console.log(JSON.stringify({ targetUrl, imagePath, downloads: fs.readdirSync("/home/ubuntu/Downloads").filter(name => name.endsWith(".png")).slice(-5) }, null, 2));
socket.close();
