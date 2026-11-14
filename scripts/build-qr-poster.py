#!/usr/bin/env python3
"""Rebuild the QR poster with vector Korean text and QR decode checks."""
from pathlib import Path
import argparse, random, json
import fitz,qrcode,zxingcpp
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
parser = argparse.ArgumentParser(description="Build and validate the A4 game QR poster.")
parser.add_argument("--output-dir", type=Path, default=ROOT / "docs/promotion")
parser.add_argument("--font-dir", type=Path, default=Path("/usr/share/fonts/opentype/noto"))
args = parser.parse_args()
OUT = args.output_dir.resolve()
OUT.mkdir(parents=True, exist_ok=True)
URL='https://handover-legend.s2airsystems2.chatgpt.site'
ART=ROOT / "docs/promotion/handover-characters.png"
W,H=1080,1527.43
PW,PH=595.276,841.89
S=PW/W
rng=random.Random(105)
# Preserve the published layout's random sequence after its initial star pass.
for _ in range(130):
 rng.uniform(12,W-12);rng.uniform(12,H-12)
 rng.choice([0.7,0.9,1.1,1.3,1.6]);rng.uniform(.2,.62)
doc=fitz.open();page=doc.new_page(width=PW,height=PH)
# Native vector background and rounded frames, separate from the character art.
from reportlab.pdfgen import canvas
from reportlab.lib.colors import HexColor
import io
buf=io.BytesIO();c=canvas.Canvas(buf,pagesize=(PW,PH));c.scale(S,S)
c.linearGradient(0,0,0,H,[HexColor('#211030'),HexColor('#240c25')])
c.saveState()
for cx,cy,rx,ry,col,alpha in [(110,H-190,720,590,'#a42360',.012),(1020,H-1400,660,520,'#6841b8',.014)]:
 c.setFillColor(HexColor(col));c.setFillAlpha(alpha)
 for i in range(90):
  f=1-i/90;c.ellipse(cx-rx*f,cy-ry*f,cx+rx*f,cy+ry*f,fill=1,stroke=0)
c.restoreState()
for _ in range(100):
 x,y=rng.uniform(12,W-12),rng.uniform(12,H-12)
 c.setFillColor(HexColor('#b897b1'));c.setFillAlpha(rng.uniform(.2,.6));c.circle(x,H-y,rng.choice([.6,.8,1.1,1.4]),fill=1,stroke=0)
c.setFillAlpha(1)
c.setFillColor(HexColor('#481b38'));c.setStrokeColor(HexColor('#c46b94'));c.setLineWidth(1.5);c.roundRect(322,H-116,436,57,28.5,fill=1,stroke=1)
c.saveState();clip=c.beginPath();clip.roundRect(205,H-1058,670,670,63);c.clipPath(clip,stroke=0,fill=0);c.linearGradient(205,0,875,0,[HexColor('#ff5579'),HexColor('#8f56f6')]);c.restoreState()
c.setFillColor(HexColor('#ffffff'));c.roundRect(215,H-1048,650,650,53,fill=1,stroke=0)
c.setFillColor(HexColor('#331731'));c.setStrokeColor(HexColor('#89627d'));c.setLineWidth(1.5);c.roundRect(32,H-1489,434,384,35,fill=1,stroke=1)
c.setStrokeColor(HexColor('#6d5264'));c.setLineWidth(.7);c.line(505,H-1385,1002,H-1385)
c.showPage();c.save();bg=fitz.open('pdf',buf.getvalue());page.show_pdf_page(page.rect,bg,0)
# Outline the display typography so Korean glyphs remain portable in print.
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
fontdata={}
for name,weight in [('regular','Regular'),('bold','Bold')]:
 f=TTFont(args.font_dir / f'NotoSansCJK-{weight}.ttc',fontNumber=1)
 fontdata[name]=(f,f.getGlyphSet(),f.getBestCmap(),f['head'].unitsPerEm)
