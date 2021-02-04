package models.pizza_rush;

import java.util.List;

public class PizzaCreation {


    private List<String> ingredients;

    public PizzaCreation(List<String> ingredients) {
        this.ingredients = ingredients;
    }

    //TODO validates a pizza with the database and checks if ingredients are doubled on the pizza
    public boolean validatePizza(){
        return true;
    }

}
