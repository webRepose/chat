import PreloaderChatList from "../components/Preloaders/PreloaderChatList";
import Style from "../styles/data/data.module.css";
import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import {
  collection,
  query,
  doc,
  deleteDoc,
  getDocs,
  orderBy,
} from "firebase/firestore";
import { db, auth } from "..";
import { useAuthState } from "react-firebase-hooks/auth";
import { useCollectionData } from "react-firebase-hooks/firestore";
import { DateFun } from "../chats/Components";

const Chat_list = () => {
  const [user] = useAuthState(auth),
    [chatsAll, loading] = useCollectionData(
      query(collection(db, "users", user.uid, "chats"), orderBy("time", "desc"))
    ),
    [Saved] = useCollectionData(query(collection(db, "users"))),
    [dataUsersID, setDataUsersID] = useState([]),
    [dataUsersID2, setDataUsersID2] = useState([]),
    [dataUserTwo, setDataUserTwo] = useState([]),
    [uids, setUids] = useState([]);

  useEffect(() => {
    if (Saved) {
      let d;
      const data4 = Saved.map((e) => e.uid === user.uid && e);
      data4.map((e) => e !== false && (d = e));
      setUids((prev) => (prev = [d]));
    }

    if (chatsAll) {
      const data = chatsAll.map(
        (data) => data.participants[0] + data.participants[1]
      );
      setDataUsersID((prev) => (prev = data));

      const data2 = chatsAll.map((data) => data.participants[1]);
      setDataUserTwo((prev) => (prev = data2));

      const data3 = chatsAll.map(
        (data) => data.participants[1] + data.participants[0]
      );
      setDataUsersID2((prev) => (prev = data3));
    }
  }, [chatsAll, Saved, user.uid]);

  const DeleteChat = async (userTwoUID, value, value2) => {
    const q = query(
        collection(db, "users", user.uid, "chats", value, "messages")
      ),
      q2 = query(
        collection(db, "users", userTwoUID, "chats", value2, "messages")
      ),
      querySnapshot = await getDocs(q),
      querySnapshot2 = await getDocs(q2);

    querySnapshot.forEach(async (docsData) => {
      await deleteDoc(
        doc(db, "users", user.uid, "chats", value, "messages", docsData.id)
      );
    });

    querySnapshot2.forEach(async (docsData) => {
      await deleteDoc(
        doc(db, "users", userTwoUID, "chats", value2, "messages", docsData.id)
      );
    });
    await deleteDoc(doc(db, "users", user.uid, "chats", value));
    await deleteDoc(doc(db, "users", userTwoUID, "chats", value2));
  };

  if (loading) return <PreloaderChatList />;

  return (
    <nav>
      {uids &&
        uids.map((data, id) => (
          <div key={id} className={Style.data_l}>
            <NavLink
              className={({ isActive }) =>
                [isActive && Style.active, Style.data].join(" ")
              }
              to={"/saved"}
            >
              <div className={Style.data_sub}>
                <div className={Style.data_avatar_block}>
                  <img
                    loading="lazy"
                    className={Style.data_avatar}
                    src="../img/Saved/bookmark.svg"
                    alt="avatar_chat"
                  />
                </div>
                <div className={Style.data_content}>
                  <p className={Style.data_name}>Сохраненные сообщения</p>
                  <p className={Style.data_text}>{data.text}</p>
                </div>
                {/* <div className={Style.data_time}> */}
                {/* <p>{DateFun(data.time)}</p> */}
                {/* </div> */}
              </div>
            </NavLink>
          </div>
        ))}

      {chatsAll &&
        chatsAll.map((data, id) => (
          <div className={Style.data_l} key={id}>
            <NavLink
              className={({ isActive }) =>
                [isActive && Style.active, Style.data].join(" ")
              }
              to={data.id}
            >
              <div className={Style.data_sub}>
                <div className={Style.data_avatar_block}>
                  <img
                    loading="lazy"
                    className={Style.data_avatar}
                    src={data.photoURL}
                    alt="avatar_chat"
                  />
                </div>
                <div className={Style.data_content}>
                  <p className={Style.data_name}>{data.displayName}</p>
                  <p className={Style.data_text}>{data.text}</p>
                </div>
                <div className={Style.data_time}>
                  <p>{DateFun(data.time)}</p>
                </div>
                <button
                  className={Style.data_delete}
                  onClick={(e) => {
                    e.preventDefault();
                    const resDel = window.confirm(
                      "Вы действительно хотите удалить этот чат?"
                    );
                    resDel &&
                      DeleteChat(
                        dataUserTwo[id],
                        dataUsersID[id],
                        dataUsersID2[id]
                      );
                  }}
                >
                  <img
                    loading="lazy"
                    src="../../img/deleteChat.svg"
                    width={18}
                    alt="delete_chat"
                  />
                </button>
              </div>
            </NavLink>
          </div>
        ))}
    </nav>
  );
};

export default Chat_list;
