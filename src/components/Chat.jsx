import { useAuthState } from 'react-firebase-hooks/auth';
import { useContext, useRef, useState } from 'react';
import Context from '../index';
import {useCollectionData} from 'react-firebase-hooks/firestore';
import {collection, orderBy, getFirestore, addDoc} from 'firebase/firestore';
import { initializeApp } from 'firebase/app';
import Preloader from './Preloader';
import { Timestamp } from '@firebase/firestore';
import Style from '../styles/chat/chat.module.css';

const Chat = () => {
    const {auth} = useContext(Context); 
    const [user] = useAuthState(auth); 
    const bottomRef = useRef();

    // useEffect(() =>
    //     bottomRef.current.scrollIntoView({ behavior: "smooth", block: "end" })
    // ); 

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

    const [value, setValue] = useState('');
    const [messages, loading] = useCollectionData(
        collection(db, 'messages'), 
        orderBy("createdAt")   
    ); 


    const Send = async () => {
        bottomRef.current.scrollIntoView({ behavior: "smooth", block: "end" })
        // console.log(bottomRef.current.scrollHeight)
        // console.log(bottomRef.current)

        if (!value || value.trim().length < 1) {
            setValue('');
            return 0;
        }

        await addDoc(collection(db, 'messages'), {
            uid: user.uid,
            displayName: user.displayName,
            photoURL: user.photoURL,
            text: value.trim(),
            createdAt: Timestamp.fromDate(new Date())
        });

        setValue('');
    }

    if(loading) {
        return <Preloader/>
    }

    return (
        <section>
            <div className={Style.chat}>
                <div ref={bottomRef}>
                    {
                        messages.sort((a, b) => a.createdAt > b.createdAt ? 1 : -1).map((message, id)=> 
                        <div 
                        style={{marginLeft: user.uid === message.uid ? 'auto' : '0px'}}
                        className={Style.chat_message} 
                        key={id}
                        >
                            <div>
                            {user.uid === message.uid ? 
                            <div className={Style.chat_messageYou}>
                                <div className={Style.chat_message_blockYou}>
                                        <p className={Style.chat_message_textYou}>
                                            {message.text}
                                        </p>
                                </div>

                                <div className={Style.chat_message_ava}>
                                    <img alt='avatar' src={message.photoURL}/>
                                </div>
                            </div>
                             :         
                             <div className={`${Style.chat_message} ${Style.chat_message_user}`}>
                                <div className={Style.chat_message_ava}>
                                    <img alt='avatar' src={message.photoURL}/>
                                </div>
                                <div className={Style.chat_message_block}>
                                    <p className={Style.chat_message_name}>
                                        {message.displayName}
                                    </p>
                                <hr />
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
                            <img src='../../img/send.svg' alt="send"/>
                        </div>
                    </button>
                </div>
            </div>
        </section>
    );
}

export default Chat;