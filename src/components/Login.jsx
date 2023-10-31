import { useContext } from 'react';
import Context from '../index';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import Style from '../styles/components/login/login.module.css';



const Copyright = () => {
  return (
    <div>
      <p>{'Copyright © '}</p>
      <p>Test</p>
      <p>{new Date().getFullYear()}</p>
    </div>
  );
}


const Login = () => {
    const { auth } = useContext(Context);
   
      const login = async () => {        
          const provider = new GoogleAuthProvider()
          const { user } = await signInWithPopup(auth, provider)
          console.log(user);
      };
   

  return (
    <>
    <section className={Style.login}>
      <button onClick={login} type="submit">
        Войти с помощью Google
      </button>
              <Copyright/>
    </section>
    </>
)
}

export default Login;