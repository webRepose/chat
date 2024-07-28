import Section from "../UI_kit/Section"; // Импорт компонента Section из UI_kита
import { useAuthState } from "react-firebase-hooks/auth"; // Импорт хука useAuthState из react-firebase-hooks/auth
import { useRef, useState, useEffect } from "react"; // Импорт useRef, useState, useEffect из react
import { useCollectionData } from "react-firebase-hooks/firestore"; // Импорт хука useCollectionData из react-firebase-hooks/firestore
import Preloader from "../components/Preloaders/Preloader"; // Импорт компонента Preloader из папки components/Preloaders
import Style from "../styles/chat/chat.module.css"; // Импорт стилей из файла chat.module.css в папке styles/chat
import { db, auth } from "../index"; // Импорт объектов db и auth из файла index в корне проекта
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
} from "firebase/firestore"; // Импорт функций и объектов из firebase/firestore
import {
  isURL,
  Consolidate,
  UpdateButton,
  Update,
  DeleteButton,
  Send,
  Pined,
  DateFun,
} from "./Components"; // Импорт функций из файла Components в текущей директории
import ModalClose from "../components/ModalClose"; // Импорт компонента ModalClose из папки components

// Основной компонент Chats
const Chats = ({ dataChats }) => {
  const [user] = useAuthState(auth), // Получение текущего пользователя с помощью хука useAuthState
    href = window.location.href; // Получение текущего URL

  // Определение idFromHref в зависимости от URL
  let idFromHref;
  if (href.includes("https://diasmess.vercel.app/")) {
    idFromHref = href.replace("https://diasmess.vercel.app/", "");
  } else idFromHref = href.replace("http://localhost:3000/", "");

  // Запрос сообщений и управление загрузкой
  const [messages, loading] = useCollectionData(
      query(
        collection(db, "users", dataChats, "chats", idFromHref, "messages"),
        orderBy("createdAt", "asc")
      )
    ),
    q = query(
      collection(db, "users", dataChats, "chats", idFromHref, "messages"),
      orderBy("createdAt", "asc")
    ),
    bottomRef = useRef(null), // Создание ref для прокрутки вниз
    [value, setValue] = useState(""), // Стейт для значения сообщения
    [valueRewrite, setValueRewrite] = useState(""), // Стейт для значения редактируемого сообщения
    [modalMessage, setModalMessage] = useState(false), // Стейт для модального окна
    [idMessageList, setIdMessageList] = useState([]), // Стейт для списка id сообщений
    [idDoc, setIdDoc] = useState(), // Стейт для id документа
    [copyText, setCopyText] = useState(), // Стейт для копируемого текста
    [uidModal, setUidModal] = useState(), // Стейт для uid модального окна
    [modeType, setModeType] = useState(true), // Стейт для типа модального окна
    [pined, setPined] = useState(""), // Стейт для закрепленного сообщения
    [pinedIdMessage, setPinedIdMessage] = useState(""), // Стейт для id закрепленного сообщения
    [idMessage, setIdMessage] = useState(), // Стейт для id сообщения
    [togglePined, setTogglePined] = useState(false), // Стейт для переключения закрепленного сообщения
    modalRef = useRef(null), // Создание ref для модального окна
    userUid1 = idFromHref.replace(dataChats, ""), // Получение uid пользователя 1
    userUid2 = dataChats, // Получение uid пользователя 2
    chatRefUser1 = query(
      doc(db, "users", userUid2, "chats", userUid2 + userUid1)
    ), // Создание запроса для чата пользователя 1
    chatRefUser2 = query(
      doc(db, "users", userUid1, "chats", userUid1 + userUid2)
    ); // Создание запроса для чата пользователя 2

  // Блокировка прокрутки body
  document.querySelector("body").style.overflow = "hidden";

  // Прокрутка вниз при загрузке и обновлении сообщений
  useEffect(() => {
    const timer = setTimeout(() => {
      bottomRef.current?.scrollIntoView({ block: "end" });
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Обновление idMessageList при изменении сообщений
  useEffect(() => {
    const f = onSnapshot(q, (querySnapshot) => {
      const data = querySnapshot.docs.map((e) => e.id);
      data.length > idMessageList.length &&
        setIdMessageList((prev) => (prev = data));
      return () => f();
    });
  }, [q, idMessageList]);

  // Получение закрепленного сообщения
  Pined(getDoc, doc, db, dataChats, idFromHref, setPined, setPinedIdMessage);

  // Отправка сообщения
  const [countSend, setCountSend] = useState(false);
  const SendClick = async () => {
    if (countSend) return false;
    Send(
      value,
      setValue,
      bottomRef,
      addDoc,
      collection,
      db,
      dataChats,
      idFromHref,
      user,
      Timestamp.fromDate(new Date()),
      updateDoc,
      chatRefUser1,
      chatRefUser2
    );
    setCountSend((prev) => (prev = true));

    setTimeout(() => {
      setCountSend((prev) => (prev = false));
    }, [700]);
  };

  // Обновление сообщения
  const [countUpdate, setCountUpdate] = useState(false);
  const UpdateClick = () => {
    if (countUpdate) return false;
    UpdateButton(
      valueRewrite,
      updateDoc,
      doc,
      db,
      dataChats,
      idFromHref,
      idDoc,
      idMessage,
      pinedIdMessage,
      chatRefUser1,
      chatRefUser2,
      setValueRewrite,
      setModeType
    );

    setCountUpdate((prev) => (prev = true));

    setTimeout(() => {
      setCountUpdate((prev) => (prev = false));
    }, [700]);
  };

  // Отправка первого сообщения
  const sendFirstMessage = async () => {
    await addDoc(
      collection(db, "users", dataChats, "chats", idFromHref, "messages"),
      {
        uid: user.uid,
        displayName: user.displayName,
        photoURL: user.photoURL,
        text: "Привет!",
        createdAt: Timestamp.fromDate(new Date()),
        changed: false,
      }
    );

    await updateDoc(chatRefUser1, {
      text: "Привет!",
      time: Timestamp.fromDate(new Date()),
    });

    await updateDoc(chatRefUser2, {
      text: "Привет!",
      time: Timestamp.fromDate(new Date()),
    });
  };

  // Отображение загрузочного экрана
  if (loading) return <Preloader />;

  // Основной JSX компонент

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
                  chatRefUser1,
                  chatRefUser2,
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
                            loading="lazy"
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
                        <img
                          loading="lazy"
                          width={15}
                          src="../../img/copy.svg"
                          alt="copy"
                        />
                      </div>
                      <div>Копировать</div>
                    </button>
                  </li>
                  {uidModal && (
                    <li
                      onClick={() => {
                        DeleteButton(
                          deleteDoc,
                          doc,
                          db,
                          dataChats,
                          idFromHref,
                          idDoc,
                          idMessage,
                          pinedIdMessage,
                          updateDoc,
                          chatRefUser1,
                          chatRefUser2,
                          setModalMessage
                        );
                      }}
                    >
                      <button>
                        <div>
                          <img
                            loading="lazy"
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
                        chatRefUser1,
                        chatRefUser2,
                        setModalMessage
                      );
                    }}
                  >
                    <button>
                      <div>
                        <img
                          loading="lazy"
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
                        <img
                          loading="lazy"
                          width={15}
                          src="../../img/close.svg"
                          alt="close"
                        />
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
                      marginLeft: user.uid === message.uid ? "auto" : "0px",
                      maxWidth: user.uid === message.uid && "88%",
                    }}
                    className={Style.chat_message}
                    onClick={() => {
                      setIdMessage((prev) => (prev = "#" + id));
                    }}
                  >
                    <div>
                      {user.uid === message.uid ? (
                        <>
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
                        </>
                      ) : (
                        <article className={Style.chat_message}>
                          <div className={Style.chat_message_ava}>
                            <img
                              loading="lazy"
                              alt="avatar"
                              src={
                                message.photoURL
                                  ? message.photoURL
                                  : "../../img/avatar.svg"
                              }
                            />
                          </div>
                          <div
                            onClick={() => {
                              setUidModal((prev) => (prev = false));
                              setModalMessage((prev) => (prev = true));
                              setCopyText((prev) => (prev = message.text));
                            }}
                            style={{ maxWidth: "80%", paddingTop: "6px" }}
                            className={Style.chat_message_block}
                          >
                            <p className={Style.chat_message_text}>
                              {message.text.split(" ").map((data, id) =>
                                isURL(data) ? (
                                  <a
                                    style={{
                                      textDecoration: "underline",
                                      color: user.uid === message.uid && "#fff",
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
                            <span
                              style={{ marginTop: "0" }}
                              className={Style.chat_message_date}
                            >
                              <span>
                                {message.changed && (
                                  <p style={{ marginRight: "3px" }}>Изменено</p>
                                )}
                                <time dateTime={DateFun(message.createdAt)}>
                                  {DateFun(message.createdAt)}
                                </time>
                              </span>
                            </span>
                          </div>
                        </article>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div onClick={sendFirstMessage} className={Style.chat_empty}>
                <div className={Style.chat_empty_block}>
                  <h4>Не знаете что написать?</h4>
                  <p>Отправить сообщение:</p>
                  <p>
                    <b>Привет!</b>
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
                    SendClick();
                  }
                }}
                onChange={(e) => {
                  setValue((prev) => (prev = e.target.value));
                }}
              />
            </div>
            <div className={Style.chat_form_button_block}>
              <button onClick={SendClick}>
                <div className={Style.chat_form_button}>
                  <img
                    width={"20px"}
                    height={"16.83px"}
                    src="../../img/send.svg"
                    alt="send"
                    loading="lazy"
                  />
                </div>
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className={Style.chat_form_change}>
              <div className={Style.chat_form_change_img}>
                <img
                  loading="lazy"
                  width={20}
                  src="../img/edit.svg"
                  alt="edit"
                />
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
                <img
                  loading="lazy"
                  width={17}
                  src="../img/close.svg"
                  alt="close"
                />
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
                      UpdateClick();
                    }
                  }}
                  onChange={(e) => {
                    setValueRewrite((prev) => (prev = e.target.value));
                  }}
                />
              </div>
              <div className={Style.chat_form_button_block}>
                <button onClick={UpdateClick}>
                  <div className={Style.chat_form_button}>
                    <img
                      loading="lazy"
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

export default Chats;
