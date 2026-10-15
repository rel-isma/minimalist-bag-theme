#!/usr/bin/env bash
# Native Shopify package only. --check validates sources without writing a ZIP.
set -euo pipefail
cd "$(dirname "$0")/.."
python3 - "$@" <<'PY'
import sys,json,re,zipfile,pathlib,hashlib
root=pathlib.Path.cwd();args=sys.argv[1:]
if args not in ([],['--check']):raise SystemExit('Usage: bash scripts/package.sh [--check]')
check_only=args==['--check'];allowed=['assets','blocks','config','layout','locales','sections','snippets','templates']
files=[];issues=[]
for folder in allowed:
 base=root/folder
 if base.is_symlink():issues.append(f'Symlink directory is not allowed: {folder}');continue
 for p in sorted(base.rglob('*')):
  if p.is_symlink():issues.append(f'Symlink is not allowed: {p.relative_to(root)}');continue
  if p.is_file():files.append(p)
required=['layout/theme.liquid','config/settings_schema.json','config/settings_data.json','templates/404.json','templates/article.json','templates/blog.json','templates/cart.json','templates/collection.json','templates/index.json','templates/list-collections.json','templates/page.json','templates/page.contact.json','templates/password.json','templates/product.json','templates/search.json','templates/gift_card.liquid']
for name in required:
 if not(root/name).is_file():issues.append(f'Missing required-by-brief file: {name}')
if len(files)>100000:issues.append('More than 100,000 files')
if len(list((root/'templates').glob('*.json')))>1000:issues.append('More than 1,000 JSON templates')
if len(list((root/'sections').glob('*.json')))>20:issues.append('More than 20 section groups')
if len(list((root/'blocks').glob('*.liquid')))>300:issues.append('More than 300 theme block files')
if sum(p.stat().st_size for p in files if p.relative_to(root).parts[0]!='assets')>250*1024*1024:issues.append('Non-asset code exceeds 250 MB')
for p in files:
 rel=p.relative_to(root);size=p.stat().st_size
 limit=20*1024*1024 if rel.parts[0]=='assets' else 256*1024
 if p.name=='settings_data.json' or rel.parts[0]=='locales':limit=int(1.5*1024*1024)
 elif p.name=='settings_schema.json' or p.suffix=='.json':limit=512*1024
 if size>limit:issues.append(f'File too large: {rel} ({size} bytes)')
 if p.suffix=='.json':
  try:d=json.loads(p.read_text())
  except Exception as e:issues.append(f'Invalid JSON {rel}: {e}');continue
  if rel.parts[0]in['templates','sections'] and isinstance(d,dict) and 'sections'in d:
   if len(d['sections'])>25:issues.append(f'More than 25 sections: {rel}')
   if sum(len(s.get('blocks',{})) for s in d['sections'].values())>1250:issues.append(f'More than 1,250 blocks: {rel}')
   for sid,s in d['sections'].items():
    source=root/'sections'/f"{s['type']}.liquid"
    if not source.is_file():issues.append(f'Missing section type {s["type"]}: {rel}');continue
    match=re.search(r'{%\s*schema\s*%}([\s\S]*?){%\s*endschema\s*%}',source.read_text())
    schema=json.loads(match.group(1)) if match else {}
    maximum=min(50,schema.get('max_blocks',50))
    if len(s.get('blocks',{}))>maximum:issues.append(f'Too many blocks in {rel}:{sid}')
    declared={b['type'] for b in schema.get('blocks',[])}
    for block in s.get('blocks',{}).values():
     if block['type']not in declared and not(block['type'].startswith('shopify://apps/')and'@app'in declared):issues.append(f'Undeclared block type {block["type"]} in {rel}:{sid}')
if issues:
 print(json.dumps({'ok':False,'files':len(files),'issues':issues},indent=2));raise SystemExit(1)
if check_only:
 print(json.dumps({'ok':True,'files':len(files),'mode':'check-only'}));raise SystemExit(0)
target=root/'dist'/'atelier-vane-theme.zip';target.parent.mkdir(exist_ok=True)
with zipfile.ZipFile(target,'w',zipfile.ZIP_DEFLATED) as z:
 for p in files:z.write(p,p.relative_to(root))
with zipfile.ZipFile(target) as z:
 assert z.testzip()is None
 assert all(n.split('/')[0]in allowed for n in z.namelist())
if target.stat().st_size>50*1024*1024:raise SystemExit('Compressed ZIP exceeds 50 MB; do not upload it')
schema=json.loads((root/'config/settings_schema.json').read_text())
version=next((group.get('theme_version') for group in schema if group.get('name')=='theme_info'),'unknown')
manifest={'ok':True,'theme':'Atelier Vane','version':version,'file':str(target),'files':len(files),'bytes':target.stat().st_size,'sha256':hashlib.sha256(target.read_bytes()).hexdigest()}
(root/'dist/package-manifest.json').write_text(json.dumps(manifest,indent=2)+'\n')
print(json.dumps(manifest))
PY
