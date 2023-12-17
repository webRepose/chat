import Style from "../styles/menu/Menu.module.css";
import { useEffect, useState, useRef } from "react";
import {
  collection,
  query,
  onSnapshot,
  setDoc,
  doc,
  Timestamp,
} from "firebase/firestore";
import { db, auth } from "..";
import { useAuthState } from "react-firebase-hooks/auth";
import { useNavigate } from "react-router-dom";
import ModalClose from "../components/ModalClose";

const AddChat = ({ setToggle, toggle, btnRef }) => {
  const [user] = useAuthState(auth),
    [checkHaveChat, setCheckHaveChat] = useState(""),
    [usersAll, setUsersAll] = useState([]),
    modalRef = useRef(null),
    navigate = useNavigate(),
    [search, setSearch] = useState("");

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
      setToggle((prev) => (prev = true));
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
        text: "",
        time: Timestamp.fromDate(new Date()),
      });

      await setDoc(chatRefUser2, {
        participants: [user2, user1],
        id: user1 + user2,
        idChats: user1,
        photoURL: user.photoURL,
        displayName: user.displayName,
        text: "",
        time: Timestamp.fromDate(new Date()),
      });

      navigate("/" + user1 + user2);

      return user1 + user2;
    }
  };

  return (
    <>
      <ModalClose
        modal={toggle}
        setModal={setToggle}
        refButton={btnRef}
        refModal={modalRef}
      />
      {toggle && (
        <div className={Style.modal}>
          <div ref={modalRef} className={Style.modal_choice}>
            <button
              onClick={() => {
                setToggle((prev) => (prev = false));
              }}
              className={Style.modal_close}
            >
              <img src="../../img/close.svg" width={18} alt="close" />
            </button>
            <h4>Кому написать?</h4>
            <input
              type="search"
              placeholder="Поиск"
              value={search}
              onChange={(e) => {
                setSearch((prev) => (prev = e.target.value));
              }}
            />
            <div className={Style.modal_choice_scroll}>
              {usersAll &&
                usersAll.map(
                  (data, id) =>
                    user.uid !== data.uid &&
                    data.displayName.includes(search) && (
                      <div
                        onClick={() => {
                          addNewChat(
                            user.uid,
                            data.uid,
                            data.photoURL,
                            data.displayName
                          );
                          setToggle((prev) => (prev = false));
                        }}
                        className={Style.modal_choice_data}
                        key={id}
                      >
                        <div className={Style.modal_choice_data__img}>
                          <img
                            width={50}
                            height={50}
                            src={data.photoURL && data.photoURL}
                            alt="avatar"
                          />
                        </div>
                        <p>{data.displayName}</p>
                      </div>
                    )
                )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AddChat;
