import React,{useState,useEffect} from "react";
import Loader from './Loader';
import AceEditor from 'react-ace';
import 'ace-builds/src-noconflict/mode-javascript';
import 'ace-builds/src-noconflict/theme-monokai'; 
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
import { showErrorCard } from "../App";



export default function Dashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user,setUser] = useState(null);
  const [addModuleDis,setAddModuleDis] = useState(false)
  const [codeList,setCodeList] = useState([]);
  const [filterdCodeList,setFilteredCodeList] = useState([]);
  const [selectedCode,setSelectedCode] = useState('')
  const [delPopUp,setDelPopUp] = useState(false);
  const [editEnable,setEditEnable] = useState(false);

  const handleSearch = (val)=>{
    let newCodeList = codeList.filter(f => f.title.toLowerCase().includes(val.toLowerCase()));
    setFilteredCodeList(newCodeList);
    if(newCodeList.length==1){
      setSelectedCode(newCodeList[0]);
    }
    console.log(filterdCodeList)
  }

  const changeName = (id,title,code,event)=>{
    let newName = event.target.parentNode.parentNode.querySelector('.disName').innerText;
    updateName(id,newName);
    setEditEnable(false);


  }
  const handleNameEdit = (id,title,code)=>{
    // alert(title)
    setEditEnable(true)
    setSelectedCode({
      title,id,code
    })
  }

  useEffect(() => {
    // Simulate an API call or data loading delay
    setTimeout(() => {
      setLoading(false);
    }, 4000); // Loading for 2 seconds

  }, []);
    const handleKeyPress = (event)=>{
        if ((event.ctrlKey || event.metaKey) && event.key === 's') {
            event.preventDefault();
            updateCode(selectedCode.id)
          }
    }
    
    const addCode = async (e) => {
        let newTitle = e.target.title.value;
        let newCode = e.target.code.value;
        e.target.reset();
        try {
          e.preventDefault();
          if (newTitle.trim() == "") return;
          const docRef = await addDoc(collection(firestore, "snippets"), {
            title: newTitle,
            code:newCode,
            email: user.email,
            createdAt: serverTimestamp(),
          });
          showErrorCard('Code Added Successfully','success');
          e.target.reset();
          setTimeout(window.location.reload(),1000)
          
        } catch (error) {
          console.error("Error adding document:", error);
        }
      };

     

      const handleDelete = async (documentId) => {
      try {
        await deleteDoc(doc(firestore, "snippets", documentId));
        console.log("Document deleted successfully");
        showErrorCard('Code Deleted Successfully','success')
        setSelectedCode({
            title:"",
            id:"",
            code:""
        })
        fetchData();
        setDelPopUp(false)
      } catch (error) {
        console.error("Error deleting document:", error);
      }
    };

    function copyCode(){
        navigator.clipboard.writeText(selectedCode.code);
        showErrorCard("Copy Code Successfull",'success');
    }


    const handleEditorChange = (newValue) => {
        setSelectedCode(prev=>({
          ...prev,
          code:newValue
        }))
        console.log(codeList)
      };
    const handleLogout = async () => {
        try {
          await signOut(auth);
          navigate("/");
        } catch (error) {
          console.error("Error logging out:", error);
        }
      };
      const fetchData = async () => {
        try {
          const q = query(
            collection(firestore, "snippets"),
            where("email", "==", user.email),
            orderBy("createdAt", "desc")
          );
          const querySnapshot = await getDocs(q);
          const fetchedData = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setCodeList(fetchedData);
          setFilteredCodeList(fetchedData);
          setSelectedCode(fetchedData[0])
        } catch (error) {
          console.error("Error fetching data:", error);
        }
      };

      useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
          setUser(user);
        //   if(user){
        //     if(user.photoURL != null) setImage(user.photoURL);
        //   } 
    
          // Fetch and set the items from your database
          if (user) {
            const fetchData = async () => {
              try {
                const q = query(
                  collection(firestore, "snippets"),
                  where("email", "==", user.email),
                  orderBy("createdAt", "desc")
                );
                const querySnapshot = await getDocs(q);
                const fetchedData = querySnapshot.docs.map((doc) => ({
                  id: doc.id,
                  ...doc.data(),
                }));
                setCodeList(fetchedData);
                setSelectedCode(fetchedData[0])
                setFilteredCodeList(fetchedData);

              } catch (error) {
                console.error("Error fetching data:", error);
              }
            };
            fetchData();
          }
        });
    
        return () => unsubscribe();
      }, []);


      const updateName = async (docId,newName) => {
        const documentRef = doc(firestore, "snippets", docId);  
        try {
          await updateDoc(documentRef, {
            title: newName
          });
        showErrorCard('Name Updated Successfully','success')

          console.log("Document successfully updated!", documentRef);
        } catch (error) {
          console.error("Error updating document:", error);
        }
        // fetchData();
      };
      const updateCode = async (docId) => {
        const documentRef = doc(firestore, "snippets", docId);  
        try {
          await updateDoc(documentRef, {
            code: selectedCode.code
          });
        showErrorCard('Code Updated Successfully','success')

          console.log("Document successfully updated!", documentRef);
        } catch (error) {
          console.error("Error updating document:", error);
        }
        fetchData();
      };

      if(!user) return(
        <>
            {loading ? <Loader /> :   <div className="loggedInText">
            <div>You are not logged in</div>
            <a href="/">Login</a>
        </div>}    
        </>
    
      )
  return (
    <div className="mainCont"  onKeyDown={(e)=>handleKeyPress(e)}>
       
      <div className="snippetsCont">
        <div className="searchCont">
          <input type="text"  onInput={(e)=>handleSearch(e.target.value)} />
          <i class="fa-solid fa-magnifying-glass"></i>
        </div>
        <div className="snippets">
            {filterdCodeList.map((e)=>{
                return(
                    <div className={e.id==selectedCode.id?"snipCont selected":"snipCont"}>
<div className="snip" id={e.id} onClick={()=>setSelectedCode(e)}>
                        <div><i className="fa-solid fa-code" ></i> </div>
                        <div className="disName" contentEditable={e.id == selectedCode.id && editEnable}>{e.title.slice(0,40)}</div>

                    </div>
                       {e.id == selectedCode.id && editEnable?<div><i className="fa-solid fa-floppy-disk" onClick={(event)=>changeName(e.id,e.title,e.code,event)} ></i> </div>:<div><i className="fa-solid fa-pen" onClick={()=>handleNameEdit(e.id,e.title,e.code)} ></i></div>}
                        


                        {/* <div><i className={e.id == selectedCode.id && editEnable?"fa-solid fa-floppy-disk":"fa-solid fa-pen"} onClick={()=>handleNameEdit(e.id,e.title,e.code)} ></i> </div> */}
                    </div>
                    
                )
            })}
        </div>
      </div>
      <div className="codeEditorCont">
      <i class="fa-solid fa-power-off logOutBtn" onClick={handleLogout}></i>
      <i class="fa-solid fa-trash deleteBtn" onClick={()=>setDelPopUp(true)}></i>
        <i class="fa-solid fa-floppy-disk updateBtn" onClick={()=>updateCode(selectedCode.id)}></i>
        <i class="fa-solid fa-copy copyBtn" onClick={copyCode}></i>
  <i style={addModuleDis?{transform:'rotate(225deg)'}:{transform:'rotate(0deg)'}} className="fa-solid fa-circle-plus addModuleBtn" onClick={()=>setAddModuleDis(!addModuleDis)}></i>

      <AceEditor
      mode="javascript" // Set the mode for syntax highlighting
      theme="monokai" // Set the theme
      onChange={handleEditorChange} // Handle code changes
      name="code-editor"
      editorProps={{ $blockScrolling: true }}
      height="80%" // Set the desired height
      width="98%" // Set the desired width
      value={selectedCode.code}
      fontSize="1em"
    />
      </div>

      <div className='addCodeCont' style={addModuleDis?{width:'75%'}:{width:'0%'}}>
          <form onSubmit={(e)=>addCode(e)}>
            <input name='title' type="text" placeholder="Enter the title" required/>
            <br />
            <textarea name='code' placeholder="Enter the Code" required></textarea>
            <button>Add Code</button>
          </form>
     </div>

     <div className="prompt" style={delPopUp?{transform:'scale(1)'}:{transform:'scale(0)'}}>
        <div className="card">
            <div className="text">Delete {selectedCode.title} ?</div>
            <div className="buttonCont"> <button onClick={()=>handleDelete(selectedCode.id)}>YES</button>
            <button onClick={()=>setDelPopUp(false)}>NO</button></div>
           
        </div>
     </div>
    </div>
  );
}
