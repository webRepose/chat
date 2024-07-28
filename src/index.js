import React, { createContext } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/index/index.module.css';
import { initializeApp } from 'firebase/app';
import { getStorage } from 'firebase/storage';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyC-8mx4_j1nxfHVLavJI0DzIdyefAlBMR4",
  authDomain: "chat-with-react-32ee8.firebaseapp.com",
  projectId: "chat-with-react-32ee8",
  storageBucket: "chat-with-react-32ee8.appspot.com",
  messagingSenderId: "569353468626",
  appId: "1:569353468626:web:9ca667cca9d9f9d93b4b0b",
  measurementId: "G-30ZGEPBMSJ"
};

const Context = createContext(null);
export default Context;
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const firestore = getStorage(app);
export const db = getFirestore(app);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Context.Provider value={{
      firebaseConfig,
      auth,
      firestore
    }}>
      <App />
    </Context.Provider>
  </React.StrictMode>
);
