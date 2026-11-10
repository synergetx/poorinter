# Font assets

`1CamBam_Stick_3.ttf` is the existing default font, retained at 72 px. The other
font files were referenced only in commented-out experiments and have been
removed. The build copies this directory to `lib/fonts`; generated copies are
not versioned.

`futural.json` is the unmodified `futural` entry from `hersheytext@2.0.0`
(`hersheytext.min.json`), sourced from https://github.com/techninja/hersheytextjs.
Its MIT license is retained in `HERSHEY-LICENSE.txt`. Only this font was used by
the application. Keeping its glyph data directly avoids the obsolete Cheerio
XML parser and the package's unrelated SVG-font loader.
