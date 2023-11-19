import Section from '../UI_kit/Section';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useRef, useState, useEffect } from 'react';
import {useCollectionData} from 'react-firebase-hooks/firestore';
import { Timestamp, orderBy, collection, addDoc, doc, deleteDoc, onSnapshot, query, updateDoc } from 'firebase/firestore';
import Preloader from '../components/Preloader';
import Style from '../styles/chat/chat.module.css';
import { getMessaging, onMessage } from "firebase/messaging";
import { db, auth  } from '../index';

const Chats = ({dataChats}) => {
    const [heightChat, setHeightChat] = useState(window.visualViewport.height - 130),
    [user] = useAuthState(auth), 
    href = window.location.href;
    let idFromHref;
    if(href.includes('https://webrepose-chat.vercel.app')) {
        idFromHref = href.replace('https://webrepose-chat.vercel.app/','');
    } else idFromHref = href.replace('http://localhost:3000/','');
    const bottomRef = useRef(),
    [value, setValue] = useState(''),
    [valueRewrite, setValueRewrite] = useState(''),
    [modalMessage, setModalMessage] = useState(false),
    [messages, loading] = useCollectionData(query(
      collection(db, 'users', dataChats, 'chats', idFromHref, 'messages'), orderBy("createdAt", "asc")
    )), 
    [idMessageList, setIdMessageList] = useState([]),
    [idDoc, setIdDoc] = useState(),
    [copyText, setCopyText] = useState(),
    [uidModal, setUidModal] = useState(),
    q = query(collection(db, 'users', dataChats, 'chats', idFromHref, 'messages'), orderBy("createdAt", "asc")),
    [modeType, setModeType] = useState(true);

    useEffect(()=>{
        const f = onSnapshot(q, (querySnapshot) => {
            const data = querySnapshot.docs.map(e => e.id);
            data.length > idMessageList.length && setIdMessageList(prev => prev = data);
            return () => f();
        });
    },[q,idMessageList]);

    useEffect(() => {
        const timer = setTimeout(() => {
        bottomRef.current.scrollIntoView({ block: 'end' });
      }, 1200);
  
      return () => clearTimeout(timer);
    }, []);  
      
    const Send = async () => {
        if (!value || value.trim().length < 1) {
            setValue('');
            bottomRef.current.scrollIntoView({ behavior: "smooth", block: "end" })
            setTimeout(()=>{setHeightChat(prev => prev = window.visualViewport.height - 130);},200)
            return 0;
        }

        await addDoc(collection(db, 'users', dataChats, 'chats', idFromHref, 'messages'), {
            uid: user.uid,
            displayName: user.displayName,
            photoURL: user.photoURL,
            text: value.trim(),
            createdAt: Timestamp.fromDate(new Date()),
            changed: false
        });

        // await updateDoc(doc(db, 'users', dataChats, 'chats', idFromHref), {
        //     displayNameFromMessages: user.displayName,
        //     text: value.trim(),
        // });

        bottomRef.current.scrollIntoView({ behavior: "smooth", block: "end" })
        setValue('');
        setHeightChat(prev => prev = window.visualViewport.height - 130);
    }

    const Delete = async (value) => {
        await deleteDoc(doc(db, 'users', dataChats, 'chats', idFromHref, 'messages', value));
    }

    const DeleteButton = () => {
        const resDel = window.confirm('Вы действительно хотите удалить это сообщение?');
        resDel && Delete(idDoc);
        setModalMessage(prev => prev = false);
    }

    const Update = () => {
        setModeType(prev => prev = false);
        messages.forEach((data, i) => {
            idDoc === idMessageList[i] && setValueRewrite(prev => prev = data.text);
        })
    }

    const UpdateButton = async () => {
        if(valueRewrite.length === 0) return 0;
        await updateDoc(doc(db, 'users', dataChats, 'chats', idFromHref, 'messages', idDoc), {
            text: valueRewrite.trim(),
            changed: true
        })

        setValueRewrite('');
        setModeType(prev => prev = true);
    }

    const sendFirstMessage = async() => {
        await addDoc(collection(db, 'users', dataChats, 'chats', idFromHref, 'messages'), {
            uid: user.uid,
            displayName: user.displayName,
            photoURL: user.photoURL,
            text: 'Привет!',
            createdAt: Timestamp.fromDate(new Date()),
            changed: false
        });
    }

    const messaging = getMessaging();
    onMessage(messaging, () => {
        const timer = setTimeout(() => {
            bottomRef.current.scrollIntoView({ block: 'end' });
          }, 1200);
      
          return () => clearTimeout(timer);
    });

    if(loading) return <Preloader/>

    return (
        <main>
            <Section>
            <div style={{height: heightChat}} className={Style.chat}>
                    { modalMessage &&
                        <div className={Style.chat_change_block}>
                            <div className={Style.chat_change}>
                                <h4>Меню взаимодействия</h4>
                                <ul>
                                    {uidModal &&
                                        <li onClick={()=>{
                                            Update();
                                            setModalMessage(prev => prev = false);
                                        }}>
                                            <button>
                                                <div>
                                                    <img width={15} src="../../img/edit.svg" alt="close"/>
                                                </div>
                                                <div>
                                                    Изменить 
                                                </div>
                                            </button>
                                        </li>
                                    }
                                    <li onClick={()=>{
                                        navigator.clipboard.writeText(copyText);
                                        alert('Вы успешно скопировали тест сообщения!');
                                        setModalMessage(prev => prev = false);
                                    }}>
                                        <button>
                                            <div>
                                                <img width={15} src="../../img/copy.svg" alt="copy"/>
                                            </div>
                                            <div>
                                                Копировать 
                                            </div>
                                        </button>
                                    </li>
                                    {uidModal &&
                                        <li onClick={DeleteButton}>
                                            <button>
                                                <div>
                                                    <img width={15} src="../../img/delete.svg" alt="delete"/>
                                                </div>
                                                <div>
                                                    Удалить 
                                                </div>
                                            </button>
                                        </li>
                                    }
                                    <li onClick={()=>{
                                        setModalMessage(prev => prev = false);
                                    }}>
                                        <button>
                                            <div>
                                                <img width={15} src="../../img/close.svg" alt="close"/>
                                            </div>
                                            <div>
                                                Отменить
                                            </div>
                                        </button>
                                    </li>
                                </ul>
                            </div>  
                        </div>
                    }
                <div className={Style.chat_block} ref={bottomRef}>
                    {
                        messages.length >= 1 ? messages.map((message, id) => 
                        <div 
                        style={{marginLeft: user.uid === message.uid ? 'auto' : '0px', maxWidth: user.uid === message.uid && '88%'} }
                        className={Style.chat_message} 
                        key={id}
                        >
                            <div>
                            {user.uid === message.uid ? 
                            <>
                            <div className={Style.chat_messageYou}>
                                <div
                                id={id}
                                onClick={()=>{
                                    setUidModal(prev => prev = true);
                                    setModalMessage(prev => prev = true);
                                    setIdDoc(prev => prev = idMessageList[id]);
                                    setCopyText(prev => prev = message.text);
                                }} 
                                className={Style.chat_message_blockYou}>
                                    <p className={Style.chat_message_textYou}>
                                        {message.text}
                                    </p>
                                    <span className={Style.chat_message_dateYou}>
                                    {message.changed &&
                                        <p style={{marginRight:'3px'}}>Изменено</p>
                                    }
                                        <p>{message.createdAt.toDate().getHours()}</p>
                                        <p>:</p>
                                        <p>
                                            {message.createdAt.toDate().getMinutes() !== 0 
                                            ?
                                            <>
                                                {message.createdAt.toDate().getMinutes() < 10 ?
                                                    '0' + message.createdAt.toDate().getMinutes() 
                                                    : message.createdAt.toDate().getMinutes() 
                                                }
                                            </>
                                            : 
                                            message.createdAt.toDate().getMinutes() + '0' 
                                            }
                                        </p>
                                    </span>
                                </div>
                            </div>
                                </>
                             :    
                             <div className={Style.chat_message}>
                                <div className={Style.chat_message_ava}>
                                        <img alt='avatar' 
                                        src={message.photoURL ? message.photoURL : '../../img/avatar.svg'}/>
                                </div>
                                <div onClick={()=>{
                                    setUidModal(prev => prev = false);
                                    setModalMessage(prev => prev = true);
                                    setCopyText(prev => prev = message.text);
                                }} style={{maxWidth: '80%', paddingTop: '6px'}} className={Style.chat_message_block}>     
                                    <p className={Style.chat_message_text}>
                                         {message.text}
                                    </p>
                                    <span style={{marginTop:'0'}} className={Style.chat_message_date}>
                                    <span>
                                    {message.changed &&
                                        <p style={{marginRight:'3px'}}>Изменено</p>
                                    }
                                        <p>
                                            {message.createdAt.toDate().getHours()}
                                        </p>
                                        <p>:</p>
                                        <p>
                                            {message.createdAt.toDate().getMinutes() !== 0 
                                            ?
                                            <>
                                                {message.createdAt.toDate().getMinutes() < 10 ?
                                                   '0' + message.createdAt.toDate().getMinutes() 
                                                   : message.createdAt.toDate().getMinutes() 
                                                }
                                            </>
                                            : 
                                            message.createdAt.toDate().getMinutes() + '0' }
                                        </p>
                                    </span>
                                </span>
                                </div>
                             </div>
                            }
                            </div>
                        </div>)

                        : 
                        <div onClick={sendFirstMessage} style={{height: heightChat - 40}} className={Style.chat_empty}>
                            <div className={Style.chat_empty_block}> 
                                <h4>Не знаете что написать?</h4>
                                <p>Отправить сообщение:</p>
                                <p><b>Привет!</b></p>
                            </div>
                        </div>
                    }
                </div>
            </div>
            {modeType ? 
                    <div className={Style.chat_form}>
                        <div className={Style.chat_form_input}>
                            <input 
                            placeholder='Начать писать'
                            value={value}
                            onKeyDown={(e)=>{
                                if(e.key === 'Enter' || e.code === 'Enter') {
                                    Send();
                                    setHeightChat(prev => prev = window.visualViewport.height - 130);
                                };
                            }}
                            onChange={(e => {
                                setValue(prev => prev = e.target.value);
                            })}/>
                        </div>
                        <div className={Style.chat_form_button_block}>
                            <button onClick={Send}>
                                <div className={Style.chat_form_button}>
                                    <img width={'20px'} height={'16.83px'} src='../../img/send.svg' alt="send"/>
                                </div>
                            </button>
                        </div>
                    </div>
                    :
                    <div className={Style.chat_form}>
                    <div className={Style.chat_form_input}>
                        <input 
                        placeholder='Начать писать'
                        value={valueRewrite}
                        onKeyDown={(e)=>{
                            if(e.key === 'Enter' || e.code === 'Enter') {
                                UpdateButton();
                                setHeightChat(prev => prev = window.visualViewport.height - 130);
                            };
                        }}
                        onChange={(e => {
                            setValueRewrite(prev => prev = e.target.value);
                        })}/>
                    </div>
                    <div className={Style.chat_form_button_block}>
                        <button onClick={UpdateButton}>
                            <div className={Style.chat_form_button}>
                                <img width={'20px'} height={'16.83px'} src='../../img/send.svg' alt="send"/>
                            </div>
                        </button>
                    </div>
                </div>
            }
        </Section>
        </main>
    );
}

export default Chats;