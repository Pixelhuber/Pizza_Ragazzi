
const gameProperties = {
    roundLength: 300,

    maxTimeBetweenOrders: 30,
    orderDelay: 2,
    minOrdersActive: 2,
    ordersActiveWhenStarting: 2,

    pizza_timeUntilBurnt: 7, // additional to regular baking time
    pizza_timeUntilWarning: 4, // additional to regular baking time
    pizza_bakingTime: 5,

    fruitNinja_distractionChance_percent: 10,
    fruitNinja_distractionDisablingTime: 5,
    fruitNinja_maxIngredientsInAir: 6,
    fruitNinja_minTimeBetweenThrows: 0.7,

    whack_distractionChance_percent: 0,
    whack_maxIngredientsShownAtOnce: 2,
    whack_minTimeBetweenShows: 0
}


const availableIngredients = [];

const possibleOrders = [];

const ovenList = [];

const existingDraggablePizzaInstances = [];

const existingDraggableIngredientInstances = [];


// CLASSES ------------------------------------------------------------------------------------------------------------

// An "Ingredient" is only a definition of an ingredient without any behavior.
class AbstractIngredient {

    // ATTRIBUTES --------------------
    id;
    name;
    picture_raw;
    picture_raw_distraction;
    picture_processed;
    picture_baked;
    picture_burnt;

    static picture_type = {
        RAW: 1,
        RAW_DISTRACTION: 2,
        PROCESSED: 3,
        BAKED: 4,
        BURNT: 5
    }

    constructor(id, name, picture_raw, picture_raw_distraction, picture_processed, picture_baked, picture_burnt) {
        this.id = id;
        this.name = name;
        this.picture_raw = picture_raw;
        this.picture_raw_distraction = picture_raw_distraction;
        this.picture_processed = picture_processed;
        this.picture_baked = picture_baked;
        this.picture_burnt = picture_burnt;
    }

    createDraggableInstance() {
        return new DraggableIngredientInstance(this);
    }

    createImg(picture_type) {
        const ret = document.createElement('img');

        switch (picture_type) {
            case 1:
                ret.setAttribute('src', this.picture_raw);
                break;
            case 2:
                ret.setAttribute('src', this.picture_raw_distraction);
                break;
            case 3:
                ret.setAttribute('src', this.picture_processed);
                break;
            case 4:
                ret.setAttribute('src', this.picture_baked);
                break;
            case 5:
                ret.setAttribute('src', this.picture_burnt);
                break;
        }

        ret.setAttribute('alt', this.name);
        ret.setAttribute('width', '110px');
        ret.setAttribute('height', '110px');

        // TODO: Früher oder später müssen wir die z-Indexes der Ingredients in der Datenbank speichern
        switch (this.name) {
            case "Pomodoro":
                ret.style.zIndex = "11";
                break;
            case "Formaggio":
                ret.style.zIndex = "12";
                break;
            case "Salame":
                ret.style.zIndex = "13";
                break;
            case "Prociutto":
                ret.style.zIndex = "14";
                break;
            case "Paprica":
                ret.style.zIndex = "15";
                break;
            case "Funghi":
                ret.style.zIndex = "16";
                break;
            case "Ananas":
                ret.style.zIndex = "17";
                break;
        }

        return ret;
    }

    getName() {
        return this.name;
    }

    getId() {
        return this.id;
    }

    //returns an instance of the ingredient with this name
    static getInstanceByName(name) {
        let ret = undefined

        availableIngredients.forEach(function (item) {
            if (name === item.name)
                ret = item;
        });

        return ret;
    }
}

class ChoppingIngredient extends AbstractIngredient {

    flight_behavior;

    constructor(id, name, picture_raw, picture_raw_distraction, picture_processed, picture_baked, picture_burnt, flight_behavior) {
        super(id, name, picture_raw, picture_raw_distraction, picture_processed, picture_baked, picture_burnt);
        this.flight_behavior = flight_behavior;
    }
}

class StampingIngredient extends AbstractIngredient {

    stamp_behavior;

    constructor(id, name, picture_raw, picture_raw_distraction, picture_processed, picture_baked, picture_burnt, stamp_behavior) {
        super(id, name, picture_raw, picture_raw_distraction, picture_processed, picture_baked, picture_burnt);
        this.stamp_behavior = stamp_behavior;
    }
}

// A "DraggableIngredientInstance" is an actual Ingredient you can interact with and drag around
class DraggableIngredientInstance extends AbstractIngredient {

    // ATTRIBUTES --------------------

    draggable; // Actual draggable html-element

    parentIngredient; // StampingIngredient or ChoppingIngredient

    static Status = {
        RAW: 1,
        PROCESSED: 3,
        BAKED: 4,
        BURNT: 5
    };

    status;
    isDragEnabled;

    constructor(ingredient) {
        super(ingredient.id, ingredient.name, ingredient.picture_raw, ingredient.picture_raw_distraction, ingredient.picture_processed, ingredient.picture_baked, ingredient.picture_burnt);
        this.parentIngredient = ingredient;
        existingDraggableIngredientInstances.push(this);

        this.createDraggable();
        this.isDragEnabled = true;
        this.setStatus(DraggableIngredientInstance.Status.RAW);
    }


    createDraggable() {
        const draggable = this.parentIngredient.createImg(AbstractIngredient.picture_type.RAW);

        draggable.setAttribute('class', 'draggable');

        document.getElementById("ingredient_layer").appendChild(draggable);
        this.draggable = draggable;

        makeDraggable(this);
    }

    delete() {
        this.draggable.remove();
        const index = existingDraggableIngredientInstances.indexOf(this);
        existingDraggableIngredientInstances.splice(index, 1);
    }

    instanceOf(compareClass) {
        return this.parentIngredient instanceof compareClass;
    }

    setStatus(status) {
        this.status = status;

        switch (this.status) {
            case DraggableIngredientInstance.Status.RAW:
                this.draggable.setAttribute('src', this.parentIngredient.picture_raw);
                break;
            case DraggableIngredientInstance.Status.PROCESSED:
                this.draggable.setAttribute('src', this.parentIngredient.picture_processed);
                break;
            case DraggableIngredientInstance.Status.BAKED:
                this.draggable.setAttribute('src', this.parentIngredient.picture_baked);
                break;
            case DraggableIngredientInstance.Status.BURNT:
                this.draggable.setAttribute('src', this.parentIngredient.picture_burnt);
                break;
        }
    }

    // utility to disable dragging temporarily
    setIsDragEnabled(boolean) {
        this.isDragEnabled = boolean;
    }

    whenDraggedInPizza(pizza) {

        //Play sound
        AudioPlayer.mash();

        //Put ingredient on pizza
        pizza.ingredients.push(AbstractIngredient.getInstanceByName(this.getName()));

        pizza.updateDiv();

        //Remove single draggable ingredient
        this.delete();
    }
}

// --------------------------------------------------------------------

// A "Pizza" is only a definition of ingredients without any behavior.
// Example: A "Pizza" is something on the menu in the restaurant
//          A "DraggablePizzaInstance" is on a plate and can be manipulated (and eaten)
class Pizza {

    // ATTRIBUTES --------------------

    ingredients = [];

    // When created, a new pizza is simply a piece of dough. More ingredients get added while playing.
    constructor() {
        this.ingredients.push(AbstractIngredient.getInstanceByName("Impasto"))
    }

