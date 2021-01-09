// An "Ingredient" is only a definition of an ingredient without any behavior.
class Ingredient {

    constructor(name, image) {
        this.name = name; // attributes
        this.image = image;
    }

    name;
    image;

    createDraggableInstance() {
        if (this.name === "Impasto")
            return new DraggablePizzaInstance();
        else
            return new DraggableIngredientInstance(this);
    }

    createImg() {
        const ret = document.createElement('img');

        ret.setAttribute('src', this.image);
        ret.setAttribute('alt', this.name);
        ret.setAttribute('width', '100px');
        ret.setAttribute('height', '100px');

        return ret;
    }

    getName() {
        return this.name;
    }

    //returns an instance of the ingredient with this name
    static getInstanceByName(name) {
        let ret = undefined;

        availableIngredients.forEach(function(item, index, array) {
            if (name === item.name)
                ret = new Ingredient(name, item.image);
        })

        return ret;
    }
}

// A "DraggableIngredientInstance" is an actual Ingredient you can interact with and drag around
class DraggableIngredientInstance extends Ingredient {

    constructor(ingredient) {
        super(ingredient.name, ingredient.image);
        this.createDraggable();
        this.isDragEnabled = true;
    }

    draggable; // Actual draggable html-element
    isDragEnabled; // Dragging gets disabled for example when in oven

    createDraggable() {
        const draggable = this.createImg();

        draggable.setAttribute('class', 'draggable');

        switch (this.name) {
            case "Pomodoro":    document.getElementById("tomato_layer").appendChild(draggable);
                break;
            case "Formaggio":   document.getElementById("cheese_layer").appendChild(draggable);
                break;
            case "Salame":      document.getElementById("salami_layer").appendChild(draggable);
                break;
            case "Funghi":      document.getElementById("mushroom_layer").appendChild(draggable);
                break;
        }

        this.draggable = draggable;

        makeDraggable(this);
    }

    setIsDragEnabled(boolean) {
        this.isDragEnabled = boolean;
    }

    whenDraggedInPizza(pizza) {

        //Put ingredient on pizza
        pizza.ingredients.push(Ingredient.getInstanceByName(this.getName()));

        //Div declarations
        const pizzaDivOld = pizza.draggable;
        const pizzaDivUpdated = pizza.updateDiv();

        //Set position of pizzaDivUpdated
        pizzaDivUpdated.style.left = pizzaDivOld.style.left;
        pizzaDivUpdated.style.top = pizzaDivOld.style.top;

        //Swap pizzaDivs
        document.getElementById("pizza_layer").replaceChild(pizzaDivUpdated, pizzaDivOld)

        //Remove single draggable ingredient
        pizzaDivOld.remove();
        this.draggable.remove();
    }
}

// ingredient & draggableIngredientInstance class above
// --------------------------------------------------------------------------------------------------------------------

// A "Pizza" is only a definition of ingredients without any behavior.
// Example: An Order-Element requests a "Pizza" and not a "DraggablePizzaInstance"
class Pizza {

    // When created, a new pizza is simply a piece of dough. More ingredients get added while playing.
    constructor() {
        this.ingredients.push(Ingredient.getInstanceByName("Impasto"))
        this.bakingTimeInSeconds = 5;
    }

    ingredients = [];
    bakingTimeInSeconds;

}

// A "DraggablePizzaInstance" is the actual Pizza you can interact with and drag around
class DraggablePizzaInstance extends Pizza {

    draggable; // Actual draggable html-element
    isDragEnabled;
    bakeStatus = {
        UNBAKED: 0,
        WELL: 1,
        BURNT: 2
    };

    constructor() {
        super();

        this.updateDiv();
        existingDraggablePizzaInstances.push(this);
        document.getElementById("pizza_layer").appendChild(this.draggable);

        this.bakeStatus = this.bakeStatus.UNBAKED;
        this.isDragEnabled = true;
    }

    static findExistingPizzaByDiv(div) {
        existingDraggablePizzaInstances.forEach(function(item, index, array){
            if (item.draggable === div)
                return item;
        })

        return undefined;
    }

    setIsDragEnabled(boolean) {
        this.isDragEnabled = boolean;
    }

    getName() {
        // temporary return values
        switch (this.bakeStatus){
            case 0: return "unknown unbaked pizza";
            case 1: return "unknown baked pizza";
            case 2: return "unknown burnt pizza"
        }
    }

