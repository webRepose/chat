import * as React from 'react';
import { useContext } from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import Link from '@mui/material/Link';
import Box from '@mui/material/Box';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import Context from '../index';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';


function Copyright(props) {
  return (
    <Typography variant="body2" color="text.secondary" align="center" {...props}>
      {'Copyright © '}
      <Link color="inherit" href="https://mui.com/">
        Test
      </Link>{' '}
      {new Date().getFullYear()}
      {'.'}
    </Typography>
  );
}

const defaultTheme = createTheme();

const Login = () => {
    const { auth } = useContext(Context);
   
       const login = async () => {        
           const provider = new GoogleAuthProvider()
           const { user } = await signInWithPopup(auth, provider)
           console.log(user);
       };
   

  return (
    <ThemeProvider theme={defaultTheme}>
      <Container component="main" maxWidth="xs">
        <CssBaseline />
        <Box
          sx={{
            marginTop: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',   
          }}
        >
          <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h5">
            Войти
          </Typography>
          <Button
              onClick={login}
              color='error'
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 4, mb: 2 }}
            >
              Войти с помощью Google
            </Button>
        </Box>
        <Copyright sx={{ mt: 8, mb: 4 }} />
      </Container>
    </ThemeProvider>
  );
}

export default Login;