// Local Code 39 PNG renderer. PNG is used rather than an SVG data URL because
// @react-pdf can leave embedded SVG data URLs blank in generated label PDFs.
import { PNG } from "pngjs";

const PATTERNS: Record<string, string> = {
  "0":"nnnwwnwnn","1":"wnnwnnnnw","2":"nnwwnnnnw","3":"wnwwnnnnn","4":"nnnwwnnnw","5":"wnnwwnnnn","6":"nnwwwnnnn","7":"nnnwnnwnw","8":"wnnwnnwnn","9":"nnwwnnwnn",
  "A":"wnnnnwnnw","B":"nnwnnwnnw","C":"wnwnnwnnn","D":"nnnnwwnnw","E":"wnnnwwnnn","F":"nnwnwwnnn","G":"nnnnnwwnw","H":"wnnnnwwnn","I":"nnwnnwwnn","J":"nnnnwwwnn",
  "K":"wnnnnnnww","L":"nnwnnnnww","M":"wnwnnnnwn","N":"nnnnwnnww","O":"wnnnwnnwn","P":"nnwnwnnwn","Q":"nnnnnnwww","R":"wnnnnnwwn","S":"nnwnnnwwn","T":"nnnnwnwwn",
  "U":"wwnnnnnnw","V":"nwwnnnnnw","W":"wwwnnnnnn","X":"nwnnwnnnw","Y":"wwnnwnnnn","Z":"nwwnwnnnn","-":"nwnnnnwnw",".":"wwnnnnwnn"," ":"nwwnnnwnn","$":"nwnwnwnnn","/":"nwnwnnnwn","+":"nwnnnwnwn","%":"nnnwnwnwn","*":"nwnnwnwnn"
};

export function code39DataUrl(value: string): string {
  const safe = value.toUpperCase().split("").filter((char) => PATTERNS[char]).join("");
  const encoded = `*${safe || "EMPTY"}*`;
  const narrow = 2, wide = 5, gap = 2, height = 44;
  let width = 16;
  for (const char of encoded) { for (const kind of PATTERNS[char]) width += kind === "w" ? wide : narrow; width += gap; }
  const png = new PNG({ width, height: 48, colorType: 6 });
  png.data.fill(255);
  let x = 8;
  for (const char of encoded) {
    [...PATTERNS[char]].forEach((kind, index) => {
      const barWidth = kind === "w" ? wide : narrow;
      if (index % 2 === 0) for (let px = x; px < x + barWidth; px++) for (let y = 2; y < height; y++) {
        const offset = (width * y + px) * 4;
        png.data[offset] = 0; png.data[offset + 1] = 0; png.data[offset + 2] = 0; png.data[offset + 3] = 255;
      }
      x += barWidth;
    });
    x += gap;
  }
  return `data:image/png;base64,${PNG.sync.write(png).toString("base64")}`;
}
