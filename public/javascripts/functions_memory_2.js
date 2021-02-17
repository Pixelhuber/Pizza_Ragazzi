class MemoryIngredient {

    id;
    name;
    description;
    picture_string;

    constructor(id, name, description, picture_src) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.picture_string = picture_src;
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

        CardHandler.handle();

        if (this.isFlipped)
            this.showContent();
        else
            this.hideContent();
    }

    // private
    showContent() {
        //TODO: Display the content of the card
    }

    // private
    hideContent() {
        //TODO: Hide the content of the card
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
        this.ingredient_picture.setAttribute("src", memoryIngredient.picture_string);

        this.createGameElement();
    }

    createGameElement() {

        // TODO: Create <div> however you want
        const tmp = document.createElement('div');

        tmp.setAttribute("onclick", "CardHandler.flipCard(" + this.card_number + ")");
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

        // TODO: Create <div> however you want
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

        if (numberFlippedCards > 2)
            this.hideAllCards();
    }

    static flipCard(number) {

    }

    static hideAllCards() {
        memoryCards.forEach(function (item) {
            item.setFlipped(false);
        })
    }
}

// DATABASE STUFF -----------------------------------------------------------------------------------------------------

async function createMemoryCards() {
    const ingredients = await getMemoryIngredients();

    ingredients.forEach(function (item) {
        const memoryIngredient = new MemoryIngredient(item.id, item.name, item.description, item.picture_string)
        memoryCards.push(AbstractMemoryCard.createNameCard(memoryIngredient));
        memoryCards.push(AbstractMemoryCard.createFactCard(memoryIngredient));
    })
}

async function getMemoryIngredients() {

    let response = await fetch("memory/getMemoryIngredients");
    return response.json();
}
