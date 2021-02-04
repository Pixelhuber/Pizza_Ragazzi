package models.pizza_rush;

import play.db.Database;

import javax.inject.Inject;
import javax.inject.Singleton;
import java.awt.image.BufferedImage;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

@Singleton
public class PizzaRushFactory {
    Database db;

    @Inject
    public PizzaRushFactory(Database db){
        this.db=db;
    }

    public List<IngredientFactory.Ingredient> getAllIngredients(){
        return null;//TODO noch machen sowie andere wichtige Funktionen
    }

    public static IngredientFactory.Ingredient getIngredientById(int id){
        return null;//TODO noch machen sowie andere wichtige Funktionen
    }


//-----------KLASSEN-------------------------------------------------------------------------------------------
    public class Ingredient{
        int id;
        String name;
        BufferedImage picture_raw;
        BufferedImage picture_raw_distractor;
        BufferedImage picture_processed;
        BufferedImage picture_baked;
        BufferedImage picture_burnt;
        int tier;

        public Ingredient (ResultSet rs) throws SQLException {
            id=rs.getInt("idIngredient");
            //TODO rest noch machen
        }

    }

    public class Order{ //Ideale Pizza, also einfach Pizza aus Datenbank
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
