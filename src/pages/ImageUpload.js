import React, {useState} from 'react'
import {storage, db, auth} from "../firebase.js"
import firebase from 'firebase'

import {Button} from 'react-native'
function ImageUpload({username}) {
    const [caption, setCaption] = useState('');
    const[image, setImage] = useState(null);
    const[progress, setProgress] = useState(0);

    const handleChange = (e) => {
        if(e.target.files[0]) {
            setImage(e.target.files[0]);
        }
    }

    const handleUpload = () => {
        if(image != null){
        const uploadTask = storage.ref(`images/${image.name}`).put(image);
        
        uploadTask.on(
            "state_changed",
            (snapshot) => {
                const progress = Math.round(
                    (snapshot.bytesTransferred /snapshot.totalBytes) *100
                );
                setProgress(progress);
            },
            (error) => {
                console.log(error);
                alert(error.message);
            },
            () => {
                storage
                    .ref("images")
                    .child(image.name)
                    .getDownloadURL()
                    .then(url => {
                        db.collection("posts").add({
                            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                            caption: caption,
                            imageUrl: url,
                            username: username,
                            uid: auth.currentUser.uid

                        });

                        setCaption("");
                        setImage(null);
                    });
            }
        );
        }
    };

    return (
        <div>
            <progress value={progress} max="100" />
            <input type="text" placeholder='Enter a caption' onChange={event => setCaption(event.target.value)} value ={caption}/>
            <input type="file" onChange={handleChange} />
            <button onClick={handleUpload}>Upload
            </button>

        </div>
    )
}

export default ImageUpload