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

    memoryIngredient
    gameElement;
    isFlipped; // true -> card content is visible

    constructor(memoryIngredient) {

        this.memoryIngredient = memoryIngredient;
        this.isFlipped = false;
    }

    toggleFlipped() {
        this.isFlipped(!this.isFlipped);

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

    //MemoryIngredient  |
    //gameElement       |   <- die Attribute werden geerbt, kannst du hier auch ganz normal benutzen
    //isFlipped         |
    ingredient_name;
    ingredient_picture;

    constructor(memoryIngredient) {
        super(memoryIngredient);

        this.ingredient_name = memoryIngredient.name;
        this.ingredient_picture = document.createElement('img');
        this.ingredient_picture.setAttribute("src", memoryIngredient.imageString);

        this.createGameElement();
    }

    createGameElement() {

        // TODO: Create <div> however you want
    }

    static createNameCard(memoryIngredient) {
        return new NameCard(memoryIngredient);
    }

    static createFactCard(memoryIngredient) {
        return new DescriptionCard(memoryIngredient);
    }
}

class DescriptionCard extends AbstractMemoryCard {

    //MemoryIngredient  |
    //gameElement       |   <- die Attribute werden geerbt, kannst du hier auch ganz normal benutzen
    //isFlipped         |
    ingredient_description;

    constructor(memoryIngredient) {
        super(memoryIngredient);

        this.ingredient_description = memoryIngredient.description;

        this.createGameElement();
    }

    createGameElement() {

        // TODO: Create <div> however you want
    }
}

memoryCards = [];

// --------------------------------------------------------------------------------------------------------------------

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
