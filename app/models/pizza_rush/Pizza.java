package models.pizza_rush;

import java.util.List;

public class Pizza {

    private String type;
    private List<String> ingredients;

    public Pizza(String type, List<String> ingredients) {
        this.type = type;
        this.ingredients = ingredients;
    }

    //TODO validates a pizza with the database and checks if ingredients are doubled on the pizza
    public boolean validatePizza(){
        return true;
    }

}
