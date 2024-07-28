import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import Style from "../styles/components/login/login.module.css";
import {
  query,
  orderBy,
  collection,
  Timestamp,
  setDoc,
  doc,
} from "firebase/firestore";
import { useCollectionData } from "react-firebase-hooks/firestore";
import { db, auth } from "../index";

const Copyright = () => {
  return (
    <div className={Style.copyright}>
      <p>{"Copyright © "}</p>
      <p>Chat IO</p>
      <p>{new Date().getFullYear()}</p>
    </div>
  );
};

const Login = () => {
  // Получаем коллекцию пользователей
  const [users] = useCollectionData(
    query(collection(db, "users"), orderBy("createdAt", "asc"))
  );

  // Функция для авторизации через Google
  const login = async () => {
    const provider = new GoogleAuthProvider();
    const { user } = await signInWithPopup(auth, provider);

    let isNewUser = true;
    // Проверяем, есть ли пользователь в коллекции
    users.forEach((data) => {
      if (data.uid === user.uid) isNewUser = false;
    });

    // Если пользователь новый, добавляем его в коллекцию
    if (isNewUser) {
      const createNewUser = async () => {
        await setDoc(doc(db, "users", user.uid), {
          uid: user.uid,
          displayName: user.displayName,
          photoURL: user.photoURL,
          createdAt: Timestamp.fromDate(new Date()),
        });
      };
      createNewUser();
    }
  };

  return (
    <>
      <section className={Style.login}>
        <div>
          <h1>Вход</h1>
          <button onClick={login} type="submit">
            Войти с помощью Google
          </button>
          <Copyright />
        </div>
      </section>
    </>
  );
};

export default Login;
