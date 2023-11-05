import { useAuthState } from 'react-firebase-hooks/auth';
import { useContext, useRef, useState, useEffect } from 'react';
import Context from '../index';
import {useCollectionData} from 'react-firebase-hooks/firestore';
import { orderBy, collection, getFirestore, addDoc, doc, deleteDoc, onSnapshot, query, updateDoc } from 'firebase/firestore';
import { initializeApp } from 'firebase/app';
import Preloader from './Preloader';
import { Timestamp } from '@firebase/firestore';
import Style from '../styles/chat/chat.module.css';


const Chat = () => {
    const {auth} = useContext(Context); 
    const [user] = useAuthState(auth); 
    const [heightChat, setHeightChat] = useState(window.visualViewport.height - 60);
    const bottomRef = useRef();
    const [value, setValue] = useState('');
    const [modalMessage, setModalMessage] = useState(false);
    const firebaseConfig = {
        apiKey: "AIzaSyC-8mx4_j1nxfHVLavJI0DzIdyefAlBMR4",
        authDomain: "chat-with-react-32ee8.firebaseapp.com",
        projectId: "chat-with-react-32ee8",
        storageBucket: "chat-with-react-32ee8.appspot.com",
        messagingSenderId: "569353468626",
        appId: "1:569353468626:web:9ca667cca9d9f9d93b4b0b",
        measurementId: "G-30ZGEPBMSJ"
    };
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    const [messages, loading] = useCollectionData(query(
        collection(db, 'messages'), orderBy("createdAt", "asc")
    )); 
    const [idMessageList, setIdMessageList] = useState([]);
    const [idDoc, setIdDoc] = useState();
    const [copyText, setCopyText] = useState();
    const [uidModal, setUidModal] = useState();
    const q = query(collection(db, "messages"), orderBy("createdAt", "asc"));

    useEffect(()=>{
        const documentsArray = [];
        const f = onSnapshot(q, (querySnapshot) => {
            querySnapshot.docs.map((e) => (
                documentsArray.push(e.id)
            ))

            if(documentsArray.length > idMessageList.length) {
                setIdMessageList(prev => prev = documentsArray);
            }
            return () => f();
        });
    },[q,idMessageList]);

    useEffect(() => {
        const timer = setTimeout(() => {
        bottomRef.current.scrollIntoView({ block: 'end' });
      }, 1000);
  
      return () => clearTimeout(timer);
    }, []);  
      
    const Send = async () => {
        if (!value || value.trim().length < 1) {
            setValue('');
            bottomRef.current.scrollIntoView({ behavior: "smooth", block: "end" })
            setTimeout(()=>{setHeightChat(prev => prev = window.visualViewport.height - 60);},200)
            return 0;
        }

        await addDoc(collection(db, 'messages'), {
            uid: user.uid,
            displayName: user.displayName,
            photoURL: user.photoURL,
            text: value.trim(),
            createdAt: Timestamp.fromDate(new Date()),
        });

        setIdMessageList(prev => prev = []);
        bottomRef.current.scrollIntoView({ behavior: "smooth", block: "end" })
        setValue('');
        setHeightChat(prev => prev = window.visualViewport.height - 60);
    }

    const Delete = async (value) => {
        await deleteDoc(doc(db, "messages", value));
        setIdMessageList(prev => prev = []);
    }

    const DeleteButton = () => {
        const resDel = window.confirm('Вы действительно хотите удалить это сообщение?');
        if(resDel) Delete(idDoc);
        setModalMessage(prev => prev = false);
    }

    // const Update = async (valueID) => {
    //     await updateDoc(doc(db, "messages", valueID), {
    //         text: value.trim()
    //     })
    // }

    if(loading) return <Preloader/>

    return (
        <main>
            <section>
            <div style={{height: heightChat}} className={Style.chat}>
                    { modalMessage &&
                        <div className={Style.chat_change_block}>
                            <div className={Style.chat_change}>
                                <h4>Меню взаимодействия</h4>
                                <ul>
                                    {uidModal &&
                                        <li onClick={()=>{
                                            // Update(idDoc)
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
                        messages ? messages.map((message, id) => 
                        <div 
                        style={{marginLeft: user.uid === message.uid ? 'auto' : '0px'}}
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
                                    { message.photoURL ?
                                        <img alt='avatar' src={message.photoURL}/>
                                        :
                                        <img alt='Avatar by Dmitriy Bondarchuk' src='../../img/avatar.svg'/>
                                        
                                    }
                                </div>
                                <div onClick={()=>{
                                    setUidModal(prev => prev = false);
                                    setModalMessage(prev => prev = true);
                                    setCopyText(prev => prev = message.text);
                                }} className={Style.chat_message_block}>
                                <span className={Style.chat_message_date}>
                                    <p className={Style.chat_message_name}>
                                        {message.displayName}
                                    </p>    
                                    <span>
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
                                    <p className={Style.chat_message_text}>
                                         {message.text}
                                    </p>
                                </div>
                             </div>
                            }
                            </div>
                        </div>)

                        : 
                        <div>
                            Здесь пока пусто
                        </div>
                    }
                </div>
            </div>
            <div className={Style.chat_form}>
                <div className={Style.chat_form_input}>
                    <input 
                    placeholder='Начать писать'
                    value={value}
                    onKeyDown={(e)=>{
                        if(e.key === 'Enter' || e.code === 'Enter') {
                            Send();
                            setHeightChat(prev => prev = window.visualViewport.height - 60);
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
        </section>
        </main>
    );
}

export default Chat;