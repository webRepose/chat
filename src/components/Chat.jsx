import { useAuthState } from 'react-firebase-hooks/auth';
import { useContext, useRef, useState, useEffect } from 'react';
import Context from '../index';
import {useCollectionData} from 'react-firebase-hooks/firestore';
import { collection, getFirestore, addDoc, doc, deleteDoc, onSnapshot, query, updateDoc } from 'firebase/firestore';
import { initializeApp } from 'firebase/app';
import Preloader from './Preloader';
import { Timestamp } from '@firebase/firestore';
import Style from '../styles/chat/chat.module.css';


const Chat = () => {
    const {auth} = useContext(Context); 
    const [user] = useAuthState(auth); 
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
    const [messages, loading] = useCollectionData(collection(db, 'messages')); 
    const [idMessageList, setIdMessageList] = useState([]);
    const [idDoc, setIdDoc] = useState();
    const chatRef = useRef();

    const q = query(collection(db, "messages"));
    useEffect(()=>{
        const documentsArray = [];
        onSnapshot(q, (querySnapshot) => {
            querySnapshot.docs.forEach((e) => {
                documentsArray.push(e.id)
            })

            if(documentsArray.length > idMessageList.length) {
                setIdMessageList(prev => prev = documentsArray);
            }
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
            return 0;
        }

        await addDoc(collection(db, 'messages'), {
            uid: user.uid,
            displayName: user.displayName,
            photoURL: user.photoURL,
            text: value.trim(),
            createdAt: Timestamp.fromDate(new Date()),
        });

        bottomRef.current.scrollIntoView({ behavior: "smooth", block: "end" })
        setValue('');

            // console.log(chatRef.current.clientHeight)
            // chatRef.current.clientHeight = window.visualViewport.height - 130
    }

    const Delete = async (value) => {
        await deleteDoc(doc(db, "messages", value));
    }

    // const Update = async (valueID) => {
    //     await updateDoc(doc(db, "messages", valueID), {
    //         text: value.trim()
    //     })
    // }

    console.log(idMessageList)
    console.log(idDoc)

    if(loading) return <Preloader/>

    return (
        <section>
            <div ref={chatRef} style={{height: window.visualViewport.height - 130}} className={Style.chat}>
                    { modalMessage &&
                        <div className={Style.chat_delete_block}>
                            <div className={Style.chat_delete}>
                                <h4>Меню взаимодействия</h4>
                                <ul>
                                <li onClick={()=>{
                                        // Update(idDoc)
                                        setModalMessage(prev => prev = false);
                                    }}>
                                        <button>
                                            <div>
                                                Изменить 
                                            </div>
                                            <div>
                                                <img width={15} src="../../img/edit.svg" alt="close"/>
                                            </div>
                                        </button>
                                    </li>
                                    <li onClick={()=>{
                                        Delete(idDoc);
                                        setModalMessage(prev => prev = false);
                                    }}>
                                        <button>
                                            <div>
                                                Удалить 
                                            </div>
                                            <div>
                                                <img width={15} src="../../img/delete.svg" alt="delete"/>
                                            </div>
                                        </button>
                                    </li>
                                    <li onClick={()=>{
                                        setModalMessage(prev => prev = false);
                                    }}>
                                        <button>
                                            <div>
                                                Отмена 
                                            </div>
                                            <div>
                                                <img width={15} src="../../img/close.svg" alt="close"/>
                                            </div>
                                        </button>
                                    </li>
                                </ul>
                            </div>  
                        </div>
                    }
                <div className={Style.chat_block} ref={bottomRef}>
                    {
                        messages.sort((a, b) => a.createdAt > b.createdAt ? 1 : -1).map((message, id)=> 
                        <div 
                        style={{marginLeft: user.uid === message.uid ? 'auto' : '0px'}}
                        className={Style.chat_message} 
                        key={id}
                        >
                            <div>
                            {user.uid === message.uid ? 
                            <>
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
                            <div className={Style.chat_messageYou}>
                                <div
                                id={id}
                                onClick={()=>{
                                    setModalMessage(prev => prev = true);
                                    setIdDoc(idMessageList[id]);
                                }} 
                                className={Style.chat_message_blockYou}>
                                        <p className={Style.chat_message_textYou}>
                                            {message.text}
                                        </p>
                                </div>
                                <div className={Style.chat_message_ava}>
                                { message.photoURL ?
                                        <img width={'40px'} height={'40px'} alt='avatar' src={message.photoURL}/>
                                        :
                                        <img alt='Avatar by Dmitriy Bondarchuk' src='../../img/avatar.svg'/>
                                }
                                </div>
                            </div>
                                </>
                             :    
                             <div style={{marginTop:'15px'}} className={Style.chat_message}>
                                <div className={Style.chat_message_ava}>
                                    { message.photoURL  ?
                                        <img alt='avatar' src={message.photoURL}/>
                                        :
                                        <img alt='Avatar by Dmitriy Bondarchuk' src='../../img/avatar.svg'/>
                                        
                                    }
                                </div>
                                <div className={Style.chat_message_block}>
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
                    }
                </div>
            </div>
            <div className={Style.chat_form}>
                <div className={Style.chat_form_input}>
                    <input 
                    placeholder='Начать писать'
                    value={value}
                    // onClick={()=>{
                    //     alert(chatRef.current.clientHeight)
                    //     window.visualViewport.height - chatRef.current.clientHeight

                    // }}
                    onChange={(e=>{setValue(e.target.value)})}/>
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
    );
}

export default Chat;