    // a.k.a. createDraggable()
    updateDiv() {
        const pizzaDiv = document.createElement("div");

        pizzaDiv.setAttribute('class', 'draggable');

        this.ingredients.forEach(function(item, index, array){

            // TODO: Ingredients get stacked in correct order
            const ingr = item.createImg();
            ingr.setAttribute('style', 'position: absolute');

            pizzaDiv.appendChild(ingr);

            //return pizzaDiv;
        })

        // Sets the size of the <div> to the size of the <img> in it
        // without this, checkOverlap() couldn't calculate the middle point of the <div>
        pizzaDiv.style.width = pizzaDiv.firstElementChild.getAttribute("width");
        pizzaDiv.style.height = pizzaDiv.firstElementChild.getAttribute("height");

        this.draggable = pizzaDiv;

        makeDraggable(this);

        return this.draggable
    }

    // should check if pizza matches the order
    whenDraggedInOrder(order) {

        existingDraggablePizzaInstances.splice(existingDraggablePizzaInstances.indexOf(this), 1);
        this.draggable.remove();
    }

    whenDraggedInOven(oven) {

        oven.bake(this)
        alignDraggableToDestination(this.draggable, oven.gameElement.image);
    }
}

// pizza & draggablePizzaInstance class above
// --------------------------------------------------------------------------------------------------------------------

class Oven {

    constructor() {
        this.gameElement = document.createElement('div');
        this.gameElement.image = document.createElement('img');

        this.gameElement.setAttribute('class', "oven");
        this.gameElement.image.setAttribute('src', "/assets/images/oven.png");
        this.gameElement.image.setAttribute('alt', "Oven");

        this.gameElement.appendChild(this.gameElement.image);

        // Creating an oven instance automatically displays it
        document.getElementById("oven_container").appendChild(this.gameElement);
    }

    gameElement

    bake(pizza) {
        const oven = this;
        let start;

        // creating the timer element <p>
        const timer = document.createElement('p');
        timer.setAttribute('style', "position: absolute; z-index: 20; font-size: 2.5em");
        timer.innerText = pizza.bakingTimeInSeconds;

        this.gameElement.appendChild(timer);

        // disable dragging for the pizza
        pizza.setIsDragEnabled(false);

        // this is one animation step
        function updateTimer(timestamp) {
            if (start === undefined)
                start = timestamp;
            const elapsed = timestamp - start; // elapsed = time passed since animation start [milliseconds]

            // update timer
            timer.innerText = (Math.floor(pizza.bakingTimeInSeconds - elapsed/1000 + 1)).toString();

            // Stop the animation when time is over
            if (elapsed < pizza.bakingTimeInSeconds*1000) {
                window.requestAnimationFrame(updateTimer);
            }
            else {
                pizza.setIsDragEnabled(true);
                pizza.bakeStatus = Math.min(++pizza.bakeStatus, 2);
                console.log("pizza is baked: " + pizza.bakeStatus);
                timer.remove();
            }
        }

        window.requestAnimationFrame(updateTimer);
    }
}

// pizza & draggablePizzaInstance class above
// --------------------------------------------------------------------------------------------------------------------

class Order {

    constructor(name, points, timeInSeconds, requestedPizza) {
        this.name = name;
        this.points = points;
        this.timeInSeconds = timeInSeconds;
        if (requestedPizza instanceof Pizza)
            this.requestedPizza = requestedPizza;
    }

    name;
    points;
    timeInSeconds;
    requestedPizza;

    //in game representation of the order
    gameElement;

    deliver(pizza) {
        pizza.whenDraggedInOrder(this);

        // Server validates pizza and updates points
        validatePizza(this, pizza.draggable, pizza.isBaked);

        this.gameElement.remove();
        orderList.splice(orderList.indexOf(this), 1);
        console.log("Delivered: " + pizza.getName() + "\nOrdered: " + this.name);
    }

    createGameElement() {
        this.gameElement = document.createElement('div');
        this.gameElement.timeIndicator = document.createElement('div');
        this.gameElement.text = document.createElement('p');

        this.gameElement.setAttribute('class', 'box order');

        this.gameElement.text.setAttribute('style', 'position: absolute; z-index: 2');
        this.gameElement.text.innerHTML = this.name;

        this.gameElement.appendChild(this.gameElement.timeIndicator);
        this.gameElement.appendChild(this.gameElement.text);

        document.getElementById('orderSection').getElementsByClassName('scroll_container').item(0).appendChild(this.gameElement);
    }

