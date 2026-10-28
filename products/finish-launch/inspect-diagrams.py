import json,pathlib,urllib.request,concurrent.futures
from PIL import Image,ImageDraw
root=pathlib.Path('products/.state/finish-launch');items=json.loads((root/'dimension-image-sources.json').read_text());jobs=[]
for p in items:
 for n,x in enumerate(p['images']):jobs.append((p['id'],p['title'],n,x['url']))
(root/'diagrams').mkdir(exist_ok=True)
def fetch(j):
 id,title,n,url=j;file=root/'diagrams'/f'{id}-{n}.jpg'
 try:
  if not file.exists():file.write_bytes(urllib.request.urlopen(url,timeout=25).read())
 except Exception:pass
with concurrent.futures.ThreadPoolExecutor(max_workers=7) as ex:list(ex.map(fetch,jobs))
for pi,p in enumerate(items):
 canvas=Image.new('RGB',(1200,((len(p['images'])+3)//4)*250),'white');d=ImageDraw.Draw(canvas)
 for n,x in enumerate(p['images']):
  try:
   im=Image.open(root/'diagrams'/f'{p["id"]}-{n}.jpg').convert('RGB');im.thumbnail((295,220));xx=n%4*300;yy=n//4*250;canvas.paste(im,(xx+(300-im.width)//2,yy));d.text((xx+3,yy+222),f'{n}: {p["title"]}',fill='black')
  except Exception:pass
 canvas.save(root/f'diagram-sheet-{pi}.jpg')
print('Supplier diagram sheets ready',len(items),'products',len(jobs),'images; not added to product galleries.')
