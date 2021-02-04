package models.pizza_rush;

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

    public List<IngredientFactory.Ingredient> getOrderIngredients(){
        return db.withConnection(conn -> {
            List<IngredientFactory.Ingredient> ingredients = new ArrayList<>();
            PreparedStatement stmt = conn.prepareStatement("SELECT * FROM Ingredient");//TODO SQL statement falsch
            ResultSet rs = stmt.executeQuery();
            while (rs.next()) {
                //TODO noch machen
            }
            stmt.close();
            return ingredients;
        });
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

        public List<IngredientFactory.Ingredient> getIngredients() {
            return ingredients;
        }
    }
}
