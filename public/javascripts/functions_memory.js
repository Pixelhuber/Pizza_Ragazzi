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

        this.gameElement.setAttribute('class', 'box order');

        this.gameElement.text.setAttribute('style', 'position: absolute; z-index: 2');
        this.gameElement.text.innerHTML = this.ingredient;

        this.gameElement.appendChild(this.gameElement.text);

        document.getElementById('memoryBox').appendChild(this.gameElement);

    }

}

function loadMemoryCards(){
    new memoryCard("tonno", "erfunden 1900").createGameElement()
}

