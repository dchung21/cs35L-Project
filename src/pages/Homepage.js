import '../styles/homepage.css';
import React, {useState, useEffect} from 'react';
import Post from '../Post.js'

import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/storage';
import 'firebase/firestore';
import {storage, db, auth} from "../firebase.js"

import ImageUpload from './ImageUpload.js'
import {Link} from 'react-router-dom'
import { AuthProvider } from "../contexts/AuthContext.js";
import {Button} from 'react-native'

export default function Homepage(curr) {
    const [posts, setPosts] = useState([]);
    //const authUser = auth.currentUser;
    const [user, setUser] = useState(null);

    let fs = firebase.firestore();

    useEffect(() => {
         // get posts from user with id and update the posts state
        setUser(auth.currentUser);
        /*function fetchPosts(id) {
             fs.collection("posts").doc(id).collection("userPosts").get().then((snapshot) => {
                  snapshot.forEach(function (doc) {
                      let clonedPost = JSON.parse(  JSON.stringify(posts));
                      clonedPost.push(doc.data());
                      setPosts(clonedPost);
                      console.log(posts);
                  });
             });
         }*/

        // main routine to get posts from ourselves and people we follow
        /* async function fetchData() {
            firebase.auth().onAuthStateChanged( function (user) {
                if (user != null) {
                    
                    // retrieve posts from people we follow
                    fs.collection("following").doc(user.uid).get().then((doc) => {
                        let followingUsers = doc.data().following;
                        followingUsers.push(user.uid);

                        fs.collectionGroup("posts").where("uid", 'in', followingUsers).get().then((snapshot) => {
                            let p = [];
                            snapshot.forEach((doc) => {
                                p.push(doc.data());
                            });
                            setPosts(p);
                        });
                    });
                }
            });
         }
*/
        //fetchData();
        if (user != null) {
            let followingUsers = [];
            // retrieve posts from people we follow
            fs.collection("following").doc(user.uid).onSnapshot((doc) => {
                followingUsers = doc.data().following;
                followingUsers.push(user.uid)});

                fs.collection("posts").where("uid", 'in', followingUsers).onSnapshot((snapshot) => {
                    setPosts(snapshot.docs.map(doc1 => ({
                        id: doc1.id,
                        post: doc1.data()
                })));
            });
        
        }
    }, [], [posts]);


    /*let displayPost = [];

    posts.forEach((p, id) => {
        displayPost.push(<Post key = {id} postId={id} user={user} caption = {p.caption} image = {p.imageUrl} />);
    });
    console.log(displayPost);*/

    return (
        <div className="home">
          
            <div className = "home__header">
              <img
                className = "home__headerImage"
                src="https://www.instagram.com/static/images/web/mobile_nav_type_logo-2x.png/1b47f9d0e595.png"
                alt=""
              />
            </div>
            {user?.displayName ? (<div> {user.displayName} </div>):<div> No name </div>}
            {user ? (<ImageUpload username={user.displayName}/>):
            (<Link to= "/login" className ="btn btn-primary">Login</Link>)}
            {user ? (<Link to= "/login" className ="btn btn-primary">Logout</Link>):<div/>}
            {/*displayPost*/ posts.map((post) => (
            <Post key={user.uid} postId={post.uid} user={user} username={post.username} caption={post.caption} image={post.imageUrl} />
            ))}

                 
    
        </div>
      );
    }
    

    


    