// Local Code 39 barcode renderer. No API, font, network call or paid service.
// Library copy codes are upper-case letters/digits/hyphens, all supported.
const PATTERNS: Record<string, string> = {
  "0":"nnnwwnwnn","1":"wnnwnnnnw","2":"nnwwnnnnw","3":"wnwwnnnnn","4":"nnnwwnnnw","5":"wnnwwnnnn","6":"nnwwwnnnn","7":"nnnwnnwnw","8":"wnnwnnwnn","9":"nnwwnnwnn",
  "A":"wnnnnwnnw","B":"nnwnnwnnw","C":"wnwnnwnnn","D":"nnnnwwnnw","E":"wnnnwwnnn","F":"nnwnwwnnn","G":"nnnnnwwnw","H":"wnnnnwwnn","I":"nnwnnwwnn","J":"nnnnwwwnn",
  "K":"wnnnnnnww","L":"nnwnnnnww","M":"wnwnnnnwn","N":"nnnnwnnww","O":"wnnnwnnwn","P":"nnwnwnnwn","Q":"nnnnnnwww","R":"wnnnnnwwn","S":"nnwnnnwwn","T":"nnnnwnwwn",
  "U":"wwnnnnnnw","V":"nwwnnnnnw","W":"wwwnnnnnn","X":"nwnnwnnnw","Y":"wwnnwnnnn","Z":"nwwnwnnnn","-":"nwnnnnwnw",".":"wwnnnnwnn"," ":"nwwnnnwnn","$":"nwnwnwnnn","/":"nwnwnnnwn","+":"nwnnnwnwn","%":"nnnwnwnwn","*":"nwnnwnwnn"
};

export function code39DataUrl(value: string): string {
  const safe = value.toUpperCase().split("").filter((c) => PATTERNS[c]).join("");
  const encoded = `*${safe || "EMPTY"}*`;
  const narrow = 2, wide = 5, gap = 2, height = 44;
  let x = 8; const bars: string[] = [];
  for (const char of encoded) {
    const pattern = PATTERNS[char];
    pattern.split("").forEach((kind, index) => {
      const width = kind === "w" ? wide : narrow;
      if (index % 2 === 0) bars.push(`<rect x="${x}" y="2" width="${width}" height="${height}" fill="#000"/>`);
      x += width;
    });
    x += gap;
  }
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${x + 8}" height="62" viewBox="0 0 ${x + 8} 62"><rect width="100%" height="100%" fill="white"/>${bars.join("")}<text x="50%" y="58" text-anchor="middle" font-family="monospace" font-size="8" fill="#000">${safe}</text></svg>`;
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}
