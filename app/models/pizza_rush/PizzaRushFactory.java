package models.pizza_rush;

import factory.FactoryExceptions.ProfilePictureException;
import factory.UserFactory;
import play.db.Database;
import scala.util.parsing.json.JSONArray;

import javax.imageio.ImageIO;
import javax.inject.Inject;
import javax.inject.Singleton;
import java.awt.image.BufferedImage;
import java.io.BufferedInputStream;
import java.io.IOException;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Arrays;
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
        return db.withConnection(conn -> {
            List<Ingredient> result = new ArrayList<>();
            String sql = "SELECT * FROM Ingredient WHERE Tier_idTier <= (SELECT Tier_idTier FROM `User` WHERE email = ?)";
            PreparedStatement stmt = conn.prepareStatement(sql);
            stmt.setString(1, email);
            ResultSet rs = stmt.executeQuery();
            while (rs.next()) {
                Ingredient ingredient = new Ingredient(rs);
                result.add(ingredient);

                System.out.println(ingredient.getName());
            }
            stmt.close();
            return null; //Liste muss iwie zu JSON konvertiert werden evtl. mit Gson
        });
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
            id = rs.getInt("idIngredient");
            name = rs.getString("name");
            BufferedInputStream bis_raw = new BufferedInputStream(rs.getBinaryStream("picture_raw"));
            try {
                picture_raw = ImageIO.read(bis_raw);
            } catch (IOException invalidProfilePicture) {
                throw new ProfilePictureException("We had trouble getting the " + picture_raw);
            }
            BufferedInputStream bis_raw_disctractor = new BufferedInputStream(rs.getBinaryStream("picture_raw"));
            try {
                picture_raw_distractor = ImageIO.read(bis_raw_disctractor);
            } catch (IOException invalidProfilePicture) {
                throw new ProfilePictureException("We had trouble getting the " + picture_raw_distractor);
            }
            BufferedInputStream bis_processed = new BufferedInputStream(rs.getBinaryStream("picture_raw"));
            try {
                picture_processed = ImageIO.read(bis_processed);
            } catch (IOException invalidProfilePicture) {
                throw new ProfilePictureException("We had trouble getting the " + picture_processed);
            }
            BufferedInputStream bis_baked = new BufferedInputStream(rs.getBinaryStream("picture_raw"));
            try {
                picture_baked = ImageIO.read(bis_baked);
            } catch (IOException invalidProfilePicture) {
                throw new ProfilePictureException("We had trouble getting the " + picture_baked);
            }
            BufferedInputStream bis_burnt = new BufferedInputStream(rs.getBinaryStream("picture_raw"));
            try {
                picture_burnt = ImageIO.read(bis_burnt);
            } catch (IOException invalidProfilePicture) {
                throw new ProfilePictureException("We had trouble getting the " + picture_burnt);
            }
            tier = rs.getInt("Tier_idTier");
        }

    public int getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public BufferedImage getPicture_raw() {
        return picture_raw;
    }

    public BufferedImage getPicture_raw_distractor() {
        return picture_raw_distractor;
    }

    public BufferedImage getPicture_processed() {
        return picture_processed;
    }

    public BufferedImage getPicture_baked() {
        return picture_baked;
    }

    public BufferedImage getPicture_burnt() {
        return picture_burnt;
    }

    public int getTier() {
        return tier;
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
                    result.add(getIngredientById(rs.getInt("Ingredient_idIngredient")));
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
