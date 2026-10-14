/** Local development server. Renders theme Liquid with fixture data; never contacts Shopify. */
const http = require('node:http');
const fs = require('node:fs/promises');
const path = require('node:path');
const os = require('node:os');
const crypto = require('node:crypto');
const { spawn } = require('node:child_process');
const PORT = Number(process.env.PORT || 3333);
const sessions = new Map();
const resized = new Map();
const mime = { '.css': 'text/css', '.js': 'text/javascript', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.png': 'image/png', '.svg': 'image/svg+xml', '.html': 'text/html' };
async function main() {
  const theme = await import('./seed/preview-liquid.mjs');
  const { root, products, productMap, collections, collectionMap, pages, routes, baseContext, renderStore, renderSection, filteredCollection, esc } = theme;
  const send = (res, status, data, type = 'text/html') => { res.writeHead(status, { 'Content-Type': `${type}; charset=utf-8`, 'Cache-Control': 'no-store' });res.end(data); };
  async function resizedImage(file, width) {
    const stat = await fs.stat(file);const key = crypto.createHash('sha256').update(file + stat.mtimeMs + width).digest('hex');
    if (!resized.has(key)) resized.set(key, (async () => {
      const output = path.join(os.tmpdir(), `atelier-image-${key}${path.extname(file)}`);
      try { return await fs.readFile(output); } catch {}
      const script = 'from PIL import Image\nimport sys\nim=Image.open(sys.argv[1]).convert("RGB")\nw=min(int(sys.argv[2]),im.width)\nim.thumbnail((w,10000))\nim.save(sys.argv[3],"WEBP" if sys.argv[3].endswith(".webp") else "JPEG",quality=80,optimize=True)';
      await new Promise((resolve, reject) => { const proc = spawn('python3', ['-c', script, file, String(width), output], { stdio: 'ignore' });proc.on('error', reject);proc.on('exit', code => code === 0 ? resolve() : reject(new Error('Image resize failed'))); });
      return fs.readFile(output);
    })().catch(() => fs.readFile(file)));
    return resized.get(key);
  }
  const server = http.createServer(async (req, res) => {
    try {
      const url = new URL(req.url, `http://127.0.0.1:${PORT}`);
      let sessionId = /(?:^|;\s*)atelier_preview=([a-f0-9]{32})(?:;|$)/.exec(req.headers.cookie || '')?.[1];
      if (!sessionId || !sessions.has(sessionId)) { sessionId = crypto.randomBytes(16).toString('hex');sessions.set(sessionId, { items: [], note: '' });res.setHeader('Set-Cookie', `atelier_preview=${sessionId}; HttpOnly; SameSite=Lax; Path=/`); }
      const state = sessions.get(sessionId);
      let context = baseContext(url, state);
      const page = async (name, extra, status = 200) => send(res, status, await renderStore(name, { ...context, ...extra }, url));
      const drawer = async () => renderSection('cart-drawer', 'cart-drawer', {}, baseContext(url, state));
      if (req.method === 'POST') {
        const chunks = [];let size = 0;
        for await (const chunk of req) { size += chunk.length;if (size > 1024 * 1024) return send(res, 413, 'Request too large.');chunks.push(chunk); }
        const raw = Buffer.concat(chunks);
        let body;
        if ((req.headers['content-type'] || '').includes('application/json')) body = JSON.parse(raw.toString());
        else { const form = await new Request(url, { method: 'POST', headers: req.headers, body: raw }).formData();body = Object.fromEntries(form);body.updates = form.getAll('updates[]'); }
        const pathname = url.pathname.replace(/\.js$/, '');
        if (pathname === '/cart/add') {
          const incoming = body.items || [{ id: Number(body.id), quantity: Number(body.quantity || 1) }];
          for (const item of incoming) if (!products.some(p => p.variants.some(v => v.id === Number(item.id) && v.available)) || !Number.isInteger(Number(item.quantity)) || Number(item.quantity) < 1 || Number(item.quantity) > 99) return send(res, 422, JSON.stringify({ description: 'Choose a valid variant and a quantity from 1 to 99.' }), 'application/json');
          for (const item of incoming) { const existing = state.items.find(line => line.id === Number(item.id));if (existing) existing.quantity += Number(item.quantity);else state.items.push({ id: Number(item.id), quantity: Number(item.quantity) }); }
          if (!url.pathname.endsWith('.js')) { res.writeHead(303, { Location: '/cart' });res.end();return; }
        } else if (pathname === '/cart/change') {
          const line = body.line ? state.items[Number(body.line) - 1] : state.items.find(line => `preview-${line.id}` === body.id || line.id === Number(body.id));
          if (!line || !Number.isInteger(Number(body.quantity)) || Number(body.quantity) < 0 || Number(body.quantity) > 99) return send(res, 422, JSON.stringify({ description: 'Could not change this quantity.' }), 'application/json');
          line.quantity = Number(body.quantity);state.items = state.items.filter(line => line.quantity > 0);
        } else if (pathname === '/cart/update') {
          if (typeof body.note === 'string') state.note = body.note.slice(0, 2000);
        } else if (pathname === '/cart') {
          if (body.updates) state.items.forEach((line, index) => { const qty = Number(body.updates[index]);if (Number.isInteger(qty) && qty >= 0 && qty <= 99) line.quantity = qty; });
          state.items = state.items.filter(line => line.quantity > 0);state.note = String(body.note || '').slice(0, 2000);
          if ('checkout' in body) return send(res, 200, `<link rel="stylesheet" href="/assets/base.css"><main class="container section-spacing"><h1 class="section-heading">Local demo checkout</h1><p>No order or payment was created. Checkout requires your connected Shopify store.</p><a class="btn btn--secondary" href="/cart">Return to your bag</a></main>`);
          res.writeHead(303, { Location: '/cart' });res.end();return;
        } else return send(res, 501, `<link rel="stylesheet" href="/assets/base.css"><main class="container section-spacing"><h1 class="section-heading">This form needs Shopify</h1><p>No message, subscription or login was submitted by this local preview.</p><a class="btn btn--secondary" href="/">Return to the store</a></main>`);
        if (typeof body.note === 'string') state.note = body.note.slice(0, 2000);
        send(res, 200, JSON.stringify({ ...theme.cartObject(state), sections: { 'cart-drawer': await drawer() } }), 'application/json');return;
      }
      if (req.method !== 'GET' && req.method !== 'HEAD') return send(res, 405, 'Method not allowed.');
      if (url.pathname.startsWith('/assets/') || /^\/seed\/(images\/[a-z0-9-]+\.jpg|[a-z0-9-]+\.html|preview-products\/[a-z0-9-]+\.html)$/.test(url.pathname)) {
        const file = path.resolve(root, '.' + decodeURIComponent(url.pathname));
        const publicRoot = path.join(root, url.pathname.startsWith('/assets/') ? 'assets' : 'seed');
        if (!file.startsWith(publicRoot + path.sep)) return send(res, 404, 'Not found.');
        const ext = path.extname(file);if (!mime[ext]) return send(res, 404, 'Not found.');
        const width = Number(url.searchParams.get('width'));
        const content = ['.jpg', '.webp'].includes(ext) && width >= 80 && width <= 2400 ? await resizedImage(file, width) : await fs.readFile(file);
        res.writeHead(200, { 'Content-Type': mime[ext], 'Cache-Control': ['.js', '.css', '.html'].includes(ext) ? 'no-store' : 'public, max-age=3600' });res.end(content);return;
      }
      if (url.pathname === '/cart.js') return send(res, 200, JSON.stringify(theme.cartObject(state)), 'application/json');
      if (url.searchParams.get('sections') === 'cart-drawer') return send(res, 200, JSON.stringify({ 'cart-drawer': await drawer() }), 'application/json');
      if (url.pathname === '/cart/change') { const index = Number(url.searchParams.get('line')) - 1;if (state.items[index]) state.items[index].quantity = Number(url.searchParams.get('quantity') || 0);state.items = state.items.filter(line => line.quantity > 0);res.writeHead(303, { Location: '/cart' });res.end();return; }
      if (url.pathname === '/') return page('index', { page_title: 'Atelier Vane', template: { name: 'index' } });
      if (url.pathname === '/collections') return page('list-collections', { page_title: 'Collections', template: { name: 'list-collections' } });
      const collectionHandle = /^\/collections\/([a-z0-9-]+)$/.exec(url.pathname)?.[1];
      if (collectionHandle && collectionMap[collectionHandle]) return page('collection', { collection: filteredCollection(collectionMap[collectionHandle], url), page_title: collectionMap[collectionHandle].title, template: { name: 'collection' } });
      const productHandle = /^\/products\/([a-z0-9-]+)$/.exec(url.pathname)?.[1];
      if (productHandle && productMap[productHandle]) {
        const original = productMap[productHandle];const variant = original.variants.find(v => String(v.id) === url.searchParams.get('variant')) || original.variants[0];const product = { ...original, selected_or_first_available_variant: variant };
        context = { ...context, product, page_title: product.title, template: { name: 'product' } };
        const section = url.searchParams.get('section_id');
        if (['quick-view', 'recent-product-card'].includes(section)) return send(res, 200, await renderSection(section, section, {}, context));
        return page('product', context);
      }
      if (url.pathname === '/recommendations/products') {
        const product = products.find(p => String(p.id) === url.searchParams.get('product_id'));if (!product) return send(res, 404, 'No product.');
        const intent = url.searchParams.get('intent');const suggestions = products.filter(p => p.id !== product.id && (intent === 'complementary' ? p.tags.includes('accessory') : p.type === product.type)).slice(0, Number(url.searchParams.get('limit') || 4));
        return send(res, 200, await renderSection('product-recommendations', url.searchParams.get('section_id') || 'related', { intent: intent || 'related', limit: 4, heading: intent === 'complementary' ? 'To carry together' : 'You may also like' }, { ...context, product, recommendations: { products: suggestions, products_count: suggestions.length } }));
      }
      if (url.pathname === '/search' || url.pathname === '/search/suggest') {
        const terms = url.searchParams.get('q') || '';const query = terms.trim().toLowerCase();const matchingProducts = query ? products.filter(p => `${p.title} ${p.content} ${p.variants.map(v => v.title)}`.toLowerCase().includes(query)) : [];const matchingPages = query ? Object.values(pages).filter(p => `${p.title} ${p.content}`.toLowerCase().includes(query)) : [];
        if (url.pathname === '/search/suggest') return send(res, 200, await renderSection('predictive-search', 'predictive-search', {}, { ...context, predictive_search: { performed: true, terms, resources: { products: matchingProducts.slice(0, 5), pages: matchingPages.slice(0, Math.max(0, 6 - Math.min(5, matchingProducts.length))) } } }));
        const results = [...matchingProducts, ...matchingPages];return page('search', { search: { performed: url.searchParams.has('q'), terms, results, results_count: results.length }, page_title: 'Search', template: { name: 'search' } });
      }
      if (url.pathname === '/cart') return page('cart', { page_title: 'Your bag', template: { name: 'cart' } });
      const pageHandle = /^\/(?:pages|policies)\/([a-z0-9-]+)$/.exec(url.pathname)?.[1];
      if (pageHandle && pages[pageHandle]) return page(pages[pageHandle].templateSuffix ? `page.${pages[pageHandle].templateSuffix}` : 'page', { page: pages[pageHandle], page_title: pages[pageHandle].title, template: { name: 'page' } });
      if (url.pathname === '/account') return page('page', { page: { title: 'Account', content: '<p>Customer accounts are provided by your connected Shopify store. No local account is created.</p>' }, page_title: 'Account', template: { name: 'page' } });
      return page('404', { page_title: 'Page not found', template: { name: '404' } }, 404);
    } catch (err) {
      if (err.code === 'ENOENT') { send(res, 404, 'Not found.');return; }
      console.error(err.message);send(res, 500, 'Local preview could not render this page. See the terminal for details.');
    }
  });
  server.on('error', err => { console.error(err.message);process.exitCode = 1; });
  server.listen(PORT, '127.0.0.1', () => console.log(`Atelier Vane local demo store: http://localhost:${PORT}\n22 demo products. Shopify checkout, accounts and form submissions are not connected.`));
}
main().catch(err => { console.error(err.message);process.exitCode = 1; });
