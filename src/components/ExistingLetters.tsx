import { useEffect, useState } from 'react';
import Alert from '@mui/material/Alert';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { getAllLetters, type LetterCodes } from '../utils/gCode';

export default function ExistingLetters() {
  const [letters, setLetters] = useState<LetterCodes>({});
  const [selected, setSelected] = useState('');
  const [error, setError] = useState('');
  useEffect(() => getAllLetters(setLetters, (error) => setError(error.message)), []);
  return (
    <Paper sx={{ p: 3, flex: 1 }}>
      <Stack spacing={2}>
        <Typography component="h2" variant="h6">
          Existing letters
        </Typography>
        {error && <Alert severity="error">{error}</Alert>}
        <TextField
          select
          label="Existing letter"
          value={selected}
          onChange={(event) => setSelected(event.target.value)}
        >
          <MenuItem value="">None</MenuItem>
          {Object.keys(letters)
            .sort()
            .map((letter) => (
              <MenuItem key={letter} value={letter}>
                {letter}
              </MenuItem>
            ))}
        </TextField>
        {selected && (
          <>
            <Typography component="h3" variant="h6">
              {selected}
            </Typography>
            <Typography
              component="pre"
              sx={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere', fontFamily: 'monospace' }}
            >
              {letters[selected]}
            </Typography>
          </>
        )}
      </Stack>
    </Paper>
  );
}
