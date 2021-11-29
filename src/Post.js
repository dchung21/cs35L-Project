import React, { useEffect, useState } from 'react'
import '../src/styles/Post.css'
import {db} from './firebase.js'
import 'firebase/firestore';
import firebase from 'firebase/app';

export default function Post(props) {
    const [comments, setComments] = useState([]);
    const [comment, setComment] = useState('');

    const postComment = (event) => {
        event.preventDefault();
        firebase.firestore().collection("posts").doc(props.postId)
        .collection("comments")
        .add({
            text: comment,
            username: props.user.displayName,
            timestamp: firebase.firestore().FieldValue.serverTimestamp()
        });
        setComment('');
    }

    useEffect(() => {
        let unsubscribe;
        if (props.postId) {
            unsubscribe = db
            .collection("posts")
            .doc(props.postId)
            .collection("comments")
            .orderBy('timestamp', 'desc')
            .onSnapshot((snapshot) => {
                setComments(snapshot.docs.map((doc) => doc.data()));
            });
        }

        return () => {
            unsubscribe();
        };
    }, [props.postId]);
    
    
    

    return (
        <div className="post">
            <h3 className = "post__username">{props.username}</h3>

            <img className = "post__image" src ={props.image}/>

            <h4 className = "post__text"><strong>{props.username}:</strong> {props.caption}</h4>

            <div className = "post_comments">
                {
                    comments.map((comment)=>(
                        <p>
                            <strong>{comment.username}</strong>{comment.text}
                        </p>
                    ))
                }
            

            <form>
                <input
                className="comment_input"
                type="text"
                placeholder="Add a coment..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                />
                <button
                disabled={!comment}
                className = "comment_submit"
                type="submit"
                onClick={postComment}/>
            </form>
            
            </div>
        </div>
    )
}

