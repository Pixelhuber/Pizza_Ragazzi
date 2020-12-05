class Ingredient{

    constructor(name, image) {
        this.name = name; // attributes
        this.image = image;
    }

    createDraggableInstance() {
        const draggable = this.createImg();

        draggable.setAttribute('class', 'draggable');

        switch (this.name) {
            case "Impasto":     let newPizza = new Pizza();
                                existingPizzas.push(newPizza);
                                const newPizzaDiv = newPizza.createDiv();

                                document.getElementById("pizza_layer").appendChild(newPizzaDiv);
                                return newPizzaDiv;
            case "Pomodoro":    document.getElementById("tomato_layer").appendChild(draggable);
                                break;
            case "Formaggio":   document.getElementById("cheese_layer").appendChild(draggable);
                                break;
            case "Salame":      document.getElementById("salami_layer").appendChild(draggable);
                                break;
        }

        makeDraggable(draggable);

        return draggable;
    }

    createImg() {
        const ret = document.createElement('img');

        ret.setAttribute('src', this.image);
        ret.setAttribute('alt', this.name);
        ret.setAttribute('width', '100px');
        ret.setAttribute('height', '100px');

        return ret;
    }

    //returns an instance of the ingredient with this name
    static getInstanceByName(name){
        let ret = undefined;

        availableIngredients.forEach(function(item, index, array){
            if (name === item.name)
                ret = new Ingredient(name, item.image);
        })

        return ret;
    }
}

// --------------------------------------------------------------------------------------------------------------------

class Pizza{
    constructor() {
        this.ingredients.push(Ingredient.getInstanceByName("Impasto"))
        this.pizzaDiv = this.createDiv();
    }

    ingredients = [];
    pizzaDiv;

    static findExistingPizzaByDiv(div){
        existingPizzas.forEach(function(item, index, array){
            if (item.pizzaDiv === div)
                return item;
        })

        return undefined;
    }

    createDiv(){
        const pizzaDiv = document.createElement("div");

        pizzaDiv.setAttribute('class', 'draggable');

        makeDraggable(pizzaDiv);

        this.ingredients.forEach(function(item, index, array){
            const ingr = item.createImg();
            ingr.setAttribute('style', 'position: absolute');

            pizzaDiv.appendChild(ingr);

            return pizzaDiv;
        })


        return pizzaDiv;
    }
}

// --------------------------------------------------------------------------------------------------------------------

class Order{

    constructor(name, points, time) {
        this.name = name;
        this.points = points;
        this.time = time;
    }
}

// --------------------------------------------------------------------------------------------------------------------

let availableIngredients = [    new Ingredient("Impasto", "tmp_images_in_src/teig.png"),
                                new Ingredient("Formaggio", "tmp_images_in_src/formaggio.png"),
                                new Ingredient("Pomodoro", "tmp_images_in_src/pomodoro.png"),
                                new Ingredient("Salame", "tmp_images_in_src/salame.png")];

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

        ingredient.setAttribute('class', 'box ingredient');
        ingredient.setAttribute('onmousedown', 'pullNewIngredient(' + index + ')');

        image.setAttribute('src', item.image);
        image.setAttribute('height', '50px');
        image.setAttribute('width', 'auto');

        ingredient.innerHTML = item.name;
        ingredient.appendChild(image);

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
    var diff_x = 0, diff_y = 0, x = 0, y = 0;

    // if element is pressed down -> start dragging
    element.onmousedown = initiateDrag;

    function initiateDrag(event) {
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
        element.style.top = (element.offsetTop - diff_y) + "px";
        element.style.left = (element.offsetLeft - diff_x) + "px";
    }


    // defines what to do when element is released
    // TODO: Split up in specific methods for draggable ingredients and pizzas
    function endDrag(event) {
        event = event || window.event;
        event.preventDefault();

        // stop moving when mouse button is released:
        document.onmouseup = null;
        document.onmousemove = null;

        // when pizza or ingredient is dragged into an order element
        orderList.forEach(function(item, index, array){

            if (checkOverlap(element, document.getElementsByClassName("order").item(index))){

                alert(element.alt + " into " + orderList[index].name) // "element" in this case is simply an <img>
                existingPizzas.splice(existingPizzas.indexOf(element), 1);
                element.remove();
                return;
            }
        });

        // when ingredient is dragged into a pizza
        if (element.tagName !== "DIV") {

            for (let i = 0; i < document.getElementById("pizza_layer").childElementCount; i++) {

                //checks overlap with every existing pizza
                if (checkOverlap(element, document.getElementById("pizza_layer").children.item(i))) {

                    //Put ingredient on pizza
                    existingPizzas[i].ingredients.push(Ingredient.getInstanceByName(element.alt));

                    //Div declarations
                    const pizzaDivOld = document.getElementById("pizza_layer").children.item(i);
                    const pizzaDivUpdated = existingPizzas[i].createDiv();

                    //Set position of pizzaDivUpdated
                    pizzaDivUpdated.style.left = pizzaDivOld.style.left;
                    pizzaDivUpdated.style.top = pizzaDivOld.style.top;

                    //Swap pizzaDivs
                    document.getElementById("pizza_layer").replaceChild(pizzaDivUpdated, pizzaDivOld)

                    //Remove single draggable ingredient
                    element.remove();
                    return;
                }
            }
        }

    }
}

function pullNewIngredient(ingredientIndex){
    const draggable = availableIngredients[ingredientIndex].createDraggableInstance();
    const event = window.event;
    event.preventDefault();

    // set element position to cursor. Teig wird direkt als angefangene Pizza erstellt, deshalb anders behandelt
    draggable.style.left = draggable.tagName === "IMG" ? event.clientX + scrollX - draggable.width/2 + "px" : event.clientX + scrollX - draggable.firstChild.width/2 + "px";
    draggable.style.top = draggable.tagName === "IMG" ? event.clientY + scrollY - draggable.height/2 + "px" : event.clientY + scrollY - draggable.firstChild.height/2 + "px";
}

function checkOverlap(draggable, destination){
    let draggable_box = undefined;
    let destination_box = undefined;

    //Man braucht ein <img> um den Mittelpunkt zu berechnen. Da Pizzen aber <div> sind, nimmt man das .firstChild
    if (destination.firstChild.tagName !== "IMG")
        destination_box = destination.getBoundingClientRect();
    else
        destination_box = destination.tagName === "IMG" ? destination.getBoundingClientRect() : destination.firstChild.getBoundingClientRect();

    draggable_box = draggable.tagName === "IMG" ? draggable.getBoundingClientRect() : draggable.firstChild.getBoundingClientRect();

    
    //center-coordinates of the draggable element
    const draggable_centerX = draggable_box.left + (draggable_box.right - draggable_box.left)/2;
    const draggable_centerY = draggable_box.top + (draggable_box.bottom - draggable_box.top)/2;

    //are they overlapping in X or Y ?
    const isOverlapX = (draggable_centerX > destination_box.left && draggable_centerX < destination_box.right);
    const isOverlapY = (draggable_centerY > destination_box.top && draggable_centerY < destination_box.bottom);

    return isOverlapX && isOverlapY;
}