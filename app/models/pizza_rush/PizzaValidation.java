package models.pizza_rush;

import java.util.HashSet;
import java.util.List;

public class PizzaValidation {

    private int orderPoints;
    private List<Integer> orderIngredientIds;
    private List<Integer> createdPizzaIngredientIds;
    private int createdPizzaBakeStatus;

    public PizzaValidation(int orderPoints,List<Integer> orderIngredientIds,List<Integer> createdPizzaIngredientIds,int createdPizzaBakeStatus){
        if(orderPoints==0||orderIngredientIds==null||createdPizzaIngredientIds==null)throw new NullPointerException("Parameter ist null");
        this.orderPoints=orderPoints;
        this.orderIngredientIds=orderIngredientIds;
        this.createdPizzaIngredientIds=createdPizzaIngredientIds;
        this.createdPizzaBakeStatus=createdPizzaBakeStatus;
    }

    public int calculatePoints(){
        int points=orderPoints;
        if(listEquals(createdPizzaIngredientIds,orderIngredientIds)){
            switch(createdPizzaBakeStatus){
                case 0:
                    points=points/2;
                    break;
                case 1:
                    //no negative Points since its baked
                    break;
                case 2:
                    points=points-(points/4);
                    break;
            }
        }else{
            points=10;
        }
        return points;
    }

    public static <Integer> boolean listEquals(List<Integer> list1, List<Integer> list2) {
        return new HashSet<>(list1).equals(new HashSet<>(list2));
    }
}
