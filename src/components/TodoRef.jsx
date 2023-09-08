import React, { useState, useEffect } from "react";
import AnalogClock from "./Analog.jsx";
import Clock from "./Clock.jsx";
import userImg from '../images/user.png'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTrash,
  faPlusCircle,
  faCheck,
  faSquareCheck,
  faSquare,
  faCircle,
} from "@fortawesome/free-solid-svg-icons";
import "@fortawesome/fontawesome-free/css/all.min.css";
// import { getAuth,signInWithEmailAndPassword} from 'firebase/auth';
import { auth, firestore, storage } from "./Firebase";
import { useNavigate } from "react-router-dom";
import { signOut, updateProfile } from "firebase/auth";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

import {
  getFirestore,
  collection,
  onSnapshot,
  addDoc,
  deleteDoc,
  updateDoc,
  doc,
  query,
  where,
  orderBy,
  serverTimestamp,
  getDocs,
} from "firebase/firestore";
import Login from "./Login.jsx";

function Todo() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [todoList, setTodoList] = useState([]);
  const [image, setImage] = useState(userImg);

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];

    if (file) {
      const storageRef = ref(storage, "images/" + file.name);

      try {
        await uploadBytes(storageRef, file);
        console.log("Image uploaded successfully");

        // Save image URL to Firestore if needed
        const imageUrl = await getDownloadURL(storageRef);
        await addDoc(collection(firestore, "images"), {
          url: imageUrl,
          // Other fields if needed
        });
        setImage(imageUrl);
        console.log(user);
        await updateProfile(auth.currentUser, {
          photoURL: imageUrl,
        });
      } catch (error) {
        console.error("Error uploading image:", error);
      }
    }
  };
  const handleLogout = async () => {
    try {
      await signOut(auth);
      // You can also redirect the user to a different page after logout if needed
      // navigate("/login");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const changeStatus = async (docId, currStatus) => {
    const documentRef = doc(firestore, "todo", docId);
    const newStatus = currStatus == "complete" ? "incomplete" : "complete";
    const updatedItems = todoList.map(item => {
      if (item.id === docId) {
        return { ...item, status: newStatus };
      }
      return item;
    });
    setTodoList(updatedItems);
  
    try {
      await updateDoc(documentRef, {
        status: newStatus
      });
      console.log("Document successfully updated!", documentRef);
    } catch (error) {
      console.error("Error updating document:", error);
    }
    fetchData();
  };

  const fetchData = async () => {
    try {
      const q = query(
        collection(firestore, "todo"),
        where("email", "==", user.email),
        orderBy("createdAt", "desc")
      );
      const querySnapshot = await getDocs(q);
      const fetchedData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setTodoList(fetchedData);
      console.log(todoList);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      if(user){
        if(user.photoURL != null) setImage(user.photoURL);
      } 

      // Fetch and set the items from your database
      if (user) {
        const fetchData = async () => {
          try {
            const q = query(
              collection(firestore, "todo"),
              where("email", "==", user.email),
              orderBy("createdAt", "desc")
            );
            const querySnapshot = await getDocs(q);
            const fetchedData = querySnapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }));
            setTodoList(fetchedData);
            console.log(todoList);
          } catch (error) {
            console.error("Error fetching data:", error);
          }
        };
        fetchData();
      }
    });

    return () => unsubscribe();
  }, []);
  const addDocument = async (e) => {
    let newTodo = e.target.todoVal.value;
    e.target.reset();
    try {
      e.preventDefault();
      if (newTodo.trim() == "") return;
      const docRef = await addDoc(collection(firestore, "todo"), {
        todo: newTodo,
        email: user.email,
        createdAt: serverTimestamp(),
        status: "incomplete",
      });
      fetchData();
      e.target.reset();
    } catch (error) {
      console.error("Error adding document:", error);
    }
  };
  const deleteDocument = async (documentId, e) => {
      let newTodoList = todoList.filter(f=> f.id!==documentId)
    setTodoList(newTodoList);
    try {
      await deleteDoc(doc(firestore, "todo", documentId));
      console.log("Document deleted successfully");
      fetchData();
    } catch (error) {
      console.error("Error deleting document:", error);
    }
  };

  if (!user) {
    return (
      // <div className="plsLogin">
      // <div>You are not logged in please login first</div>
      // <div className="loginBtn"><a href="/login">Login</a></div>
      // </div>
      <Login />
    );
  }

  return (
    <div className="mainCont">
      <div className="left">
        <div className="userDetails">
          <div className="userImgDiv">
            <img src={image} />
            <label for="file-input">
            <FontAwesomeIcon icon={faPlusCircle} />
            </label>
          </div>
          <div className="userName">{user.displayName}</div>
          <div className="userEmail">{user.email}</div>
  
            <input
              id="file-input"
              type="file"
              className="uploadUserImg"
              onChange={handleImageUpload}
            />
          <div onClick={handleLogout} className="logoutBtn">
            Log out
          </div>
        </div>

        <Clock />
        {/* <AnalogClock /> */}
      </div>
      <div className="right">
        <form action="" className="addForm" onSubmit={(e) => addDocument(e)}>
          <input type="text" name="todoVal" required placeholder="Add Task" />
          <button className="addBtn">
            {" "}
            <FontAwesomeIcon icon={faPlusCircle} />
          </button>
        </form>
        <div className="todoHead">Task To Do</div>
        <div className="todoCont">
          {todoList.map((data, i) => {
            return (
              <div key={i} className="flex todo">
                <div key={i}>
                  <span
                    className="tickIcon"
                    onClick={(e) => changeStatus(data.id, data.status)}
                  >
                    {data.status == "complete" ? (
                      <FontAwesomeIcon
                        icon={faSquareCheck}
                        size="lg"
                        style={{ color: "#06e549" }}
                      />
                    ) : (
                      <FontAwesomeIcon
                        icon={faSquare}
                        style={{ color: "whiteSmoke" }}
                        size="lg"
                      />
                    )}
                  </span>
                  <span className={data.status}>{data.todo}</span>
                </div>
                <i onClick={(e) => deleteDocument(data.id, e)}>
                  <FontAwesomeIcon icon={faTrash} />
                </i>
              </div>
            );
          })}
        </div>
      </div>

      {/* <FontAwesomeIcon icon={faCircle} /> */}
    </div>
  );
}

export default Todo;
