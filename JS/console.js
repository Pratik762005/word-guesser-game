import { dailyLifeWords } from './word_store.js';


let game_content = document.querySelector("#game_content");
let start = document.querySelector("#button");
let levels = document.querySelector("#levels");

start.addEventListener("click", () => {
    if (levels.value === "Easy" || levels.value === "Hard") {
        const intro = game_content.querySelector(".game-card__intro");
        if (intro) intro.remove();
        start_game();
    }
});

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
    game_content.append(btn);
    btn.innerHTML=`<img src="ICONS/icon1.png" alt="image"><p>Hints</p>`;
    hint_call(random_word.toLowerCase(),btn);
    main_function(random_word.toLowerCase());
}



function getFallbackWord() {
    const letters = Object.keys(dailyLifeWords);
    const randomLetter = letters[Math.floor(Math.random() * letters.length)];
    const words = dailyLifeWords[randomLetter];
    return words[Math.floor(Math.random() * words.length)].toLowerCase();
}

async function isValidDictionaryWord(word) {
    try {
        const res = await fetch(
            `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`
        );
        if (!res.ok) {
            return false;
        }
        const data = await res.json();
        return Array.isArray(data) && data[0];
    } catch {
        return false;
    }
}

async function random_word_call(){
    const url = "https://random-word-api.herokuapp.com/word?number=1";
    let word = null;

    try {
        for (let attempt = 0; attempt < 3; attempt++) {
            const response = await fetch(url);
            if (!response.ok) {
                continue;
            }
            const data = await response.json();
            const candidate = Array.isArray(data) && data[0] ? data[0].toLowerCase() : null;
            if (candidate && await isValidDictionaryWord(candidate)) {
                word = candidate;
                break;
            }
        }
    } catch (error) {
        console.log("random word API request failed", error);
    }

    if (!word) {
        console.log("using fallback local word because no valid dictionary word was found");
        word = getFallbackWord();
    }

    const btn = document.createElement("button");
    btn.setAttribute("id","hints");
    game_content.append(btn);
    btn.innerHTML=`<img src="ICONS/icon1.png" alt="image"><p>Hints</p>`;
    hint_call(word, btn);
    main_function(word);
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






function escapeHintHtml(str) {
    if (str == null || str === "") return "";
    const el = document.createElement("div");
    el.textContent = String(str);
    return el.innerHTML;
}

function getPrimaryDefinition(entry) {
    const meanings = entry?.meanings;
    if (!Array.isArray(meanings)) return null;
    for (const m of meanings) {
        const defs = m.definitions;
        if (!Array.isArray(defs)) continue;
        for (const d of defs) {
            const text = d?.definition;
            if (text && String(text).trim()) return String(text).trim();
        }
    }
    return null;
}

/** Collects synonyms or antonyms from meaning-level and definition-level arrays (dictionaryapi.dev). */
function collectFromEntry(entry, field) {
    const out = [];
    const meanings = entry?.meanings;
    if (!Array.isArray(meanings)) return out;
    for (const m of meanings) {
        if (Array.isArray(m[field])) {
            for (const t of m[field]) {
                if (t) out.push(String(t).trim());
            }
        }
        const defs = m.definitions;
        if (!Array.isArray(defs)) continue;
        for (const d of defs) {
            if (Array.isArray(d[field])) {
                for (const t of d[field]) {
                    if (t) out.push(String(t).trim());
                }
            }
        }
    }
    return [...new Set(out.filter(Boolean))];
}

async function hint_call(word, btn) {
    try {
        const res = await fetch(
            `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`
        );
        if (!res.ok) {
            console.log("dictionary API error", res.status, word);
            return;
        }
        const data = await res.json();
        if (!Array.isArray(data) || !data[0]) {
            console.log("no dictionary entry", word);
            return;
        }
        const entry = data[0];
        const defText = getPrimaryDefinition(entry);
        const synonyms = collectFromEntry(entry, "synonyms");
        const antonyms = collectFromEntry(entry, "antonyms");

        let counter6 = 0;
        btn.addEventListener("click", () => {
            if (counter6 !== 0) return;
            counter6++;

            const blocks = [];

            if (defText) {
                const definition = document.createElement("div");
                definition.id = "definition";
                definition.innerHTML = `<span>Definition</span> ${escapeHintHtml(defText)}`;
                blocks.push(definition);
            }

            if (synonyms.length) {
                const synEl = document.createElement("div");
                synEl.id = "synonyms";
                synEl.innerHTML = `<span>Synonyms</span> ${synonyms.map(escapeHintHtml).join(", ")}`;
                blocks.push(synEl);
            }

            if (antonyms.length) {
                const antEl = document.createElement("div");
                antEl.id = "antonyms";
                antEl.innerHTML = `<span>Antonyms</span> ${antonyms.map(escapeHintHtml).join(", ")}`;
                blocks.push(antEl);
            }

            if (!blocks.length) {
                const fallback = document.createElement("div");
                fallback.id = "definition";
                fallback.innerHTML =
                    "<span>Hints</span> No definition, synonyms, or antonyms were found for this word.";
                blocks.push(fallback);
            }

            let anchor = btn;
            for (const el of blocks) {
                anchor.after(el);
                anchor = el;
            }
        });
    } catch (error) {
        console.log("word meaning not found", error);
    }
}




function wireLetterRow(option_container) {
    const inputs = [...option_container.querySelectorAll(".option")];
    inputs.forEach((input, i) => {
        input.autocomplete = "off";
        input.spellcheck = false;
        input.addEventListener("input", () => {
            let v = input.value;
            if (v.length > 1) {
                v = v.slice(-1);
                input.value = v;
            }
            if (v.length === 1 && i < inputs.length - 1) {
                inputs[i + 1].focus();
            }
        });
        input.addEventListener("keydown", (e) => {
            if (e.key === "Backspace" && input.value === "" && i > 0) {
                e.preventDefault();
                const prev = inputs[i - 1];
                prev.focus();
                prev.value = "";
            }
            if (e.key === "ArrowLeft" && i > 0) {
                e.preventDefault();
                inputs[i - 1].focus();
            }
            if (e.key === "ArrowRight" && i < inputs.length - 1) {
                e.preventDefault();
                inputs[i + 1].focus();
            }
        });
    });
    inputs[0]?.focus();
}

function add_main_div(word){
    let option_container=document.createElement("div");
    game_content.append(option_container);
    option_container.classList.add("option_container");
    
    for(let i=0;i<(word.length);i++){
      let  option=document.createElement("input");
      option.type="text";
      option.maxLength="1";
      option.classList.add("option");
      option_container.append(option);
    }
    wireLetterRow(option_container);
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

    game_content.innerHTML=` <img src="ICONS/icon2.png" alt="winning image" id="winning_img">
                    <p id="winning_motivation">"Every word you guess sharpens your mind and brings you closer to victory! Stay curious, think smart, and let your vocabulary shine. Keep guessing, keep learning, and let every correct word be a step toward mastery!" </p>
         <button id="next_button">Next</button>`
         let next_button=document.querySelector("#next_button");
         next_button.addEventListener("click",()=>{
            remove_win_loss_page(next_button);
            start_game();
        });
}


function load_loss(word){
    
    game_content.innerHTML=` <img src="ICONS/icon3.png" alt="lossing image" id="lossing_img">
                    <p id="lossing_motivation">"Every wrong guess is a step toward the right one! Keep playing, keep learning, and soon, the words will fall into place. The real victory is in never giving up!" </p>
                    <div id="answer"><p>${word}</p></div>
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
    let image=game_content.querySelector("img");
    let ptag=game_content.querySelector("p");
    if (image) image.remove();
    if (ptag) ptag.remove();
    button.remove();
}

