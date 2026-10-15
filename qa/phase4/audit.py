"""Read-only heuristic reference audit. Findings require human review; never deletes."""
import hashlib
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / 'qa/phase4'
dirs = ('assets', 'config', 'layout', 'locales', 'sections', 'snippets', 'templates', 'blocks')
files = {str(p.relative_to(ROOT)): p for d in dirs for p in (ROOT / d).rglob('*') if p.is_file()}
texts = {k: p.read_text() for k, p in files.items() if p.suffix in ('.liquid', '.json', '.js', '.css')}
edges, dynamic = [], []

def edge(source, target, kind):
    edges.append(dict(source=source, target=target, kind=kind, exists=target in files))

for source, text in texts.items():
    for m in re.finditer(r"{%[-\s]*(render|include|section|sections)\s+(['\"])(.*?)\2", text):
        kind, name = m[1], m[3]
        folder, suffix = ('snippets', '.liquid') if kind in ('render', 'include') else ('sections', '.json' if kind == 'sections' else '.liquid')
        edge(source, f'{folder}/{name}{suffix}', kind)
    for m in re.finditer(r"(['\"])([^'\"\n]+)\1\s*\|\s*asset_url", text):
        edge(source, 'assets/' + m[2], 'asset_url')
    for m in re.finditer(r"{%[-\s]*(?:render|include)\s+(?!['\"])([\w.]+)", text):
        dynamic.append(dict(source=source, expression=m[1], kind='dynamic render; app block may be intentional'))
    for m in re.finditer(r"(?:section_id=|section_id:\s*['\"])([\w-]+)", text):
        if 'sections/' + m[1] + '.liquid' in files:
            edge(source, 'sections/' + m[1] + '.liquid', 'JS section endpoint')
    for m in re.finditer(r"set\(\s*['\"]section_id['\"]\s*,\s*['\"]([\w-]+)['\"]", text):
        edge(source, 'sections/' + m[1] + '.liquid', 'JS section endpoint')
    if source.endswith('.json') and source.startswith(('templates/', 'sections/')):
        obj = json.loads(text)
        for section in obj.get('sections', {}).values():
            if 'type' in section:
                edge(source, 'sections/' + section['type'] + '.liquid', 'JSON section')
        if obj.get('layout'):
            edge(source, 'layout/' + obj['layout'] + '.liquid', 'JSON layout')

schemas = {}
for source, text in texts.items():
    match = re.search(r'{%\s*schema\s*%}([\s\S]*?){%\s*endschema\s*%}', text)
    if match:
        schemas[source] = json.loads(match[1])
incoming = {k: [e for e in edges if e['target'] == k] for k in files}
unreferenced = [k for k in files if k.startswith(('assets/', 'snippets/', 'sections/')) and not incoming[k]]

settings = []
def scan_settings(source, schema, scope):
    # Exclude schema definitions and stored values: a definition is not consumption.
    body = re.sub(r'{%\s*schema\s*%}[\s\S]*?{%\s*endschema\s*%}', '', texts.get(source, ''))
    haystack = '\n'.join(t for k, t in texts.items() if k.endswith(('.liquid', '.js', '.css')) and k != source) + '\n' + body if scope == 'global' else body
    for item in schema.get('settings', []):
        if 'id' not in item:
            continue
        key = item['id']
        direct = bool(re.search(r'\bsettings\.' + re.escape(key) + r'\b', haystack))
        bracket = bool(re.search(r"settings\[\s*['\"]" + re.escape(key) + r"['\"]\s*\]", haystack))
        settings.append(dict(source=source, scope=scope, id=key, directReference=direct or bracket,
                             note='Indirect snippet parameters/dynamic lookups require review' if not (direct or bracket) else ''))
for group in json.loads(texts['config/settings_schema.json']):
    scan_settings('config/settings_schema.json', group, 'global')
