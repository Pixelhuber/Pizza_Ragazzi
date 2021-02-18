package models.pizza_rush;

import java.util.HashSet;
import java.util.List;

public class PizzaValidation {

    private final int orderPoints;
    private final List<Integer> orderIngredientIds;
    private final List<Integer> createdPizzaIngredientIds;
    private final int createdPizzaBakeStatus;

    public PizzaValidation(int orderPoints,List<Integer> orderIngredientIds,List<Integer> createdPizzaIngredientIds,int createdPizzaBakeStatus){
        if(orderPoints==0||orderIngredientIds==null||createdPizzaIngredientIds==null)throw new NullPointerException("Parameter ist null");
        this.orderPoints=orderPoints;
        this.orderIngredientIds=orderIngredientIds;
        this.createdPizzaIngredientIds=createdPizzaIngredientIds;
        this.createdPizzaBakeStatus=createdPizzaBakeStatus;
    }

    // Calculates how many points this pizza should get
    public int calculatePoints(){
        int points=orderPoints;
        if(pizzaEqualsOrder()){
            switch(createdPizzaBakeStatus){
                case 3: // UNBAKED
                    points = (int)(points * 0.25);
                    break;
                case 4: // WELL
                    //no negative Points since its baked
                    break;
                case 5: // BURNT
                    points = (int)(points * 0.25);
                    break;
            }
        } else {
            points = 0;
        }
        return points;
    }

    public boolean pizzaEqualsOrder (){
        return listEquals(createdPizzaIngredientIds,orderIngredientIds);
    }

    public static <Integer> boolean listEquals(List<Integer> list1, List<Integer> list2) {
        return new HashSet<>(list1).equals(new HashSet<>(list2));
    }
}
