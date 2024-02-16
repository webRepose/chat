import { Link } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import Style from "../styles/components/navbar/navbar.module.css";
import { auth } from "../index";
import Back from "./Back";
import ChatList from "../chat_list/Chat_list";
import AddChat from "./AddChat";
import { useRef, useState } from "react";

const Navbar = () => {
  const [user] = useAuthState(auth),
    [addChat, setAddChat] = useState(false),
    btnModalRef = useRef(null);

  const signOut = () => {
    const resExit = window.confirm("Вы действительно хотите выйти?");
    resExit && auth.signOut();
  };

  return (
    <>
      {user && (
        <AddChat setToggle={setAddChat} toggle={addChat} btnRef={btnModalRef} />
      )}
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
      {window.innerWidth >= 768 && user && (
        <aside className={Style.menu_aside}>
          <ChatList />
          <button
            title="Добавить чат"
            ref={btnModalRef}
            onClick={() => {
              setAddChat((prev) => (prev = true));
            }}
            className={Style.menu_addNew}
          >
            <img
              width={20}
              height={20}
              src="../../img/Menu/chat.svg"
              alt="add chat"
            />
            <p>Добавить чат</p>
          </button>
        </aside>
      )}
    </>
  );
};

export default Navbar;