    // starts the animation of the order timeIndicator
    startAnimation() {
        const order = this;
        let start;

        let gameElement_box;
        let timeIndicator_box;

        // this is one animation step
        function updateTimeIndicator(timestamp) {
            if (start === undefined)
                start = timestamp;
            const elapsed = timestamp - start; // elapsed = time passed since animation start [milliseconds]

            gameElement_box = order.gameElement.getBoundingClientRect();
            timeIndicator_box = order.gameElement.timeIndicator.getBoundingClientRect();

            // update time indicator
            let timeLeftInDecimal = Math.max(((order.timeInSeconds*1000 - elapsed) / (order.timeInSeconds*1000)), 0) // percentage of time left [min = 0]
            order.gameElement.timeIndicator.style.height = (gameElement_box.height - 8) + "px"; // always the same
            order.gameElement.timeIndicator.style.width = gameElement_box.width * (timeLeftInDecimal) + "px";

            // set indicator color according to percentage of time left
            if (timeLeftInDecimal > 0.5)
                order.gameElement.timeIndicator.style.backgroundColor = "green";
            else if (timeLeftInDecimal > 0.2)
                order.gameElement.timeIndicator.style.backgroundColor = "yellow";
            else
                order.gameElement.timeIndicator.style.backgroundColor = "red";


            if (elapsed < order.timeInSeconds*1000) { // Stop the animation when time is over
                window.requestAnimationFrame(updateTimeIndicator);
            } else {
                if (order.gameElement.isConnected){ // SEHR wichtige Abfrage, hat mich viel Zeit gekostet
                    order.gameElement.remove();
                    orderList.splice(orderList.indexOf(order), 1);
                }
            }
        }

        window.requestAnimationFrame(updateTimeIndicator);
    }

    getName(){
        return this.name;
    }
}

// order class above
// --------------------------------------------------------------------------------------------------------------------

const availableIngredients = [      new Ingredient("Impasto", "/assets/images/teig.png"),
                                    new Ingredient("Formaggio", "/assets/images/formaggio.png"),
                                    new Ingredient("Pomodoro", "/assets/images/pomodoro.png"),
                                    new Ingredient("Salame", "/assets/images/salame.png"),
                                    new Ingredient("Funghi", "/assets/images/funghi.png")];

const orderList = [                 ];

const ovenList = [                  ];

const existingDraggablePizzaInstances = [];

// AT STARTUP ---------------------------------------------------------------------------------------------------------

// called at startup
function loadGameElements() {
    loadIngredientSection();
    loadOrderSection();
    loadOvens();
}

function loadIngredientSection(){
    availableIngredients.forEach(function(item, index, array){
        const ingredient = document.createElement('div');
        const image = document.createElement('img');
        const name = document.createElement('div')

        ingredient.setAttribute('class', 'box ingredient');
        ingredient.setAttribute('onmousedown', 'pullNewIngredient(' + index + ')');

        image.setAttribute('src', item.image);
        image.setAttribute('height', '50px');
        image.setAttribute('width', 'auto');

        name.innerText = item.name;

        ingredient.appendChild(image);
        ingredient.appendChild(name);

        document.getElementById('ingredientSection').getElementsByClassName('scroll_container').item(0).appendChild(ingredient);
    })
}

function loadOrderSection(){

    orderList.push( new Order("Margarita", 10, 15),
                    new Order("Salame", 15, 35),
                    new Order("Funghi", 10, 80),
                    new Order("Speciale", 15, 100),
                    new Order("Salame", 15, 35));

    orderList.forEach(function(item, index, array){
        item.createGameElement();
    })
}

function loadOvens() {

    // this could later be dynamic:
    // for example load as many ovens as the player has bought
    ovenList.push(  new Oven(),
                    new Oven(),
                    new Oven(),
                    new Oven());
}

// --------------------------------------------------------------------------------------------------------------------

