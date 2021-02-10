class MemoryCard{

    // ATTRIBUTES --------------------

    ingredient; // ingredient the card is about
    fact;       // fact about the ingredient

    constructor(ingredient, fact) {
        this.ingredient = ingredient;
        this.fact = fact;
    }

    createCards(){                                  //jeder Aufruf dieser Methode erstellt 2 Karten, die für den Namen und die für den Fakt
        this.createNameCard();
        this.createFactCard();
    }

    createNameCard() {
        const card = new NameCard(this);

        card.gameElement = document.createElement('div');
        card.gameElement.text = document.createElement('p');

        card.gameElement.setAttribute('class', 'memoryCard');

        card.gameElement.text.innerHTML = this.ingredient;

        card.gameElement.appendChild(card.gameElement.text);

        document.getElementById('memoryBox').appendChild(card.gameElement);

    }

    createFactCard() {
        const card = new FactCard(this);

        card.gameElement = document.createElement('div');
        card.gameElement.text = document.createElement('p');

        card.gameElement.setAttribute('class', 'memoryCard');

        card.gameElement.text.innerHTML = this.fact;

        card.gameElement.appendChild(card.gameElement.text);

        document.getElementById('memoryBox').appendChild(card.gameElement);
    }

    revealCard(MemoryCard){

    }


}

class NameCard extends MemoryCard{

    constructor(memoryCard) {
        super(memoryCard.ingredient);
        this.name = name;
    }

}

class FactCard extends MemoryCard{

    constructor(memoryCard, fact) {
        super(memoryCard.ingredient, memoryCard.fact);
        this.fact = fact;
    }

}

function loadMemoryCards(){                                                     //wird initial aufgerufen

    let ingredientList = getNextTierIngredients(getCurrentTier()+1);

    for (let i = 0; i < ingredientList.length; i++) {
        let fact = getIngredientFact(ingredientList[i], getCurrentTier())
        new MemoryCard(ingredientList[i],fact).createCards()
    }
}

// TODO: Get Tier and Ingredientlist from Database --------------------

function getCurrentTier(){
    return 1;
}

function getNextTierIngredients(tier){
    return ["impasto", "pomodoro", "formaggio", "salame", "funghi", "prosciutto"];
}

function getIngredientFact(ingredient, currentTier){
    switch (ingredient){
        case "impasto":
            if (currentTier == 1){
                return "es gibt über 300 knettechniken"
            }
        break;

    }
}

// TODO: shuffleCards, clickEvent, zugehörige Karten verknüpfen

