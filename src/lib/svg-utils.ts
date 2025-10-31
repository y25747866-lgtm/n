
function escape(text: string): string {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

export function generateGradientSVG(title: string, subtitle: string){
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='1200' height='1600' viewBox='0 0 1200 1600'>
  <defs>
    <linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>
      <stop offset='0' stop-color='#0B0F19'/>
      <stop offset='1' stop-color='#3B82F6'/>
    </linearGradient>
  </defs>
  <rect width='100%' height='100%' fill='url(#g)'/>
  <g transform='translate(80 320)'>
    <text x='0' y='0' font-size='96' fill='#fff' font-weight='700' font-family='Inter, sans-serif'>
        ${title.length > 25 ? `<tspan x='0' dy='-1.2em'>${escape(title.substring(0, title.lastIndexOf(' ')))}</tspan><tspan x='0' dy='1.2em'>${escape(title.substring(title.lastIndexOf(' ') + 1))}</tspan>` : escape(title)}
    </text>
    <text x='0' y='180' font-size='36' fill='rgba(255,255,255,0.8)' font-family='Inter, sans-serif'>
        ${escape(subtitle)}
    </text>
  </g>
  <text x='80' y='1550' font-size='24' fill='rgba(255,255,255,0.7)' font-family='Inter, sans-serif'>Boss OS AI • 2025</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
