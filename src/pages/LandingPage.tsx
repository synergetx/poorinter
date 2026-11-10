import { useState, type FormEvent } from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { textToSVG } from '../utils/gCode';

export default function LandingPage() {
  const [text, setText] = useState('');
  const [svg, setSvg] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const previewUrl = svg ? `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}` : '';
  async function generate(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError('');
    setSvg('');
    try {
      setSvg(await textToSVG(text));
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unable to generate SVG.');
    } finally {
      setBusy(false);
    }
  }
  return (
    <Stack spacing={3}>
      <Typography component="h1" variant="h4">
        G Code Generator
      </Typography>
      <Paper
        component="form"
        onSubmit={(event) => {
          void generate(event);
        }}
        sx={{ p: 3 }}
      >
        <Stack spacing={2}>
          <Typography component="h2" variant="h6">
            Enter text, press Generate
          </Typography>
          <TextField
            label="Text"
            required
            helperText="Up to 2,000 characters."
            slotProps={{ htmlInput: { maxLength: 2000 } }}
            value={text}
            onChange={(event) => setText(event.target.value)}
          />
          <Button type="submit" variant="contained" disabled={busy || !text.trim()}>
            {busy ? 'Generating…' : 'Generate'}
          </Button>
          {error && <Alert severity="error">{error}</Alert>}
        </Stack>
      </Paper>
      {previewUrl && (
        <Paper sx={{ p: 3 }}>
          <Stack spacing={2}>
            <Typography component="h2" variant="h6">
              Generated SVG
            </Typography>
            <Box
              component="img"
              src={previewUrl}
              alt="Generated SVG preview"
              sx={{ maxWidth: '100%', maxHeight: 400, bgcolor: 'white' }}
            />
            <Button component="a" href={previewUrl} download="generatedSVG.svg" variant="outlined">
              Download SVG
            </Button>
          </Stack>
        </Paper>
      )}
    </Stack>
  );
}
