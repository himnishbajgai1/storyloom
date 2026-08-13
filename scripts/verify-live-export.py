import base64
import json
import os
import sys
import time
import urllib.request
import websocket

url = sys.argv[1] if len(sys.argv) > 1 else "https://storyloom-fwngklrd.manus.space"
image_path = sys.argv[2] if len(sys.argv) > 2 else "/home/ubuntu/upload/pasted_file_iXoGb6_image.png"
page = next(item for item in json.load(urllib.request.urlopen("http://127.0.0.1:9222/json")) if item.get("type") == "page")
ws = websocket.create_connection(page["webSocketDebuggerUrl"], suppress_origin=True)
next_id = 0

def call(method, params=None):
    global next_id
    next_id += 1
    ws.send(json.dumps({"id": next_id, "method": method, "params": params or {}}))
    while True:
        result = json.loads(ws.recv())
        if result.get("id") == next_id:
            if "error" in result:
                raise RuntimeError(result["error"])
            return result.get("result", {})

def evaluate(expression):
    result = call("Runtime.evaluate", {"expression": expression, "awaitPromise": True, "returnByValue": True})
    return result.get("result", {}).get("value")

call("Page.enable")
call("DOM.enable")
call("Page.navigate", {"url": url})
time.sleep(2)
document = call("DOM.getDocument", {"depth": -1})
query = call("DOM.querySelector", {"nodeId": document["root"]["nodeId"], "selector": "input[type=file]"})
if not query.get("nodeId"):
    raise RuntimeError("Upload input not found")
call("DOM.setFileInputFiles", {"nodeId": query["nodeId"], "files": [image_path]})
time.sleep(1)
evaluate("""(() => { const field = document.querySelector('textarea'); if (!field) return false; const setter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value').set; setter.call(field, 'Book more qualified calls for my coaching offer'); field.dispatchEvent(new Event('input', { bubbles: true })); field.dispatchEvent(new Event('change', { bubbles: true })); return true; })()""")
evaluate("""(() => { const button = [...document.querySelectorAll('button')].find(item => item.textContent?.includes('Create stories')); button?.click(); return Boolean(button); })()""")
time.sleep(9)
evaluate("""(() => { const button = [...document.querySelectorAll('button')].find(item => item.textContent?.trim() === 'Luxury'); button?.click(); return Boolean(button); })()""")
time.sleep(.5)
evaluate("""(() => { const inputs = [...document.querySelectorAll('input[type=color]')]; const values = ['#ff7a59', '#123456', '#e7f0d0']; inputs.forEach((input, index) => { const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set; setter?.call(input, values[index]); input.dispatchEvent(new Event('input', { bubbles: true })); input.dispatchEvent(new Event('change', { bubbles: true })); }); return inputs.length; })()""")
time.sleep(.5)
evaluate("""(() => { const labels = [...document.querySelectorAll('label')]; const setValue = (label, value) => { const input = label?.querySelector('input'); if (!input) return false; const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set; setter?.call(input, value); input.dispatchEvent(new Event('input', { bubbles: true })); input.dispatchEvent(new Event('change', { bubbles: true })); return true; }; const badge = labels.find(item => item.textContent?.includes('Badge / eyebrow')); const cta = labels.find(item => item.textContent?.includes('CTA button')); const ribbon = labels.find(item => item.textContent?.includes('Step ribbon')); return { badge: setValue(badge, 'THE PROOF'), cta: setValue(cta, 'See the full story →'), ribbon: setValue(ribbon, 'Message → Method → Momentum') }; })()""")
time.sleep(.5)
evaluate("""(() => { const labels = [...document.querySelectorAll('label')]; return { badge: Boolean(labels.find(item => item.textContent?.includes('Badge / eyebrow'))), cta: Boolean(labels.find(item => item.textContent?.includes('CTA button'))) }; })()""")
time.sleep(.5)
preview_png = call("Page.captureScreenshot", {"format": "png"}).get("data")
if preview_png:
    with open("/home/ubuntu/Downloads/live-preview-e5ge9r.png", "wb") as output:
        output.write(base64.b64decode(preview_png))
evaluate("""(() => { const button = [...document.querySelectorAll('button')].find(item => item.textContent?.trim() === 'Export'); button?.click(); return Boolean(button); })()""")
time.sleep(2)
print(json.dumps({"url": url, "image": image_path, "preview": "/home/ubuntu/Downloads/live-preview-e5ge9r.png", "downloads": [name for name in os.listdir('/home/ubuntu/Downloads') if name.endswith('.png')][-5:]}, indent=2))
ws.close()
