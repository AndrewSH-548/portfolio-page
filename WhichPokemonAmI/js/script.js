"use strict";

window.onload = init;

const POKE_URL = "https://pokeapi.co/api/v2/pokemon/"
const EVO_URL = "https://pokeapi.co/api/v2/evolution-chain/"

let answerSection;
let answerElementList = [];
let evoChain = "";
let correctMon;

function init() {
    //Obtain the answer field
    let answerField = document.querySelector("input");
    let answerKey = "ash7811-guessAnswer"

    let hintButton = document.querySelector("#hintButton");
    let submitButton = document.querySelector("#submitButton");
    answerSection = document.querySelector("#correctAnswer")

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

    hintButton.onclick = addSecondHint;
    submitButton.onclick = submitButtonEvent;
};

function randomChainId() {
    //Generate a random evolution chain ID from 1 to 543 (the current limit) 
    let correctID = Math.ceil(Math.random() * 543)

    //Risky idea, but a return will break the loop
    while (true) {
        switch (correctID) {
            //Certain page indices are weirdly empty, so rerandomize if we get them.
            case 210:
            case 222:
            case 225:
            case 226:
            case 227:
            case 231:
            case 238:
            case 251:
                correctID = Math.ceil(Math.random() * 543);
                break;
            default:
                return correctID;
        }
    }
}

function generateCorrectAnswer(){
    let correctID = randomChainId();

    let url = EVO_URL + correctID.toString();
    //let url = EVO_URL + "68";

    getData(url, loadEvolutionChain);

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
    correctMon = JSON.parse(xhr.responseText)

    //Obtain the link to the sprite.
    let spriteLink = correctMon.sprites.front_default;

    //Create an image element with the link.
    let spriteElement = document.createElement("img");
    spriteElement.src = spriteLink;
    spriteElement.alt = 'Correct mon sprite';
    answerElementList[0] = spriteElement;

    //Create the pokemon type string.
    let monType = typeFormat(correctMon.types);

    //Obtain the pokemon's generation from the ID.
    let monGen = generationParse(correctMon.id);

    //Use the evo chain to get the evo status
    let evoStatus = getEvoStatus(evoChain, correctMon.name);

    //Create the string
    let firstHintString = `I am a ${monType}-type ${evoStatus} pok&eacute;mon from Generation ${monGen}.<br \>Which pok&eacute;mon am I?`
    document.querySelector("#firstHint").innerHTML = firstHintString;
}

//Outputs an error to the console if a JSON load fails.
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

