/** ZIP only the seven Shopify theme directories. Seed data and Node tooling stay outside. */
import { mkdir } from 'node:fs/promises';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import path from 'node:path';
const exec = promisify(execFile);
const root = path.resolve(import.meta.dirname, '..');
await mkdir(path.join(root, 'dist'), { recursive: true });
const script = `import pathlib, zipfile, hashlib, json
root=pathlib.Path.cwd()
target=root/'dist/atelier-vane-theme.zip'
with zipfile.ZipFile(target,'w',zipfile.ZIP_DEFLATED) as archive:
 for folder in ['assets','config','layout','locales','sections','snippets','templates']:
  for file in sorted((root/folder).rglob('*')):
   if file.is_file(): archive.write(file,file.relative_to(root))
with zipfile.ZipFile(target) as archive:
 assert archive.testzip() is None
 files=archive.namelist()
 assert 'layout/theme.liquid' in files and 'templates/index.json' in files
 assert all(name.split('/')[0] in ['assets','config','layout','locales','sections','snippets','templates'] for name in files)
manifest={'theme':'Atelier Vane','version':'2.0.1','files':len(files),'bytes':target.stat().st_size,'sha256':hashlib.sha256(target.read_bytes()).hexdigest(),'scope':'Native Shopify theme only; seed and documentation separate'}
(root/'dist/package-manifest.json').write_text(json.dumps(manifest,indent=2)+'\\n')
print(json.dumps(manifest))`;
const { stdout } = await exec('python3', ['-c', script], { cwd: root });
console.log(stdout.trim());
