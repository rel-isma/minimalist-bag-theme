/** The release gate lives in scripts/package.sh; no development files enter the ZIP. */
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import path from 'node:path';
const root = path.resolve(import.meta.dirname, '..');
const { stdout } = await promisify(execFile)('bash', [path.join(root, 'scripts/package.sh')], { cwd: root });
console.log(stdout.trim());
