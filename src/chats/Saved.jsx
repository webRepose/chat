import Section from "../UI_kit/Section";
import { useAuthState } from "react-firebase-hooks/auth";
import { useRef, useState, useEffect } from "react";
import { useCollectionData } from "react-firebase-hooks/firestore";
import Preloader from "../components/Preloaders/Preloader";
import Style from "../styles/chat/chat.module.css";
import { db, auth } from "../index";
import {
  Timestamp,
  orderBy,
  collection,
  addDoc,
  doc,
  deleteDoc,
  onSnapshot,
  query,
  updateDoc,
  getDoc,
} from "firebase/firestore";
import { isURL, Consolidate, Update, DateFun } from "./Components";
import ModalClose from "../components/ModalClose";

const Saved = () => {
  const [user] = useAuthState(auth),
    [messages, loading] = useCollectionData(
      query(
        collection(db, "users", user.uid, "saved"),
        orderBy("createdAt", "asc")
      )
    ),
    q = query(
      collection(db, "users", user.uid, "saved"),
      orderBy("createdAt", "asc")
    ),
    bottomRef = useRef(null),
    [value, setValue] = useState(""),
    [valueRewrite, setValueRewrite] = useState(""),
    [modalMessage, setModalMessage] = useState(false),
    [idMessageList, setIdMessageList] = useState([]),
    [idDoc, setIdDoc] = useState(),
    [copyText, setCopyText] = useState(),
    [uidModal, setUidModal] = useState(),
    [modeType, setModeType] = useState(true),
    [pined, setPined] = useState(""),
    [pinedIdMessage, setPinedIdMessage] = useState(""),
    [idMessage, setIdMessage] = useState(),
    [togglePined, setTogglePined] = useState(false),
    modalRef = useRef(null),
    chatsRef = query(doc(db, "users", user.uid));
  document.querySelector("body").style.overflow = "hidden";

  useEffect(() => {
    const timer = setTimeout(() => {
      bottomRef.current?.scrollIntoView({ block: "end" });
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const f = onSnapshot(q, (querySnapshot) => {
      const data = querySnapshot.docs.map((e) => e.id);
      data.length > idMessageList.length &&
        setIdMessageList((prev) => (prev = data));
      return () => f();
    });
  }, [q, idMessageList]);

  const Pined = async () => {
    const e = await getDoc(doc(db, "users", user.uid));
    setPined((prev) => (prev = e.data().pined));
    setPinedIdMessage((prev) => (prev = e.data().idMessage));
  };

  Pined();

  const Send = async () => {
    if (!value || value.trim().length < 1) {
      setValue("");
      bottomRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
      return 0;
    }

    await addDoc(collection(db, "users", user.uid, "saved"), {
      text: value.trim(),
      createdAt: Timestamp.fromDate(new Date()),
      changed: false,
    });

    bottomRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
    setValue("");

    await updateDoc(chatsRef, {
      text: value.trim(),
      time: Timestamp.fromDate(new Date()),
    });
  };

  const [countSend, setCountSend] = useState(false);
  const debugSend = () => {
    if (countSend) return false;
    Send();
    setCountSend((prev) => (prev = true));

    setTimeout(() => {
      setCountSend((prev) => (prev = false));
    }, [700]);
  };

  const Delete = async (value) => {
    await deleteDoc(doc(db, "users", user.uid, "saved", value));
  };

  const DeleteButton = async () => {
    const resDel = window.confirm(
      "Вы действительно хотите удалить это сообщение?"
    );
    if (resDel) {
      Delete(idDoc);

      if (
        document.getElementById(Number(idMessage.replace("#", "")) + 1) === null
      ) {
        await updateDoc(chatsRef, {
          text: document.getElementById(Number(idMessage.replace("#", "")) - 1)
            .children[0].textContent,
        });
      }

      if (idMessage === pinedIdMessage) {
        await updateDoc(chatsRef, {
          pined: "",
          idMessage: "",
        });
      }
    }
    setModalMessage((prev) => (prev = false));
  };

  const UpdateButton = async (id) => {
    if (valueRewrite.length === 0) return 0;
    await updateDoc(doc(db, "users", user.uid, "saved", idDoc), {
      text: valueRewrite.trim(),
      changed: true,
    });

    if (
      document.getElementById(Number(idMessage.replace("#", "")) + 1) === null
    ) {
      await updateDoc(chatsRef, {
        text: valueRewrite.trim(),
      });
    }

    if (idMessage === pinedIdMessage) {
      await updateDoc(chatsRef, {
        pined: valueRewrite.trim(),
        idMessage: id,
      });
    }

    setValueRewrite("");
    setModeType((prev) => (prev = true));
  };

  const [countUpdate, setCountUpdate] = useState(false);
  const debugUpdate = (idmMess) => {
    if (countUpdate) return false;
    setCountUpdate((prev) => (prev = true));
    UpdateButton(idmMess);

    setTimeout(() => {
      setCountUpdate((prev) => (prev = false));
    }, [700]);
  };

  if (loading) return <Preloader />;

  return (
    <main>
      <ModalClose
        modal={modalMessage}
        setModal={setModalMessage}
        refButton={""}
        refModal={modalRef}
      />
      <Section>
        {pined && (
          <article className={Style.chat_consolidate}>
            <div
              className={Style.chat_consolidate_click}
              onClick={() => {
                setTogglePined((prev) => !prev);
                document
                  .getElementById(pinedIdMessage)
                  ?.scrollIntoView({ behavior: "smooth", block: "center" });
                document
                  .getElementById(pinedIdMessage)
                  .classList.add(Style.chat_anim);

                if (togglePined) {
                  setTimeout(() => {
                    if (document.getElementById(pinedIdMessage)) {
                      document
                        .getElementById(pinedIdMessage)
                        .classList.remove(Style.chat_anim);
                    }
                  }, [4500]);
                }
              }}
            >
              <h4>Закрепленное сообщение</h4>
              <p>{pined}</p>
            </div>
            <button
              onClick={() => {
                Consolidate(
                  copyText,
                  true,
                  idMessage,
                  updateDoc,
                  chatsRef,
                  "",
                  setModalMessage
                );
              }}
            >
              <img src="../../img/close.svg" width={15} alt="unpined" />
            </button>
          </article>
        )}
        <div className={Style.chat}>
          {modalMessage && (
            <div className={Style.chat_change_block}>
              <div ref={modalRef} className={Style.chat_change}>
                <h4>Меню взаимодействия</h4>
                <ul>
                  {uidModal && (
                    <li
                      onClick={() => {
                        Update(
                          setModeType,
                          messages,
                          idDoc,
                          idMessageList,
                          setValueRewrite,
                          setModalMessage
                        );
                      }}
                    >
                      <button>
                        <div>
                          <img
                            width={15}
                            src="../../img/edit.svg"
                            alt="close"
                          />
                        </div>
                        <div>Изменить</div>
                      </button>
                    </li>
                  )}
                  <li
                    onClick={() => {
                      navigator.clipboard.writeText(copyText);
                      alert("Вы успешно скопировали тест сообщения!");
                      setModalMessage((prev) => (prev = false));
                    }}
                  >
                    <button>
                      <div>
                        <img width={15} src="../../img/copy.svg" alt="copy" />
                      </div>
                      <div>Копировать</div>
                    </button>
                  </li>
                  {uidModal && (
                    <li onClick={DeleteButton}>
                      <button>
                        <div>
                          <img
                            width={15}
                            src="../../img/delete.svg"
                            alt="delete"
                          />
                        </div>
                        <div>Удалить</div>
                      </button>
                    </li>
                  )}
                  <li
                    onClick={() => {
                      Consolidate(
                        copyText,
                        false,
                        idMessage,
                        updateDoc,
                        chatsRef,
                        "",
                        setModalMessage
                      );
                    }}
                  >
                    <button>
                      <div>
                        <img
                          height={18}
                          width={15}
                          src="../../img/Chat/pin.svg"
                          alt="pined"
                        />
                      </div>
                      <div>Закрепить</div>
                    </button>
                  </li>
                  <li
                    onClick={() => {
                      setModalMessage((prev) => (prev = false));
                    }}
                  >
                    <button>
                      <div>
                        <img width={15} src="../../img/close.svg" alt="close" />
                      </div>
                      <div>Отменить</div>
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          )}
          <div
            style={{ marginTop: pined && "70px" }}
            className={Style.chat_block}
            ref={bottomRef}
          >
            {messages.length >= 1 ? (
              messages.map((message, id) => (
                <div key={id} id={"#" + id}>
                  <div
                    style={{
                      marginLeft: "auto",
                      maxWidth: "88%",
                    }}
                    className={Style.chat_message}
                    onClick={() => {
                      setIdMessage((prev) => (prev = "#" + id));
                    }}
                  >
                    <div>
                      <article className={Style.chat_messageYou}>
                        <div
                          id={id}
                          onClick={() => {
                            setUidModal((prev) => (prev = true));
                            setModalMessage((prev) => (prev = true));
                            setIdDoc((prev) => (prev = idMessageList[id]));
                            setCopyText((prev) => (prev = message.text));
                          }}
                          className={Style.chat_message_blockYou}
                        >
                          <p className={Style.chat_message_textYou}>
                            {message.text.split(" ").map((data, id) =>
                              isURL(data) ? (
                                <a
                                  style={{
                                    textDecoration: "underline",
                                    color: "#fff",
                                  }}
                                  key={id}
                                  rel="noreferrer"
                                  target="_blank"
                                  href={data}
                                >
                                  {" "}
                                  {data}{" "}
                                </a>
                              ) : (
                                `${data} `
                              )
                            )}
                          </p>
                          <span className={Style.chat_message_dateYou}>
                            {message.changed && (
                              <p style={{ marginRight: "3px" }}>Изменено</p>
                            )}
                            <time dateTime={DateFun(message.createdAt)}>
                              {DateFun(message.createdAt)}
                            </time>
                          </span>
                        </div>
                      </article>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className={Style.chat_empty}>
                <div className={Style.chat_empty_block}>
                  <h4>Ваши закладки</h4>
                  <p>Здесь можно хранить ваши данные</p>
                  <p>
                    Например:
                    <b> Ссылки, Фото, Сообщения и тд.</b>
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
        {modeType ? (
          <div className={Style.chat_form}>
            <div className={Style.chat_form_input}>
              <input
                type="text"
                placeholder="Начать писать"
                value={value}
                onKeyUp={(e) => {
                  if (e.key === "Enter" || e.code === "Enter") {
                    debugSend();
                  }
                }}
                onChange={(e) => {
                  setValue((prev) => (prev = e.target.value));
                }}
              />
            </div>
            <div className={Style.chat_form_button_block}>
              <button onClick={debugSend}>
                <div className={Style.chat_form_button}>
                  <img
                    width={"20px"}
                    height={"16.83px"}
                    src="../../img/send.svg"
                    alt="send"
                  />
                </div>
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className={Style.chat_form_change}>
              <div className={Style.chat_form_change_img}>
                <img width={20} src="../img/edit.svg" alt="edit" />
              </div>
              <div className={Style.chat_form_change_block}>
                <h4>Изменяемое собщение</h4>
                <p>{copyText}</p>
              </div>
              <button
                onClick={() => {
                  setModeType((prev) => !prev);
                }}
                className={Style.chat_form_change_close}
              >
                <img width={17} src="../img/close.svg" alt="close" />
              </button>
            </div>
            <div className={Style.chat_form}>
              <div className={Style.chat_form_input}>
                <input
                  autoFocus
                  type="text"
                  placeholder="Начать писать"
                  value={valueRewrite}
                  onKeyUp={(e) => {
                    if (e.key === "Enter" || e.code === "Enter") {
                      debugUpdate(idMessage);
                    }
                  }}
                  onChange={(e) => {
                    setValueRewrite((prev) => (prev = e.target.value));
                  }}
                />
              </div>
              <div className={Style.chat_form_button_block}>
                <button
                  onClick={() => {
                    debugUpdate(idMessage);
                  }}
                >
                  <div className={Style.chat_form_button}>
                    <img
                      width={"20px"}
                      height={"16.83px"}
                      src="../../img/send.svg"
                      alt="send"
                    />
                  </div>
                </button>
              </div>
            </div>
          </>
        )}
      </Section>
    </main>
  );
};

export default Saved;
