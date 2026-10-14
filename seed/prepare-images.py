#!/usr/bin/env python3
"""Resize/crop/compress authorized generated demo assets; never synthesize photography."""
import argparse
import io
import json
from pathlib import Path
from PIL import Image, ImageOps

parser = argparse.ArgumentParser()
parser.add_argument('--sources', required=True, type=Path)
parser.add_argument('--output', type=Path, default=Path(__file__).parent / 'images')
args = parser.parse_args()
args.output.mkdir(parents=True, exist_ok=True)
sources = json.loads(args.sources.read_text())
for item in sources:
    with Image.open(item['source']) as original:
        image = ImageOps.exif_transpose(original).convert('RGB')
        a, b = (4, 5) if item['kind'] in ('front', 'detail') else (3, 2)
        scale = min(image.width / a, image.height / b, 1600 / max(a, b))
        size = (a * int(scale), b * int(scale))
        image = ImageOps.fit(image, size, method=getattr(Image, 'Resampling', Image).LANCZOS)
        for quality in range(90, 39, -5):
            output = io.BytesIO()
            image.save(output, 'JPEG', quality=quality, optimize=True, progressive=True)
            if len(output.getvalue()) < 300000:
                (args.output / item['file']).write_bytes(output.getvalue())
                break
        else:
            raise RuntimeError(f'Cannot compress {item["file"]} below 300KB')
print(f'Prepared {len(sources)} JPEGs; longest side <=1600px and each <300KB.')
