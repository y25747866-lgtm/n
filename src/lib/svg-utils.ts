
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
    default: { start: 'hsl(var(--accent-1-start))', end: 'hsl(var(--accent-1-end))' },
};


export function generateGradientSVG(title: string, subtitle: string, category: string = 'default'){
  const colors = categoryColors[category] || categoryColors.default;
  
  // A simple function to wrap long titles.
  // This is a basic implementation and might not handle all cases perfectly.
  const wrapTitle = (text: string, maxWidth: number, maxLines: number) => {
      if (text.length <= maxWidth) {
          return `<tspan x='0' dy='0'>${escape(text)}</tspan>`;
      }

      const words = text.split(' ');
      let lines = [];
      let currentLine = '';
      
      for(const word of words) {
          const testLine = currentLine ? `${currentLine} ${word}` : word;
          if (testLine.length > maxWidth && currentLine) {
              lines.push(currentLine);
              currentLine = word;
          } else {
              currentLine = testLine;
          }
      }
      lines.push(currentLine);

      if (lines.length > maxLines) {
          lines = lines.slice(0, maxLines);
          lines[maxLines - 1] += '...';
      }

      return lines.map((line, index) => `<tspan x='0' dy='${index === 0 ? 0 : '1.2em'}'>${escape(line)}</tspan>`).join('');
  }

  const wrappedTitle = wrapTitle(title, 25, 3);
  
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='1200' height='1600' viewBox='0 0 1200 1600'>
  <defs>
    <linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>
      <stop offset='0' stop-color='${colors.start}'/>
      <stop offset='1' stop-color='${colors.end}'/>
    </linearGradient>
  </defs>
  <rect width='100%' height='100%' fill='url(#g)'/>
  <g transform='translate(80 320)'>
    <text y='0' font-size='96' fill='#fff' font-weight='700' font-family='Inter, sans-serif'>
        ${wrappedTitle}
    </text>
    <text x='0' y='${(title.length > 25 ? 3 : 1) * 120 + 60}' font-size='36' fill='rgba(255,255,255,0.8)' font-family='Inter, sans-serif'>
        ${escape(subtitle)}
    </text>
  </g>
  <text x='80' y='1550' font-size='24' fill='rgba(255,255,255,0.7)' font-family='Inter, sans-serif'>NexoraOS • 2025</text>
</svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

    