function makeDraggable(element) {
    let diff_x = 0, diff_y = 0, x = 0, y = 0;

    if (!(element instanceof DraggableIngredientInstance || element instanceof DraggablePizzaInstance))
        alert("problem in functions_pizzarush.makeDraggable()")

    // if element is pressed down -> start dragging
    element.draggable.onmousedown = initiateDrag;

    function initiateDrag(event) {
        if (!element.isDragEnabled)
            return;

        event = event || window.event;
        event.preventDefault();

        // get the mouse cursor position at startup:
        x = event.clientX;
        y = event.clientY;
        document.onmouseup = endDrag;

        // calls function whenever the cursor moves:
        document.onmousemove = updateDragPosition;
    }

    function updateDragPosition(event) {
        event = event || window.event;
        event.preventDefault();

        // calculate the new cursor position:
        diff_x = x - event.clientX;
        diff_y = y - event.clientY;
        x = event.clientX;
        y = event.clientY;

        // set the element's new position:
        element.draggable.style.top = (element.draggable.offsetTop - diff_y) + "px";
        element.draggable.style.left = (element.draggable.offsetLeft - diff_x) + "px";
    }


    // defines what to do when element is released
    function endDrag(event) {
        event = event || window.event;
        event.preventDefault();

        // stop moving when mouse button is released:
        document.onmouseup = null;
        document.onmousemove = null;


        if (element instanceof DraggableIngredientInstance)
            checkIfDraggedInPizza(); // check overlap with every existing pizza

        else if (element instanceof DraggablePizzaInstance) {
            checkIfDraggedInOven(); // check overlap with every oven
            checkIfDraggedInOrder(); // check overlap with every order element
        }
    }
    // -------------------------------

    function checkIfDraggedInOrder() {
        orderList.forEach(function(item, index, array){

            if (checkOverlap(element.draggable, item.gameElement)){

                item.deliver(element)
            }
        });
    }

    function checkIfDraggedInPizza() {
        for (let i = 0; i < document.getElementById("pizza_layer").childElementCount; i++) {

            if (checkOverlap(element.draggable, document.getElementById("pizza_layer").children.item(i))) {

                element.whenDraggedInPizza(existingDraggablePizzaInstances[i])
            }
        }
    }

    function checkIfDraggedInOven() {
        ovenList.forEach(function(item, index, array){

            if (checkOverlap(element.draggable, item.gameElement.image)) {

                element.whenDraggedInOven(item);
            }
        });
    }
}

function pullNewIngredient(ingredientIndex){
    const draggable = availableIngredients[ingredientIndex].createDraggableInstance().draggable;
    const event = window.event;
    event.preventDefault();

    // set element position to cursor. Teig wird direkt als angefangene Pizza erstellt, deshalb anders behandelt
    draggable.style.left = draggable.tagName === "IMG" ? event.clientX + scrollX - draggable.width/2 + "px" : event.clientX + scrollX - draggable.firstChild.width/2 + "px";
    draggable.style.top = draggable.tagName === "IMG" ? event.clientY + scrollY - draggable.height/2 + "px" : event.clientY + scrollY - draggable.firstChild.height/2 + "px";
}

function checkOverlap(draggable, destination) {
    const draggable_box = draggable.getBoundingClientRect();
    const destination_box = destination.getBoundingClientRect();

    //center-coordinates of the draggable element
    const draggable_centerX = draggable_box.left + (draggable_box.right - draggable_box.left)/2;
    const draggable_centerY = draggable_box.top + (draggable_box.bottom - draggable_box.top)/2;

    //are they overlapping in X or Y ?
    const isOverlapX = (draggable_centerX > destination_box.left && draggable_centerX < destination_box.right);
    const isOverlapY = (draggable_centerY > destination_box.top && draggable_centerY < destination_box.bottom);

    return isOverlapX && isOverlapY;
}

function alignDraggableToDestination(draggable, destination) {

    const draggable_box = draggable.getBoundingClientRect();
    const destination_box = destination.getBoundingClientRect();

    const x = destination_box.left + (destination_box.width - draggable_box.width) / 2
    const y = destination_box.top + (destination_box.height - draggable_box.height) / 2

    //Align pizza and oven position
    draggable.style.left = x + "px";
    draggable.style.top = y + "px";
}


// PIZZA-VALIDATION & POINTS ------------------------------------------------------------------------------------------

