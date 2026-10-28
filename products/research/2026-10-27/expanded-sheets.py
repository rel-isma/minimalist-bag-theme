import json,urllib.request,concurrent.futures,os
from PIL import Image,ImageDraw
root='products/research/2026-10-27';a=json.load(open(root+'/expanded-candidates.json'));ids=[118,119,120,121,123,127,129,130,139,146,147,149,150,151,152,154,161,162,164,166,167,173,174,176,177,180,205,210,217,222,225,230,235,240,243,253,259,261,262,263,265,275,277,285,292,298,301,303,309,310,313,335,349,353,356,362,364]
os.makedirs(root+'/expanded-thumbs',exist_ok=True)
def get(i):
 try:
  b=urllib.request.urlopen(a[i]['bigImage'],timeout=25).read();open(f'{root}/expanded-thumbs/{i}.jpg','wb').write(b)
 except Exception:pass
with concurrent.futures.ThreadPoolExecutor(max_workers=8) as ex:list(ex.map(get,ids))
for n in range(0,len(ids),24):
 group=ids[n:n+24];canvas=Image.new('RGB',(1440,((len(group)+5)//6)*220),'white');d=ImageDraw.Draw(canvas)
 for j,i in enumerate(group):
  x=j%6*240;y=j//6*220
  try:im=Image.open(f'{root}/expanded-thumbs/{i}.jpg').convert('RGB');im.thumbnail((235,180));canvas.paste(im,(x+(240-im.width)//2,y))
  except:pass
  d.text((x+4,y+182),f'{i} {a[i]["sku"]}',fill='black');d.text((x+4,y+199),'$'+str(a[i].get('sellPrice')),fill='black')
 canvas.save(f'{root}/expanded-sheet-{n//24}.jpg')
