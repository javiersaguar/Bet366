"""Regenera public/icon.svg y public/apple-icon.svg a partir de la geometria
que vive en src/components/logo.tsx, para que el favicon y el icono de la
pantalla de inicio no se queden atras cuando se retoque la marca.

Uso: python3 scripts/generar-iconos.py  (desde la raiz del repo)
"""
import re
src = open('src/components/logo.tsx').read()

def block(name):
    return re.search(rf'const {name} = \{{(.*?)\n\}} as const;', src, re.S).group(1)

def field(b, key):
    v = re.search(rf"\n  {key}:\s*(.*?)(?=\n  [a-zA-Z0-9]+:|\Z)", b, re.S).group(1).strip().rstrip(',')
    parts = re.findall(r"'((?:[^'\\]|\\.)*)'", v)
    return ''.join(parts) if parts else v

def svg(variant, rounded=True):
    b = block(variant); n366 = field(b, 'n366')
    marco = ('  <rect x="1.25" y="1.25" width="189.5" height="189.5" rx="44.75" fill="none"'
             ' stroke="rgba(255,255,255,.08)" stroke-width="2.5"/>\n') if rounded else ''
    rx = ' rx="46"' if rounded else ''
    fondo = f'  <rect width="192" height="192"{rx} fill="url(#fondo)"/>\n'
    letras = f'''    <path d="{field(b,'b')}" fill="#FFFFFF"/>
    <path d="{field(b,'e')}" fill="url(#verde)"/>
    <path d="{field(b,'t')}" fill="#FFFFFF"/>'''
    if n366:
        letras += f'\n    <path d="{n366}" fill="url(#verde)"/>'
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 192" role="img" aria-label="Bet366">
  <defs>
    <linearGradient id="fondo" x1="0" y1="0" x2="0.35" y2="1">
      <stop offset="0%" stop-color="#14181F"/><stop offset="100%" stop-color="#080A0E"/>
    </linearGradient>
    <linearGradient id="verde" x1="0.1" y1="0" x2="0.9" y2="1">
      <stop offset="0%" stop-color="#63F2B4"/><stop offset="52%" stop-color="#2BE08C"/><stop offset="100%" stop-color="#17B872"/>
    </linearGradient>
  </defs>
{fondo}{marco}  <path d="{field(b,'arc')}" fill="none" stroke="url(#verde)" stroke-width="{field(b,'arcWidth')}" stroke-linecap="round"/>
  <g transform="translate(96 88) skewX(-9) translate(-96 -88)">
{letras}
  </g>
  <circle cx="{field(b,'ballCx')}" cy="{field(b,'ballCy')}" r="{field(b,'ballR')}" fill="url(#verde)"/>
  <path d="{field(b,'pentagon')}" fill="#07080B"/>
  <path d="{field(b,'seams')}" fill="none" stroke="#07080B" stroke-width="{field(b,'seamWidth')}" stroke-linecap="round"/>
</svg>
'''

open('public/icon.svg','w').write(svg('FULL'))
open('public/apple-icon.svg','w').write(svg('FULL', rounded=False))
print('ok')
