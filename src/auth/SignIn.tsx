import { useEffect, useRef, useState, type FormEvent } from 'react';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import {
  createUserWithEmailAndPassword,
  FacebookAuthProvider,
  GithubAuthProvider,
  GoogleAuthProvider,
  RecaptchaVerifier,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPhoneNumber,
  signInWithPopup,
  TwitterAuthProvider,
  type ConfirmationResult,
} from 'firebase/auth';
import { auth } from '../config/firebase';

const providers = [
  { name: 'Google', create: () => new GoogleAuthProvider() },
  { name: 'Facebook', create: () => new FacebookAuthProvider() },
  { name: 'Twitter', create: () => new TwitterAuthProvider() },
  { name: 'GitHub', create: () => new GithubAuthProvider() },
];

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [confirmation, setConfirmation] = useState<ConfirmationResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const verifier = useRef<RecaptchaVerifier | null>(null);
  const captchaContainer = useRef<HTMLDivElement>(null);
  useEffect(
    () => () => {
      verifier.current?.clear();
      verifier.current = null;
    },
    [],
  );

  async function run(action: () => Promise<unknown>) {
    setBusy(true);
    setError('');
    setMessage('');
    try {
      await action();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unable to sign in. Please try again.');
    } finally {
      setBusy(false);
    }
  }
  function submit(event: FormEvent) {
    event.preventDefault();
    void run(() => signInWithEmailAndPassword(auth, email, password));
  }
  async function sendCode() {
    if (!captchaContainer.current) return;
    verifier.current?.clear();
    verifier.current = new RecaptchaVerifier(auth, captchaContainer.current, { size: 'normal' });
    try {
      setConfirmation(await signInWithPhoneNumber(auth, phone, verifier.current));
    } catch (error) {
      verifier.current.clear();
      verifier.current = null;
      throw error;
    }
  }
  return (
    <Paper sx={{ p: 3, maxWidth: 480, mx: 'auto' }}>
      <Stack spacing={2}>
        <Typography component="h1" variant="h5">
          Sign in to Pooprinter
        </Typography>
        <Typography sx={{ color: 'text.secondary' }}>
          Generate SVGs and manage your letter G-Code.
        </Typography>
        {error && <Alert severity="error">{error}</Alert>}
        {message && <Alert severity="success">{message}</Alert>}
        <Stack component="form" spacing={2} onSubmit={submit}>
          <TextField
            label="Email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
          <TextField
            label="Password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
          <Button type="submit" variant="contained" disabled={busy}>
            Sign in
          </Button>
          <Button
            disabled={busy || !email || password.length < 6}
            onClick={() => void run(() => createUserWithEmailAndPassword(auth, email, password))}
          >
            Create account
          </Button>
          <Button
            disabled={busy || !email}
            onClick={() =>
              void run(async () => {
                await sendPasswordResetEmail(auth, email);
                setMessage('Password reset email sent.');
              })
            }
          >
            Reset password
          </Button>
        </Stack>
        <Divider>or continue with</Divider>
        <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap' }}>
          {providers.map((provider) => (
            <Button
              key={provider.name}
              variant="outlined"
              disabled={busy}
              onClick={() => void run(() => signInWithPopup(auth, provider.create()))}
            >
              {provider.name}
            </Button>
          ))}
        </Stack>
        <Divider>or use your phone</Divider>
        <TextField
          label="Phone number"
          type="tel"
          autoComplete="tel"
          placeholder="+16505550101"
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
          helperText="Include the country code. SMS rates may apply."
        />
        <div ref={captchaContainer} />
        <Button disabled={busy || !phone} onClick={() => void run(sendCode)}>
          Send verification code
        </Button>
        {confirmation && (
          <>
            <TextField
              label="Verification code"
              autoComplete="one-time-code"
              value={code}
              onChange={(event) => setCode(event.target.value)}
            />
            <Button
              disabled={busy || !code}
              onClick={() => void run(() => confirmation.confirm(code))}
            >
              Verify and sign in
            </Button>
          </>
        )}
      </Stack>
    </Paper>
  );
}