    getIngredientIds() {
        let ingredientIds = [];

        this.ingredients.forEach(function (value) {
            ingredientIds.push(value.id)
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

    static bakeStatus = {
        UNBAKED: 3,
        WELL: 4,
        BURNT: 5
    };
    bakeStatus;

    constructor() {
        super();
        this.setBakeStatus(DraggablePizzaInstance.bakeStatus.UNBAKED);

        existingDraggablePizzaInstances.push(this);
        document.getElementById("pizza_layer").appendChild(this.draggable);

        this.isDragEnabled = true;
        this.bakingTimeInSeconds = gameProperties.pizza_bakingTime;
    }



    static findExistingPizzaByDiv(div) {
        existingDraggablePizzaInstances.forEach(function (item) {
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
        switch (this.bakeStatus) {
            case 0:
                return "unknown unbaked pizza";
            case 1:
                return "unknown baked pizza";
            case 2:
                return "unknown burnt pizza"
        }
    }

    // returns an updated <div> with all the ingredients in it
    updateDiv() {

        const pizzaDivUpdated = document.createElement("div");
        const pizzaDivOld = this.draggable;

        const currentBakeStatus = this.bakeStatus;

        pizzaDivUpdated.setAttribute('class', 'draggable');

        this.ingredients.forEach(function (item) {

            const ingredient = item.createImg(currentBakeStatus);
            ingredient.style.position = "absolute";

            pizzaDivUpdated.appendChild(ingredient);
        })

        document.getElementById("pizza_layer").appendChild(pizzaDivUpdated);

        // Sets the size of the <div> to the size of the <img> in it
        // without this, checkOverlap() couldn't calculate the middle point of the <div>
        const child_box = pizzaDivUpdated.firstElementChild.getBoundingClientRect();
        pizzaDivUpdated.style.width = child_box.width + "px";
        pizzaDivUpdated.style.height = child_box.height + "px";

        if (pizzaDivOld !== undefined) {
            alignDraggableToDestination(pizzaDivUpdated, pizzaDivOld);
            document.getElementById("pizza_layer").removeChild(pizzaDivOld);
            pizzaDivOld.remove();
        }

        this.draggable = pizzaDivUpdated;
        makeDraggable(this);
    }

    delete() {
        this.draggable.remove();
        const index = existingDraggablePizzaInstances.indexOf(this);
        existingDraggablePizzaInstances.splice(index, 1);
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

        console.log("pizza baked: " + this.bakeStatus);
    }

    setBakeStatus(bakeStatus) {
        this.bakeStatus = bakeStatus;
        this.updateDiv();
    }

    updateBakeStatus() {
        // determine bakeStatus of the pizza
        const difference = this.bakingTimeInSeconds - this.timeInOvenInMilliseconds / 1000;
        if (difference < -gameProperties.pizza_timeUntilBurnt)
            this.setBakeStatus(DraggablePizzaInstance.bakeStatus.BURNT);
        else if (difference < 0)
            this.setBakeStatus(DraggablePizzaInstance.bakeStatus.WELL);
    }
}

// --------------------------------------------------------------------

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
        timer.setAttribute('style', "position: absolute; z-index: 45; font-size: 2em");
        timer.setAttribute('class', "unclickable");
        timer.innerText = pizza.bakingTimeInSeconds;

        this.gameElement.appendChild(timer);

        // BAKING TIMER ANIMATION ----------------------------------------------
        let lastTimestamp;

        // this method describes one animation step
        function bakingAnimation(timestamp) {
            if (start === undefined) {
                start = timestamp;
                lastTimestamp = timestamp;
            }
            const elapsed = timestamp - start; // elapsed = time passed since animation start [milliseconds]

            // manipulate pizza: increment timeInOvenInMilliseconds
            const differenceSinceLastAnimationFrame = timestamp - lastTimestamp;
            pizza.timeInOvenInMilliseconds += differenceSinceLastAnimationFrame;
            pizza.updateBakeStatus();

            // manipulate timer: update the timer
            console.assert(gameProperties.pizza_timeUntilBurnt > gameProperties.pizza_timeUntilWarning);
            const timerCount = (Math.floor(pizza.bakingTimeInSeconds - pizza.timeInOvenInMilliseconds / 1000 + 1));
            if (timerCount > 0)
                timer.innerText = timerCount.toString();
            else if (timerCount > -gameProperties.pizza_timeUntilWarning)
                timer.innerText = "DONE";
            else if (timerCount > -gameProperties.pizza_timeUntilBurnt)
                timer.innerText = "!!!"
            else
                timer.innerText = "BURNT"

            // Decide whether to stop animation or not
            if (!pizza.isInOven) { // pizza.ovenOut() method sets isInOven to false when pizza is dragged out of oven
                // stop animation
                timer.remove();
            } else {
                // continue animation (a.k.a. continue baking)
                lastTimestamp = timestamp;
                pizza.updateDiv();
                window.requestAnimationFrame(bakingAnimation);
            }
        }

        window.requestAnimationFrame(bakingAnimation); // this command initially starts the animation
    }
}

// --------------------------------------------------------------------

class Order {

    // ATTRIBUTES --------------------

    name; // name to display in game
    requestedPizza; // pizza used for validation [Pizza.class]

    points;
    timeInSeconds; // time before order expires

    gameElement; //in game representation of the order

    animationRunning = false;

    constructor(name, points, timeInSeconds, ingredients) {
        this.name = name;
        this.points = points;
        this.timeInSeconds = timeInSeconds;
        this.requestedPizza = new Pizza();
        this.requestedPizza.ingredients = [];
        this.requestedPizza.ingredients.push.apply(this.requestedPizza.ingredients, ingredients)
    }

    getCopy() {
        return new Order(this.name, this.points, this.timeInSeconds, this.requestedPizza.ingredients);
    }

    createGameElement() {
        this.gameElement = document.createElement('div');
        this.gameElement.timeIndicator = document.createElement('div');
        this.gameElement.text = document.createElement('p');

        this.gameElement.setAttribute('class', 'box order');

        this.gameElement.text.innerHTML = this.name;

        this.gameElement.appendChild(this.gameElement.text);
        this.gameElement.appendChild(this.gameElement.timeIndicator);

        document.getElementById('orderSection').getElementsByClassName('scroll_container').item(0).appendChild(this.gameElement);
    }

    // starts the animation of the order timeIndicator
    startAnimation() {
        const thisOrder = this;
        let start;

        let gameElement_box;
        let timeIndicator_box;

        thisOrder.animationRunning = true;

        // this is one animation step
        function updateTimeIndicator(timestamp) {
            if (start === undefined)
                start = timestamp;
            const elapsed = timestamp - start; // elapsed = time passed since animation start [milliseconds]

            gameElement_box = thisOrder.gameElement.getBoundingClientRect();
            timeIndicator_box = thisOrder.gameElement.timeIndicator.getBoundingClientRect();

            // update time indicator
            let timeLeftInDecimal = Math.max(((thisOrder.timeInSeconds * 1000 - elapsed) / (thisOrder.timeInSeconds * 1000)), 0) // percentage of time left [min = 0]
            thisOrder.gameElement.timeIndicator.style.height = (gameElement_box.height - 8) + "px"; // always the same
            thisOrder.gameElement.timeIndicator.style.width = gameElement_box.width * (timeLeftInDecimal) + "px";

            // set indicator color according to percentage of time left
            if (timeLeftInDecimal > 0.5)
                thisOrder.gameElement.timeIndicator.style.backgroundColor = "green";
            else if (timeLeftInDecimal > 0.2)
                thisOrder.gameElement.timeIndicator.style.backgroundColor = "yellow";
            else
                thisOrder.gameElement.timeIndicator.style.backgroundColor = "red";


            if (elapsed < thisOrder.timeInSeconds * 1000){ // Stop the animation when time is over
                if (thisOrder.animationRunning)
                    window.requestAnimationFrame(updateTimeIndicator);
            }

            else
                OrderHandler.getInstance().notifyExpired(thisOrder);
        }

        window.requestAnimationFrame(updateTimeIndicator);
    }

    stopAnimation() {
        this.animationRunning = false;
    }

    getName() {
        return this.name;
    }
}

// Responsible for WHAT is ordered and WHEN
class OrderHandler {

    static orderHandler = new OrderHandler();
    activeOrders = [];
    isRunning;

    static getInstance() {
        return this.orderHandler;
    }

    start() {

        this.isRunning = true;
        const orderHandler = this;
        let lastTimestamp = window.performance.now();
        let timeSinceLastOrder = 0;

        for (let i = 0; i < gameProperties.ordersActiveWhenStarting; i++)
            this.activateOrder(this.drawRandomOrder());

        function orderFlow(timestamp) {

            timeSinceLastOrder += timestamp - lastTimestamp;
            lastTimestamp = timestamp;

            if (orderHandler.activeOrders.length < gameProperties.minOrdersActive) {
                orderHandler.activateOrder(orderHandler.drawRandomOrder(), gameProperties.orderDelay*1000);
                timeSinceLastOrder = 0;
            }

            if (timeSinceLastOrder > gameProperties.maxTimeBetweenOrders*1000) {
                orderHandler.activateOrder(orderHandler.drawRandomOrder());
                timeSinceLastOrder = 0;
            }


            if (orderHandler.isRunning)
                window.requestAnimationFrame(orderFlow);
        }

        window.requestAnimationFrame(orderFlow);
    }

    stop() {
        this.isRunning = false;

        this.activeOrders.forEach(function (item) {
            item.stopAnimation();
        })
    }

    drawRandomOrder() {

        const ordersToChooseFrom = [];
        ordersToChooseFrom.push.apply(ordersToChooseFrom, possibleOrders);
        // this.activeOrders.forEach(function (item) {
        //     if (ordersToChooseFrom.includes(item))
        //         ordersToChooseFrom.splice(item, 1);
        // })

        const randomIndex = Math.floor(ordersToChooseFrom.length * Math.random());

        return ordersToChooseFrom[randomIndex].getCopy();
    }

    activateOrder(order, delay = undefined) {


        this.activeOrders.push(order);

        if (delay)
            setTimeout(function () {
                AudioPlayer.order_new();
                order.createGameElement();
                order.startAnimation();
            }, delay);
        else {
            AudioPlayer.order_new();
            order.createGameElement();
            order.startAnimation();
        }

    }

    notifyDelivered(order, receivedPizza) {
        let orderIds = [];
        let pizzaIds = [];

        function fillIdArray(origArray, idArray) {
            for (var i = 0; i < origArray.length; i++) {
                idArray.push(origArray[i].id);
            }
        }

        const equalsIgnoreOrder = (order, pizza) => {
            if (order.length !== pizza.length) return false;
            const uniqueValues = new Set([...order, ...pizza]);
            for (const v of uniqueValues) {
                const aCount = order.filter(e => e === v).length;
                const bCount = pizza.filter(e => e === v).length;
                if (aCount !== bCount) return false;
            }
            return true;
        }

        fillIdArray(order.requestedPizza.ingredients, orderIds)
        fillIdArray(receivedPizza.ingredients, pizzaIds)

        // Play sound
        if (equalsIgnoreOrder(orderIds,pizzaIds) && receivedPizza.bakeStatus === DraggablePizzaInstance.bakeStatus.WELL)
            AudioPlayer.order_correct();
        else
            AudioPlayer.distraction_hit();

        // Server validates pizza and updates points
        validatePizza(order, receivedPizza);

        receivedPizza.whenDraggedInOrder(this);
        order.stopAnimation();
        order.gameElement.remove();
        this.activeOrders.splice(this.activeOrders.indexOf(order), 1);
    }

    notifyExpired(order) {

        // Play sound
        AudioPlayer.order_expired();

        order.stopAnimation();
        order.gameElement.remove();
        this.activeOrders.splice(this.activeOrders.indexOf(order), 1);
    }
}

// --------------------------------------------------------------------

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

    static order_correct() {
        const sound = document.createElement("AUDIO");
        sound.setAttribute('src', "/assets/sounds/order_correct.wav");
        sound.setAttribute('type', "audio/wav");
        sound.volume = 0.4;
        sound.play();
    }

    static order_expired() {
        const sound = document.createElement("AUDIO");
        sound.setAttribute('src', "/assets/sounds/order_expired.wav");
        sound.setAttribute('type', "audio/wav");
        sound.volume = 0.4;
        sound.play();
    }

    static order_new() {
        const sound = document.createElement("AUDIO");
        sound.setAttribute('src', "/assets/sounds/order_new.wav");
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

    static ingredient_stamp() {
        const sound = document.createElement("AUDIO");
        sound.setAttribute('src', "/assets/sounds/stamp_small.wav");
        sound.setAttribute('type', "audio/wav");
        sound.volume = 0.4;
        sound.play();
    }

    static ingredient_finalStamp() {
        const sound = document.createElement("AUDIO");
        sound.setAttribute('src', "/assets/sounds/stamp_big.wav");
        sound.setAttribute('type', "audio/wav");
        sound.volume = 0.4;
        sound.play();
    }

    static trashcan() {
        const sound = document.createElement("AUDIO");
        sound.setAttribute('src', "/assets/sounds/trashcan.wav");
        sound.setAttribute('type', "audio/wav");
        sound.volume = 0.4;
        sound.play();
    }

    static round_lastFive() {
        const sound = document.createElement("AUDIO");
        sound.setAttribute('src', "/assets/sounds/round_lastFive.wav");
        sound.setAttribute('type', "audio/wav");
        sound.volume = 0.4;
        sound.play();
    }

    static round_end() {
        const sound = document.createElement("AUDIO");
        sound.setAttribute('src', "/assets/sounds/round_end.wav");
        sound.setAttribute('type', "audio/wav");
        sound.volume = 0.4;
        sound.play();
    }
}

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
    startCountdown() {
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


// AT STARTUP ---------------------------------------------------------------------------------------------------------

async function setupAvailableIngredients() {
    const ingredients = await getAvailableIngredients(); // fetch ingredients Json-Array
    console.log("Fetched ingredients:")
    console.log(ingredients)
    ingredients.forEach(function (item) {// Json-Array in availableIngredients-Array
        if (item.hasOwnProperty("display_time")) {
            availableIngredients.push(
                new StampingIngredient(item.id, item.name, item.picture_raw, item.picture_raw_distraction, item.picture_processed, item.picture_baked, item.picture_burnt, {
                    disabling_time: item.disabling_time,
                    hits_required: item.hits_required,
                    display_time: item.display_time
                }))
        } else {
            availableIngredients.push(
                new ChoppingIngredient(item.id, item.name, item.picture_raw, item.picture_raw_distraction, item.picture_processed, item.picture_baked, item.picture_burnt, {
                    vertex_x_inPercent: item.vertex_x_inPercent,
                    vertex_y_inPercent: item.vertex_y_inPercent,
                    speed: item.speed,
                    rotation: item.rotation,
                    hits_required: item.hits_required
                }))
        }
    });
}

async function setupAvailablePizzas() {
    const orders = await getAvailablePizzas();
    console.log("Fetched Orders:");
    console.log(orders);

    orders.forEach(function (item) {
        possibleOrders.push(new Order(item.name, item.points, item.order_time, item.ingredients));
    });
}

async function getAvailableIngredients() {
    let response = await fetch("pizza_rush/getAvailableIngredients");
    return response.json();
}

async function getAvailablePizzas() {
    let response = await fetch("pizza_rush/getAvailablePizzas");
    return response.json();
}

// --------------------------------------------------------------------

async function loadGameElements() {
    await setupAvailableIngredients();
    await setupAvailablePizzas();

    document.getElementById("loading").style.display = 'none';

    loadIngredientSection();
    loadOvens();
    loadRecipeList();
}

function loadIngredientSection() {

    availableIngredients.forEach(function (item, index) {
        // simply create the <div> element

        const ingredient = document.createElement('div');
        const image = document.createElement('img');
        const name = document.createElement('div')

        ingredient.setAttribute('class', 'box ingredientSectionItem');
        ingredient.setAttribute('onmousedown', 'pullNewIngredient(' + index + ')');

        image.setAttribute('src', item.picture_raw);

        name.innerText = item.name;

        ingredient.appendChild(image);
        ingredient.appendChild(name);

        document.getElementById('ingredientSection').getElementsByClassName('scroll_container').item(0).appendChild(ingredient);
    })
}

function loadOvens() {

    // this could later be dynamic:
    // for example load as many ovens as the player has bought
    ovenList.push(new Oven(),
        new Oven(),
        new Oven(),
        new Oven());
}

function loadRecipeList() {
    const recipeList = document.getElementById("recipeList");
    recipeList.onmouseenter = function (){
        expanded.style.display = "flex";
        // recipeList.innerText = "";
    };
    recipeList.onmouseleave = function (){
        expanded.style.display = "none";
        // recipeList.innerText = "recipes"
    };

    const expanded = document.createElement('div');
    recipeList.appendChild(expanded);

    for (let i = 0; i < possibleOrders.length; i++) {
        const current = possibleOrders[i];
        const div = createElement(current);
        expanded.appendChild(div);
    }


    function createElement(order) {
        const div = document.createElement('div');
        const heading = document.createElement('h2');
        const description = document.createElement('div');

        heading.innerHTML = order.name;
        let text = "";
        order.requestedPizza.ingredients.forEach(function (item) {
            text += item.name + ", ";
        })
        description.innerHTML = text;

        div.appendChild(heading);
        div.appendChild(description);
        return div;
    }
}


// ROUND LIFECYCLE ----------------------------------------------------------------------------------------------------

let pizzaRushRunning = false;

function manageRushCountdown(timerContainerId) {
    if (!pizzaRushRunning) {

        resetPoints();

        class RushCountdown extends AbstractCountdown {

            // @Override
            onCountdownStart() {
                pizzaRushRunning = true;
                document.getElementById("startStop_overlay").style.visibility = "hidden";

                this.onCountdownInterval();

                OrderHandler.getInstance().start();
            }

            // @Override
            onCountdownInterval() {

                // Time calculations
                let secondsLeft = this.durationInSeconds - this.secondsPassed;
                let minutes = "" + Math.floor(secondsLeft / 60);
                let seconds = "" + secondsLeft - minutes * 60;
                if (seconds.toString().length < 2)
                    seconds = "0" + seconds;

                if (secondsLeft < 6)
                    AudioPlayer.round_lastFive();

                // Display the result in the affectedObject
                this.affectedObject.innerHTML = "TIME: " + minutes + ":" + seconds;


            }

            // @Override
            // Hier könnte später die PizzaRush Runde beendet werden
            async onCountdownEnd() {
                AudioPlayer.round_end();

                pizzaRushRunning = false;
                document.getElementById("startStop_overlay").style.visibility = "visible";
                document.getElementById("startStop_overlay_text").innerHTML = "Round over!<br/>You scored " + await getCurrentPoints() + " Points";
                document.getElementById("startStop_overlay_button").innerHTML = "Play Again!"

                this.affectedObject.innerHTML = "END";
                await endGame();
                document.getElementById("startStop_overlay_button").onclick = restartGame;
            }
        }

        new RushCountdown(gameProperties.roundLength, document.getElementById(timerContainerId)).startCountdown(); // Countdown wird gestartet
    }
}

async function endGame() {

    // Stop all processes
    pizzaRushRunning = false;
    fruitNinjaRunning = false;
    whackAMoleRunning = false;
    OrderHandler.getInstance().stop();

    // Update player stats
    let currentPoints = await getCurrentPoints();
    let currentPlayerHighscore = await getCurrentPlayerHighscore();
    let currentPlayerTotalPoints = await getCurrentPlayerTotalPoints();
    if (currentPoints > currentPlayerHighscore) {
        currentPlayerHighscore = currentPoints;
    }
    await setCurrentPlayerPoints(currentPlayerTotalPoints + currentPoints, currentPlayerHighscore);

    resetPoints();
}

function restartGame() {
    window.location.reload(false);
}


// PIZZA-VALIDATION & POINTS ------------------------------------------------------------------------------------------

function validatePizza(order, pizza) {

    console.assert(pizza instanceof DraggablePizzaInstance);
    console.assert(order instanceof Order);

    fetch("/pizza_rush/validate_pizza", {
        method: 'POST',
        body: JSON.stringify({
            orderPoints: order.points,
            orderIngredientIds: order.requestedPizza.getIngredientIds(),
            createdPizzaIngredientIds: pizza.getIngredientIds(),
            createdPizzaBakeStatus: pizza.bakeStatus
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

async function updateCurrentPoints() {
    document.getElementById("currentlyDisplayedPoints").textContent = "POINTS: " + await getCurrentPoints();
}

async function getCurrentPoints() {
    let returnedPoints = -1;
    return await fetch("/pizza_rush/get_current_points")
        .then(
            result => result.text()
        ).then(
            result => {
                returnedPoints = parseInt(result);
                return returnedPoints;
            }
        ).catch((error) => {
            console.error('Error:', error);
        });
}

async function getCurrentPlayerHighscore() {
    let returnedPoints = -1;
    return await fetch("/profile/getHighScore")
        .then(
            result => result.text()
        ).then(
            result => {
                returnedPoints = parseInt(result);
                return returnedPoints;
            }
        ).catch((error) => {
            console.error('Error:', error);
        });
}

async function getCurrentPlayerTotalPoints() {
    let returnedPoints = -1;
    return await fetch("/profile/getTotalPoints")
        .then(
            result => result.text()
        ).then(
            result => {
                returnedPoints = parseInt(result);
                return returnedPoints;
            }
        ).catch((error) => {
            console.error('Error:', error);
        });
}

async function setCurrentPlayerPoints(newTotalPoints, newHighscore) {
    fetch("/pizza_rush/setPlayerPoints", {
        method: 'POST',
        body: JSON.stringify({
            newTotalPoints: newTotalPoints,
            newHighscore: newHighscore
        }),
        headers: {
            "Content-Type": "application/json"
        },
        credentials: 'include'
    }).then(result => result.text())
        .then(data => {
            let msg = data.toString();
            console.log(msg);
        })

}

function resetPoints() {
    fetch("/pizza_rush/reset_points", {
        method: 'POST',
        credentials: "include"
    }).then(updateCurrentPoints)
        .catch((error) => {
            console.log('Error', error)
        })
}


// MINI GAMES ---------------------------------------------------------------------------------------------------------

let fruitNinjaRunning = false;
let whackAMoleRunning = false;

function startFromChoppingTable() {

    const ingredientsToPlayWith = [];
    const cuttingSurface = document.getElementById("cuttingSurface");

    cuttingSurface.setAttribute("style", "outline: ");

    for (let i = 0; i < existingDraggableIngredientInstances.length; i++) {
        const current = existingDraggableIngredientInstances[i];

        if (checkOverlap(current.draggable, document.getElementById("cuttingSurface"))) {

            if (!current.instanceOf(ChoppingIngredient)) {

                cuttingSurface.setAttribute("style", "outline: 4px solid red");
                return;
            }

            if (current.instanceOf(ChoppingIngredient) &&
                current.status === DraggableIngredientInstance.Status.RAW) {

                ingredientsToPlayWith.push(current);
            }
        }
    }

    if (ingredientsToPlayWith.length > 0)
        startMiniGame(ingredientsToPlayWith);
}

function startFromStampingTable() {

    const ingredientsToPlayWith = [];
    const stampingSurface = document.getElementById("smashingSurface");

    stampingSurface.setAttribute("style", "outline: ");

    for (let i = 0; i < existingDraggableIngredientInstances.length; i++) {
        const current = existingDraggableIngredientInstances[i];

        if (checkOverlap(current.draggable, document.getElementById("smashingSurface"))) {

            if (!current.instanceOf(StampingIngredient)) {

                stampingSurface.setAttribute("style", "outline: 4px solid red");
                return;
            }

            if (current.instanceOf(StampingIngredient) &&
                current.status === DraggableIngredientInstance.Status.RAW) {

                ingredientsToPlayWith.push(current);
            }
        }
    }

    if (ingredientsToPlayWith.length > 0)
        startMiniGame(ingredientsToPlayWith);
}

// all functionality for both mini games
function startMiniGame(ingredientList) {

    const processedIngredients = []; // type: DraggableIngredientInstance


    // CREATE THE GAME WINDOW -----------------------------------------------------------------------------------------

    const miniGame_window = document.getElementById("miniGame_window");

    const playArea = document.getElementById("miniGame_playArea");

    const sideBar = document.getElementById("miniGame_sideBar");

    const counter = document.getElementById("miniGame_sideBar_counter");
    updateCounter();
    sideBar.appendChild(counter);

    const closeButton = document.getElementById("miniGame_sideBar_closeButton");
    sideBar.appendChild(closeButton);

    const canvas = document.getElementById("miniGame_canvas")
    const context = canvas.getContext("2d");
    playArea.appendChild(canvas);

    miniGame_window.appendChild(playArea);
    miniGame_window.appendChild(sideBar);
    document.getElementById("miniGame_layer").appendChild(miniGame_window);


    if (ingredientList[0].parentIngredient instanceof ChoppingIngredient)
        fruit_ninja();
    else if (ingredientList[0].parentIngredient instanceof StampingIngredient)
        whackAMole();


    // UTILITY FUNCTIONS ----------------------------------------------------------------------------------------------

    function setCanvasSize() {
        const playArea_box = playArea.getBoundingClientRect();
        canvas.setAttribute('height', playArea_box.height + "px");
        canvas.setAttribute('width', playArea_box.width + "px");
    }

    function updateCounter() {
        counter.innerHTML = "" + processedIngredients.length + "/" + ingredientList.length;
    }

    // ----------------------------------------------------------------------------------------------------------------

    // display the game window
    document.getElementById("miniGame_layer").style.visibility = "visible";


    function fruit_ninja() {
        fruitNinjaRunning = true;

        // an instance of this class handles the throw of ONE ingredient
        class AbstractThrower {

            // ATTRIBUTES -----------------

            // stays the same for every throw
            draggableIngredient;
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


            constructor(draggableIngredient, context) {
                this.draggableIngredient = draggableIngredient;
                this.context = context;

                this.kurtosis = 0.05;
                this.speed = draggableIngredient.parentIngredient.flight_behavior.speed;
                this.rotation_increment = draggableIngredient.parentIngredient.flight_behavior.rotation;
            }


            newThrow() {

                this.defineNewTrajectory();
                this.startThrow();
            }

            // this method sets up all variables for the next throw
            defineNewTrajectory() {

                // prepare values for next throw --------------------

                // new coordinates of highpoint
                this.vertex_x_inPercent = this.randomize(this.draggableIngredient.parentIngredient.flight_behavior.vertex_x_inPercent, 30);
                this.vertex_y_inPercent = this.randomize(this.draggableIngredient.parentIngredient.flight_behavior.vertex_y_inPercent, 15);
                this.rotation = 0;

                // set the initial x to the value where y is 100px under the canvas
                // this is to prevent the trajectory from starting extremely far off screen
                this.x = this.parableYGiven(
                    canvas.height + 100,
                    this.kurtosis,
                    canvas.width * (this.vertex_x_inPercent / 100),
                    canvas.height * (1 - (this.vertex_y_inPercent / 100))
                )


                // randomly set flight direction (left -> right / right <- left)
                if (Math.random() > 0.5) { // 50:50
                    this.speed = -1 * this.draggableIngredient.parentIngredient.flight_behavior.speed; // element will fly reversed
                    this.x = canvas.width * (this.vertex_x_inPercent / 100) + (canvas.width * (this.vertex_x_inPercent / 100) - this.x);
                } else {
                    this.speed = this.draggableIngredient.parentIngredient.flight_behavior.speed;
                    // leave this.x as it is
                }
                this.x = Math.max(this.x, -100);
                this.x = Math.min(this.x, canvas.width + 100)

                // randomly set rotation direction
                if (Math.random() > 0.5) // 50:50
                    this.rotation_increment = -this.draggableIngredient.parentIngredient.flight_behavior.rotation;
                else
                    this.rotation_increment = this.draggableIngredient.parentIngredient.flight_behavior.rotation;
            }

            startThrow() {
            }

            endThrow() {
            }

            // calculate next position and draw on canvas
            step() {

                // calculating y with parable function
                this.y = this.parableXGiven(
                    this.x,
                    this.kurtosis,
                    canvas.width * (this.vertex_x_inPercent / 100),
                    canvas.height * (1 - (this.vertex_y_inPercent / 100))
                );

                this.context.save();

                // set rotation center of canvas-context to coordinates of the ingredient
                this.context.translate(this.x, this.y);

                // rotate the canvas to the specified degrees
                this.context.rotate(this.rotation * Math.PI / 180);
                this.rotation = (this.rotation + this.rotation_increment) % 360;

                // draw the image
                // since the context is rotated, the image will be rotated as well
                this.context.drawImage(this.ingredient_image, -this.ingredient_image.width / 2, -this.ingredient_image.height / 2);
                //this.context.fillRect(-20, -20, 40, 40);

                this.context.restore();

                this.x += this.speed;

                if (this.y > canvas.height + 150 || this.x < -150 || this.x > canvas.width + 150)
                    this.endThrow();
            }

            isHit(cursorX, cursorY) {

                if (!this.wasHitInThisThrow)
                    return isInside([cursorX, cursorY], this.getShapeCoordinates());
                else
                    return false;
            }

            onHit() {
            }

            // form:  cur * (x - ver_x)^2 + ver_y
            parableXGiven(x, cur, ver_x, ver_y) {
                return cur * Math.pow(x - ver_x, 2) + ver_y;
            }

            // form:  -((x - ver_y)/cur)^0.5 + ver_x
            parableYGiven(y, cur, ver_x, ver_y) {
                return -Math.pow((y - ver_y) / cur, 0.5) + ver_x;
            }

            randomize(value, range) {

                const value_min = Math.max(value - range / 2, 10);
                const value_max = Math.min(value + range / 2, 90);

                const tmp = value_max - value_min; // Maximum value you can add to value_min

                return value_min + Math.random() * tmp; // 0 <= Math.random() < 1
            }

            getShapeCoordinates() {
                let lu = [this.x - this.ingredient_image.width / 2, this.y - this.ingredient_image.height / 2];
                let lo = [this.x - this.ingredient_image.width / 2, this.y + this.ingredient_image.height / 2];
                let ro = [this.x + this.ingredient_image.width / 2, this.y + this.ingredient_image.height / 2];
                let ru = [this.x + this.ingredient_image.width / 2, this.y - this.ingredient_image.height / 2];

                const shape = [lu, lo, ro, ru];

                return rotateCoordinates(shape, [this.x, this.y], this.rotation)
            }
        }

        class IngredientThrower extends AbstractThrower {

            // changes during play
            wasHitInThisThrow = false;
            hits_left; // how many hits until it is chopped


            constructor(draggableIngredient, context) {
                super(draggableIngredient, context);

                this.ingredient_image = document.createElement('img');
                this.ingredient_image.setAttribute('src', draggableIngredient.picture_raw);

                this.hits_left = draggableIngredient.parentIngredient.flight_behavior.hits_required;
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
                if (Math.random() < gameProperties.fruitNinja_distractionChance_percent/100)
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
                    console.log("Final Hit: " + this.draggableIngredient.name);

                    this.ingredient_image.remove();
                    this.draggableIngredient.setStatus(DraggableIngredientInstance.Status.PROCESSED);

                    this.ingredientJuggler.dropIngredient(this);
                    processedIngredients.push(this.draggableIngredient);
                    updateCounter();
                } else {

                    AudioPlayer.ingredient_hit();
                    console.log("Hit: " + this.draggableIngredient.name);
                }
            }

            createDistraction() {

                return new DistractionThrower(this, gameProperties.fruitNinja_distractionDisablingTime*1000);
            }
        }

        class DistractionThrower extends AbstractThrower {

            realIngredientThrower;
            disablingTime;

            constructor(ingredientThrower, disablingTime) {
                super(ingredientThrower.draggableIngredient, ingredientThrower.context);

                this.ingredient_image = document.createElement('img');
                this.ingredient_image.setAttribute('src', ingredientThrower.draggableIngredient.parentIngredient.picture_raw_distraction);

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

                window.requestAnimationFrame(function () {
                    context.fillStyle = '#ab0000'
                    context.fillRect(0, 0, canvas.width, canvas.height);
                });

                console.log("Distraction Hit: " + this.draggableIngredient.name);
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

            minTimeBetweenThrows;
            timestampLastThrow = 0;
            maxIngredientsInAir;

            disableTime = 0;
            lastTimestamp;

            constructor(ingredientList, minTimeBetweenThrows, maxIngredientsInAir) {
                this.minTimeBetweenThrows = minTimeBetweenThrows;
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

                if (this.disableTime > 0) {
                    this.disableTime -= timestamp - this.lastTimestamp;

                    context.fillStyle = '#e57d7d'
                    context.fillRect(0, 0, canvas.width, canvas.height);
                }

                this.lastTimestamp = timestamp;

                if ((timestamp - this.timestampLastThrow) > this.minTimeBetweenThrows*1000)
                    if (this.ingredientsWaitingToBeThrown.length > 0 &&
                        this.ingredientsCurrentlyInAir.length < this.maxIngredientsInAir) {
                        const randomIndex = Math.floor(Math.random() * this.ingredientsWaitingToBeThrown.length);
                        this.ingredientsWaitingToBeThrown[randomIndex].newThrow();
                        this.timestampLastThrow = timestamp;
                    }

                const copy = [...this.ingredientsCurrentlyInAir];

                copy.forEach(function (item, index, array) {
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

                ingredientJuggler.ingredientsCurrentlyInAir.forEach(function (item) {
                    if (item.isHit(x, y))
                        item.onHit();
                })
            }
        }

        // ------------------------------------------------------------------------------------------------------------

        setCanvasSize();

        const ingredientJuggler = new IngredientJuggler(
            ingredientList,
            gameProperties.fruitNinja_minTimeBetweenThrows,
            gameProperties.fruitNinja_maxIngredientsInAir);

        addHitListener(ingredientJuggler);

        let start;

        function animationStep(timestamp) {
            if (start === undefined)
                start = timestamp;

            // clear the canvas before drawing the next frame
            context.clearRect(0, 0, canvas.width, canvas.height);

            // calculating & drawing next frame for every current throw
            ingredientJuggler.nextFrame(timestamp);

            if (ingredientJuggler.allIngredientsToJuggle.length <= 0)
                stopMiniGame();
            if (fruitNinjaRunning)
                window.requestAnimationFrame(animationStep);
        }

        window.requestAnimationFrame(animationStep); // initially start the game-animation
    }

    function whackAMole() {
        whackAMoleRunning = true;

        class AbstractShower {

            draggableIngredient;
            ingredient_image;
            context;

            show_duration;
            time_shown = 0;
            lastTimestamp = 0;

            // changes for every appearance
            holeNumber;

            moleHandler;


            constructor(element, context) {
                this.draggableIngredient = element;
                this.context = context;
            }

            newShow() {

                this.lastTimestamp = window.performance.now();
                this.time_shown = this.draggableIngredient.parentIngredient.stamp_behavior.display_time;
                this.defineNewShow();
                this.startShow();
            }

            defineNewShow() {

                // define in which hole to appear
                const randomIndex = Math.floor(Math.random() * this.moleHandler.freeHoles.length);
                this.holeNumber = moleHandler.freeHoles[randomIndex];
            }

            startShow() {

                // tell MoleHandler, your hole is occupied
                //this.moleHandler.freeHoles.splice(this.holeNumber, 1);
                const index = this.moleHandler.freeHoles.indexOf(this.holeNumber);
                this.moleHandler.freeHoles.splice(index, 1);
            }

            endShow() {

                // tell MoleHandler, your hole is now free again
                //this.moleHandler.freeHoles.splice(this.holeNumber, 0, this.holeNumber);
                this.moleHandler.freeHoles.push(this.holeNumber);
                this.holeNumber = undefined;
            }

            step(timestamp) {

                this.time_shown -= timestamp - this.lastTimestamp;
                this.lastTimestamp = timestamp;

                this.moleHandler.moleDrawer.drawInHole(this.holeNumber, this.ingredient_image);

                if (this.time_shown <= 0) {
                    this.endShow();
                }
            }

            isHit(cursorX, cursorY) {
                return isInside([cursorX, cursorY], this.getShapeCoordinates());
            }

            onHit() {
            }

            getShapeCoordinates() {
                const holeCoordinates = this.moleHandler.moleDrawer.holeCoordinates[this.holeNumber];

                let lu = [holeCoordinates[0] - this.ingredient_image.width / 2, holeCoordinates[1] - this.ingredient_image.height / 2];
                let lo = [holeCoordinates[0] - this.ingredient_image.width / 2, holeCoordinates[1] + this.ingredient_image.height / 2];
                let ro = [holeCoordinates[0] + this.ingredient_image.width / 2, holeCoordinates[1] + this.ingredient_image.height / 2];
                let ru = [holeCoordinates[0] + this.ingredient_image.width / 2, holeCoordinates[1] - this.ingredient_image.height / 2];

                return [lu, lo, ro, ru];
            }
        }

        class IngredientShower extends AbstractShower {

            hits_left;


            constructor(draggableIngredient, context) {
                super(draggableIngredient, context);

                this.ingredient_image = document.createElement('img');
                this.ingredient_image.setAttribute('src', draggableIngredient.picture_raw);

                this.hits_left = draggableIngredient.parentIngredient.stamp_behavior.hits_required;
            }

            setupWithMoleHandler(handler) {
                this.moleHandler = handler;
            }

            startShow() {
                super.startShow();

                // tell MoleHandler, you can't be shown again
                let index = this.moleHandler.ingredientsWaitingToBeShown.indexOf(this);
                this.moleHandler.ingredientsWaitingToBeShown.splice(index, 1);

                // tell MoleHandler to either show yourself OR a distraction
                if (Math.random() < gameProperties.whack_distractionChance_percent/100)
                    this.moleHandler.ingredientsCurrentlyShown.push(this.createDistraction());
                else
                    this.moleHandler.ingredientsCurrentlyShown.push(this);
            }

            endShow() {
                super.endShow();

                // tell MoleHandler, you are ready to be shown again
                const index = this.moleHandler.ingredientsCurrentlyShown.indexOf(this);
                this.moleHandler.ingredientsCurrentlyShown.splice(index, 1);
                this.moleHandler.ingredientsWaitingToBeShown.push(this);
            }

            onHit() {
                this.endShow();

                this.hits_left -= 1;

                if (this.hits_left <= 0) {

                    AudioPlayer.ingredient_finalStamp();
                    console.log("Final Hit: " + this.draggableIngredient.name);

                    this.ingredient_image.remove();
                    this.draggableIngredient.setStatus(DraggableIngredientInstance.Status.PROCESSED);

                    this.moleHandler.dropIngredient(this);

                    if (this.draggableIngredient.name === "Impasto") {
                        const newPizza = new DraggablePizzaInstance();
                        alignDraggableToDestination(newPizza.draggable, this.draggableIngredient.draggable);
                        this.draggableIngredient.delete();
                    }
                    processedIngredients.push(this.draggableIngredient);
                    updateCounter();
                } else {

                    AudioPlayer.ingredient_stamp();
                    console.log("Hit: " + this.draggableIngredient.name)
                }
            }

            createDistraction() {

                return new DistractionShower(this);
            }
        }

        class DistractionShower extends AbstractShower {

            disabling_time;
            display_time;

            realIngredientShower;

            constructor(ingredientShower) {
                super(ingredientShower.draggableIngredient, ingredientShower.context);

                this.ingredient_image = document.createElement('img');
                this.ingredient_image.setAttribute('src', ingredientShower.draggableIngredient.parentIngredient.picture_raw_distraction);

                // copy variables of real ingredientShower
                this.time_shown = ingredientShower.time_shown;
                this.lastTimestamp = ingredientShower.lastTimestamp
                this.holeNumber = ingredientShower.holeNumber;
                this.moleHandler = ingredientShower.moleHandler;

                this.disabling_time = ingredientShower.draggableIngredient.parentIngredient.stamp_behavior.disabling_time;
                this.display_time = ingredientShower.draggableIngredient.parentIngredient.stamp_behavior.display_time;
                this.realIngredientShower = ingredientShower;
            }

            endShow() {
                super.endShow();

                // tell MoleHandler, the NON-distracting ingredient can be shown again
                const index = this.moleHandler.ingredientsCurrentlyShown.indexOf(this);
                this.moleHandler.ingredientsCurrentlyShown.splice(index, 1);
                this.moleHandler.ingredientsWaitingToBeShown.push(this.realIngredientShower);
            }

            onHit() {

                AudioPlayer.distraction_hit(); // TODO: Change this

                window.requestAnimationFrame(function () {
                    context.fillStyle = '#ab0000'
                    context.fillRect(0, 0, canvas.width, canvas.height);
                });

                console.log("Distraction Hit: " + this.draggableIngredient.name);
                this.moleHandler.disableFor(this.disabling_time);

                this.ingredient_image.remove();
                this.endShow();
            }
        }

        // this class is responsible for WHAT is shown, and WHEN
        class MoleHandler {

            allIngredientsInPlay = [];
            ingredientsWaitingToBeShown = [];
            ingredientsCurrentlyShown = [];

            freeHoles = [];

            numberOfHoles;
            minDistanceBetweenShows;
            timestampLastShow = 0;
            maxIngredientsShownAtOnce;

            disableTime = 0;
            lastTimestamp;

            moleDrawer;

            constructor(ingredientList, numberOfHoles, minDistanceBetweenShows, maxIngredientsShownAtOnce) {
                this.numberOfHoles = numberOfHoles;
                this.moleDrawer = new MoleDrawer(numberOfHoles, canvas, context);

                this.minDistanceBetweenShows = minDistanceBetweenShows;
                this.maxIngredientsShownAtOnce = maxIngredientsShownAtOnce;

                for (let i = 0; i < numberOfHoles; i++) {
                    this.freeHoles.push(i);
                }

                for (let i = 0; i < ingredientList.length; i++) {
                    this.addIngredient(new IngredientShower(ingredientList[i]));
                    this.allIngredientsInPlay[i].setupWithMoleHandler(this);
                }
            }

            addIngredient(ingredientShower) {
                this.allIngredientsInPlay.push(ingredientShower);
                this.ingredientsWaitingToBeShown.push(ingredientShower);
            }

            dropIngredient(ingredientShower) {
                this.allIngredientsInPlay.splice(this.allIngredientsInPlay.indexOf(ingredientShower), 1);
                if (this.ingredientsCurrentlyShown.includes(ingredientShower))
                    this.ingredientsCurrentlyShown.splice(this.ingredientsCurrentlyShown.indexOf(ingredientShower), 1);
                if (this.ingredientsWaitingToBeShown.includes(ingredientShower))
                    this.ingredientsWaitingToBeShown.splice(this.ingredientsWaitingToBeShown.indexOf(ingredientShower), 1);
            }

            nextFrame(timestamp) {

                if (this.disableTime > 0) {
                    this.disableTime -= timestamp - this.lastTimestamp

                    context.fillStyle = '#e57d7d'
                    context.fillRect(0, 0, canvas.width, canvas.height);
                }

                this.moleDrawer.drawEmpty();

                this.lastTimestamp = timestamp;

                if ((timestamp - this.timestampLastShow) > this.minDistanceBetweenShows)
                    if (this.ingredientsWaitingToBeShown.length > 0 &&
                        this.ingredientsCurrentlyShown.length < this.maxIngredientsShownAtOnce) {
                        const randomIndex = Math.floor(Math.random() * this.ingredientsWaitingToBeShown.length);
                        this.ingredientsWaitingToBeShown[randomIndex].newShow();
                        this.timestampLastShow = timestamp;
                    }

                const copy = [...this.ingredientsCurrentlyShown];

                copy.forEach(function (item, index, array) {
                    item.step(timestamp);
                });
            }

            isDisabled() {
                return this.disableTime > 0;
            }

            disableFor(milliseconds) {

                this.disableTime = milliseconds;
            }
        }

        class MoleDrawer {

            numberOfHoles;
            holeSize = 200;
            gapSize = 20;

            canvas;
            context;

            holeCoordinates = [];

            constructor(numberOfHoles, canvas, context) {
                this.numberOfHoles = numberOfHoles;
                this.canvas = canvas;
                this.context = context;

                this.determineCoordinates();
            }

            determineCoordinates() {

                const side = this.holeSize * 3 + this.gapSize * 2;
                const topGap = (canvas.height - side) / 2;
                const leftGap = (canvas.width - side) / 2;

                let x = leftGap;
                let y = topGap;

                for (let i = 0; i < 3; i++) {
                    y += this.holeSize / 2

                    for (let j = 0; j < 3; j++) {
                        x += this.holeSize / 2

                        this.holeCoordinates.push([x, y]);

                        x += this.gapSize;
                        x += this.holeSize / 2;
                    }

                    x = leftGap;
                    y += this.gapSize;
                    y += this.holeSize / 2;
                }
            }

            drawEmpty() {

                for (let i = 0; i < this.holeCoordinates.length; i++) {

                    context.beginPath();
                    context.arc(this.holeCoordinates[i][0], this.holeCoordinates[i][1], this.holeSize / 2, 0, 2 * Math.PI, false);
                    context.lineWidth = 10;
                    context.strokeStyle = '#000000';
                    context.stroke();
                }


            }

            drawInHole(holeNumber, image) {
                context.save();
                context.translate(this.holeCoordinates[holeNumber][0], this.holeCoordinates[holeNumber][1]);
                context.drawImage(image, -image.width / 2, -image.height / 2);
                context.restore();
            }
        }

        function addHitListener(moleHandler) {

            let x;
            let y;

            canvas.onmousedown = checkForHit;


            function checkForHit(event) {
                if (moleHandler.isDisabled())
                    return;

                const canvas_box = canvas.getBoundingClientRect();
                x = event.clientX - canvas_box.left;
                y = event.clientY - canvas_box.top;

                moleHandler.ingredientsCurrentlyShown.forEach(function (item) {
                    if (item.isHit(x, y))
                        item.onHit();
                })
            }
        }

        // ------------------------------------------------------------------------------------------------------------

        setCanvasSize();


        const moleHandler = new MoleHandler(
            ingredientList,
            9,
            gameProperties.whack_minTimeBetweenShows*1000,
            gameProperties.whack_maxIngredientsShownAtOnce);

        addHitListener(moleHandler);

        let start;

        function animationStep(timestamp) {
            if (start === undefined)
                start = timestamp;

            // clear the canvas before drawing the next frame
            context.clearRect(0, 0, canvas.width, canvas.height);

            moleHandler.nextFrame(timestamp);

            if (moleHandler.allIngredientsInPlay.length <= 0)
                stopMiniGame();
            if (whackAMoleRunning)
                window.requestAnimationFrame(animationStep);
        }

        window.requestAnimationFrame(animationStep); // initially start the game-animation
    }

}

function stopMiniGame() {
    fruitNinjaRunning = false;
    whackAMoleRunning = false;

    document.getElementById("miniGame_layer").style.visibility = "hidden";
}


// FUNCTIONALITY & BEHAVIOR -------------------------------------------------------------------------------------------

// drag functionality
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

        checkIfDraggedInTrash();

        if (element instanceof DraggableIngredientInstance && element.status === DraggableIngredientInstance.Status.PROCESSED)
            checkIfDraggedInPizza(); // check overlap with every existing pizza

        else if (element instanceof DraggablePizzaInstance) {
            checkIfDraggedInOven(); // check overlap with every oven
            checkIfDraggedInOrder(); // check overlap with every order element
        }
    }

    // -------------------------------

    function checkIfDraggedInOrder() {

        const activeOrders = OrderHandler.getInstance().activeOrders;

        activeOrders.forEach(function (item, index, array) {

            if (checkOverlap(element.draggable, item.gameElement)) {

                OrderHandler.getInstance().notifyDelivered(item, element);
            }
        });
    }

    function checkIfDraggedInPizza() {
        existingDraggablePizzaInstances.forEach(function (currentPizza) {

            if (currentPizza.timeInOvenInMilliseconds < 1.5 * 1000) // you can only assemble (nearly) raw pizzas -> prevents cheating
                if (checkOverlap(element.draggable, currentPizza.draggable))
                    element.whenDraggedInPizza(currentPizza);
        });
    }

    function checkIfDraggedInOven() {
        ovenList.forEach(function (item, index, array) {

            if (checkOverlap(element.draggable, item.gameElement.image)) {

                element.whenDraggedInOven(item);
            }
        });
    }

    function checkIfDraggedInTrash() {
        if (checkOverlap(element.draggable, document.getElementById("trash"))) {
            AudioPlayer.trashcan();
            element.delete();
        }
    }
}

// get a new raw ingredient
function pullNewIngredient(ingredientIndex) {
    const draggable = availableIngredients[ingredientIndex].createDraggableInstance().draggable;
    const event = window.event;
    event.preventDefault();

    // set element position to cursor. Teig wird direkt als angefangene Pizza erstellt, deshalb anders behandelt
    draggable.style.left = draggable.tagName === "IMG" ? event.clientX + scrollX - draggable.width / 2 + "px" : event.clientX + scrollX - draggable.firstChild.width / 2 + "px";
    draggable.style.top = draggable.tagName === "IMG" ? event.clientY + scrollY - draggable.height / 2 + "px" : event.clientY + scrollY - draggable.firstChild.height / 2 + "px";
}

function checkOverlap(draggable, destination) {
    const draggable_box = draggable.getBoundingClientRect();
    const destination_box = destination.getBoundingClientRect();

    //center-coordinates of the draggable element
    const draggable_centerX = draggable_box.left + (draggable_box.right - draggable_box.left) / 2;
    const draggable_centerY = draggable_box.top + (draggable_box.bottom - draggable_box.top) / 2;

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
    for (let i = 0; i < shape.length; i++) {
        shape[i][0] -= pivot[0];
        shape[i][1] -= pivot[1];
    }

    // rotation around 0x0
    for (let i = 0; i < shape.length; i++) {
        const tmp = [];
        tmp[0] = shape[i][0] * Math.cos(angle) - shape[i][1] * Math.sin(angle);
        tmp[1] = shape[i][1] * Math.cos(angle) + shape[i][0] * Math.sin(angle);

        shape[i][0] = tmp[0];
        shape[i][1] = tmp[1];
    }

    // translate coordinates so that pivot is back in original position
    for (let i = 0; i < shape.length; i++) {
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
