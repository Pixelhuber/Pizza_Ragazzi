package models.pizza_rush;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import factory.FactoryExceptions.ProfilePictureException;
import factory.UserFactory;
import org.checkerframework.checker.units.qual.A;
import play.db.Database;

import javax.imageio.ImageIO;
import javax.inject.Inject;
import javax.inject.Singleton;
import java.awt.image.BufferedImage;
import java.io.*;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Base64;
import java.util.List;

@Singleton
public class PizzaRushFactory {
    Database db;

    @Inject
    public PizzaRushFactory(Database db){
        this.db=db;
    }

    public List<Ingredient> getAllIngredients(){
        return db.withConnection(conn -> {
            List<Ingredient> ingredients = new ArrayList<>();
            PreparedStatement stmt = conn.prepareStatement("SELECT * FROM `Ingredient`");
            ResultSet rs = stmt.executeQuery();
            while (rs.next()) {
                Ingredient ingredient = new Ingredient(rs);
                ingredients.add(ingredient);
            }
            stmt.close();
            return ingredients;
        });
    }

    public Ingredient getIngredientById(int id){
        return db.withConnection(conn -> {
            Ingredient ingredient = null;
            PreparedStatement stmt = conn.prepareStatement("SELECT * FROM `Ingredient` WHERE idIngredient = ?");
            stmt.setInt(1, id);
            ResultSet rs = stmt.executeQuery();
            if (rs.next()) {
                ingredient = new Ingredient(rs);
            }
            stmt.close();
            return ingredient;
        });
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
            }
            stmt.close();
            return result; //Liste muss iwie zu JSON konvertiert werden evtl. mit Gson
        });
    }

    public List<Order> getAvailablePizzas(String email){
        return db.withConnection(conn -> {
            List<Order> result = new ArrayList<>();
            String sql = "SELECT * FROM Pizza WHERE idPizza NOT IN (SELECT Pizza_idPizza FROM Ingredient INNER JOIN Pizza_has_Ingredient PhI ON Ingredient.idIngredient = PhI.Ingredient_idIngredient WHERE Tier_idTier > (SELECT Tier_idTier FROM `User` WHERE email = ?))";
            PreparedStatement stmt = conn.prepareStatement(sql);
            stmt.setString(1, email);
            ResultSet rs = stmt.executeQuery();
            while (rs.next()) {
                Order order = new Order(rs);
                result.add(order);
            }
            stmt.close();
            return result; //Liste muss iwie zu JSON konvertiert werden evtl. mit Gson
        });
    }

    private static String encodeFileToBase64(File file){
        String encoded = null;
        try {
            FileInputStream fileInputStreamReader = new FileInputStream(file);
            byte[] bytes = new byte[(int)file.length()];
            fileInputStreamReader.read(bytes);
            encoded = new String(Base64.getEncoder().encode(bytes), "UTF-8");
        } catch (FileNotFoundException e) {
            e.printStackTrace();
        } catch (IOException e) {
            e.printStackTrace();
        }
        return encoded;
    }


//-----------KLASSEN-------------------------------------------------------------------------------------------
    public class Ingredient{
        int id;
        String name;
        @JsonIgnore //https://gist.github.com/vikrum/4758434
        BufferedImage picture_raw;
        @JsonIgnore
        BufferedImage picture_raw_distractor;
        @JsonIgnore
        BufferedImage picture_processed;
        @JsonIgnore
        BufferedImage picture_baked;
        @JsonIgnore
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
            this.ingredients = new ArrayList<>(getOrderIngredientsFromDatabase());
        }

        public List<Ingredient> getOrderIngredientsFromDatabase(){
            return db.withConnection(conn -> {
                List<Ingredient> result = new ArrayList<>();
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
            return ingredients;
        }

        public int getId() {
            return id;
        }

        public String getName() {
            return name;
        }

        public int getPoints() {
            return points;
        }
    }
}
