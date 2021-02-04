package models.pizza_rush;

import java.util.List;

public class Pizza {

    private String name;
    private List<String> ingredients;

    public Pizza(String name, List<String> ingredients) {
        this.name = name;
        this.ingredients = ingredients;
    }

    //TODO validates a pizza with the database and checks if ingredients are doubled on the pizza
    public boolean validatePizza(){
        return true;
    }

}
