import '../styles/homepage.css';
import React, {useState, useEffect} from 'react';
import Post from '../Post.js'
//import Select from 'react-select'
import {db, auth} from '../firebase.js'
import ImageUpload from './ImageUpload.js'
import { useHistory } from 'react-router-dom'
import { AuthProvider } from "../contexts/AuthContext.js";
import {Button} from 'react-native'
//import { handleInputChange } from 'react-select/dist/declarations/src/utils';

function Homepage(curr) {
    const [posts, setPosts] = useState([]);
    const authUser = auth.currentUser;
    const [user, setUser] = useState(null);
    const [selectedSearch, setSearch] = useState(null);
    const [userList, setUserList] = useState([]);
    let history = useHistory();
    const redirect = () => {history.push("/Login")}
    const handleChange = () => {
      setSearch(selectedSearch)
    }
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

    useEffect(() => {
      db.collection("users").onSnapshot(snapshot => {
        setUserList(snapshot.docs.map(doc => ({
          username: doc.data().username,
          id: doc.id
        })));
      })
      console.log(userList);
    }, []);

    return (
      <div className="home">
        
        <div className = "home__header">
          <img
            className = "home__headerImage"
            src="https://www.instagram.com/static/images/web/mobile_nav_type_logo-2x.png/1b47f9d0e595.png"
            alt=""
          />

          <div>
            {/* <Select
              value={selectedSearch}
              options={userList}
              onChange={handleChange}
              placeholder="Search..."
              openMenuOnClick={false}
            /> */}
          </div>

          {user ? (
            <div className="header__login">
              {user.displayName ? <div> {user.displayName} </div> : <div> No name </div>}
              <button className="logout__button" onClick={() => auth.signOut()}>Logout</button>
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