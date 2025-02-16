import { dailyLifeWords } from './word_store.js';


let start=document.querySelector("#button");
let h3=document.querySelectorAll("h3");
let p=document.querySelector("p");
let ol=document.querySelector("ol");
let levels=document.querySelector("#levels");
let main_container=document.querySelector("#main_container");


start.addEventListener('click',()=>{

    if(levels.value==="Easy"||levels.value==="Hard"){

        h3[0].remove();
        h3[1].remove();
        p.remove();
        ol.remove();
        start.remove();
                 start_game();   

    }
    
})

function start_game(){
            if(levels.value==="Easy"){
                easy_word();
              
            }
            else if(levels.value==="Hard"){
                random_word_call();
            }
            else{
                console.log("please select the level");
            }
}

function easy_word(){
    let num=Math.floor(Math.random()*26);
   let random_number=String.fromCharCode(97 + num);
    let random_word=dailyLifeWords[random_number][Math.floor(Math.random()*30)];

    let btn=document.createElement("button");
    btn.setAttribute("id","hints");
    main_container.append(btn);
    btn.innerHTML=`<img src="icon1.png" alt="image"><p>Hints</p>`;
    hint_call(random_word.toLowerCase(),btn);
    main_function(random_word.toLowerCase());
}



async function random_word_call(){
    try{
        let url="https://random-word-form.herokuapp.com/random/noun"
        let promise_data=await fetch(url);
        let data=await promise_data.json();
        let btn=document.createElement("button");
        btn.setAttribute("id","hints");
        main_container.append(btn);
        btn.innerHTML=`<img src="icon1.png" alt="image"><p>Hints</p>`;
        hint_call(data[0].toLowerCase(),btn);
 
       main_function(data[0].toLowerCase());

    }
    catch(error){
        console.log("api failed to load data",error);
    }
}

let keydownHandler; 
function main_function(main_word) {
    let new_value = main_word;
    add_main_div(new_value);
    let counter1 = 0;

    keydownHandler = function (evt) {
        if (evt.key === "Enter") {
            if (feeling_checker(counter1)) {
                disable_input(counter1);
                if (!alph_checker(new_value)) {
                    if (counter1 < 6) {
                        add_main_div(new_value);
                        counter1++;
                    } else {
                        document.removeEventListener("keydown", keydownHandler);
                        load_loss(new_value);
                    }
                } else {
                    document.removeEventListener("keydown", keydownHandler);
                    setTimeout(load_win, 2000);
                }
            }
        }
    };
    document.addEventListener("keydown", keydownHandler);
}






async function hint_call(word,btn){
    try{
        let promise_data=await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);

        let data=await promise_data.json();

        let counter6=0;

    btn.addEventListener('click',()=>{
                if(counter6==0){
                        let definition=document.createElement("div");
                        let antonyms=document.createElement("div");
                        definition.setAttribute('id',"definition");
                        definition.innerHTML=`<span> Definition:-</span> ${data[0].meanings[0].definitions[0].definition}`
                        antonyms.setAttribute('id',"antonyms");
                        antonyms.innerHTML=`<span> Antonyms:-</span>${data[0].meanings[0].definitions[0].antonyms}`;
                        btn.after(definition);
                        definition.after(antonyms);
                }
            counter6++;

    })
    }
   catch(error){
        console.log("word meaning not found",error)
   }
}




function add_main_div(word){
    let option_container=document.createElement("div");
    main_container.append(option_container);
    option_container.classList.add("option_container");
    
    for(let i=0;i<(word.length);i++){
      let  option=document.createElement("input");
      option.type="text";
      option.maxLength="1";
      option.classList.add("option");
      option_container.append(option);
    }
}

function feeling_checker(counter){
    let option_container=document.querySelectorAll(".option_container");
    let option=option_container[counter].querySelectorAll(".option");
        for(let i=0;i<option.length;i++){
            if(["0","1", "2", "3","4","5","6","7","8","9",""].includes(option[i].value)){
                return false;
            }
        }
        return true;
}

function disable_input(counter){
    let option_container=document.querySelectorAll(".option_container");
    let option=option_container[counter].querySelectorAll(".option");
        for(let i=0;i<option.length;i++){
            option[i].disabled=true;
        }
}


function alph_checker(word){
    let option_container=document.querySelectorAll(".option_container");
    let option=option_container[option_container.length-1].querySelectorAll(".option");
    let include=document.createElement("div");
    let correct=document.createElement("div");
    include.classList.add("include");
    correct.classList.add("correct");
    option[option.length-1].after(include);
    include.after(correct);
    let counter4= 0;
    let counter5= 0;
    let wordFreq = {}; 
    for (let i = 0; i < word.length; i++) {
        if (word[i] === option[i].value) {
            counter5++; 
        } else {
            wordFreq[word[i]] = (wordFreq[word[i]] || 0) + 1;
        }
    }
    
    for (let i = 0; i < word.length; i++) {
        if (word[i] !== option[i].value && wordFreq[option[i].value]) {
            counter4++; 
            wordFreq[option[i].value]--; 
        }
    }
   
    include.innerText = `${counter4}`;
    correct.innerText = `${counter5}`;
    if(counter5===word.length){
        return true;
    }
    else{
        return false;
    }

}

function load_win(){ 

    main_container.innerHTML=` <img src="icon2.png" alt="winning image" id="winning_img">
                    <p id="winning_motivation">"Every word you guess sharpens your mind and brings you closer to victory! Stay curious, think smart, and let your vocabulary shine. Keep guessing, keep learning, and let every correct word be a step toward mastery!" </p>
         <button id="next_button">Next</button>`
         let next_button=document.querySelector("#next_button");
         next_button.addEventListener("click",()=>{
            remove_win_loss_page(next_button);
            start_game();
        });
}


function load_loss(word){
    
    main_container.innerHTML=` <img src="icon3.png" alt="lossing image" id="lossing_img">
                    <p id="lossing_motivation">"Every wrong guess is a step toward the right one! Keep playing, keep learning, and soon, the words will fall into place. The real victory is in never giving up!" </p>
                    <div  id="answer"><p>${word}</P></div>
                    <button id="next_button">Next</button>`
                    let next_button=document.querySelector("#next_button");
                    next_button.addEventListener("click",()=>{
                        let answer=document.querySelector("#answer");
                        answer.remove();
                        remove_win_loss_page(next_button);
                        start_game();
                    });
}

function remove_win_loss_page(button){
let image=document.querySelector("img");
let ptag=document.querySelector("p");
image.remove();
ptag.remove();
button.remove();

}

