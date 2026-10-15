// Reuse Shopify CLI's managed app authentication; never export its access token.
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { mkdtemp, readFile, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { ShopifyAdmin } from './admin.mjs';
import { API_VERSION } from './lib.mjs';

const executeFile = promisify(execFile);
export class ShopifyCliAdmin extends ShopifyAdmin {
  constructor(store, { cli = 'shopify', allowMutations = false, execute = executeFile } = {}) {
    super(store, 'cli-managed-auth-not-an-api-token');
    this.cli = cli;
    this.allowMutations = allowMutations;
    this.execute = execute;
  }

  async graphql(query, variables = {}) {
    // Seed operations use one named query or mutation per document.
    const operation = query.trim().match(/^(query|mutation)\b/);
    if (!operation) throw new Error('Use one explicitly named GraphQL query or mutation.');
    if (operation[1] === 'mutation' && !this.allowMutations) throw new Error('CLI adapter is read-only; mutations were not enabled.');
    const directory = await mkdtemp(join(tmpdir(), 'atelier-cli-operation-'));
    try {
      const queryFile = join(directory, 'query.graphql');
      const variablesFile = join(directory, 'variables.json');
      const outputFile = join(directory, 'result.json');
      await writeFile(queryFile, query, { mode: 0o600 });
      await writeFile(variablesFile, JSON.stringify(variables), { mode: 0o600 });
      const args = ['store', 'execute', '--store', this.store, '--version', API_VERSION,
        '--query-file', queryFile, '--variable-file', variablesFile, '--output-file', outputFile, '--no-input', '--no-color'];
      if (operation[1] === 'mutation') args.push('--allow-mutations');
      // Do not retry ambiguous mutations. The seeder reconciles resources on rerun.
      try { await this.execute(this.cli, args, { timeout: 120000, maxBuffer: 2 * 1024 * 1024 }); }
      catch (error) { throw new Error(`Shopify CLI operation failed: ${String(error.stderr || error.message).slice(0, 2000)}`); }
      const data = JSON.parse(await readFile(outputFile, 'utf8'));
      if (data.errors?.length) throw new Error(data.errors.map(error => error.message).join('; '));
      // store execute writes the GraphQL data object directly, not {data: ...}.
      for (const payload of Object.values(data)) {
        if (payload?.userErrors?.length) throw new Error(payload.userErrors.map(error => `${error.field?.join('.') ?? ''}: ${error.message}`).join('; '));
      }
      return data;
    } finally {
      await rm(directory, { recursive: true, force: true });
    }
  }
}
