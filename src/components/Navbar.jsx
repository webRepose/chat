import * as React from 'react';
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
    <div>
          {user ? 
          <NavLink>
            <button onClick={signOut} >Exit</button>
          </NavLink>
           : 
          // <NavLink to={LOGIN_ROUTE}>
          //   <button variant='outlined' color="inherit">Login</button>
          // </NavLink>
          ''
          }
    </div>
  );
}

export default Navbar;