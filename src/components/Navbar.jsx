import { Link } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import Style from "../styles/components/navbar/navbar.module.css";
import { auth } from "../index";
import Back from "./Back";

const Navbar = () => {
  const [user] = useAuthState(auth);
  const signOut = () => {
    auth.signOut().then(() => {
      console.log("sign out");
    });
  };

  return (
    <header className={Style.header}>
      <Back />
      <button
        className={Style.header_sync}
        onClick={() => {
          window.location.reload();
        }}
      >
        <img width={"20px"} src="../../img/sync.svg" alt="sync" />
      </button>
      {user && (
        <Link>
          <button className={Style.header_exit} onClick={signOut}>
            <div>Выход</div>
            <div>
              <img width={"20px"} src="../../img/exit.svg" alt="exit" />
            </div>
          </button>
        </Link>
      )}
    </header>
  );
};

export default Navbar;
