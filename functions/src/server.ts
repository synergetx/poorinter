import cors from 'cors';
import express, { type ErrorRequestHandler, type RequestHandler } from 'express';
import helmet from 'helmet';
import { renderHershey, renderText } from './svg.js';

const MAX_TEXT_LENGTH = 2000;

export const httpApp = express();
httpApp.disable('x-powered-by');
httpApp.use(cors({ origin: true }));
httpApp.use(helmet({ frameguard: false }));
httpApp.use(express.json({ limit: '16kb' }));
httpApp.use(express.text({ type: 'text/plain', limit: '16kb' }));

function svgHandler(render: (text: string) => string): RequestHandler {
  return (request, response) => {
    let body: unknown = request.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch {
        response.status(400).json({ error: 'Expected a JSON object containing text.' });
        return;
      }
    }

    const text =
      typeof body === 'object' && body !== null && 'text' in body ? body.text : undefined;
    if (typeof text !== 'string' || text.trim().length === 0 || text.length > MAX_TEXT_LENGTH) {
      response.status(400).json({ error: `Text must contain 1 to ${MAX_TEXT_LENGTH} characters.` });
      return;
    }

    response.type('image/svg+xml').send(render(text));
  };
}

httpApp.post('/textToSVG', svgHandler(renderText));
httpApp.post('/hersheySVG', svgHandler(renderHershey));

const handleError: ErrorRequestHandler = (error: unknown, _request, response, _next) => {
  const status =
    typeof error === 'object' && error !== null && 'status' in error ? error.status : 500;
  if (status === 400 || status === 413) {
    response
      .status(status)
      .json({ error: status === 413 ? 'Request body is too large.' : 'Invalid JSON request.' });
    return;
  }
  console.error('SVG generation failed', error);
  response.status(500).json({ error: 'Unable to generate SVG.' });
};
httpApp.use(handleError);