//Formats a pokemon's name or ability to be more formal
function nameFormat(name, isSpecialException) {
    //Certain mons have special characters that will need to be removed for comparisons
    if (name.toLowerCase() == "farfetch'd") {
        name = name.replace(`'`, "");
    }
    else if (name.toLowerCase().replace(/-/g, " ") == "zygarde 10%" || name.toLowerCase().replace(/-/g, " ") == "zygarde 50%") {
        name = name.replace("%", "");
    }
    else if (name.toLowerCase() == "mime jr." || name.toLowerCase() == "mr. mime" || name.toLowerCase() == "mr. rime") {
        name = name.replace(".", "");
    }

    //Certain mon names have natural hyphens to not replace. They'll be intact when passed into the function.
    if (isSpecialException) {
        return handleAltForms(capitalizeFirstLetter(name));
    }
    return handleAltForms(capitalizeFirstLetter(name.replace(/-/g, " ")));
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

//Loads the selected evolution chain
function loadEvolutionChain(e) {
    let xhr = e.target; 

    //Log out the loaded JSON.
    console.log(xhr.responseText);

    //Create the evolution chain JSON
    evoChain = JSON.parse(xhr.responseText);

    //Create an array to hold all the stages.
    let chainArray = [];

    //Start at the chain base by creating a dynamic code block reference.
    let currentBlock = evoChain.chain;

    //Loop until the block can't go deeper into the chain.
    while (currentBlock.evolves_to){
        //Add the stage of the chain into the array. 
        chainArray.push(currentBlock.species);
        currentBlock = currentBlock.evolves_to;
        //To account for branched evolutions, select randomly from the evolves_to array if it has more than 1 item.
        if (currentBlock.length > 1){
            currentBlock = currentBlock[Math.floor(Math.random() * currentBlock.length)];
        }
        else if (!currentBlock[0]){
            break;
        }
        else {
            currentBlock = currentBlock[0];
        }
    }
    //Choose randomly from the array to get our chosen mon.
    let monChoice = chainArray[Math.floor(Math.random() * chainArray.length)];

    //Load the mon.
    //getData(POKE_URL + "raichu-alola", loadPokemon);
    getData(POKE_URL + handleAltForms(monChoice.name), loadPokemon)
}

//Returns an expression representing the mon's position in its evolutionary line.
function getEvoStatus(evoChain, monName) {
    let currentBlock = evoChain.chain;

    //reformat the name for the comparison.
    let comparisonName = nameFormat(monName, specialCaseCheck(correctMon.id)).toLowerCase();

    let description = "";

    // Because this is the root, the mon is single-staged if the evolves_to array has nothing in it.
    if (comparisonName.toLowerCase() == "wo-chien" || comparisonName.toLowerCase() == "chien-pao" || comparisonName.toLowerCase() == "ting-lu" || comparisonName.toLowerCase() == "chi-yu" || comparisonName.toLowerCase() == "ho-oh"){
        return "single-stage";
    }
    if (comparisonName.toLowerCase() == "porygon-z" || comparisonName.toLowerCase() == "kommo-o") {
        return "fully evolved";
    }
    if (comparisonName.toLowerCase() == "jangmo-o") {
        return "base-form";
    }
    if (comparisonName.includes("-mega")) {
        return "mega-evolved";
    }

    if (evoChain.chain.evolves_to.length == 0) {
        description += "single-stage";
    }
    // If the root is what we're looking for, it's a base form or a baby.
    else if (evoChain.chain.species.name == comparisonName.split('-')[0])
    {
        if (evoChain.chain.is_baby) {
            description += "baby";
        }
        else {
            description += "base-form";
        }
    }
    else{
        //Head to the end of the array
        while (currentBlock.evolves_to.length > 0){
            currentBlock = currentBlock.evolves_to[0];
        }
        if (currentBlock.species.name == comparisonName.split('-')[0]){
            description += "fully evolved";
        }
    }
    if (comparisonName.includes("-") && (comparisonName.toLowerCase() != "porygon-z" && comparisonName.toLowerCase() != "ho-oh"
        && comparisonName.toLowerCase() != "jangmo-o" && comparisonName.toLowerCase() != "hakamo-o"
        && comparisonName.toLowerCase() != "kommo-o" && comparisonName.toLowerCase() != "wo-chien"
        && comparisonName.toLowerCase() != "chien-pao" && comparisonName.toLowerCase() != "ting-lu"
        && comparisonName.toLowerCase() != "chi-yu")) {
        description += " alternate-form";
    }
    return description;
}

//Replaces the hint button with a hint.
function addSecondHint() {
    //Grab the hint div element
    let hintDiv = document.querySelector("#secondHint");

    //Create the array of hint strings
    let hintArray = [
        `My height is ${correctMon.height / 10}m.`,
        `My weight is ${correctMon.weight / 10}kg.`,
        `My first ability is ${nameFormat(correctMon.abilities[0].ability.name, false)}.`
    ]

    //Randomly select from the array
    let hintChoice = hintArray[Math.floor(Math.random() * hintArray.length)];

    //Add the hint to the div
    hintDiv.innerHTML = hintChoice;
}

function checkAnswer() {
    //obtain the typed guess
    let answerGuess = document.querySelector("input").value;
    //create a text element to hold the status of the answer
    let rightOrWrong = document.createElement("div");

    let correctName = nameFormat(correctMon.name, specialCaseCheck(correctMon.id)).toLowerCase();

    //compare the guess to the mon's name to determine whether it's correct.
    if (answerGuess.toLowerCase() == correctName) {
        rightOrWrong.innerHTML = "Correct!";
        rightOrWrong.style.color = "#008800";
    }
    else {
        rightOrWrong.innerHTML = "Incorrect!";
        rightOrWrong.style.color = "#880000";
    }

    answerElementList[1] = (rightOrWrong);
}

const submitButtonEvent = e => {
    //Make this the retry button
    e.target.innerHTML = "Retry";
    //Check if the typed answer is right or wrong.
    checkAnswer();
    //Add the answer section to the field
    for (let item of answerElementList) {
        answerSection.appendChild(item);
    }
    //Re-assign the button's event to the retry event.
    e.target.onclick = retryButtonEvent;
}

const retryButtonEvent = e => {
    //Make this the submit button again
    e.target.innerHTML = "Submit";
    //Remove the answer section from the field
    for (let item of answerElementList) {
        answerSection.removeChild(item);
    }
    //Create another correct answer.
    generateCorrectAnswer();

    //Reset the hint button if it's been clicked.
    resetHintButton();

    //Re-assign the event to the submit event.
    e.target.onclick = submitButtonEvent;
}

function resetHintButton() {
    //Re-add the hint button to the document
    document.querySelector("#secondHint").innerHTML = `<button id="hintButton">Get another hint!</button>`;

    //Extract the new hint button
    let hintButton = document.querySelector("#hintButton");

    //Re-assign the event.
    hintButton.onclick = addSecondHint;
}