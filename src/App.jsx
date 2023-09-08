import "./css/main.css"
import Router from "./components/Router";

export default function App() {
  return (
    <Router/>
  );
}

export function showErrorCard(errMessage,status){
  if(document.querySelector('.errCard')) return;
   let errCard = document.createElement('div');
   errCard.setAttribute('class',`errCard ${status}`);
   errCard.innerText = errMessage;
   document.querySelector('body').appendChild(errCard);
   setTimeout(()=>{
    document.querySelector('.errCard').remove()
   },2000)
}
