import React from 'react'
import todoBack from "../images/todoBack.png";
import { getAuth, createUserWithEmailAndPassword,updateProfile} from 'firebase/auth';
import { auth} from "./Firebase"
import { useNavigate } from 'react-router-dom';

function Signup() {
    const navigate = useNavigate();
    const handleSignup = async (e) => {
        e.preventDefault();
        try {
            const email = e.target.email.value;
            const password = e.target.password.value;
            const name = e.target.name.value;
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            updateProfile(user,{
                displayName:name
               })
            console.log('User created as:', user);
            navigate('/');
        } catch (error) {
          console.error('Error signing up:', error.message);
        }
    }
  return (
    <div className="loginCont">
    <div className="loginLeft">
      <img src={todoBack} />
    </div>
    <form className="loginRight" onSubmit={(e)=>handleSignup(e)}>
      <div className="appName">
         TodoTrac
      </div>
      <div class="input-field">
        <i class="fas fa-user" aria-hidden="true"></i>
        <input type="text" placeholder="Name" name="name" required/>
      </div>
      <div class="input-field">
        <i class="fas fa-envelope" aria-hidden="true"></i>
        <input type="email" placeholder="Email" name="email" required/>
      </div>
      <div class="input-field">
        <i class="fas fa-lock" aria-hidden="true"></i>
        <input type="password" placeholder="Password" name="password" required/>
      </div>
      <button className="loginBtn">Sign up</button>
      <div className="signupTag">Already have an account? <a href="/">Login</a></div>
    </form>
  </div>
  )
}

export default Signup