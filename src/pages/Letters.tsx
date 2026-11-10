import { useState, type FormEvent } from 'react';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import ExistingLetters from '../components/ExistingLetters';
import { saveNewGCode } from '../utils/gCode';

export default function LettersPage() {
  const [letter, setLetter] = useState('');
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  async function save(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError('');
    setSaved(false);
    try {
      await saveNewGCode(letter, code);
      setLetter('');
      setCode('');
      setSaved(true);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unable to save letter.');
    } finally {
      setBusy(false);
    }
  }
  return (
    <Stack spacing={3}>
      <Typography component="h1" variant="h4">
        Enter G Code for Letters
      </Typography>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} sx={{ alignItems: 'stretch' }}>
        <Paper
          component="form"
          onSubmit={(event) => {
            void save(event);
          }}
          sx={{ p: 3, flex: 1 }}
        >
          <Stack spacing={2}>
            <Typography component="h2" variant="h6">
              Enter a letter and its G-Code
            </Typography>
            <TextField
              label="Letter"
              required
              value={letter}
              onChange={(event) => {
                setLetter(Array.from(event.target.value).slice(-1).join('').toUpperCase());
                setSaved(false);
              }}
            />
            <TextField
              label="G-Code"
              required
              multiline
              minRows={5}
              value={code}
              onChange={(event) => {
                setCode(event.target.value);
                setSaved(false);
              }}
            />
            <Button type="submit" variant="contained" disabled={busy || !letter || !code.trim()}>
              {busy ? 'Saving…' : 'Save'}
            </Button>
            {error && <Alert severity="error">{error}</Alert>}
            {saved && <Alert severity="success">Letter saved.</Alert>}
          </Stack>
        </Paper>
        <ExistingLetters />
      </Stack>
    </Stack>
  );
}
