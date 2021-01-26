package factory;

import factory.FactoryExceptions.EmailAlreadyInUseException;
import factory.FactoryExceptions.InvalidEmailException;
import factory.FactoryExceptions.ProfilePictureException;
import play.db.Database;

import javax.imageio.ImageIO;
import javax.inject.Inject;
import javax.inject.Singleton;
import java.awt.image.BufferedImage;
import java.io.BufferedInputStream;
import java.io.IOException;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;

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
     * @param email email from user input
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
            throw new EmailAlreadyInUseException("The e-mail "+email+" is already in use");
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
            this.totalPoints = rs.getInt("highscore");
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
        //TODO: add int id, String username, String email, int totalPoints, int highScore, BufferedImage profilePicture, int currentTier here
        public void save() {
            db.withConnection(conn -> {
                String sql = "UPDATE User SET username = ?, totalPoints = ?, email = ? WHERE idUser = ?";
                PreparedStatement stmt = conn.prepareStatement(sql);
                stmt.setString(1, this.username);
                stmt.setInt(2, this.totalPoints);
                stmt.setString(3, this.email);
                stmt.setInt(4, this.id);
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

        //TODO: this function isn't correct yet
       /* public List<User> getFriends() {
            return db.withConnection(conn -> {
                List<User> result = new ArrayList<>();
                String sql = "SELECT * FROM Friendship, User WHERE User1Id = ? AND Friendship.User2Id = UserId";
                PreparedStatement stmt = conn.prepareStatement(sql);
                stmt.setInt(1, this.id);
                ResultSet rs = stmt.executeQuery();
                while (rs.next()) {
                    User user = new User(rs);
                    result.add(user);
                }
                stmt.close();
                return result;
            });
        }*/

        public int getId() {
            return id;
        }

        public void setId(int id) {
            this.id = id;
        }

        public String getUsername() {
            return username;
        }

        public void setUsername(String username) {
            this.username = username;
        }

        public String getEmail() {
            return email;
        }

        public void setEmail(String email) {
            this.email = email;
        }

        public int getTotalPoints() {
            return totalPoints;
        }

        public void setTotalPoints(int totalPoints) {
            this.totalPoints = totalPoints;
        }

        public int getHighScore() {
            return highScore;
        }

        public void setHighScore(int highScore) {
            this.highScore = highScore;
        }

        public BufferedImage getProfilePicture() {
            return profilePicture;
        }

        public void setProfilePicture(BufferedImage profilePicture) {
            this.profilePicture = profilePicture;
        }

        public int getCurrentTier() {
            return currentTier;
        }

        public void setCurrentTier(int currentTier) {
            this.currentTier = currentTier;
        }

        public void addPoints(int points) {
            this.totalPoints += points;
            this.save();
        }
    }


}