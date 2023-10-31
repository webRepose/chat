import { NavLink } from 'react-router-dom';
import { LOGIN_ROUTE } from '../utils/consts';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useContext } from 'react';
import Context from '../index';
import Style from '../styles/components/navbar/navbar.module.css';

const Navbar = () => {
    const {auth} = useContext(Context); 
    const [user] = useAuthState(auth); 
    
    const signOut = () => {
        auth.signOut().then(()=>{console.log('sign out')}) 
    }

  return (
    <header className={Style.header}>
      <button onClick={()=>{
        window.location.reload()
      }}>Reload</button>
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
    </header>
  );
}

export default Navbar;