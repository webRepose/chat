import ChatList from "../chat_list/Chat_list";
import Section from "../UI_kit/Section";
import Style from "../styles/menu/Menu.module.css";
import { useState, useRef } from "react";
import AddChat from "../components/AddChat";

const Menu = () => {
  const [modalChoiceUser, setModalChoiceUser] = useState(false),
    btnModalRef = useRef(null);
  document.querySelector("body").style.overflow = "auto";

  if (window.innerWidth >= 768) return false;

  return (
    <main style={{ overflowX: "hidden", overflowY: "auto" }}>
      <AddChat
        setToggle={setModalChoiceUser}
        toggle={modalChoiceUser}
        btnRef={btnModalRef}
      />
      <Section>
        <ChatList />
        <button
          title="Добавить чат"
          ref={btnModalRef}
          onClick={() => {
            setModalChoiceUser((prev) => (prev = true));
          }}
          className={Style.menu_addNew}
        >
          <img
            width={30}
            height={30}
            loading="lazy"
            src="../../img/Menu/chat.svg"
            alt="add chat"
          />
        </button>
      </Section>
    </main>
  );
};

export default Menu;
