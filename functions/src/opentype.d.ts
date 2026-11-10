// opentype.js 2 does not ship TypeScript declarations. Describe only the API used here.
declare module 'opentype.js' {
  export type PathCommand =
    | { type: 'M' | 'L'; x: number; y: number }
    | { type: 'Q'; x1: number; y1: number; x: number; y: number }
    | { type: 'C'; x1: number; y1: number; x2: number; y2: number; x: number; y: number }
    | { type: 'Z' };
  export interface Font {
    unitsPerEm: number;
    ascender: number;
    descender: number;
    glyphs: {
      length: number;
      get(index: number): { path: { stroke: string; strokeWidth: number } };
    };
    getAdvanceWidth(text: string, fontSize: number, options?: { kerning: boolean }): number;
    getPath(
      text: string,
      x: number,
      y: number,
      fontSize: number,
      options?: { kerning: boolean },
    ): {
      commands: PathCommand[];
    };
  }
  const opentype: { parse(buffer: ArrayBuffer): Font };
  export default opentype;
}
