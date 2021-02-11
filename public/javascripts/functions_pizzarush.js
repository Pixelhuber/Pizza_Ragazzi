class AudioPlayer {

    static mash() {
        const sound = document.createElement("AUDIO");
        sound.setAttribute('src', "/assets/sounds/mash_kürzer.wav");
        sound.setAttribute('type', "audio/wav");
        sound.volume = 0.4;
        sound.play();
    }

    static fire() {
        const sound = document.createElement("AUDIO");
        sound.setAttribute('src', "/assets/sounds/epic_fire.wav");
        sound.setAttribute('type', "audio/wav");
        sound.volume = 0.4;
        sound.play();
    }

    static short_ring() {
        const sound = document.createElement("AUDIO");
        sound.setAttribute('src', "/assets/sounds/short_ring.wav");
        sound.setAttribute('type', "audio/wav");
        sound.volume = 0.4;
        sound.play();
    }

    static ingredient_hit() {
        const sound = document.createElement("AUDIO");
        sound.setAttribute('src', "/assets/sounds/ingredient_hit.wav");
        sound.setAttribute('type', "audio/wav");
        sound.volume = 0.4;
        sound.play();
    }

    static ingredient_finalHit() {
        const sound = document.createElement("AUDIO");
        sound.setAttribute('src', "/assets/sounds/ingredient_finalHit.wav");
        sound.setAttribute('type', "audio/wav");
        sound.volume = 0.4;
        sound.play();
    }

    static distraction_hit() {
        const sound = document.createElement("AUDIO");
        sound.setAttribute('src', "/assets/sounds/distraction_hit.wav");
        sound.setAttribute('type', "audio/wav");
        sound.volume = 0.4;
        sound.play();
    }

    static throw() {
        const sound = document.createElement("AUDIO");
        sound.setAttribute('src', "/assets/sounds/ingredient_throw.wav");
        sound.setAttribute('type', "audio/wav");
        sound.volume = 0.4;
        sound.play();
    }
}


// An "Ingredient" is only a definition of an ingredient without any behavior.
class Ingredient {

    // ATTRIBUTES --------------------
    id;
    name;
    image_path;
    flight_behavior;

    constructor(id, name, image_path, flight_behavior) {
        this.id=id;
        this.name = name; // attributes
        this.image_path = image_path;
        this.flight_behavior = flight_behavior;
    }


    createDraggableInstance() {
        if (this.name === "Impasto")
            return new DraggablePizzaInstance();
        else
            return new DraggableIngredientInstance(this);
    }

    createImg() {
        const ret = document.createElement('img');

        ret.setAttribute('src', this.image_path);
        ret.setAttribute('alt', this.name);
        ret.setAttribute('height', '100px');
        ret.setAttribute('width', '100px');

        switch (this.name) {
            case "Pomodoro":    ret.style.zIndex = "11";
                break;
            case "Formaggio":   ret.style.zIndex = "12";
                break;
            case "Salame":      ret.style.zIndex = "13";
                break;
            case "Funghi":      ret.style.zIndex = "14";
                break;
        }

        return ret;
    }

    getName() {
        return this.name;
    }

    getId(){
        return this.id;
    }

    //returns an instance of the ingredient with this name
    static getInstanceByName(name) {
        let ret = undefined

        availableIngredients.forEach(function(item, index, array) {
            if (name === item.name)
                ret = item;
        });

        return ret;
    }
}

// A "DraggableIngredientInstance" is an actual Ingredient you can interact with and drag around
class DraggableIngredientInstance extends Ingredient {

    // ATTRIBUTES --------------------

    draggable; // Actual draggable html-element
    isDragEnabled;

    constructor(ingredient) {
        super(ingredient.id, ingredient.name, ingredient.image_path);
        this.createDraggable();
        this.isDragEnabled = true;
    }


    createDraggable() {
        const draggable = this.createImg();

        draggable.setAttribute('class', 'draggable');

        document.getElementById("ingredient_layer").appendChild(draggable);
        this.draggable = draggable;

        makeDraggable(this);
    }

    // utility to disable dragging temporarily
    setIsDragEnabled(boolean) {
        this.isDragEnabled = boolean;
    }

