import { readFileSync } from 'node:fs';
import opentype, { type Font, type PathCommand } from 'opentype.js';

const fontDirectory = new URL('./fonts/', import.meta.url);
const hershey = JSON.parse(readFileSync(new URL('futural.json', fontDirectory), 'utf8')) as {
  chars: { d: string; o: number }[];
};
let font: Font | undefined;

// The published OpenType 2 exporter produces NaN / concatenated coordinates:
// https://github.com/opentypejs/opentype.js/issues/851 and /issues/881.
// Serialize the typed commands directly until a fixed package is released.
function pathData(commands: PathCommand[]): string {
  return commands
    .map((command) => {
      if (command.type === 'Z') return 'Z';
      let values: number[];
      if (command.type === 'C')
        values = [command.x1, command.y1, command.x2, command.y2, command.x, command.y];
      else if (command.type === 'Q') values = [command.x1, command.y1, command.x, command.y];
      else values = [command.x, command.y];
      return command.type + values.map((value) => value.toFixed(2)).join(' ');
    })
    .join('');
}

export function renderText(text: string): string {
  if (!font) {
    const bytes = readFileSync(new URL('1CamBam_Stick_3.ttf', fontDirectory));
    font = opentype.parse(
      bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength),
    );
    // OpenType 2 omits contour closure for un-stroked paths. Our SVG has a black
    // stroke, so retain those closing segments exactly as the previous parser did.
    for (let index = 0; index < font.glyphs.length; index++) {
      const path = font.glyphs.get(index).path;
      path.stroke = 'black';
      path.strokeWidth = 1;
    }
  }

  // Match the previous text-to-svg renderer: 72 px, top-left anchor and kerning.
  const size = 72;
  const scale = (1 / font.unitsPerEm) * size;
  const width = font.getAdvanceWidth(text, size, { kerning: true });
  const height = (font.ascender - font.descender) * scale;
  const d = pathData(
    font.getPath(text, 0, font.ascender * scale, size, { kerning: true }).commands,
  );
  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${width}" height="${height}"><path fill="black" stroke="black" d="${d}"/></svg>`;
}

function escapeAttribute(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

export function renderHershey(text: string): string {
  let offset = 0;
  const paths: string[] = [];
  // Retain the original futural glyphs, scale, translation and word spacing.
  for (const word of text.split(' ')) {
    for (const letter of word) {
      const glyph = hershey.chars[letter.charCodeAt(0) - 33];
      if (!glyph) continue;
      paths.push(
        `<path d="${glyph.d}" stroke="black" stroke-width="1" fill="none" transform="translate(${offset}, 0)" letter="${escapeAttribute(letter)}"></path>`,
      );
      offset += glyph.o * 1.68;
    }
    offset += 10;
  }
  const width = Math.max(200, (50 + offset) * 2);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="200"><g id="mytext" stroke="black" fill="none" transform="scale(2) translate(50, 50)"><g id="mytext-line-0">${paths.join('')}</g></g></svg>`;
}
