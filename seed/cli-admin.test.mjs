import test from 'node:test';
import assert from 'node:assert/strict';
import { access, readFile, stat, writeFile } from 'node:fs/promises';
import { ShopifyCliAdmin } from './cli-admin.mjs';

test('managed CLI auth passes literal variables in private files and removes temporary results', async () => {
  let operationPath;
  const literal = 'Literal $(do-not-run) `also-literal`\nUnicode —';
  const admin = new ShopifyCliAdmin('atelier-vane-test.myshopify.com', { execute: async (cli, args) => {
    assert.equal(cli, 'shopify');
    assert.ok(!args.includes('--allow-mutations'));
    operationPath = args[args.indexOf('--query-file') + 1];
    const variablesPath = args[args.indexOf('--variable-file') + 1];
    assert.equal((await stat(variablesPath)).mode & 0o777, 0o600);
    assert.equal(JSON.parse(await readFile(variablesPath)).value, literal);
    await writeFile(args[args.indexOf('--output-file') + 1], JSON.stringify({ shop: { name: 'Test' } }));
  }});
  assert.deepEqual(await admin.graphql('query Test($value: String) { shop { name } }', { value: literal }), { shop: { name: 'Test' } });
  await assert.rejects(access(operationPath));
});

test('mutations require explicit adapter authorization and propagate user errors without retries', async () => {
  const readonly = new ShopifyCliAdmin('atelier-vane-test.myshopify.com', { execute: () => assert.fail('Must not execute') });
  await assert.rejects(readonly.graphql('mutation Save { example }'), /read-only/);
  let calls = 0;
  const admin = new ShopifyCliAdmin('atelier-vane-test.myshopify.com', { allowMutations: true, execute: async (cli, args) => {
    calls++;
    assert.ok(args.includes('--allow-mutations'));
    await writeFile(args[args.indexOf('--output-file') + 1], JSON.stringify({ example: { userErrors: [{ field: ['input'], message: 'Invalid value' }] } }));
  }});
  await assert.rejects(admin.graphql('mutation Save { example }'), /input: Invalid value/);
  assert.equal(calls, 1);
});

test('CLI failures are not retried and operation files are removed', async () => {
  let filename, calls = 0;
  const admin = new ShopifyCliAdmin('atelier-vane-test.myshopify.com', { allowMutations: true, execute: async (cli, args) => {
    calls++;
    filename = args[args.indexOf('--query-file') + 1];
    throw new Error('Connection interrupted');
  }});
  await assert.rejects(admin.graphql('mutation Save { example }'), /Connection interrupted/);
  assert.equal(calls, 1);
  await assert.rejects(access(filename));
});
