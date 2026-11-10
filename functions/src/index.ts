import { onRequest } from 'firebase-functions/v1/https';
import { httpApp } from './server.js';

// Keep the existing first-generation /app endpoint during this tooling migration.
export const app = onRequest((request, response) => {
  httpApp(request, response);
});
