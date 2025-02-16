let data={
    username:"Pratik",
    email:"deshmukhpratik8500@gmail.com",
    password:"123456"
}



let username1=document.querySelector("#username");
let email1=document.querySelector("#email");
let password1=document.querySelector("#password");
let button=document.querySelector("#button");
let form=document.querySelector("form");

button.addEventListener('click',()=>{
   
login();
})





function login(){
  
if(check_username()==true){
    if(check_email()==true){
        if(check_password()==true){
            form.action="/index.html";
        }
        else{
            event.preventDefault();
            let error=document.createElement("p");
            error.style.color="red";
            error.style.position="absolute";
            error.style.top="390px";
            error.style.left="100px";
            password1.after(error);
            error.innerText="password is wrong";
            setTimeout(()=>{
                error.remove();
            },3000);
           
        }
    }
    else{
        event.preventDefault();
        let error=document.createElement("p");
        error.style.color="red";
        error.style.position="absolute";
        error.style.top="390px";
        error.style.left="100px";
        password1.after(error);
        error.innerText="email is wrong";
        setTimeout(()=>{
            error.remove();
        },3000);
       
    }
}
else{  
    event.preventDefault();
    let error=document.createElement("p");
    error.style.color="red";
    error.style.position="absolute";
    error.style.top="390px";
    error.style.left="100px";
    password1.after(error);
    error.innerText="username is wrong";
    setTimeout(()=>{
        error.remove();
    },3000);
   
}

}

function check_username(){
    if(data.username===username1.value){
    return true;
    }
    return false
}
function check_email(){
    if(data.email===email1.value){
    return true ;
    } 
    return false
}
function check_password(){
    if(data.password===password1.value){
    return true;
    }
    return false;
}