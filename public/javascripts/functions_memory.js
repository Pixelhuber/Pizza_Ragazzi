class MemoryCard{

    // ATTRIBUTES --------------------

    ingredient; // ingredient the card is about
    fact;       // fact about the ingredient
    id;

    constructor(ingredient, fact, id) {
        this.ingredient = ingredient;
        this.fact = fact;
        this.id = id;
    }

    createCards(){                                  //jeder Aufruf dieser Methode erstellt 2 Karten, die für den Namen und die für den Fakt
        this.createNameCard();
        this.createFactCard();

    }

    createNameCard() {
        const card = new NameCard(this);

        card.gameElement = document.createElement('div');
        card.gameElement.text = document.createElement("p");

        card.gameElement.setAttribute('class', 'memoryCard');

        card.gameElement.text.innerHTML = this.ingredient;

        card.gameElement.text.style.visibility = "hidden"
        card.gameElement.setAttribute('id', this.id);

        /*card.gameElement.setAttribute('onmousedown', card.turnAround.bind(this));*/

        card.gameElement.appendChild(card.gameElement.text);

        document.getElementById('memoryBox').appendChild(card.gameElement);


    }


    createFactCard() {
        const card = new FactCard(this);

        card.gameElement = document.createElement('div');
        card.gameElement.text = document.createElement('p');

        card.gameElement.setAttribute('class', 'memoryCard');

        card.gameElement.text.innerHTML = this.fact;
        card.gameElement.text.style.visibility = "hidden"

        this.id = -this.id

        card.gameElement.setAttribute('id', this.id);

        card.gameElement.appendChild(card.gameElement.text);

        document.getElementById('memoryBox').appendChild(card.gameElement);
    }


}

class NameCard extends MemoryCard{

    id;

    constructor(memoryCard,id) {
        super(memoryCard.ingredient);
        this.id = id;
    }

}

class FactCard extends MemoryCard{

    id;

    constructor(memoryCard, fact, id) {
        super(memoryCard.ingredient, memoryCard.fact);
        this.fact = fact;
        this.id = -id;
    }

}

function loadMemoryCards(){                                                     //wird initial aufgerufen

    let ingredientList = getNextTierIngredients(getCurrentTier()+1);

    for (let i = 0; i < ingredientList.length; i++) {
        let fact = getIngredientFact(ingredientList[i], getCurrentTier())
        let memoryCard = new MemoryCard(ingredientList[i],fact,i+1).createCards()

    }

    //onClick müsste eigentlich für NameCard und FactCard gehen, da beide die gleiche ID haben

    clickCard(ingredientList);



}

function toggle(card){

    if (card.text.style.visibility === "visible") {
        card.text.style.visibility = "hidden"
    } else {
        card.text.style.visibility = "visible"
    }


}

function clickCard(ingredientList){
    for (let i = -ingredientList.length; i <= ingredientList.length; i++) {
        if(!(i === 0)){
            let  firstCard = document.getElementById(i.toString());
            firstCard.onclick = function(evt) {
                toggle(firstCard);
                for (let j = -ingredientList.length; j <= ingredientList.length; j++) {
                    if(!(j === 0)){
                        let secondCard = document.getElementById(j.toString());
                        secondCard.onclick = function (evt) {
                            toggle(secondCard);
                            if ((parseInt(firstCard.id) + parseInt(secondCard.id)) === 0) {
                                firstCard.remove();
                                secondCard.remove();
                            } else {
                                setTimeout(function () {
                                    if (firstCard.text.style.visibility === "visible" && secondCard.text.style.visibility === "visible")
                                        toggle(firstCard);
                                        toggle(secondCard);
                                }, 1500);
                        }

                    }
                }
            }
        }
        }

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
            if (currentTier === 1){
                return "Fakt über Teig"
            }
        break;

    }
}

// TODO: shuffleCards, clickEvent, zugehörige Karten verknüpfen