function validatePizza(order, element, isBaked) {

    //ich frage is baked im moment nur hier ab und lasse es nicht vom server validieren
    //dies mache ich nur, da ich im moment keine zeit hab, mich mit imaginären nullpointerexeptions auseinander zu setzten
    if (!isBaked)
        return

    //Pizza JSON creation
    let pizzaJson = '{"pizzaName": "' + order.getName() + '",\n' +
       // '"bakingState:": "' + isBaked + '",\n' +
        '"ingredients": [';
    let collection = element.children;
    Array.from(collection).forEach(function (element) {
        pizzaJson += '\n"' + element.alt + '",'
    });
    pizzaJson = pizzaJson.substring(0, pizzaJson.length - 1) + '\n]\n}'

    fetch("/pizza_rush/validate_pizza", {
        method: 'POST',
        body: pizzaJson,
        headers: {
            "Content-Type": "application/json"
        },
        credentials: 'include'
    }).then(updateCurrentPoints)
        .catch((error) => {
        console.error('Error:', error);
    });
}

function updateCurrentPoints() {
    let returnedPoints = -1;
    fetch("/pizza_rush/get_current_points")
        .then(
            result => result.text()
        ).then(
        result => {
            returnedPoints = parseInt(result);
            document.getElementById("currentlyDisplayedPoints").textContent = "Points: " + returnedPoints;
        }
    ).catch((error) => {
        console.error('Error:', error);
    });

}

function resetPoints() {
    fetch("/pizza_rush/reset_points",{
        method: 'POST',
        credentials: "include"
    }).then(updateCurrentPoints)
        .catch((error) =>{console.log('Error', error)})

    orderList.forEach(function (item, index, array){

        item.gameElement.remove();
        item.createGameElement();
        item.startAnimation();
    })
}


// COUNTDOWN-STUFF ----------------------------------------------------------------------------------------------------

// diese Klasse soll ein Java-Interface simulieren
// spezifische Countdown-Anwendungen erben von dieser Klasse und müssen nurnoch die drei methoden "onCountdownX()" überschreiben
class CountdownInterface {

    constructor(durationInSeconds, affectedObject) {
        this.durationInSeconds = durationInSeconds;
        this.secondsPassed = 0;

        this.affectedObject = affectedObject;

    }

    durationInSeconds;
    secondsPassed;

    affectedObject;


    // do not override this method
    startCountdown(){
        this.onCountdownStart(); // behavior to be specified in concrete class

        // Update the countdown every 1 second
        let x = setInterval(() => {
            this.secondsPassed += 1;

            if (this.secondsPassed >= this.durationInSeconds) {
                    this.onCountdownEnd(); // behavior to be specified in concrete class
                    clearInterval(x);

            } else {
                this.onCountdownInterval() // behavior to be specified in concrete class
            }
        }, 1000); // 1000 millisecond (= 1 second) interval
    }

    // Override this method in concrete class
    onCountdownStart() {
        alert("onCountdownStart() hasn't been overridden for this countdown type")
    }

    // Override this method in concrete class
    onCountdownInterval() {
        alert("onCountdownInterval() hasn't been overridden for this countdown type")
    }

    // Override this method in concrete class
    onCountdownEnd() {
        alert("onCountdownEnd() hasn't been overridden for this countdown type")
    }
}



let timerActive = false;

function manageRushCountdown(seconds, timerContainerId){
    if (!timerActive){

        resetPoints();

        class RushCountdown extends CountdownInterface { // Hier wird die spezifische RushCountdown Klasse definiert

            // @Override
            onCountdownStart() {
                timerActive = true;
                document.getElementById("startStop_overlay").style.display='none';

                orderList.forEach(function(item, index, array){
                    item.startAnimation();
                })
            }

            // @Override
            onCountdownInterval() {
                // Time calculations
                let secondsLeft = this.durationInSeconds - this.secondsPassed;
                let minutes = "" + Math.floor(secondsLeft/60);
                let seconds = "" + secondsLeft - minutes*60;
                if (seconds.toString().length < 2)
                    seconds = "0" + seconds;

                // Display the result in the affectedObject
                this.affectedObject.innerHTML = "Time: " + minutes + ":" + seconds;
            }

            // @Override
            // Hier könnte später die PizzaRush Runde beendet werden
            onCountdownEnd() {
                timerActive = false;
                document.getElementById("startStop_overlay").style.display='block';
                document.getElementById("startStop_overlay_text").innerHTML="Round over!<br />Click to play again";
                this.affectedObject.innerHTML = "END";
            }
        }

        new RushCountdown(seconds, document.getElementById(timerContainerId)).startCountdown(); // Countdown wird gestartet
    }
}