def color(h):return tuple(int(h[i:i+2],16)/255 for i in (1,3,5))
def txt(text,x,y,size=28,hex='#ffffff',font='bold',align='left',stroke=0):
 f,gs,cmap,upem=fontdata[font]
 scale=size/upem
 advance=sum(f['hmtx'].metrics[cmap[ord(ch)]][0] for ch in text)*scale
 if align=='center':x-=advance/2
 paths=[]
 for ch in text:
  glyph=cmap[ord(ch)];pen=SVGPathPen(gs)
  gs[glyph].draw(TransformPen(pen,(scale,0,0,-scale,x,y)))
  paths.append(f'<path d="{pen.getCommands()}"/>')
  x+=f['hmtx'].metrics[glyph][0]*scale
 svgtext=f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}"><g fill="{hex}">{"".join(paths)}</g></svg>'
 vector=fitz.open('svg',svgtext.encode());pdftext=fitz.open('pdf',vector.convert_to_pdf())
 page.show_pdf_page(page.rect,pdftext,0)

txt('DLC 오락실 · 업무 체험 게임',540,98,27,'#f7e7ed',align='center')
txt('첫 출근, 첫 번째 미션.',540,172,29,'#f4d382',align='center')
txt('인수인계의 전설',540,282,110,'#6d2149',align='center',stroke=1.2)
txt('인수인계의 전설',540,274,110,'#fff7f3',align='center',stroke=.55)
txt('전임자는 떠났습니다. 인수인계서는 없습니다.',540,334,27,'#d9c9d7',font='regular',align='center')

# QR remains exact vector geometry, including an untouched four-module quiet zone.
qr=qrcode.QRCode(error_correction=qrcode.constants.ERROR_CORRECT_H,border=4,box_size=1)
qr.add_data(URL);qr.make(fit=True);matrix=qr.get_matrix();n=len(matrix)
size=602;left=239;top=422;unit=size/n
shape=page.new_shape()
for row,values in enumerate(matrix):
 for col,black in enumerate(values):
  if black:
   shape.draw_rect(fitz.Rect((left+col*unit)*S,(top+row*unit)*S,(left+(col+1)*unit)*S,(top+(row+1)*unit)*S))
shape.finish(color=None,fill=color('#170b20'));shape.commit()
page.insert_link({'kind':fitz.LINK_URI,'from':fitz.Rect(215*S,398*S,865*S,1048*S),'uri':URL})

page.insert_image(fitz.Rect(26*S,1076*S,470*S,1520*S),filename=str(ART),keep_proportion=True)
txt('카메라로 찍고',505,1195,43,'#fff7f3')
txt('첫 출근 시작!',505,1262,52,'#f7d882',stroke=.25)
txt('로그인 없이 · 약 5분',505,1323,28,'#d9c9d7',font='regular')
for x,label,width in [(505,'단서 탐색',190),(718,'팀장 보고',190)]:
 shape=page.new_shape();shape.draw_rect(fitz.Rect(x*S,1404*S,(x+width)*S,1454*S));shape.finish(color=color('#c5a772'),fill=None,width=.8);shape.commit()
 txt(label,x+width/2,1438,24,'#edcf98',align='center')
txt('DLC ARCADE  /  EPISODE 01',505,1498,17,'#ab94b3',font='regular')

doc.set_metadata({'title':'인수인계의 전설 | QR 체험 포스터','author':'DLC 오락실','subject':URL})

pdf=OUT/'handover-legend-qr-poster.pdf';doc.save(pdf,garbage=4,deflate=True)
final=fitz.open(pdf);pix=final[0].get_pixmap(dpi=260,alpha=False);png=OUT/'handover-legend-qr-poster.png';pix.save(png)
results=[]
img=Image.open(png)
for width in [img.width,1080,540]:
 sample=img if width==img.width else img.resize((width,round(img.height*width/img.width)))
 decoded=zxingcpp.read_barcodes(sample)
 texts=[r.text for r in decoded]
 assert texts==[URL],(width,texts)
 results.append({'width':width,'height':sample.height,'decoded':texts[0]})
print(json.dumps({'pdf':str(pdf),'png':str(png),'qr_modules_with_quiet_zone':n,'validation':results,'bytes':{'pdf':pdf.stat().st_size,'png':png.stat().st_size}},ensure_ascii=False))
