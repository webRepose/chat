import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import { NavLink } from 'react-router-dom';
import { LOGIN_ROUTE } from '../utils/consts';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useContext } from 'react';
import Context from '../index';

const Navbar = () => {
    const {auth} = useContext(Context); 
    const [user] = useAuthState(auth); 
    
    const signOut = () => {
        auth.signOut().then(()=>{console.log('sign out')}) 
    }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar color='primary' position="static">
        <Toolbar>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            News
          </Typography>
          {user ? 
          <NavLink>
            <Button onClick={signOut} variant='outlined' color="inherit">Exit</Button>
          </NavLink>
           : 
          <NavLink to={LOGIN_ROUTE}>
            <Button variant='outlined' color="inherit">Login</Button>
          </NavLink>
          }
        </Toolbar>
      </AppBar>
    </Box>
  );
}

export default Navbar;