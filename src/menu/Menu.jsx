import ChatList from "../chat_list/Chat_list";
import Section from "../UI_kit/Section";
import Style from "../styles/menu/Menu.module.css";
import { useState, useRef } from "react";
import AddChat from "../components/AddChat";

const Menu = () => {
  const [modalChoiceUser, setModalChoiceUser] = useState(false),
    btnModalRef = useRef(null);
    document.querySelector('body').style.overflow = 'auto';

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
          ref={btnModalRef}
          onClick={() => {
            setModalChoiceUser((prev) => (prev = true));
          }}
          className={Style.menu_addNew}
        >
          Добавить чат
        </button>
      </Section>
    </main>
  );
};

export default Menu;
