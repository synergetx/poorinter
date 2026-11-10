import assert from 'node:assert/strict';
import { once } from 'node:events';
import { after, before, test } from 'node:test';
import { httpApp } from '../lib/server.js';

let server;
let baseUrl;

before(async () => {
  server = httpApp.listen(0, '127.0.0.1');
  await once(server, 'listening');
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});
after(async () => {
  await new Promise((resolve, reject) =>
    server.close((error) => (error ? reject(error) : resolve())),
  );
});

test('renders an SVG with the bundled default font through the HTTP endpoint', async () => {
  const response = await fetch(`${baseUrl}/textToSVG`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: 'AV WAVE 123' }),
  });
  assert.equal(response.status, 200);
  assert.match(response.headers.get('content-type'), /image\/svg\+xml/);
  const svg = await response.text();
  assert.match(svg, /^<svg .*<path fill="black" stroke="black" d="M/);
  assert.match(svg, /<\/svg>$/);
  assert.doesNotMatch(svg, /NaN|Infinity/);
});

test('keeps Hershey engraving paths and accepts the old text/plain JSON client', async () => {
  const response = await fetch(`${baseUrl}/hersheySVG`, {
    method: 'POST',
    body: JSON.stringify({ text: 'A B' }),
  });
  assert.equal(response.status, 200);
  const svg = await response.text();
  assert.match(svg, /transform="scale\(2\) translate\(50, 50\)"/);
  assert.match(svg, /letter="A"/);
  assert.match(svg, /letter="B"/);
});

test('rejects malformed JSON and invalid text without generating an SVG', async () => {
  for (const body of [
    '{broken',
    '{}',
    '{"text":" "}',
    JSON.stringify({ text: 'a'.repeat(2001) }),
  ]) {
    const response = await fetch(`${baseUrl}/textToSVG`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
    });
    assert.equal(response.status, 400);
    assert.equal(typeof (await response.json()).error, 'string');
  }
});
