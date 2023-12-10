import ChatList from "../chat_list/Chat_list";
import Section from "../UI_kit/Section";
import Style from "../styles/menu/Menu.module.css";
import { useEffect, useState, useRef } from "react";
import { collection, query, onSnapshot, setDoc, doc } from "firebase/firestore";
import { db, auth } from "..";
import { useAuthState } from "react-firebase-hooks/auth";
import { useNavigate } from "react-router-dom";
import ModalClose from "../components/ModalClose";

const Menu = () => {
  const [user] = useAuthState(auth),
    [checkHaveChat, setCheckHaveChat] = useState(""),
    [modalChoiceUser, setModalChoiceUser] = useState(false),
    [usersAll, setUsersAll] = useState([]),
    modalRef = useRef(null),
    btnModalRef = useRef(null),
    navigate = useNavigate();

  useEffect(() => {
    const f = onSnapshot(
      query(collection(db, "users", user.uid, "chats")),
      (querySnapshot) => {
        const data = querySnapshot.docs.map((e) => e.data());
        setCheckHaveChat((prev) => (prev = data));

        return () => f();
      }
    );

    const f2 = onSnapshot(query(collection(db, "users")), (querySnapshot) => {
      const data = querySnapshot.docs.map((e) => e.data());
      setUsersAll((prev) => (prev = data));

      return () => f2();
    });
  }, [user.uid]);

  const addNewChat = async (user1, user2, user2Photo, user2DisplayName) => {
    let resChat = true;
    checkHaveChat &&
      checkHaveChat.forEach((e) => {
        if (e.participants[1] === user2) {
          resChat = false;
          navigate("/" + user1 + user2);
        }
      });

    if (resChat) {
      setModalChoiceUser((prev) => (prev = true));
      const chatRefUser1 = query(
        doc(db, "users", user1, "chats", user1 + user2)
      );
      const chatRefUser2 = query(
        doc(db, "users", user2, "chats", user2 + user1)
      );

      await setDoc(chatRefUser1, {
        participants: [user1, user2],
        id: user1 + user2,
        idChats: user1,
        photoURL: user2Photo,
        displayName: user2DisplayName,
      });

      await setDoc(chatRefUser2, {
        participants: [user2, user1],
        id: user1 + user2,
        idChats: user1,
        photoURL: user.photoURL,
        displayName: user.displayName,
      });

      navigate("/" + user1 + user2);

      return user1 + user2;
    }
  };

  return (
    <main>
      <ModalClose
        modal={modalChoiceUser}
        setModal={setModalChoiceUser}
        refButton={btnModalRef}
        refModal={modalRef}
      />
      <Section>
        {modalChoiceUser && (
          <div className={Style.modal}>
            <div ref={modalRef} className={Style.modal_choice}>
              <button
                onClick={() => {
                  setModalChoiceUser((prev) => (prev = false));
                }}
                className={Style.modal_close}
              >
                <img src="../../img/close.svg" width={18} alt="close" />
              </button>
              <h4>Кому написать?</h4>
              <div className={Style.modal_choice_scroll}>
                {usersAll &&
                  usersAll.map(
                    (data, id) =>
                      user.uid !== data.uid && (
                        <div
                          onClick={() => {
                            addNewChat(
                              user.uid,
                              data.uid,
                              data.photoURL,
                              data.displayName
                            );
                            setModalChoiceUser((prev) => (prev = false));
                          }}
                          className={Style.modal_choice_data}
                          key={id}
                        >
                          <img
                            width={50}
                            src={data.photoURL && data.photoURL}
                            alt="avatar"
                          />
                          <p>{data.displayName}</p>
                        </div>
                      )
                  )}
              </div>
            </div>
          </div>
        )}
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
