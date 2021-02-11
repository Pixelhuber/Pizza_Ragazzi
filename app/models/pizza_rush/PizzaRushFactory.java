package models.pizza_rush;

import com.fasterxml.jackson.annotation.JsonIgnore;
import factory.FactoryExceptions.ProfilePictureException;
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
    public PizzaRushFactory(Database db) {
        this.db = db;
    }

    public List<Ingredient> getAllIngredients() {
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

    public Ingredient getIngredientById(int id) {
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

    public List<Ingredient> getAvailableIngredients(String email) {
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

    public List<Order> getAvailablePizzas(String email) {
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

    public String encodeImageToString(BufferedImage image, String type) {
        String imageString = null;
        ByteArrayOutputStream bos = new ByteArrayOutputStream();

        try {
            ImageIO.write(image, type, bos);
            byte[] imageBytes = bos.toByteArray();

            imageString = "data:image/" + type + ";base64," + Base64.getEncoder().encodeToString(imageBytes);

            bos.close();
        } catch (IOException e) {
            e.printStackTrace();
        }
        return imageString;
    }


    //-----------KLASSEN-------------------------------------------------------------------------------------------
    public class Ingredient {
        int id;
        String name;         //https://gist.github.com/vikrum/4758434
        String picture_raw;
        String picture_raw_distractor;
        String picture_processed;
        String picture_baked;
        String picture_burnt;
        int tier;
        int vertex_x_inPercent;
        int vertex_y_inPercent;
        int speed;
        int rotation;

        public Ingredient(ResultSet rs) throws SQLException {
            this.id = rs.getInt("idIngredient");
            this.name = rs.getString("name");
            BufferedInputStream bis_raw = new BufferedInputStream(rs.getBinaryStream("picture_raw"));
            try {
                this.picture_raw = encodeImageToString(ImageIO.read(bis_raw), "png");
            } catch (IOException invalidProfilePicture) {
                throw new ProfilePictureException("We had trouble getting the " + picture_raw);
            }
            BufferedInputStream bis_raw_distractor = new BufferedInputStream(rs.getBinaryStream("picture_raw"));
            try {
                this.picture_raw_distractor = encodeImageToString(ImageIO.read(bis_raw_distractor), "png");
            } catch (IOException invalidProfilePicture) {
                throw new ProfilePictureException("We had trouble getting the " + picture_raw_distractor);
            }
            BufferedInputStream bis_processed = new BufferedInputStream(rs.getBinaryStream("picture_processed"));
            try {
                this.picture_processed = encodeImageToString(ImageIO.read(bis_processed), "png");
            } catch (IOException invalidProfilePicture) {
                throw new ProfilePictureException("We had trouble getting the " + picture_processed);
            }
            BufferedInputStream bis_baked = new BufferedInputStream(rs.getBinaryStream("picture_baked"));
            try {
                this.picture_baked = encodeImageToString(ImageIO.read(bis_baked), "png");
            } catch (IOException invalidProfilePicture) {
                throw new ProfilePictureException("We had trouble getting the " + picture_baked);
            }
            BufferedInputStream bis_burnt = new BufferedInputStream(rs.getBinaryStream("picture_burnt"));
            try {
                this.picture_burnt = encodeImageToString(ImageIO.read(bis_burnt), "png");
            } catch (IOException invalidProfilePicture) {
                throw new ProfilePictureException("We had trouble getting the " + picture_burnt);
            }
            this.tier = rs.getInt("Tier_idTier");
            setIngredientFlightBehaviorFromDatabase();
        }

        private void setIngredientFlightBehaviorFromDatabase() {
            db.withConnection(conn -> {
                PreparedStatement stmt = conn.prepareStatement("SELECT * FROM `FlightBehavior` WHERE Ingredient_idIngredient = ? ");
                stmt.setInt(1, this.id);
                ResultSet rs = stmt.executeQuery();
                while (rs.next()) {
                    this.vertex_x_inPercent = rs.getInt("vertex_x_inPercent");
                    this.vertex_y_inPercent = rs.getInt("vertex_y_inPercent");
                    this.speed = rs.getInt("speed");
                    this.rotation = rs.getInt("rotation");
                }
                stmt.close();
            });
        }

        public int getId() {
            return id;
        }

        public String getName() {
            return name;
        }

        public String getPicture_raw() {
            return picture_raw;
        }

        public String getPicture_raw_distractor() {
            return picture_raw_distractor;
        }

        public String getPicture_processed() {
            return picture_processed;
        }

        public String getPicture_baked() {
            return picture_baked;
        }

        public String getPicture_burnt() {
            return picture_burnt;
        }

        public int getTier() {
            return tier;
        }

        public int getVertex_x_inPercent() {
            return vertex_x_inPercent;
        }

        public int getVertex_y_inPercent() {
            return vertex_y_inPercent;
        }

        public int getSpeed() {
            return speed;
        }

        public int getRotation() {
            return rotation;
        }

        @Override
        public String toString() {
            return "Ingredient{" +
                    "id=" + id +
                    ", name='" + name + '\'' +
                    ", picture_raw=" + picture_raw +
                    ", picture_raw_distractor=" + picture_raw_distractor +
                    ", picture_processed=" + picture_processed +
                    ", picture_baked=" + picture_baked +
                    ", picture_burnt=" + picture_burnt +
                    ", tier=" + tier +
                    ", vertex_x_inPercent=" + vertex_x_inPercent +
                    ", vertex_y_inPercent=" + vertex_y_inPercent +
                    ", speed=" + speed +
                    ", rotation=" + rotation +
                    '}';
        }
    }

    public class Order { //Ideale Pizza, also einfach Pizza aus Datenbank
        int id;
        String name;
        int points;
        List<Ingredient> ingredients;

        public Order(ResultSet rs) throws SQLException {
            this.id = rs.getInt("idPizza");
            this.name = rs.getString("name");
            this.points = rs.getInt("points");
            this.ingredients = new ArrayList<>(setOrderIngredientsFromDatabase());
        }

        private List<Ingredient> setOrderIngredientsFromDatabase() {
            return db.withConnection(conn -> {
                List<Ingredient> result = new ArrayList<>();
                PreparedStatement stmt = conn.prepareStatement("SELECT Ingredient_idIngredient FROM `Pizza_has_Ingredient` WHERE Pizza_idPizza =? ");
                stmt.setInt(1, getId());
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
