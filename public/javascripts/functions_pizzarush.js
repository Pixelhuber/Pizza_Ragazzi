// An "Ingredient" is only a definition of an ingredient without any behavior.
class Ingredient {

    constructor(name, image) {
        this.name = name; // attributes
        this.image = image;
    }

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
        }

        this.draggable = draggable;

        makeDraggable(this);
    }

    setIsDragEnabled(boolean) {
        this.isDragEnabled = boolean;
    }

    whenDraggedInOrder(order) {

        alert("Delivered: " + this.getName() + "\nOrdered: " + order.name)
        this.draggable.remove();
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

    constructor() {
        super();

        this.updateDiv();
        existingPizzas.push(this);
        document.getElementById("pizza_layer").appendChild(this.draggable);

        this.isBaked = false;
        this.isDragEnabled = true;
    }

    draggable; // Actual draggable html-element
    isDragEnabled;
    isBaked;

    static findExistingPizzaByDiv(div) {
        existingPizzas.forEach(function(item, index, array){
            if (item.draggable === div)
                return item;
        })

        return undefined;
    }

    bake() {
        class BakingTimer extends CountdownInterface {

            onCountdownStart() {
                this.affectedObject.setIsDragEnabled(false);
            }

            onCountdownInterval() {
                // irgendein Zeit-Indikator
            }

            onCountdownEnd() {
                this.affectedObject.setIsDragEnabled(true);
                this.affectedObject.isBaked = true
            }
        }

        new BakingTimer(this.bakingTimeInSeconds, this).startCountdown();
    }

    setIsDragEnabled(boolean) {
        this.isDragEnabled = boolean;
    }

    getName() {
        // temporary return values
        if (this.isBaked)
            return "unknown baked Pizza"
        else
            return "unknown unbaked Pizza"
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

        // Server validates pizza and updates points
        validatePizza(this.draggable);

        alert("Delivered: " + this.getName() + "\nOrdered: " + order.name)
        existingPizzas.splice(existingPizzas.indexOf(this), 1);
        this.draggable.remove();
        return;
    }

    whenDraggedInOven(oven) {

        alignDraggableToDestination(this.draggable, oven);
        this.bake();
    }
}

// pizza & draggablePizzaInstance class above
// --------------------------------------------------------------------------------------------------------------------

class Order{

    constructor(name, points, timeInSeconds, requestedPizza) {
        this.name = name;
        this.points = points;
        this.time = timeInSeconds;
        if (requestedPizza instanceof Pizza)
            this.pizza = requestedPizza;
    }
}

// order class above
// --------------------------------------------------------------------------------------------------------------------

let availableIngredients = [    new Ingredient("Impasto", "/assets/images/teig.png"),
                                new Ingredient("Formaggio", "/assets/images/formaggio.png"),
                                new Ingredient("Pomodoro", "/assets/images/pomodoro.png"),
                                new Ingredient("Salame", "/assets/images/salame.png")];

let orderList = [               new Order("Margarita", 10, 30),
                                new Order("Salame", 15, 30),
                                new Order("Salame", 15, 30)];

let existingPizzas = [          ];

// --------------------------------------------------------------------------------------------------------------------

// called at startup
function populateIngredientSection(){
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

// called at startup
function populateOrderSection(){
    orderList.forEach(function(item, index, array){
        const order = document.createElement('div');

        order.setAttribute('class', 'box order');

        order.innerHTML = item.name;
        document.getElementById('orderSection').getElementsByClassName('scroll_container').item(0).appendChild(order);
    })
}

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

        checkIfDraggedInOrder(); // check overlap with every order element

        if (element instanceof DraggableIngredientInstance)
            checkIfDraggedInPizza(); // check overlap with every existing pizza

        if (element instanceof DraggablePizzaInstance)
            checkIfDraggedInOven(); // check overlap with every oven
    }

    function checkIfDraggedInOrder() {
        orderList.forEach(function(item, index, array){

            if (checkOverlap(element.draggable, document.getElementsByClassName("order").item(index))){

                element.whenDraggedInOrder(orderList[index]); // notify the object
            }
        });
    }

    function checkIfDraggedInPizza() {
        for (let i = 0; i < document.getElementById("pizza_layer").childElementCount; i++) {

            if (checkOverlap(element.draggable, document.getElementById("pizza_layer").children.item(i))) {

                element.whenDraggedInPizza(existingPizzas[i])
            }
        }
    }

    function checkIfDraggedInOven() {
        for (let i = 0; i < document.getElementsByClassName("oven").length; i++) {

            if (checkOverlap(element.draggable, document.getElementsByClassName("oven").item(i))) {

                element.whenDraggedInOven(document.getElementsByClassName("oven").item(i))
            }
        }
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

function validatePizza(element) {

    //Pizza JSON creation TODO: enter correct pizza name instead of salame
    let pizzaJson = '{"pizzaName": "' + 'Salame' + '",\n "ingredients": [';
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
}


// COUNTDOWN-STUFF ----------------------------------------------------------------------------------------------------

// diese Klasse soll ein Java-Interface simulieren
// spezifische Countdown-Anwendungen erben von dieser Klasse und müssen nurnoch die drei methoden "onCountdownX()" überschreiben
class CountdownInterface {

    constructor(seconds, affectedObject) {
        this.seconds = seconds;
        this.affectedObject = affectedObject;

        // Set the date we're counting down to
        this.countDownDate = new Date();
        this.countDownDate.setSeconds(this.countDownDate.getSeconds() + seconds);
    }

    seconds;
    affectedObject;

    countDownDate;
    distance;

    // do not override this method
    startCountdown(){
        this.onCountdownStart(); // behavior to be specified in concrete class

        // Update the countdown every 1 second
        let x = setInterval(() => {
            let now = new Date().getTime();

            // Find the distance between now and the countdown date
            this.distance = this.countDownDate - now;

            if (this.distance < 1) {
                clearInterval(x);
                this.onCountdownEnd(); // behavior to be specified in concrete class
            } else {
                this.onCountdownInterval() // behavior to be specified in concrete class
            }
        }, 1000);
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

        class RushCountdown extends CountdownInterface { // Hier wird die spezifische RushCountdown Klasse definiert

            // @Override
            onCountdownStart() {
                timerActive = true;
                document.getElementById("startStop_overlay").style.display='none';
            }

            // @Override
            onCountdownInterval() {
                // Time calculations
                let minutes = Math.floor((this.distance % (1000 * 60 * 60)) / (1000 * 60));
                let seconds = Math.floor((this.distance % (1000 * 60)) / 1000);

                if (seconds < 10){
                    seconds = "0" + seconds;
                }

                // Display the result in the affectedObject
                this.affectedObject.innerHTML = "Time: " + minutes + ":" + seconds;
            }

            // @Override
            // Hier könnte später die PizzaRush Runde beendet werden
            onCountdownEnd() {
                timerActive = false;
                document.getElementById("startStop_overlay").style.display='block';
                document.getElementById("startStop_overlay_text").innerHTML="Round over !<br />Click to play again";
                this.affectedObject.innerHTML = "END";
            }
        }

        resetPoints();
        new RushCountdown(seconds, document.getElementById(timerContainerId)).startCountdown(); // Countdown wird gestartet
    }
}