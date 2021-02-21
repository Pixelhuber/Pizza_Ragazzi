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
        //tmp.text = document.createElement('p');

        //tmp.text.innerHTML = this.ingredient_name;

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
        document.getElementById(this.card_number).style.backgroundColor = "rgba(150, 150, 150, 0.5)";
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
        document.getElementById(this.card_number).style.backgroundColor = "rgba(150, 150, 150, 0.5)";
    }
}

memoryCards = [];  // Hier sind alle Karten drin, die erstellt wurden

class CardHandler {

    static handle() {

        let numberFlippedCards = 0;

        clearTimeout();

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
        } else {
            let that = this;
            setTimeout(function(){that.hideAllCards();}, 1500);
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
        //document.getElementById(memoryCards[indicesOfFlippedCards[0]].card_number).remove();        //Löschen der jeweiligen Divs
        //document.getElementById(memoryCards[indicesOfFlippedCards[1]].card_number).remove();


        delete memoryCards[indicesOfFlippedCards[0]];                                               //Löschen der MemoryCards im Array
        delete memoryCards[indicesOfFlippedCards[1]];


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


