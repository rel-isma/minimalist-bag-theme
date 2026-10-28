#!/usr/bin/env python3
"""Back up private product work separately from Git; omit authentication tokens."""
from pathlib import Path
from datetime import datetime, timezone
import hashlib
import os
import tarfile

root = Path(__file__).resolve().parents[1]
folder = root / 'backups'
folder.mkdir(exist_ok=True)
target = folder / ('atelier-private-workspace-' + datetime.now(timezone.utc).strftime('%Y%m%d-%H%M%S') + '.tar.gz')
secrets = []
env = root / '.env'
if env.exists():
    for line in env.read_text().splitlines():
        key, sep, value = line.partition('=')
        if sep and any(word in key.upper() for word in ('KEY', 'SECRET', 'TOKEN', 'PASSWORD')):
            value = value.strip().strip('\"\'')
            if len(value) >= 12:
                secrets.append(value.encode())
files = []
for base in (root / 'products', root / 'studio' / '.state'):
    if not base.exists():
        continue
    for file in sorted(base.rglob('*')):
        if not file.is_file() or file.is_symlink():
            continue
        relative = file.relative_to(root)
        name = file.name.lower()
        if name.startswith('.env') or any(word in name for word in ('token', 'credential', 'cookie', 'secret')):
            continue
        if any(value in file.read_bytes() for value in secrets):
            raise SystemExit('Backup stopped: credential found in ' + str(relative))
        files.append((file, relative))
try:
    with target.open('xb') as output:
        os.chmod(target, 0o600)
        with tarfile.open(fileobj=output, mode='w:gz') as archive:
            for file, relative in files:
                archive.add(file, arcname=str(relative), recursive=False)
    with tarfile.open(target, 'r:gz') as archive:
        if len(archive.getmembers()) != len(files):
            raise RuntimeError('Archive verification failed')
    checksum = hashlib.sha256(target.read_bytes()).hexdigest()
    target.with_suffix(target.suffix + '.sha256').write_text(checksum + '  ' + target.name + '\n')
    print(f'Private backup verified: {target.relative_to(root)} ({len(files)} files, {target.stat().st_size // 1048576} MiB)')
    print('Copy .env separately through a private transfer. Authentication tokens were excluded.')
except BaseException:
    target.unlink(missing_ok=True)
    raise
