"use strict";

window.onload = init;

const POKE_URL = "https://pokeapi.co/api/v2/pokemon/"
const EVO_URL = "https://pokeapi.co/api/v2/evolution-chain/"

let answerElement = "";
let evoChain;

function init() {
    //Obtain the answer field
    let answerField = document.querySelector("input");
    let answerKey = "ash7811-guessAnswer"

    //Grab the answer from local storage using the key
    const storedAnswer = localStorage.getItem(answerKey);

    //If we found an answer, put it into the input field preemptively
    if (storedAnswer) {
        answerField.value = storedAnswer;
    }

    //Get the correct answer.
    generateCorrectAnswer();

    //Replace the answer in the storage when it's changed.
    answerField.onchange = e => { localStorage.setItem(answerKey, e.target.value); }

    answerField.onkeydown = e => {
        if (e.key == "Enter") {
            document.querySelector("#correctAnswer").innerHTML = answerElement;
        }
    }
};

function generateCorrectAnswer(){
    //Generate a random pokemon ID from 1 to 809 (Generation 1 to 7) 
    let correctID = Math.ceil(Math.random() * 809)

    let url = POKE_URL + correctID.toString();

    getData(url, loadPokemon);

}

function getData(url, dataLoaded) {
    //Create the XHR object to grab the data.
    let xhr = new XMLHttpRequest();
    
    //Do these functions if load works.
    xhr.onload = dataLoaded;

    //Do this function if an error occurs.
    xhr.onerror = dataError;

    xhr.open("GET", url);
    xhr.send();
}

function loadPokemon(e) {
    //Simplify calling the target with this reference
    let xhr = e.target;

    //Log out the JSON.
    console.log(xhr.responseText);

    //Create the pokemon object JSON.
    let correctMon = JSON.parse(xhr.responseText)

    //Obtain the link to the sprite.
    let spriteLink = correctMon.sprites.front_default;

    //Create an image element with the link.
    let spriteElementString = `<img src='${spriteLink}' alt='Correct mon sprite'>`;
    answerElement += spriteElementString;

    //Create the pokemon type string.
    let monType = typeFormat(correctMon.types);

    //Obtain the pokemon's generation from the ID.
    let monGen = generationParse(correctMon.id);

    let monAbilities = correctMon.abilities;

    //let evoStatus = evoComparison();

    //Create the string
    let firstHintString = `I am a ${monType}-type pok&eacute;mon from Generation ${monGen}.<br \>My first ability is ${abilityFormat(monAbilities[0].ability.name)}.<br \>Which pok&eacute;mon am I?`
    document.querySelector("#firstHint").innerHTML = firstHintString;
}

function dataError(e) {
    console.log("An error occurred");
}

//Formats the mon's types into a string and capitalizes them.
function typeFormat(typeList) {
    let typeString
    if (typeList.length == 1) {
        typeString = typeList[0].type.name;
        typeString = typeString.charAt(0).toUpperCase() + typeString.slice(1);
    }
    else {
        let firstType = typeList[0].type.name;
        let secondType = typeList[1].type.name;
        firstType = firstType.charAt(0).toUpperCase() + firstType.slice(1);
        secondType = secondType.charAt(0).toUpperCase() + secondType.slice(1);
        typeString = firstType + "/" + secondType;
    }
    return typeString;
}

//Returns the generation this mon is native to based on the ID, which is the national Pokedex number.
function generationParse(id) {
    if (id <= 151) {
        return 1;
    }
    else if (id > 151 && id <= 251) {
        return 2;
    }
    else if (id > 251 && id <= 386) {
        return 3;
    }
    else if (id > 386 && id <= 493) {
        return 4;
    }
    else if (id > 493 && id <= 649) {
        return 5;
    }
    else if (id > 649 && id <= 721) {
        return 6;
    }
    else {
        //The application only goes up to gen 7, so this is the upper limit.
        return 7;
    }
}

//Formats the ability to be more formal.
function abilityFormat(ability) {
    return capitalizeFirstLetter(ability.replace(/-/g, " "));
}

//Capitalizes the first letter in a passed string.
function capitalizeFirstLetter(string) {
    //Multi-word strings have a complicated approach.
    if (string.includes(" ")) {

        //Split the string into an array of its words.
        let wordArray = string.split(" ");
        string = "";

        //Loop through each word, format it, and add it to the string.
        for (let i = 0; i < wordArray.length; i++) {
            let word = wordArray[i].charAt(0).toUpperCase() + wordArray[i].slice(1);
            string += word;

            //Add a space if this isn't the final word.
            if (i < wordArray.length - 1) {
                string += " ";
            }
        }
        return string;
    }
    else {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }
}

/*function processEvo(id) {
    let url = EVO_URL + id;

    getData(url, loadEvolutionChain);
}

function loadEvolutionChain(e) {
    let xhr = e.target; 

    console.log(xhr.responseText);

    evoChain = JSON.parse(xhr.responseText);
}

function evoComparison(monName) {

}*/