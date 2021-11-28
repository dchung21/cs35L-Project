import '../styles/homepage.css';
import React, {useState, useEffect} from 'react';
import Post from '../Post.js'
import {db, auth} from '../firebase.js'
import ImageUpload from './ImageUpload.js'
import { useHistory } from 'react-router-dom'
import { AuthProvider } from "../contexts/AuthContext.js";
import {Button} from 'react-native'

function Homepage(curr) {
    const [posts, setPosts] = useState([]);
    const authUser = auth.currentUser;
    const [user, setUser] = useState(null);
    let history = useHistory();
    const redirect = () => {history.push("/Login")}
    useEffect(() => {
      if(!!authUser)
        db.collection('posts').doc(authUser.uid).collection("userPosts").orderBy('timestamp', 'desc').onSnapshot(snapshot => {
          setPosts(snapshot.docs.map(doc => ({
            id: doc.id,
            post: doc.data()
          })));
        })
      }, [posts])
    useEffect(() => {
      const unsubscribe = auth.onAuthStateChanged((authUser) => {
      if (authUser){
        console.log(authUser)
        setUser(authUser)
      } else {
        setUser(null);
      }
    })

    return () => {
      unsubscribe();
    }
  }, [user]);
      return (
        <div className="home">
          
          <div className = "home__header">
            <img
              className = "home__headerImage"
              src="https://www.instagram.com/static/images/web/mobile_nav_type_logo-2x.png/1b47f9d0e595.png"
              alt=""
            />
            {user ? (
              <div className="header__login">
                <div> {user.displayName} </div>
                <Button className="logout__button" onClick={() => auth.signOut()}>Logout</Button>
              </div>
            ): (
              <div className="header__login">
                <div> No name </div>
                <Button onClick={redirect}>Login</Button>
              </div>
            )}
          </div>
          
          {user ? (<ImageUpload username={user.displayName}/>) : (<div/>) }
            
          {
            posts.map(({id, post}) => (
            <Post key={id} username={post.username} caption={post.caption} image={post.imageUrl} />
            ))
          }
          {
            posts.map(({id, post}) => (
            <div key={id}> username={post.username} caption={post.caption} image={post.imageUrl} </div>
            ))
          }
    
        </div>
      );
    }
    
    export default Homepage;