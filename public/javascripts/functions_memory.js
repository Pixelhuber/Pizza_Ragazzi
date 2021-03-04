class AudioPlayer {
    static short_ring() {
        const sound = document.createElement("AUDIO");
        sound.setAttribute('src', "/assets/sounds/short_ring.wav");
        sound.setAttribute('type', "audio/wav");
        sound.volume = 0.4;
        sound.play();
    }
}

// CLASSES ------------------------------------------------------------------------------------------------------------

// An "Ingredient" is only a definition of an ingredient without any behavior.

class MemoryIngredient {

    id;
    name;
    description;
    picture;

    constructor(id, name, description, picture_src) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.picture = picture_src;
    }
}

// ---------------------------------------------------

// Abstract Memory Card is used and creates both NameCard and FactCard for one Ingredient

class AbstractMemoryCard {

    card_number;
    memoryIngredient;
    gameElement;
    isFlipped; // true -> card content is visible

    constructor(memoryIngredient, card_number) {

        this.card_number = card_number;
        this.memoryIngredient = memoryIngredient;
        this.isFlipped = false;
    }

    static card_count = 0;

    static createNameCard(memoryIngredient) {
        this.card_count++;
        return new NameCard(memoryIngredient, this.card_count);
    }

    static createFactCard(memoryIngredient) {
        this.card_count++;
        return new DescriptionCard(memoryIngredient, this.card_count);
    }

    setFlipped(bool) {
        this.isFlipped = bool;

        if (this.isFlipped)
            this.showContent();
        else
            this.hideContent();
    }

    toggleFlipped() {
        this.isFlipped = !this.isFlipped;

        if (CardHandler.handle())
            this.isFlipped = !this.isFlipped;

        if (this.isFlipped)
            this.showContent();
        else
            this.hideContent();
    }


    createGameElement() {} // wird in Unterklassen spezifiziert
}

class NameCard extends AbstractMemoryCard {

    //card_number
    //MemoryIngredient  |
    //gameElement       |   <- die Attribute werden geerbt, kannst du hier auch ganz normal benutzen
    //isFlipped         |
    ingredient_name;
    ingredient_picture; // <img>

    constructor(memoryIngredient, card_number) {
        super(memoryIngredient, card_number);

        this.ingredient_name = memoryIngredient.name;
        this.ingredient_picture = document.createElement('img');
        this.ingredient_picture.setAttribute("src", memoryIngredient.picture);

        this.createGameElement();
    }

    createGameElement() {

        const tmp = document.createElement('div');
        tmp.setAttribute('class', 'memoryCard');
        tmp.setAttribute('id', this.card_number);

        tmp.appendChild(this.ingredient_picture);
        this.ingredient_picture.style.maxWidth = '40%';

        tmp.setAttribute("onclick", "CardHandler.flipCard(" + this.card_number + ")");

        document.getElementById('memoryBox').appendChild(tmp);

        this.hideContent();
    }
    // private
    showContent() {
        this.ingredient_picture.style.display = "block";
        document.getElementById(this.card_number).style.backgroundColor = "rgba(150, 150, 150, 0.1)";
    }

    // private
    hideContent() {
        this.ingredient_picture.style.display = "none";
        document.getElementById(this.card_number).style.backgroundColor = "rgba(251, 192, 45, 0.3)";
    }
}

class DescriptionCard extends AbstractMemoryCard {

    //MemoryIngredient  |
    //gameElement       |   <- die Attribute werden geerbt, kannst du hier auch ganz normal benutzen
    //isFlipped         |
    ingredient_description;

    constructor(memoryIngredient, card_number) {
        super(memoryIngredient, card_number);

        this.ingredient_description = memoryIngredient.description;

        this.createGameElement();
    }

    createGameElement() {

        const tmp = document.createElement('div');
        tmp.setAttribute('class', 'memoryCard');
        tmp.setAttribute('id', this.card_number);
        tmp.text = document.createElement('p');

        tmp.text.innerHTML = this.ingredient_description;

        tmp.setAttribute("onclick", "CardHandler.flipCard(" + this.card_number + ")");

        tmp.appendChild(tmp.text);

        document.getElementById('memoryBox').appendChild(tmp);

        this.hideContent();
    }

    // private
    showContent() {
        document.getElementById(String(this.card_number)).text.style.display = "block";
        document.getElementById(this.card_number).style.backgroundColor = "rgba(150, 150, 150, 0.1)";
    }

    // private
    hideContent() {
        document.getElementById(String(this.card_number)).text.style.display = "none";
        document.getElementById(this.card_number).style.backgroundColor = "rgba(251, 192, 45, 0.3)";
    }
}

memoryCards = [];  // Hier sind alle Karten drin, die erstellt wurden

class CardHandler {

    static handle() {

        let numberFlippedCards = 0;

        memoryCards.forEach(function (item) {
            if (item.isFlipped)
                numberFlippedCards++;
        })

        if (numberFlippedCards > 2){
            this.hideAllCards();
            return true;                            //informiert toggleFlipped, ob alle Karten umgedreht wurden (dann muss aktuelle Karte nochmal umgedreht werden)
        } else if (numberFlippedCards == 2){
            this.checkPair();
        } else {
            return false;
        }
    }

    static flipCard(number) {
        memoryCards[number-1].toggleFlipped();

    }

    static hideAllCards() {
        memoryCards.forEach(function (item) {
            item.setFlipped(false);
        })
    }

