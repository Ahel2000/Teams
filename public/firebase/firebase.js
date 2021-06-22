import firebase from 'firebase'


require('firebase/auth');
require('firebase/database');

var firebaseConfig = {
  apiKey: "AIzaSyAZYrdWPPo3xwJ8MrKQxDreCO6BbN5RSqs",
  authDomain: "teamsclonesite.firebaseapp.com",
  projectId: "teamsclonesite",
  storageBucket: "teamsclonesite.appspot.com",
  messagingSenderId: "292225232182",
  appId: "1:292225232182:web:0b58800c63f20865875797"
};

// Initialize Firebase
const firebaseApp=firebase.initializeApp(firebaseConfig);
const db=firebase.firestore();

export default db;