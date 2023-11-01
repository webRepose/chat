import { useContext } from 'react';
import Context from '../index';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import Style from '../styles/components/login/login.module.css';

const Copyright = () => {
  return (
    <div className={Style.copyright}>
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
      <div>
      <h1>Вход</h1>
      <button onClick={login} type="submit">
        Войти с помощью Google
      </button>
              <Copyright/>
      </div>
    </section>
    </>
)
}

export default Login;