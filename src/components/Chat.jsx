import { useAuthState } from 'react-firebase-hooks/auth';
import { useContext, useState } from 'react';
import Context from '../index';
import { Avatar, Button, Container, Grid, TextField } from '@mui/material';
import {useCollectionData} from 'react-firebase-hooks/firestore';
import {collection, orderBy, getFirestore, addDoc} from 'firebase/firestore';
import { initializeApp } from 'firebase/app';
import Preloader from './Preloader';
import { Timestamp} from '@firebase/firestore';

const Chat = () => {
    const {auth} = useContext(Context); 
    const [user] = useAuthState(auth); 

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
        console.log(value)
        await addDoc(collection(db, 'messages'), {
            uid: user.uid,
            displayName: user.displayName,
            photoURL: user.photoURL,
            text: value,
            createdAt: Timestamp.fromDate(new Date())
        });

        setValue('');
    }

    if(loading) {
        return <Preloader/>
    }

    return (
        <Container>
            <Grid container justify={'center'} style={{height: window.innerHeight - 200, marginTop:20}}>
                <div style={{width:'80%', height: '60vh',
                border: '1px solid gray', overflowY:'auto'}}>
                    {
                        messages.sort((a, b) => a.createdAt > b.createdAt ? 1 : -1).map((message, id)=> 
                        <div style={{
                            margin:20,
                            marginLeft: user.uid === message.uid ? 'auto' : '10px',
                            width: 'fit-content'
                            }} key={id}>
                            <Grid container>
                                <Avatar src={message.photoURL}/>
                                <div style={{marginLeft:13, marginTop:2}}>
                                    {message.displayName}
                                </div>
                            </Grid>
                            <div style={{marginLeft:53, marginTop:-18}}>
                                {message.text}
                            </div>
                        </div>)
                    }
                </div>
                <Grid container direction={'column'} alignItems={'flex-end'}
                    style={{width:'80%', height:'100px'}}
                    >
                        <TextField 
                        fullWidth
                        placeholder='Начать писать'
                        variant="outlined"
                        value={value}
                        onChange={(e=>{setValue(e.target.value)})}/>
                        
                        <Button onClick={Send} variant='outlined'>Отправить</Button>
                </Grid>
            </Grid>
        </Container>
    );
}

export default Chat;