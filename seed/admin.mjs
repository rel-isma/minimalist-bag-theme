import { readFile } from 'node:fs/promises';
import { API_VERSION, digest, seedDirectory } from './lib.mjs';

const pause = ms => new Promise(resolve => setTimeout(resolve, ms));
export class ShopifyAdmin {
  constructor(store, token, fetcher = fetch) {
    if (!/^[a-z0-9][a-z0-9-]*\.myshopify\.com$/i.test(store ?? '')) throw new Error('SHOPIFY_STORE must be a .myshopify.com domain without a scheme or path.');
    if (!token) throw new Error('Set SHOPIFY_ADMIN_TOKEN locally. Never place it in a file or chat.');
    this.store = store.toLowerCase(); this.token = token; this.fetcher = fetcher;
  }

  async graphql(query, variables = {}, attempt = 0) {
    const response = await this.fetcher(`https://${this.store}/admin/api/${API_VERSION}/graphql.json`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Shopify-Access-Token': this.token },
      body: JSON.stringify({ query, variables }), signal: AbortSignal.timeout(60000), redirect: 'error'
    });
    // Retrying a mutation after an unknown server failure can duplicate a create.
    // Retry only an explicit throttle rejection, which did not execute the operation.
    if (response.status === 429 && attempt < 5) { await pause(Math.min(10000, Number(response.headers.get('retry-after') || 2) * 1000)); return this.graphql(query, variables, attempt + 1); }
    if (!response.ok) throw new Error(`Shopify HTTP ${response.status}; operation stopped. Re-run to reconcile by handle.`);
    const result = await response.json();
    if (result.errors?.length) {
      if (result.errors.every(error => error.extensions?.code === 'THROTTLED') && attempt < 5) { await pause(2000 * (attempt + 1)); return this.graphql(query, variables, attempt + 1); }
      throw new Error(result.errors.map(error => error.message).join('; '));
    }
    for (const payload of Object.values(result.data ?? {})) {
      if (payload?.userErrors?.length) throw new Error(payload.userErrors.map(error => `${error.field?.join('.') ?? ''}: ${error.message}`).join('; '));
    }
    return result.data;
  }

  async all(connection, fields, query = null) {
    const nodes = []; let cursor = null;
    do {
      const data = await this.graphql(`query List($cursor: String, $query: String) { ${connection}(first: 25, after: $cursor, query: $query) { nodes { ${fields} } pageInfo { hasNextPage endCursor } } }`, { cursor, query });
      nodes.push(...data[connection].nodes); cursor = data[connection].pageInfo.hasNextPage ? data[connection].pageInfo.endCursor : null;
    } while (cursor);
    return nodes;
  }

  async uploadImage(image, state, saveState) {
    const bytes = await readFile(new URL(`images/${image.file}`, seedDirectory));
    const hash = digest(bytes.toString('base64'));
    const cached = state.files[image.file];
    if (cached) {
      if (cached.hash !== hash) throw new Error(`Image ${image.file} changed after upload. Delete this demo seed before replacing its files.`);
      const { node } = await this.graphql('query File($id: ID!) { node(id: $id) { ... on MediaImage { id fileStatus image { url } } } }', { id: cached.id });
      if (node) {
        const ready = node.fileStatus === 'READY' && node.image?.url ? { id: cached.id, hash, url: node.image.url } : await this.waitForImage(cached.id, hash);
        state.files[image.file] = ready; await saveState(); return ready;
      }
      delete state.files[image.file];
    }
    // Filename reconciliation handles a process interruption after fileCreate.
    const files = await this.all('files', '... on MediaImage { id alt fileStatus image { url } }', `filename:${image.file}`);
    const owned = files.filter(file => file.alt === image.alt);
    if (files.length && !owned.length) throw new Error(`Unowned file collision: ${image.file}.`);
    if (owned.length > 1) throw new Error(`Multiple matching uploads for ${image.file}; reconcile in Shopify Files before retrying.`);
    if (owned.length) {
      const ready = await this.waitForImage(owned[0].id, hash);
      state.files[image.file] = ready; await saveState(); return ready;
    }
    const staged = await this.graphql('mutation Stage($input: [StagedUploadInput!]!) { stagedUploadsCreate(input: $input) { stagedTargets { url resourceUrl parameters { name value } } userErrors { field message } } }', { input: [{ filename: image.file, mimeType: 'image/jpeg', resource: 'IMAGE', httpMethod: 'POST', fileSize: String(bytes.length) }] });
    const target = staged.stagedUploadsCreate.stagedTargets[0];
    if (!target) throw new Error(`No upload target for ${image.file}.`);
    const form = new FormData();
    for (const parameter of target.parameters) form.append(parameter.name, parameter.value);
    form.append('file', new Blob([bytes], { type: 'image/jpeg' }), image.file);
    const uploaded = await this.fetcher(target.url, { method: 'POST', body: form, signal: AbortSignal.timeout(60000) });
    if (!uploaded.ok) throw new Error(`Staged upload failed (${uploaded.status}) for ${image.file}.`);
    const created = await this.graphql('mutation CreateFile($files: [FileCreateInput!]!) { fileCreate(files: $files) { files { id fileStatus } userErrors { field message } } }', { files: [{ originalSource: target.resourceUrl, filename: image.file, contentType: 'IMAGE', alt: image.alt, duplicateResolutionMode: 'RAISE_ERROR' }] });
    const id = created.fileCreate.files[0]?.id;
    if (!id) throw new Error(`No file ID for ${image.file}.`);
    state.files[image.file] = { id, hash }; await saveState();
    const ready = await this.waitForImage(id, hash);
    state.files[image.file] = ready; await saveState(); return ready;
  }

  async waitForImage(id, hash) {
    for (let i = 0; i < 30; i++) {
      const { node } = await this.graphql('query File($id: ID!) { node(id: $id) { ... on MediaImage { id fileStatus image { url } } } }', { id });
      if (node?.fileStatus === 'READY' && node.image?.url) return { id, hash, url: node.image.url };
      if (!node || node.fileStatus === 'FAILED') throw new Error(`Image processing failed for ${id}.`);
      await pause(2000);
    }
    throw new Error(`Image processing is still pending for ${id}; re-run later.`);
  }
}
