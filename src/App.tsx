import { lazy, Suspense, useMemo, useState } from 'react';
import { Navigate, NavLink, Route, Routes } from 'react-router';
import { signOut } from 'firebase/auth';
import Alert from '@mui/material/Alert';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Container from '@mui/material/Container';
import CssBaseline from '@mui/material/CssBaseline';
import Stack from '@mui/material/Stack';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { AuthProvider, useAuth } from './auth/AuthProvider';
import { auth } from './config/firebase';
const SignIn = lazy(() => import('./auth/SignIn'));
const LandingPage = lazy(() => import('./pages/LandingPage'));
const LettersPage = lazy(() => import('./pages/Letters'));

function Loading() {
  return (
    <Stack sx={{ alignItems: 'center' }}>
      <CircularProgress aria-label="Loading account" />
    </Stack>
  );
}

function Content() {
  const { user, loading, error } = useAuth();
  const [signOutError, setSignOutError] = useState('');
  return (
    <>
      <AppBar position="static">
        <Toolbar sx={{ flexWrap: 'wrap', gap: 1 }}>
          <Typography component="span" variant="h6" sx={{ flexGrow: 1 }}>
            Pooprinter
          </Typography>
          {user && (
            <>
              <Button color="inherit" component={NavLink} to="/" end>
                Generator
              </Button>
              <Button color="inherit" component={NavLink} to="/letters">
                Letters
              </Button>
              <Button
                color="inherit"
                onClick={() => {
                  void signOut(auth).catch((error) =>
                    setSignOutError(error instanceof Error ? error.message : 'Unable to sign out.'),
                  );
                }}
              >
                Sign out
              </Button>
            </>
          )}
        </Toolbar>
      </AppBar>
      <Container component="main" maxWidth="lg" sx={{ py: 4 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        {signOutError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {signOutError}
          </Alert>
        )}
        <Suspense fallback={<Loading />}>
          {loading ? (
            <Loading />
          ) : !user ? (
            <SignIn />
          ) : (
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/letters" element={<LettersPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          )}
        </Suspense>
      </Container>
    </>
  );
}

export default function App() {
  const [dark, setDark] = useState(() => {
    try {
      return localStorage.getItem('poorinter-theme') === 'dark';
    } catch {
      return false;
    }
  });
  const theme = useMemo(
    () => createTheme({ palette: { mode: dark ? 'dark' : 'light', primary: { main: '#3f51b5' } } }),
    [dark],
  );
  function toggleTheme() {
    setDark(!dark);
    try {
      localStorage.setItem('poorinter-theme', dark ? 'light' : 'dark');
    } catch {
      /* Storage may be disabled. */
    }
  }
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Content />
      </AuthProvider>
      <Box component="footer" sx={{ px: 3, pb: 3, textAlign: 'center' }}>
        <Button onClick={toggleTheme}>{dark ? 'Day mode' : 'Night mode'}</Button>
      </Box>
    </ThemeProvider>
  );
}
