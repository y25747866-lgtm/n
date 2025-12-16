
function escape(text: string): string {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

const categoryColors: Record<string, { start: string; end: string }> = {
    business: { start: '#3B82F6', end: '#1E40AF' }, // Blue
    ai: { start: '#8B5CF6', end: '#4C1D95' },       // Purple
    finance: { start: '#10B981', end: '#047857' },  // Green
    education: { start: '#F59E0B', end: '#B45309' }, // Amber
    marketing: { start: '#EC4899', end: '#9D174D' }, // Pink
    default: { start: '#0B0F19', end: '#3B82F6' },
};


export function generateGradientSVG(title: string, subtitle: string, category: string = 'default'){
  const colors = categoryColors[category] || categoryColors.default;
  
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='1200' height='1600' viewBox='0 0 1200 1600'>
  <defs>
    <linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>
      <stop offset='0' stop-color='${colors.start}'/>
      <stop offset='1' stop-color='${colors.end}'/>
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
  <text x='80' y='1550' font-size='24' fill='rgba(255,255,255,0.7)' font-family='Inter, sans-serif'>Nexora OS AI • 2025</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
