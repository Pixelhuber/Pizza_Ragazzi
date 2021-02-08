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

    public List<Ingredient> getAllIngredients(){
        return null;//TODO noch machen sowie andere wichtige Funktionen
    }

    public static Ingredient getIngredientById(int id){
        return null;//TODO noch machen sowie andere wichtige Funktionen
    }

    public List<Ingredient> getAvailableIngredients(String email){
        //TODO jacob gibt euch eine lustige sql abfrage die zuerst das UserTier und damit alle lustigen Zutaten abfragt
        // select * from Ingredient where Tier_idTier <= (select Tier_idTier from User where email = 'jj@jj.jj')
        return null;
    }

    public List<Order> getAvailablePizzas(String email){
        //TODO jacob gibt euch eine lustige SQL abfrage die alle veerfügbaren pizza zurückgibt
        // select * from Pizza where idPizza not in
        //                          (select Pizza_idPizza from Ingredient
        //                              inner join Pizza_has_Ingredient PhI on Ingredient.idIngredient = PhI.Ingredient_idIngredient
        //                          where Tier_idTier > (select Tier_idTier from User where email = 'jj@jj.jj'))
        return null;
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
        List<Ingredient> ingredients;

        public Order (ResultSet rs) throws SQLException {
            this.id=rs.getInt("idPizza");
            this.name=rs.getString("name");
            this.points=rs.getInt("points");
            //TODO ingredients noch hinzufügen
        }

        public List<Ingredient> getOrderIngredients(){
            return db.withConnection(conn -> {
                List<Ingredient> result = new ArrayList<>();
                //TODO sql statement nochmal überprüfen
                PreparedStatement stmt = conn.prepareStatement("SELECT Ingredient_idIngredient FROM `Pizza_has_Ingredient` WHERE Pizza_idPizza =? ");
                stmt.setInt(1,getId());
                ResultSet rs = stmt.executeQuery();
                while (rs.next()) {
                    result.add(getIngredientById(rs.getInt("Ingredien_idIngredient")));
                }
                stmt.close();
                return result;
            });
        }

        public List<Ingredient> getIngredients() {
            return null;
        }

        public int getId() {
            return id;
        }
    }
}
