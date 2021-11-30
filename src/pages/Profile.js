import React, { useState, useEffect } from 'react';
import ProfileInput from './ProfileInput.js';
import UserModal from './Modal.js';

// firebase imports
import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/storage';
import 'firebase/firestore';

// react bootstrap imports
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button'
import Image from 'react-bootstrap/Image'
import OverlayTrigger from 'react-bootstrap/OverlayTrigger'
import Tooltip from 'react-bootstrap/Tooltip'
import InputGroup from 'react-bootstrap/InputGroup';
import FormControl from 'react-bootstrap/FormControl';
import Card from 'react-bootstrap/Card';

const DEFAULT_PICTURE = "https://firebasestorage.googleapis.com/v0/b/lproject-1bc54.appspot.com/o/images%2Fprofile_pictures%2Fdefault_picture.png?alt=media&token=71541b82-6264-46e8-b3c0-4e4c038a61ba"

const DATA_FIELDS = ["mile", "squat", "bench", "deadlift", "ohp", "steps"];
const MAP_NAME = "userData";

export default function Profile(props) {
    const [uid, setUid] = useState("");
    const [imgUrl, setImgUrl] = useState("");
    const [userData, setUserData] = useState({});
    const [isUser, setIsUser] = useState(false);
    const [isFollowing, setFollowing] = useState(false);
    const [numFollowing, setNumFollowing] = useState(null);
    const [numFollowers, setNumFollowers] = useState(null);
    const [users, setUsers] = useState([]);
    const [modalStatus, setModalStatus] = useState(false);

    let storage = firebase.storage();
    let fs = firebase.firestore();
    let targetUid = props.match.params.userId;


    useEffect(() => {
        async function fetchData() {
        firebase.auth().onAuthStateChanged(function (user) {
            if (user != null) {
                setUid(user.uid);
                setIsUser(targetUid == user.uid ? true : false);

                // check if we are currently following the profile that we are on
                fs.collection("following").doc(user.uid).get().then(doc => {
                    let followingUsers = doc.data().following;
                    setFollowing(followingUsers.includes(targetUid) ? true : false);
                });

                fs.collection("following").doc(targetUid).get().then(doc => {
                    let followingUsers = doc.data().following;
                    let followers = doc.data().followers;
                    setNumFollowing(followingUsers.length);
                    setNumFollowers(followers.length);
                });

                storage.ref("images").child("profile_pictures").child(targetUid).getDownloadURL().then(url => {
                    setImgUrl(url); 
                }).catch(error => {
                    // if there doesn't exist such a file then user doens't have profile picture yet
                    setImgUrl(DEFAULT_PICTURE);
                });

                // get some userdata 
                fs.collection("users").where("userData.uid", "==", targetUid).get().then(function (querySnapshot) {
                    querySnapshot.forEach(function (doc) {
                        let data = {"uid": user.uid};
                        DATA_FIELDS.forEach(function (field) {
                            data[field] = doc.get(MAP_NAME + '.' + field);                            
                        });
                        setUserData(data);
                    });
                })

                }
            });
        }

        fetchData();
    }, []);
    
    // BEGIN FILE UPLOAD FUNCTIONS
    const hiddenFileInput = React.useRef(null);

    const handleClick = event => {
        if (!isUser)
            return;
        hiddenFileInput.current.click();
    };

    // on selection of image from the user
    const handleImageChange = (event) => {
        if (event.target.files[0]) {
	    const image = event.target.files[0];
			
	    const upload = storage.ref(`images/profile_pictures/${uid}`).put(image);
	    upload.on("state_changed",
	    (snapShot) => {
	        console.log(snapShot);
	    }, (err) => {
		console.log(err);
	    }, () => {
		storage.ref("images").child("profile_pictures").child(`${uid}`).getDownloadURL()
                .then(url => {
		    setImgUrl(url);
		})
            })
	}
    }
    // END FILE UPLOAD FUNCTIONS
    
    
    // Handle changing the input boxes
    const inputChange = (event, targetField) => {
        event.preventDefault();

        let clonedObject = {...userData};
        clonedObject[targetField] = event.target.value;
        setUserData(clonedObject);
    }

    // Save the input data to firebase
    const onSave = (event) => {
        event.preventDefault();

        const users = fs.collection("users");
        users.where("userData.uid", "==", uid).get().then(querySnapshot => {
            querySnapshot.forEach(doc => {
                users.doc(doc.id).set({ userData });
            });
        })
    }

    // follow or unfollow a user
    const changeFollow = (event) => {
        // if we are following then unfollow
        if (isFollowing) {
            fs.collection("following").doc(uid).update({
                following: firebase.firestore.FieldValue.arrayRemove(targetUid) 
            });
            setNumFollowers(numFollowers-1);
        }

        // if we are not then following them
        else {
            fs.collection("following").doc(uid).update({
                following: firebase.firestore.FieldValue.arrayUnion(targetUid)
            });
            setNumFollowers(numFollowers+1);
        }
        setFollowing(!isFollowing);
    }

    const getFollowing = () => {
        fs.collection("following").doc(targetUid).get().then(doc => {
            let followingUsers = doc.data().following;
            setUsers(followingUsers);
            setModalStatus(true);
        });
    }

    const getFollowers = () => {
        fs.collection("following").doc(targetUid).get().then(doc => {
            let followerUsers = doc.data().followers;
            setUsers(followerUsers);
            setModalStatus(true);
        });
    }

    const disableModal = () => {
        setModalStatus(false);
    }

    return (
	    <Container className="d-flex justify-content-center align-items-center min-vh-100">
                <div className="w-75 h-80">
		    <h3 className="text-center py-3">Profile</h3>
                    <Form>
		    <div className="d-flex justify-content-center">
		    <OverlayTrigger
			placement="top"
			delay={{ show: 250, hide: 400 }}
                        overlay={<Tooltip id="button-tooltip-2">{isUser ? "Click here to change profile" : null}</Tooltip>}
		    >
		        <Button variant = "" onClick = {handleClick}><Image className="w-50 h-50" src={imgUrl}/></Button>
		    </OverlayTrigger>
                    {isUser &&
		    <input
                        type={"file"}
			ref={hiddenFileInput}
                        onChange={handleImageChange}
			style={{display: 'none'}}
		    />
                    }
                    <Card onClick = {getFollowing}>
                        <Card.Title>Following</Card.Title>
                        <Card.Body>{numFollowing}</Card.Body>
                    </Card>
                    <Card onClick = {getFollowers} >
                        <Card.Title>Followers</Card.Title>
                        <Card.Body>{numFollowers}</Card.Body>
                    </Card>
                    <ProfileInput label="Mile time" placeholder="8:00" field="mile" val={userData.mile} onChange ={inputChange} readOnly = {isUser} />
                    <ProfileInput label="Squat" placeholder="135" field="squat" val={userData.squat} onChange = {inputChange} readOnly={isUser} />
                    <ProfileInput label="Bench Press" placeholder="135" field="bench" val={userData.bench} onChange = {inputChange} readOnly={isUser} />
                    <ProfileInput label="Deadlift" placeholder="135" field="deadlift" val={userData.deadlift} onChange = {inputChange} readOnly={isUser} />
                    <ProfileInput label="Overhead Press" placeholder="135" field="ohp" val={userData.ohp} onChange = {inputChange} readOnly={isUser} />
                    <ProfileInput label="Steps per day" placeholder="10000" field="steps" val={userData.steps} onChange = {inputChange} readOnly={isUser}/>

                    {!isUser &&
                    <Button variant="primary" onClick = {changeFollow} >
                        {isFollowing ? "Unfollow" : "Follow"}
                    </Button>
                    }

                    {isUser && 
                    <Button variant="primary" type="submit" onClick = {onSave} >
                        Save
                    </Button>
                    }
		    </div>
			</Form>
	        </div>
                <UserModal users={users} handleClose={disableModal} status={modalStatus} />
	    </Container>
	);
}
