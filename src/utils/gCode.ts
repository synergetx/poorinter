import { collection, doc, onSnapshot, setDoc, type QuerySnapshot } from 'firebase/firestore';
import firebaseApp from '../config/firebase';
import { db } from '../config/firestore';

export type LetterCodes = Record<string, string>;
const projectId = firebaseApp.options.projectId;
const baseUrl = (
  import.meta.env.VITE_FUNCTIONS_URL ||
  (import.meta.env.DEV
    ? `http://127.0.0.1:5001/${projectId}/us-central1/app`
    : `https://us-central1-${projectId}.cloudfunctions.net/app`)
).replace(/\/$/, '');
const lettersRef = collection(db, 'letters');

function mapLetters(snapshot: QuerySnapshot): LetterCodes {
  const letters: LetterCodes = {};
  snapshot.forEach((document) => {
    const code: unknown = document.data().code;
    if (typeof code === 'string') letters[document.id.toUpperCase()] = code;
  });
  return letters;
}

export async function textToSVG(text: string): Promise<string> {
  if (!text.trim() || text.length > 2000)
    throw new Error('Text must contain 1 to 2,000 characters.');
  const response = await fetch(`${baseUrl}/textToSVG`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  });
  if (!response.ok)
    throw new Error(`SVG generation failed (${response.status}). Please try again.`);
  const svg = await response.text();
  if (!/^\s*(?:<\?xml[^>]*>\s*)?<svg[\s>]/i.test(svg))
    throw new Error('The server returned an invalid SVG.');
  return svg;
}
export function saveNewGCode(letter: string, code: string) {
  const key = letter.toUpperCase();
  if (Array.from(key).length !== 1 || key === '/' || key === '.' || !code.trim())
    throw new Error('Enter one letter and its G-Code.');
  if (code.length > 100_000) throw new Error('G-Code must be 100,000 characters or fewer.');
  return setDoc(doc(db, 'letters', key), { code });
}
export const getAllLetters = (
  onUpdate: (letters: LetterCodes) => void,
  onError: (error: Error) => void,
) => onSnapshot(lettersRef, (snapshot) => onUpdate(mapLetters(snapshot)), onError);