for source, schema in schemas.items():
    scan_settings(source, schema, 'section')
    for block in schema.get('blocks', []):
        scan_settings(source, block, 'block:' + block['type'])

def leaves(obj, prefix=''):
    for key, value in obj.items():
        name = prefix + key
        if isinstance(value, dict):
            yield from leaves(value, name + '.')
        else:
            yield name
locale_keys = []
for source, text in texts.items():
    if source.startswith('locales/'):
        for key in leaves(json.loads(text)):
            refs = [k for k, t in texts.items() if not k.startswith('locales/') and
                    (re.search(r"['\"]" + re.escape(key) + r"['\"]\s*\|\s*t\b", t) or 't:' + key in t)]
            locale_keys.append(dict(source=source, key=key, literalReferences=refs))

comments, markers, functions, duplicates, css_classes = [], [], [], [], []
all_runtime = '\n'.join(re.sub(r'{%\s*schema\s*%}[\s\S]*?{%\s*endschema\s*%}', '', t) for k, t in texts.items() if not k.endswith('.css'))
for source, text in texts.items():
    for n, line in enumerate(text.splitlines(), 1):
        if re.search(r'console\.log\s*\(|\bTODO\b|\bFIXME\b', line):
            markers.append(dict(source=source, line=n, text=line.strip()))
    for m in re.finditer(r'/\*[\s\S]*?\*/|<!--[\s\S]*?-->|{%[-\s]*comment[\s\S]*?endcomment\s*[-]?%}', text):
        comments.append(dict(source=source, line=text[:m.start()].count('\n') + 1, text=m[0][:250]))
    if source.endswith('.js'):
        names = set(re.findall(r'\bfunction\s+(\w+)\s*\(|\b(?:const|let)\s+(\w+)\s*=\s*(?:async\s*)?(?:\([^)]*\)|\w+)\s*=>', text))
        for pair in sorted(names):
            name = next(n for n in pair if n)
            functions.append(dict(source=source, name=name, occurrences=len(re.findall(r'\b' + re.escape(name) + r'\b', text))))
    if source.endswith('.css'):
        classes = sorted(set(re.findall(r'\.([a-zA-Z_][\w-]*)', re.sub(r'/\*[\s\S]*?\*/', '', text))))
        for cls in classes:
            if cls not in all_runtime:
                css_classes.append(dict(source=source, className=cls, status='No exact token outside CSS; check dynamic construction and native content'))
hashes = {}
for source, p in files.items():
    digest = hashlib.sha256(p.read_bytes()).hexdigest()
    hashes.setdefault(digest, []).append(source)
duplicates = [paths for paths in hashes.values() if len(paths) > 1]
result = dict(method='Heuristic static graph; no deletion decisions. Literal and JS endpoint references plus JSON schemas. Dynamic references listed separately. CSS class scan excludes schema metadata and is not a selector parser.',
              files=[dict(path=k, bytes=p.stat().st_size, sha256=hashlib.sha256(p.read_bytes()).hexdigest(), incoming=incoming[k]) for k,p in sorted(files.items())],
              edges=edges, dynamicReferences=dynamic, unreferencedLiteralFiles=unreferenced,
              protectedPresetSections=[k for k,v in schemas.items() if v.get('presets')],
              settings=settings, localeKeys=locale_keys, markerHits=markers, comments=comments,
              namedFunctions=functions, exactDuplicateFiles=duplicates, cssClassesWithoutExactRuntimeToken=css_classes)
(OUT / 'reference-graph.json').write_text(json.dumps(result, indent=2) + '\n')
print(json.dumps(dict(files=len(files), edges=len(edges), missingTargets=[e for e in edges if not e['exists']], unreferenced=unreferenced,
                     settingsWithoutDirectReferences=[s for s in settings if not s['directReference']], localeKeysWithoutLiteralReferences=len([k for k in locale_keys if not k['literalReferences']]),
                     markers=markers, exactDuplicates=duplicates, cssClassCandidates=css_classes), indent=2))
