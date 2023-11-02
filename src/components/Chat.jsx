import { useAuthState } from 'react-firebase-hooks/auth';
import { useContext, useRef, useState } from 'react';
import Context from '../index';
import {useCollectionData} from 'react-firebase-hooks/firestore';
import {collection, orderBy, getFirestore, addDoc} from 'firebase/firestore';
import { initializeApp } from 'firebase/app';
import Preloader from './Preloader';
import { Timestamp } from '@firebase/firestore';
import Style from '../styles/chat/chat.module.css';
import { useEffect } from 'react';   

const Chat = () => {
    const {auth} = useContext(Context); 
    const [user] = useAuthState(auth); 
    const bottomRef = useRef();
    const [value, setValue] = useState('');

    useEffect(() => {
        const timer = setTimeout(() => {
        bottomRef.current.scrollIntoView({ block: 'end' });

      }, 1000);
  
      return () => clearTimeout(timer);
    }, []);  

    
    // const goDown = () => {
    //     bottomRef.current.scrollIntoView({ behavior: "smooth", block: 'end' });
    // }

    const firebaseConfig = {
        apiKey: "AIzaSyC-8mx4_j1nxfHVLavJI0DzIdyefAlBMR4",
        authDomain: "chat-with-react-32ee8.firebaseapp.com",
        projectId: "chat-with-react-32ee8",
        storageBucket: "chat-with-react-32ee8.appspot.com",
        messagingSenderId: "569353468626",
        appId: "1:569353468626:web:9ca667cca9d9f9d93b4b0b",
        measurementId: "G-30ZGEPBMSJ"
      };

      const app = initializeApp(firebaseConfig)
      const db = getFirestore(app);

    const [messages, loading] = useCollectionData(
        collection(db, 'messages'), 
        orderBy("createdAt")   
    ); 

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
    }

    if(loading) return <Preloader/>
    
    console.log(Timestamp.fromDate(new Date()).toDate())
    console.log(Timestamp.fromDate(new Date()).toDate().getMonth())
    console.log(Timestamp.fromDate(new Date()).toDate().getDay())

    return (
        <section>
            <div style={{height: window.visualViewport.height - 130}} className={Style.chat}>
                    {/* <button className={Style.chat_goDown} onClick={goDown}>
                        вниз
                    </button> */}
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
                                <div className={Style.chat_message_blockYou}>
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