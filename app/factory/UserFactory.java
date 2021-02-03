package factory;

import factory.FactoryExceptions.EmailAlreadyInUseException;
import factory.FactoryExceptions.InvalidEmailException;
import factory.FactoryExceptions.ProfilePictureException;
import play.db.Database;
import scala.Console;

import javax.imageio.ImageIO;
import javax.inject.Inject;
import javax.inject.Singleton;
import java.awt.image.BufferedImage;
import java.io.BufferedInputStream;
import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.sql.*;
import java.util.*;

@Singleton
public class UserFactory {

    private Database db;

    @Inject
    public UserFactory(Database db) {
        this.db = db;
    }

    /**
     * Authenticates a user with the given credentials
     *
     * @param email    email from user input
     * @param password password from user input
     * @return Found user or null if user not found
     */
    public User authenticateUser(String email, String password) {
        return db.withConnection(conn -> {
            User user = null;
            PreparedStatement stmt = conn.prepareStatement("SELECT * FROM User WHERE email = ? AND password = ?");
            stmt.setString(1, email);
            stmt.setString(2, password);
            ResultSet rs = stmt.executeQuery();
            if (rs.next()) {
                user = new User(rs);
            }
            stmt.close();
            return user;
        });
    }

    //TODO complete this
    public User createUser(String email, String name, String password) {
        if (!email.matches("[a-zA-Z0-9._%+-]+[@]+[a-zA-Z0-9.-]+[.]+[a-zA-Z]{2,6}"))
            throw new InvalidEmailException("The e-mail " + email + " is not valid");
        if (!isEmailAvailable(email))
            throw new EmailAlreadyInUseException("The e-mail " + email + " is already in use");
        return db.withConnection(conn -> {
            String sql = "INSERT INTO User (username, email, password, gesamtpunkte, highscore, Tier_idTier) VALUES (?, ?, ?, ?, ?, ?)";
            PreparedStatement stmt = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
            stmt.setString(1, name);
            stmt.setString(2, email);
            stmt.setString(3, password);
            stmt.setInt(4, 0);
            stmt.setInt(5, 0);
            stmt.setInt(6, 0);
            stmt.executeUpdate();
            stmt.close();
            return getUserByEmail(email);
        });
    }

    /**
     * checks if a user exists in the db
     *
     * @param email the unique identifier of the user, his email address
     * @return true if there is no user, false if the email is already in use
     */
    public boolean isEmailAvailable(String email) {
        User user = getUserByEmail(email);
        if (user == null)
            return true;
        return false;
    }

    public User getUserByEmail(String email) {
        if (!email.matches("[a-zA-Z0-9._%+-]+[@]+[a-zA-Z0-9.-]+[.]+[a-zA-Z]{2,6}"))
            throw new InvalidEmailException("The e-mail " + email + " is not valid");
        return db.withConnection(conn -> {
            User user = null;
            PreparedStatement stmt = conn.prepareStatement("SELECT * FROM User WHERE email = ?");
            stmt.setString(1, email);
            ResultSet rs = stmt.executeQuery();
            if (rs.next()) {
                user = new User(rs);
            }
            stmt.close();
            return user;
        });
    }

    /**
     * Retrieves a user from database with given ID
     *
     * @param id id of user to find
     * @return User if found, else null
     */
    public User getUserById(int id) {
        return db.withConnection(conn -> {
            User user = null;
            PreparedStatement stmt = conn.prepareStatement("SELECT * FROM User WHERE idUser = ?");
            stmt.setInt(1, id);
            ResultSet rs = stmt.executeQuery();
            if (rs.next()) {
                user = new User(rs);
            }
            stmt.close();
            return user;
        });
    }

    /**
     * Polymorphism method for getUserById(int)
     *
     * @param id String of id
     * @return User if found, else null
     */
    public User getUserById(String id) {
        return getUserById(Integer.parseInt(id));
    }

    public List<User> getAllUsers() {
        return db.withConnection(conn -> {
            List<User> users = new ArrayList<>();
            PreparedStatement stmt = conn.prepareStatement("SELECT * FROM User");
            ResultSet rs = stmt.executeQuery();
            while (rs.next()) {
                User user = new User(rs);
                users.add(user);
            }
            stmt.close();
            return users;
        });
    }

    public String[][] getHighscoreData() {

        List<UserFactory.User> users = getAllUsers();

        String[][] data = new String[users.size()][2];

        for (int i = 0; i < users.size(); i++) {
            data[i][0] = users.get(i).username;
            data[i][1] = String.valueOf(users.get(i).getHighScore());
        }
        return data;
    }

