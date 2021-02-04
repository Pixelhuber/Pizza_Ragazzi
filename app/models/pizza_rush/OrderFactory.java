package models.pizza_rush;

import controllers.PizzaRushController;
import factory.UserFactory;

import org.springframework.core.annotation.Order;
import play.db.Database;

import javax.inject.Inject;
import javax.inject.Singleton;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

@Singleton
public class OrderFactory {
    Database db;

    @Inject
    public OrderFactory(Database db){
        this.db=db;
    }


    public class Order{
        int id;
        String name;
        int points;
        List<IngredientFactory.Ingredient> ingredients;

        public Order (ResultSet rs) throws SQLException {
            this.id=rs.getInt("idPizza");
            this.name=rs.getString("name");
            this.points=rs.getInt("points");
            //TODO ingredients noch hinzufügen
        }

        public List<Integer> getOrderIngredientsId(){
            return db.withConnection(conn -> {
                List<Integer> result = new ArrayList<>();
                //TODO sql statement nochmal überprüfen
                PreparedStatement stmt = conn.prepareStatement("SELECT Ingredient_idIngredient FROM `Pizza_has_Ingredient` WHERE Pizza_idPizza =? ");
                stmt.setInt(1,getId());
                ResultSet rs = stmt.executeQuery();
                while (rs.next()) {
                    result.add((Integer) rs.getObject("Ingredient_idIngredient"));
                }
                stmt.close();
                return result;
            });
        }

        public List<IngredientFactory.Ingredient> getIngredients() {
            return ingredients;
        }

        public int getId() {
            return id;
        }
    }
}
