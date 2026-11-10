import { cpSync } from 'node:fs';

cpSync(new URL('../src/fonts/', import.meta.url), new URL('../lib/fonts/', import.meta.url), {
  recursive: true,
});