    public class User {
        private int id;
        private String username;
        private String email;
        private int totalPoints;
        private int highScore;
        private BufferedImage profilePicture;
        private int currentTier;

        public User(int id, String username, String email, int totalPoints, int highScore, BufferedImage profilePicture, int currentTier) {
            this.id = id;
            this.username = username;
            this.email = email;
            this.totalPoints = totalPoints;
            this.highScore = highScore;
            this.profilePicture = profilePicture;
            this.currentTier = currentTier;
        }

        private User(ResultSet rs) throws SQLException {
            this.id = rs.getInt("idUser");
            this.username = rs.getString("username");
            this.email = rs.getString("email");
            this.totalPoints = rs.getInt("gesamtpunkte");
            this.highScore = rs.getInt("highscore");
            BufferedInputStream bis = new BufferedInputStream(rs.getBinaryStream("profilepicture"));
            if (bis != null) {
                try {
                    profilePicture = ImageIO.read(bis);
                } catch (IOException invalidProfilePicture) {
                    throw new ProfilePictureException("We had trouble getting the profile picture");
                }
            }
            this.currentTier = rs.getInt("Tier_idTier");
        }

        /**
         * Updates the user if it already exists and creates it otherwise. Assumes an
         * autoincrement id column.
         */
        //TODO: add BufferedImage profilePicture
        public void save() {
            db.withConnection(conn -> {
                String sql = "UPDATE User SET username = ?, email = ?, gesamtpunkte = ?, highscore = ?, Tier_idTier = ? WHERE idUser = ?";
                PreparedStatement stmt = conn.prepareStatement(sql);
                stmt.setString(1, this.username);
                stmt.setString(2, this.email);
                stmt.setInt(3, this.totalPoints);
                stmt.setInt(4, this.highScore);
                stmt.setInt(5, this.currentTier);
                stmt.setInt(6, this.id);
                stmt.executeUpdate();
                stmt.close();
            });
        }

        /**
         * Delete the user from the database
         */
        public void delete() {
            db.withConnection(conn -> {
                String sql = "DELETE FROM User WHERE idUser = ?";
                PreparedStatement stmt = conn.prepareStatement(sql);
                stmt.setInt(1, this.id);
                stmt.executeUpdate();
                stmt.close();
            });
        }

        public List<User> getFriends() {
            return db.withConnection(conn -> {
                List<User> result = new ArrayList<>();
                String sql = "SELECT * FROM `Friendship` WHERE User_idUser_One = ? OR User_idUser_Two = ?";
                PreparedStatement stmt = conn.prepareStatement(sql);
                stmt.setInt(1, this.id);
                stmt.setInt(2, this.id);
                ResultSet rs = stmt.executeQuery();
                while (rs.next()) {

                    int friendId = (int) rs.getObject("User_idUser_one");
                    if (friendId == this.id) {
                        friendId = (int) rs.getObject("User_idUser_two");
                    }
                    User user = getUserById(friendId);
                    result.add(user);
                }
                stmt.close();
                return result;
            });
        }

        public Map<String,String> getFriendsData() throws IOException {

            List<User> users = getFriends();

            Map<String,String> data = new HashMap<>();

            for (User user : users) {
                //Sets default Profile pic if none was Uploaded
                String path="https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png";
                if (user.profilePicture != null) {
                    ImageIO.write(user.getProfilePicture(), "png", new File("tmpImage.png"));
                    byte[] imageBytes = Files.readAllBytes(Paths.get("tmpImage.png"));
                    Base64.Encoder encoder = Base64.getEncoder();
                    path = "data:image/png;base64," + encoder.encodeToString(imageBytes);
                }
                data.put(user.username, path);
            }
            return data;

        }

        public int getId() {
            return id;
        }

        public void setId(int id) {
            this.id = id;
            save();
        }

        public String getUsername() {
            return username;
        }

        public void setUsername(String username) {
            this.username = username;
            save();
        }

        public String getEmail() {
            return email;
        }

        public void setEmail(String email) {
            this.email = email;
            save();
        }

        public int getTotalPoints() {
            return totalPoints;
        }

        public void setTotalPoints(int totalPoints) {
            this.totalPoints = totalPoints;
            save();
        }

        public int getHighScore() {
            return highScore;
        }

        public void setHighScore(int highScore) {
            this.highScore = highScore;
            save();
        }

        public BufferedImage getProfilePicture() {
            return profilePicture;
        }

        public void setProfilePicture(BufferedImage profilePicture) {
            this.profilePicture = profilePicture;
            save();
        }

        public int getCurrentTier() {
            return currentTier;
        }

        public void setCurrentTier(int currentTier) {
            this.currentTier = currentTier;
            save();
        }
    }
}
