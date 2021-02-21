package factory;

import factory.FactoryExceptions.ProfilePictureException;
import play.db.Database;

import javax.imageio.ImageIO;
import javax.inject.Inject;
import javax.inject.Singleton;
import java.awt.image.BufferedImage;
import java.io.BufferedInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Base64;
import java.util.List;

@Singleton
public class MemoryFactory {

    private Database db;

    @Inject
    public MemoryFactory(Database db) {
        this.db = db;
    }

    public List<MemoryIngredient> getMemoryIngredients(String email) {

        return db.withConnection(conn -> {
            List<MemoryIngredient> result = new ArrayList<>();
            String sql = "SELECT idIngredient, name, description, picture_raw FROM Ingredient JOIN Memory M on Ingredient.idIngredient = M.Ingredient_fk WHERE Tier_idTier <= (SELECT Tier_idTier FROM `User` WHERE email = ?)";
            PreparedStatement stmt = conn.prepareStatement(sql);
            stmt.setString(1, email);
            ResultSet rs = stmt.executeQuery();
            while (rs.next()){
                result.add(new MemoryIngredient(rs));
            }
            stmt.close();
            return result;
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



    public class MemoryIngredient {

        int id;
        String name;
        String description;

        String picture;

        public MemoryIngredient (ResultSet rs) throws SQLException {

            this.id = rs.getInt("idIngredient");
            this.name = rs.getString("name");
            this.description = rs.getString("description");

            BufferedInputStream bis = new BufferedInputStream(rs.getBinaryStream("picture_raw"));
            try {
                this.picture = encodeImageToString(ImageIO.read(bis), "png");
            } catch (IOException invalidProfilePicture) {
                throw new ProfilePictureException("We had trouble getting \"picture_raw\"");
            }

        }

        public int getId() {
            return id;
        }

        public String getName() {
            return name;
        }

        public String getDescription() {
            return description;
        }

        public String getPicture() {
            return picture;
        }
    }
}
