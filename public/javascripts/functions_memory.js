class memoryCard{

    // ATTRIBUTES --------------------

    ingredient; // ingredient the card is about

    fact; // fact about the ingredient

    constructor(ingredient, fact) {
        this.ingredient = ingredient;
        this.fact = fact;
    }

    createGameElement() {
        this.gameElement = document.createElement('div');
        this.gameElement.text = document.createElement('p');

        this.gameElement.setAttribute('class', 'memoryCard');

        this.gameElement.text.innerHTML = this.ingredient;

        this.gameElement.appendChild(this.gameElement.text);

        document.getElementById('memoryBox').appendChild(this.gameElement);
    }
}

function loadMemoryCards(){

    for (let i = 0; i < 7; i++) {
        new memoryCard("tonno", "erfunden 1900").createGameElement()
    }
}