    whenDraggedInPizza(pizza) {

        //Play sound
        AudioPlayer.mash();

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
// Example: A "Pizza" is something on the menu in the restaurant
//          A "DraggablePizzaInstance" is on a plate and can be manipulated (and eaten)
class Pizza {

    // ATTRIBUTES --------------------

    ingredients = [];

    // When created, a new pizza is simply a piece of dough. More ingredients get added while playing.
    constructor() {
        this.ingredients.push(Ingredient.getInstanceByName("Impasto"))
    }

    getIngredientIds(){
        let ingredientIds = [];

        this.ingredients.forEach(function (value){
            ingredientIds.push(value.getId())
        })
        return ingredientIds
    }
}

// A "DraggablePizzaInstance" is the actual Pizza you can interact with and drag around
class DraggablePizzaInstance extends Pizza {

    // ATTRIBUTES --------------------

    draggable; // Actual draggable html-element

    bakingTimeInSeconds; // required baking time
    timeInOvenInMilliseconds = 0; // actual time spent in oven

    isInOven;
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
        this.bakingTimeInSeconds = 5;
    }


    static findExistingPizzaByDiv(div) {
        existingDraggablePizzaInstances.forEach(function(item, index, array){
            if (item.draggable === div)
                return item;
        })

        return undefined;
    }

    // utility to disable dragging temporarily
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

    // returns an updated <div> with all the ingredients in it
    updateDiv() {
        const pizzaDiv = document.createElement("div");

        pizzaDiv.setAttribute('class', 'draggable');

        this.ingredients.forEach(function(item, index, array){

            const ingr = item.createImg();
            ingr.style.position = "absolute";
            //ingr.setAttribute('style', 'position: absolute');

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

    whenDraggedInOrder(order) {

        existingDraggablePizzaInstances.splice(existingDraggablePizzaInstances.indexOf(this), 1);
        this.draggable.remove();
    }

    whenDraggedInOven(oven) {

        this.ovenIn();
        oven.bake(this);
        alignDraggableToDestination(this.draggable, oven.gameElement.image);


    }

    ovenIn() {
        this.isInOven = true;
    }

    ovenOut() {
        this.isInOven = false;

        // determine bakeStatus of the pizza
        const difference = this.bakingTimeInSeconds - this.timeInOvenInMilliseconds/1000;
        if (difference > 0)
            this.bakeStatus = 0;
        else if (difference < -7)
            this.bakeStatus = 2;
        else
            this.bakeStatus = 1;

        console.log("pizza baked: " + this.bakeStatus);
    }
}

// pizza & draggablePizzaInstance class above
// --------------------------------------------------------------------------------------------------------------------

class Oven {

    // ATTRIBUTES --------------------

    gameElement; //in game representation of the oven

    constructor() {
        this.gameElement = document.createElement('div');
        this.gameElement.image = document.createElement('img');

        this.gameElement.setAttribute('class', "oven unclickable");
        this.gameElement.image.setAttribute('src', "/assets/images/oven.png");
        this.gameElement.image.setAttribute('alt', "Oven");

        this.gameElement.appendChild(this.gameElement.image);

        // Creating an oven instance automatically displays it
        document.getElementById("oven_container").appendChild(this.gameElement);
    }


    // baking animation, manipulating the oven timer AND the pizza inside the oven
    bake(pizza) {

        // Play sound
        AudioPlayer.fire();

        const oven = this;
        let start;

        // creating the timer element <p> --------------------------------------
        const timer = document.createElement('p');
        timer.setAttribute('style',
            "position: absolute; " +
            "z-index: 20; " +
            "font-size: 2em");
        timer.setAttribute('class', "unclickable");
        timer.innerText = pizza.bakingTimeInSeconds;

        this.gameElement.appendChild(timer);

        // BAKING TIMER ANIMATION ----------------------------------------------
        let lastTimestamp;

        // this method describes one animation step
        function bakingAnimation(timestamp) {
            if (start === undefined){
                start = timestamp;
                lastTimestamp = timestamp;
            }
            const elapsed = timestamp - start; // elapsed = time passed since animation start [milliseconds]

            // manipulate pizza: increment timeInOvenInMilliseconds
            const differenceSinceLastAnimationFrame = timestamp - lastTimestamp;
            pizza.timeInOvenInMilliseconds += differenceSinceLastAnimationFrame;

            // manipulate timer: update the timer
            const timerCount = (Math.floor(pizza.bakingTimeInSeconds - pizza.timeInOvenInMilliseconds/1000 + 1));
            if (timerCount > 0)
                timer.innerText = timerCount.toString();
            else if (timerCount > -4)
                timer.innerText = "DONE";
            else if (timerCount > -7)
                timer.innerText = "!!!"
            else
                timer.innerText = "BURNT"

            // Decide whether to stop animation or not
            if (!pizza.isInOven) { // pizza.ovenOut() method sets isInOven to false when pizza is dragged out of oven
                // stop animation
                timer.remove();
            }
            else {
                // continue animation (a.k.a. continue baking)
                lastTimestamp = timestamp;
                window.requestAnimationFrame(bakingAnimation);
            }
        }

        window.requestAnimationFrame(bakingAnimation); // this command initially starts the animation
    }
}

// oven class above
// --------------------------------------------------------------------------------------------------------------------

class Order {

    // ATTRIBUTES --------------------

    name; // name to display in game
    requestedPizza; // pizza used for validation [Pizza.class]

    points;
    timeInSeconds; // time before order expires

    gameElement; //in game representation of the order

    constructor(name, points, timeInSeconds, ingredients) {
        this.name = name;
        this.points = points;
        this.timeInSeconds = timeInSeconds;
        this.requestedPizza=new Pizza()
        this.requestedPizza.ingredients=[]
        this.requestedPizza.ingredients.push.apply(this.requestedPizza.ingredients,ingredients)
        console.log(this.requestedPizza.ingredients)
    }


    deliver(pizza) {

        // Play sound
        AudioPlayer.short_ring();

        pizza.whenDraggedInOrder(this);

        // Server validates pizza and updates points
        validatePizza(this, pizza);

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
// OBJECT COLLECTIONS -------------------------------------------------------------------------------------------------

const availableIngredients = [                ];

const orderList = [                 ];

const ovenList = [                  ];

const existingDraggablePizzaInstances = [];


async function setupAvailableIngredients() {
    const ingredients = await getAvailableIngredients(); //ingredients Json-Array fetchen
    console.log(ingredients);

    ingredients.forEach(function(item) {                                  // Json-Array in availableIngredients-Array
        availableIngredients.push(new Ingredient(item.id, item.name, item.picture_raw, {
            vertex_x_inPercent: item.vertex_x_inPercent,
            vertex_y_inPercent: item.vertex_y_inPercent,
            speed: item.speed,
            rotation: item.rotation,
            hits_required: 3                        //TODO: hits_required vielleicht auch in Datenbank speichern
        }));
    });
}

async function  setupAvailablePizzas() {
    const orders = await getAvailablePizzas();

    orders.forEach(function(item) {
        orderList.push(new Order(item.name, item.points, 80, item.ingredients))  //TODO: timeInSeconds vielleicht auch in Datenbank speichern
    });

    orderList.forEach(function(item){
        item.createGameElement();
    })
}

async function getAvailableIngredients() {
    let response = await fetch("pizza_rush/getAvailableIngredients");
    return response.json();
}

async function getAvailablePizzas() {
    let response = await fetch("pizza_rush/getAvailablePizzas");
    return response.json();
}

// AT STARTUP ---------------------------------------------------------------------------------------------------------

// called at startup
async function loadGameElements() {
    await setupAvailableIngredients();
    await setupAvailablePizzas();

    document.getElementById("loading").style.display='none';

    loadIngredientSection();
    loadOvens();
}

function loadIngredientSection(){

    availableIngredients.forEach(function(item, index, array){
        // simply create the <div> element

        const ingredient = document.createElement('div');
        const image = document.createElement('img');
        const name = document.createElement('div')

        ingredient.setAttribute('class', 'box ingredientSectionItem');
        ingredient.setAttribute('onmousedown', 'pullNewIngredient(' + index + ')');

        image.setAttribute('src', item.image_path);

        name.innerText = item.name;

        ingredient.appendChild(image);
        ingredient.appendChild(name);

        document.getElementById('ingredientSection').getElementsByClassName('scroll_container').item(0).appendChild(ingredient);
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


// FUNCTIONALITY & BEHAVIOR -------------------------------------------------------------------------------------------

function makeDraggable(element) {
    let diff_x = 0, diff_y = 0, x = 0, y = 0;

    if (!(element instanceof DraggableIngredientInstance || element instanceof DraggablePizzaInstance))
        alert("this element is not a DraggableIngredientInstance or a DraggablePizzaInstance");

    // if element is pressed down -> start dragging
    element.draggable.onmousedown = initiateDrag;

    function initiateDrag(event) {
        if (!element.isDragEnabled)
            return;

        if (element.isInOven)
            element.ovenOut();

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
        existingDraggablePizzaInstances.forEach(function(currentPizza, index, array){

            if (currentPizza.timeInOvenInMilliseconds < 1.5*1000) // you can only assemble (nearly) raw pizzas -> prevents cheating
                if (checkOverlap(element.draggable, currentPizza.draggable))
                    element.whenDraggedInPizza(currentPizza);
        });
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

function rotateCoordinates(shape, pivot, angle) {

    // translate coordinates so that pivot is at 0x0
    for (let i = 0; i < shape.length; i++){
        shape[i][0] -= pivot[0];
        shape[i][1] -= pivot[1];
    }

    // rotation around 0x0
    for (let i = 0; i < shape.length; i++){
        const tmp = [];
        tmp[0] = shape[i][0] * Math.cos(angle) - shape[i][1] * Math.sin(angle);
        tmp[1] = shape[i][1] * Math.cos(angle) + shape[i][0] * Math.sin(angle);

        shape[i][0] = tmp[0];
        shape[i][1] = tmp[1];
    }

    // translate coordinates so that pivot is back in original position
    for (let i = 0; i < shape.length; i++){
        shape[i][0] += pivot[0]
        shape[i][1] += pivot[1]
    }

    return shape;
}

function isInside(point, shape) {
    // ray-casting algorithm based on
    // https://wrf.ecse.rpi.edu/Research/Short_Notes/pnpoly.html/pnpoly.html

    const x = point[0], y = point[1];

    let inside = false;
    for (let i = 0, j = shape.length - 1; i < shape.length; j = i++) {
        const xi = shape[i][0], yi = shape[i][1];
        const xj = shape[j][0], yj = shape[j][1];

        const intersect = ((yi > y) !== (yj > y))
            && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
    }

    return inside;
}


// PIZZA-VALIDATION & POINTS ------------------------------------------------------------------------------------------

function validatePizza(order, pizza) {

    console.assert(pizza instanceof DraggablePizzaInstance);
    console.assert(order instanceof Order);

    fetch("/pizza_rush/validate_pizza", {
        method: 'POST',
        body: JSON.stringify({
            orderPoints:order.points,
            orderIngredientIds:order.requestedPizza.getIngredientIds(),

        }),
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
class AbstractCountdown {

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

        class RushCountdown extends AbstractCountdown { // Hier wird die spezifische RushCountdown Klasse definiert

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

// FRUIT NINJA --------------------------------------------------------------------------------------------------------

function startMiniGame(ingredientList) {

    document.getElementById("miniGame_layer").style.visibility = "visible";

    const miniGame_window = document.createElement('div');
    miniGame_window.setAttribute('class', "miniGame_window");

    const playArea = document.createElement('div');
    playArea.setAttribute('class', "miniGame_playArea");

    const sideBar = document.createElement('div');
    sideBar.setAttribute('class', "miniGame_sideBar");

    miniGame_window.appendChild(playArea);
    miniGame_window.appendChild(sideBar);

    document.getElementById("miniGame_layer").replaceChild(miniGame_window, document.getElementById("miniGame_layer").firstChild);


    fruit_ninja();


    function fruit_ninja() {

        // an instance of this class handles the throw of ONE ingredient
        class AbstractThrower {

            // ATTRIBUTES -----------------

            // stays the same for every throw
            element;
            ingredient_image;
            context;

            kurtosis; // defines how wide or narrow the parable trajectory is
            speed; // self explanatory [no specific value]
            rotation_increment; // speed of rotation [in degrees]



            // changes for every throw
            vertex_x_inPercent; // x-coordinate of highpoint of the throw-trajectory [in percent of canvas.width]
            vertex_y_inPercent; // y-coordinate of highpoint of the throw-trajectory [in percent of canvas.height]

            // changes constantly DURING throw
            x = -100;
            y = 0;
            rotation = 0;

            // -----
            ingredientJuggler


            constructor(element, context) {
                this.element = element;
                this.context = context;

                this.kurtosis = 0.05;
                this.speed = element.flight_behavior.speed;
                this.rotation_increment = element.flight_behavior.rotation;
            }


            newThrow() {

                this.defineNewTrajectory();
                this.startThrow();
            }

            // this method sets up all variables for the next throw
            defineNewTrajectory() {

                // prepare values for next throw --------------------

                // new coordinates of highpoint
                this.vertex_x_inPercent = this.randomize(this.element.flight_behavior.vertex_x_inPercent, 80);
                this.vertex_y_inPercent = this.randomize(this.element.flight_behavior.vertex_y_inPercent, 25);
                this.rotation = 0;

                // set the initial x to the value where y is 100px under the canvas
                // this is to prevent the trajectory from starting extremely far off screen
                this.x = this.parableYGiven(
                    canvas.height + 100,
                    this.kurtosis,
                    canvas.width * (this.vertex_x_inPercent/100),
                    canvas.height * (1 - (this.vertex_y_inPercent/100))
                )


                // randomly set flight direction (left -> right / right <- left)
                if (Math.random() > 0.5){ // 50:50
                    this.speed = -1 * this.element.flight_behavior.speed; // element will fly reversed
                    this.x = canvas.width * (this.vertex_x_inPercent/100) + (canvas.width * (this.vertex_x_inPercent/100) - this.x);
                } else {
                    this.speed = this.element.flight_behavior.speed;
                    // leave this.x as it is
                }
                this.x = Math.max(this.x, -100);
                this.x = Math.min(this.x, canvas.width + 100)

                // randomly set rotation direction
                if (Math.random() > 0.5) // 50:50
                    this.rotation_increment = - this.element.flight_behavior.rotation;
                else
                    this.rotation_increment = this.element.flight_behavior.rotation;
            }

            startThrow() {}

            endThrow() {}

            // calculate next position and draw on canvas
            step() {

                // calculating y with parable function
                this.y = this.parableXGiven(
                    this.x,
                    this.kurtosis,
                    canvas.width * (this.vertex_x_inPercent/100),
                    canvas.height * (1 - (this.vertex_y_inPercent/100))
                );

                this.context.save();

                // set rotation center of canvas-context to coordinates of the ingredient
                this.context.translate(this.x, this.y);

                // rotate the canvas to the specified degrees
                this.context.rotate(this.rotation*Math.PI/180);
                this.rotation = (this.rotation + this.rotation_increment) % 360;

                // draw the image
                // since the context is rotated, the image will be rotated as well
                this.context.drawImage(this.ingredient_image,-this.ingredient_image.width/2,-this.ingredient_image.width/2);

                this.context.restore();

                this.x += this.speed;

                if (this.y > canvas.height + 150 || this.x < -150 || this.x > canvas.width + 150)
                    this.endThrow();
            }

            // form:  cur * (x - ver_x)^2 + ver_y
            parableXGiven(x, cur, ver_x, ver_y) {
                return cur * Math.pow(x - ver_x, 2) + ver_y;
            }

            // form:  -((x - ver_y)/cur)^0.5 + ver_x
            parableYGiven(y, cur, ver_x, ver_y) {
                return - Math.pow((y - ver_y) / cur, 0.5) + ver_x;
            }

            randomize(value, range) {

                const value_min = Math.max(value - range/2, 10);
                const value_max = Math.min(value + range/2, 90);

                const tmp = value_max - value_min; // Maximum value you can add to value_min

                return value_min + Math.random() * tmp; // 0 <= Math.random() < 1
            }

            isHit(cursorX, cursorY) {

                if (!this.wasHitInThisThrow)
                    return isInside([cursorX, cursorY], this.getShapeCoordinates());
                else
                    return false;
            }

            onHit() {}

            getShapeCoordinates() {
                let lu = [this.x - this.ingredient_image.width/2, this.y - this.ingredient_image.height/2];
                let lo = [this.x - this.ingredient_image.width/2, this.y + this.ingredient_image.height/2];
                let ro = [this.x + this.ingredient_image.width/2, this.y + this.ingredient_image.height/2];
                let ru = [this.x + this.ingredient_image.width/2, this.y - this.ingredient_image.height/2];

                const shape = [lu, lo, ro, ru];

                return rotateCoordinates(shape, [this.x, this.y], this.rotation)
            }
        }

        class IngredientThrower extends AbstractThrower {

            // changes during play
            wasHitInThisThrow = false;
            hits_left; // how many hits until it is chopped


            constructor(element, context) {
                super(element, context);

                this.ingredient_image = document.createElement('img');
                this.ingredient_image.setAttribute('src', element.image_path);

                this.hits_left = element.flight_behavior.hits_required;
            }

            setupWithIngredientJuggler(juggler) {
                this.ingredientJuggler = juggler;
            }

            startThrow() {

                this.wasHitInThisThrow = false;

                // tell juggler, you can't be thrown again
                const index = this.ingredientJuggler.ingredientsWaitingToBeThrown.indexOf(this);
                this.ingredientJuggler.ingredientsWaitingToBeThrown.splice(index, 1);

                // tell juggler to either throw yourself OR a distraction
                if (Math.random() < 0.1)
                    this.ingredientJuggler.ingredientsCurrentlyInAir.push(this.createDistraction());
                else
                    this.ingredientJuggler.ingredientsCurrentlyInAir.push(this);

            }

            endThrow() {

                // tell juggler, you are ready to be thrown again
                const index = this.ingredientJuggler.ingredientsCurrentlyInAir.indexOf(this);
                this.ingredientJuggler.ingredientsCurrentlyInAir.splice(index, 1);
                this.ingredientJuggler.ingredientsWaitingToBeThrown.push(this);
            }

            onHit() {
                this.wasHitInThisThrow = true;
                this.hits_left -= 1;

                if (this.hits_left <= 0) {
                    AudioPlayer.ingredient_finalHit();
                    console.log("Final Hit: " + this.element.name);

                    this.ingredient_image.remove();
                    ingredientJuggler.dropIngredient(this);
                } else {
                    AudioPlayer.ingredient_hit();
                    console.log("Hit: " + this.element.name);
                }
            }

            createDistraction() {

                return new DistractionThrower(this, 3000);
            }
        }

        class DistractionThrower extends AbstractThrower {

            realIngredientThrower;
            disablingTime;

            constructor(ingredientThrower, disablingTime) {
                super(ingredientThrower.element, ingredientThrower.context);

                this.ingredient_image = document.createElement('img');
                this.ingredient_image.setAttribute('src', "assets/images/pomodoro.png");

                this.disablingTime = disablingTime;
                this.realIngredientThrower = ingredientThrower;
                this.ingredientJuggler = ingredientThrower.ingredientJuggler;

                this.defineNewTrajectory();
            }

            endThrow() {

                // tell juggler, the NON-distracting ingredient can be thrown again
                const index = this.ingredientJuggler.ingredientsCurrentlyInAir.indexOf(this);
                this.ingredientJuggler.ingredientsCurrentlyInAir.splice(index, 1);
                this.ingredientJuggler.ingredientsWaitingToBeThrown.push(this.realIngredientThrower);
            }

            onHit() {

                AudioPlayer.distraction_hit();

                console.log("Distraction Hit: " + this.element.name);
                this.ingredientJuggler.disableFor(this.disablingTime);

                this.ingredient_image.remove();
                this.endThrow();
            }
        }

        // this class is responsible for WHAT is thrown, and WHEN
        class IngredientJuggler {

            allIngredientsToJuggle = [];
            ingredientsWaitingToBeThrown = []
            ingredientsCurrentlyInAir = [];

            minDistanceBetweenThrows;
            timestampLastThrow = 0;
            maxIngredientsInAir;

            disableTime = 0;
            lastTimestamp;

            constructor(ingredientList, minDistanceBetweenThrows, maxIngredientsInAir) {
                this.minDistanceBetweenThrows = minDistanceBetweenThrows;
                this.maxIngredientsInAir = maxIngredientsInAir;

                for (let i = 0; i < ingredientList.length; i++) {
                    this.addIngredient(new IngredientThrower(ingredientList[i], context));
                    this.allIngredientsToJuggle[i].setupWithIngredientJuggler(this);
                }
            }

            addIngredient(ingredientThrower) {
                this.allIngredientsToJuggle.push(ingredientThrower);
                this.ingredientsWaitingToBeThrown.push(ingredientThrower);
            }

            dropIngredient(ingredientThrower) {
                this.allIngredientsToJuggle.splice(this.allIngredientsToJuggle.indexOf(ingredientThrower), 1);
                this.ingredientsCurrentlyInAir.splice(this.ingredientsCurrentlyInAir.indexOf(ingredientThrower), 1);
                if (this.ingredientsWaitingToBeThrown.includes(ingredientThrower))
                    this.ingredientsWaitingToBeThrown.splice(this.ingredientsWaitingToBeThrown.indexOf(ingredientThrower), 1);
            }

            nextFrame(timestamp) {

                if (this.disableTime > 0)
                    this.disableTime -= timestamp - this.lastTimestamp

                this.lastTimestamp = timestamp;

                if ((timestamp - this.timestampLastThrow) > this.minDistanceBetweenThrows)
                    if (    this.ingredientsWaitingToBeThrown.length > 0 &&
                            this.ingredientsCurrentlyInAir.length < this.maxIngredientsInAir) {
                        const randomIndex = Math.floor(Math.random() * this.ingredientsWaitingToBeThrown.length);
                        this.ingredientsWaitingToBeThrown[randomIndex].newThrow();
                        this.timestampLastThrow = timestamp;
                    }

                this.ingredientsCurrentlyInAir.forEach(function (item, index, array) {
                    item.step();
                });
            }

            isDisabled() {
                return this.disableTime > 0;
            }

            disableFor(milliseconds) {

                this.disableTime = milliseconds;
            }
        }

        // this class handles all user inputs while playing
        function addHitListener(ingredientJuggler) {

            let x;
            let y;

            canvas.onmousedown = startListening;


            function startListening(event) {
                event = event || window.event;
                event.preventDefault();

                document.onmouseup = stopListening;
                document.onmousemove = checkForHit;
            }

            function stopListening(event) {
                document.onmouseup = null;
                document.onmousemove = null;
            }

            function checkForHit(event) {
                if (ingredientJuggler.isDisabled())
                    return;

                const canvas_box = canvas.getBoundingClientRect();
                x = event.clientX - canvas_box.left;
                y = event.clientY - canvas_box.top;

                ingredientJuggler.ingredientsCurrentlyInAir.forEach(function (item, index, array) {
                    if (item.isHit(x, y))
                        item.onHit();
                })
            }
        }

        // ------------------------------------------------------------------------------------------------------------

        // canvas creation ----
        const canvas = document.createElement('canvas');
        const context = canvas.getContext("2d");

        //window.addEventListener('resize', setCanvasSize, false);
        function setCanvasSize() {
            const playArea_box = playArea.getBoundingClientRect();
            canvas.setAttribute('height', playArea_box.height + "px");
            canvas.setAttribute('width', playArea_box.width + "px");
        }
        setCanvasSize();

        playArea.appendChild(canvas);

        // counter creation -----

        // --------------------

        const testArray = [ Ingredient.getInstanceByName("Formaggio"),
                            Ingredient.getInstanceByName("Funghi"),
                            Ingredient.getInstanceByName("Salame")];

        // --------------------

        const ingredientJuggler = new IngredientJuggler(testArray, 500, 3);
        addHitListener(ingredientJuggler);

        let start;

        function animationStep(timestamp) {
            if (start === undefined)
                start = timestamp;

            // clear the canvas before drawing the next frame
            context.clearRect(0,0, canvas.width, canvas.height);

            // calculating & drawing next frame for every current throw
            ingredientJuggler.nextFrame(timestamp);

            window.requestAnimationFrame(animationStep);
        }

        window.requestAnimationFrame(animationStep); // initially start the game-animation
    }

}