    static checkPair(){
        let indicesOfFlippedCards = this.getIndicesOfFlippedCards();
        if (memoryCards[indicesOfFlippedCards[0]].memoryIngredient.name == memoryCards[indicesOfFlippedCards[1]].memoryIngredient.name){
            this.removePair(indicesOfFlippedCards);
        }
    }

    static getIndicesOfFlippedCards(){
        let indicesOfFlippedCards = [];
        memoryCards.forEach(function (item,index) {
            if (item.isFlipped){
                indicesOfFlippedCards.push(index)
            }
        })
        return indicesOfFlippedCards;
    }
    static removePair(indicesOfFlippedCards){
        document.getElementById(memoryCards[indicesOfFlippedCards[0]].card_number).style.borderColor = "green";
        document.getElementById(memoryCards[indicesOfFlippedCards[0]].card_number).style.borderWidth = "thick";

        document.getElementById(memoryCards[indicesOfFlippedCards[1]].card_number).style.borderColor = "green";
        document.getElementById(memoryCards[indicesOfFlippedCards[1]].card_number).style.borderWidth = "thick";


        delete memoryCards[indicesOfFlippedCards[0]];                                               //Löschen der MemoryCards im Array
        delete memoryCards[indicesOfFlippedCards[1]];

        AudioPlayer.short_ring();

        this.checkGameOver();
    }

    static checkGameOver(){
        if (Object.values(memoryCards).length == 0){
            checkForLevelUp();
            document.getElementById("end_screen").style.visibility = "block";
        }
    }

    static shuffle() {
        let memoryBox = document.getElementById("memoryBox");
        let divArray = Array.prototype.slice.call(memoryBox.getElementsByClassName('memoryCard'));
        divArray.forEach(function(item){
            memoryBox.removeChild(item);
        })
        this.shuffleDivArray(divArray);
        divArray.forEach(function(item){
            memoryBox.appendChild(item);
        })
    }

    static shuffleDivArray(divArray) {
        for (let i = divArray.length - 1; i > 0; i--) {
            let j = Math.floor(Math.random() * (i + 1));
            let temp = divArray[i];
            divArray[i] = divArray[j];
            divArray[j] = temp;
        }
        return divArray;
    }
}

function restartGame() {
    window.location.reload(false);
}

// DATABASE STUFF -----------------------------------------------------------------------------------------------------

async function createMemoryCards() {

    const ingredients = await getMemoryIngredients();

    ingredients.forEach(function (item) {
        const memoryIngredient = new MemoryIngredient(item.id, item.name, item.description, item.picture)
        memoryCards.push(AbstractMemoryCard.createNameCard(memoryIngredient));
        memoryCards.push(AbstractMemoryCard.createFactCard(memoryIngredient));
    })
    CardHandler.shuffle();
}



async function getMemoryIngredients() {

    let response = await fetch("memory/getMemoryIngredients");
    return response.json();
}

async function setCurrentPlayerTier(tier) {
    fetch("/memory/setCurrentPlayerTier", {
        method: 'POST',
        body: JSON.stringify({
            newTier: tier
        }),
        headers: {
            "Content-Type": "application/json"
        },
        credentials: 'include'
    }).then(result => result.text())
        .then(data => {
            let msg = data.toString();
            console.log(msg);
        })

}

async function setCurrentPlayerPoints(earnedPoints) {
    let currentPlayerTotalPoints = await getCurrentPlayerTotalPoints();


    fetch("/pizza_rush/setPlayerPoints", {
        method: 'POST',
        body: JSON.stringify({
            newTotalPoints: currentPlayerTotalPoints + earnedPoints,                 //aktuell gibt jedes Memory 100 Punkte, könnte man abhängig vom Tier machen (200,300)
        }),
        headers: {
            "Content-Type": "application/json"
        },
        credentials: 'include'
    }).then(result => result.text())
        .then(data => {
            let msg = data.toString();
            console.log(msg);
        })

}

async function getCurrentPlayerTotalPoints() {
    let returnedPoints = -1;
    return await fetch("/profile/getTotalPoints")
        .then(
            result => result.text()
        ).then(
            result => {
                returnedPoints = parseInt(result);
                return returnedPoints;
            }
        ).catch((error) => {
            console.error('Error:', error);
        });
}

function checkForLevelUp() {


    $.get("/menu/checkForLevelUp", function (data, status) {
        const levelUpViewModel = JSON.parse(data);

        console.log(levelUpViewModel);

        if (levelUpViewModel.levelUpPossible){
            setCurrentPlayerTier(levelUpViewModel.nextTierAsFigure);
            document.getElementById("end_screen").style.visibility = "visible";
            document.getElementById("end_screen_text").innerHTML =
                "Du hast ein neues Level erreicht! <br> Neuer Rang: " + "\"" + levelUpViewModel.nextTier + "\""
        } else {
            let earnedPoints;
            if(levelUpViewModel.nextTierPoints === -1){
                earnedPoints = 1000;
            } else {
                earnedPoints = levelUpViewModel.nextTierPoints/10;
            }
            setCurrentPlayerPoints(earnedPoints);
            document.getElementById("end_screen").style.visibility = "visible";
            document.getElementById("end_screen_text").innerHTML =
                "Du hast " + earnedPoints + " Punkte gesammelt!"
        }
    }).fail(function (data, status) {

    });
}






