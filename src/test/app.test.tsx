import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import App from '../App';

const state = vi.hoisted(() => ({ user: null as { uid: string } | null }));
vi.mock('../config/firebase', () => ({
  default: { options: { projectId: 'test-project' } },
  auth: {},
  db: {},
}));
vi.mock('../config/firestore', () => ({ db: {} }));
vi.mock('firebase/auth', async (importOriginal) => ({
  ...(await importOriginal<typeof import('firebase/auth')>()),
  onAuthStateChanged: vi.fn((_auth, next) => {
    next(state.user);
    return vi.fn();
  }),
  signOut: vi.fn().mockResolvedValue(undefined),
}));
vi.mock('firebase/firestore', () => ({
  collection: vi.fn(() => ({})),
  doc: vi.fn(() => ({})),
  getDocs: vi.fn(),
  setDoc: vi.fn(),
  onSnapshot: vi.fn((_ref, next) => {
    next({
      forEach: (callback: (document: unknown) => void) =>
        callback({ id: 'A', data: () => ({ code: 'G1 X10' }) }),
    });
    return vi.fn();
  }),
}));

function showApp(path = '/') {
  render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  );
}

beforeEach(() => {
  state.user = null;
  vi.clearAllMocks();
  vi.stubGlobal('fetch', vi.fn());
});
afterEach(() => vi.unstubAllGlobals());

describe('application smoke tests', () => {
  it('renders sign-in and the configured authentication choices without an account', async () => {
    showApp('/letters');
    expect(
      await screen.findByRole('heading', { name: 'Sign in to Pooprinter' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Google' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Send verification code' })).toBeInTheDocument();
    expect(
      screen.queryByRole('heading', { name: 'Enter G Code for Letters' }),
    ).not.toBeInTheDocument();
  });

  it('renders the protected letters route for a signed-in account', async () => {
    state.user = { uid: 'test-user' };
    showApp('/letters');
    expect(
      await screen.findByRole('heading', { name: 'Enter G Code for Letters' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /^Letter/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Sign out' })).toBeInTheDocument();
  });

  it('requests an SVG and renders a preview and download', async () => {
    state.user = { uid: 'test-user' };
    vi.mocked(fetch).mockResolvedValue(
      new Response('<svg xmlns="http://www.w3.org/2000/svg"><path d="M0 0"/></svg>', {
        status: 200,
      }),
    );
    showApp();
    const user = userEvent.setup();
    await user.type(await screen.findByRole('textbox', { name: /^Text/ }), 'Hello');
    await user.click(screen.getByRole('button', { name: 'Generate' }));
    expect(await screen.findByRole('img', { name: 'Generated SVG preview' })).toHaveAttribute(
      'src',
      expect.stringContaining('data:image/svg+xml;charset=utf-8,'),
    );
    expect(screen.getByRole('link', { name: 'Download SVG' })).toHaveAttribute(
      'download',
      'generatedSVG.svg',
    );
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/textToSVG'),
      expect.objectContaining({ method: 'POST', body: JSON.stringify({ text: 'Hello' }) }),
    );
  });

  it('shows a failed SVG request and allows another attempt', async () => {
    state.user = { uid: 'test-user' };
    vi.mocked(fetch).mockResolvedValue(new Response('Unavailable', { status: 503 }));
    showApp();
    const user = userEvent.setup();
    await user.type(await screen.findByRole('textbox', { name: /^Text/ }), 'Hello');
    await user.click(screen.getByRole('button', { name: 'Generate' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('SVG generation failed (503)');
    expect(screen.getByRole('button', { name: 'Generate' })).toBeEnabled();
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });
});
