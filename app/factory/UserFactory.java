package factory;

import play.db.Database;

import javax.inject.Inject;
import javax.inject.Singleton;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;

@Singleton
public class UserFactory {

    private Database db;

    @Inject
    UserFactory(Database db) {
        this.db = db;
    }

    /**
     * Authenticates a user with the given credentials
     *
     * @param username username from user input
     * @param password password from user input
     * @return Found user or null if user not found
     */
    public User authenticate(String username, String password) {
        return db.withConnection(conn -> {
            User user = null;
            PreparedStatement stmt = conn.prepareStatement("SELECT * FROM User WHERE Username = ? AND Password = ?");
            stmt.setString(1, username);
            stmt.setString(2, password);
            ResultSet rs = stmt.executeQuery();
            if (rs.next()) {
                user = new User(rs);
            }
            stmt.close();
            return user;
        });
    }

    public User create(String name, String email, String password, int gesamtpunkte, int highscore, int idTier) {
        return db.withConnection(conn -> {
            User user = null;
            String sql = "INSERT INTO `User` (username, email, password, gesamtpunkte, highscore, Tier_idTier) VALUES (?, ?, ?, ?, ?, ?, ?)";
            PreparedStatement stmt = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
            stmt.setString(1, name);
            stmt.setString(3, email);
            stmt.setString(4, password);
            stmt.setInt(5, gesamtpunkte);
            stmt.setInt(6, highscore);
            stmt.setInt(7, idTier);
            stmt.executeUpdate();
            ResultSet rs = stmt.getGeneratedKeys();
            if (rs.next()) {
                int id = rs.getInt(1);
                user = new User(id, name, email, gesamtpunkte, highscore, idTier);
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
            PreparedStatement stmt = conn.prepareStatement("SELECT * FROM `User` WHERE idUser = ?");
            stmt.setInt(1, id);
            ResultSet rs = stmt.executeQuery();
            if (rs.next()) {
                user = new User(rs);
            }
            stmt.close();
            System.out.println(user.toString());
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
        private String mail;
        private int gesamtpunkte;
        private int highscore;
        //private ???? profilepicture;
        private int idTier;

        private User(int id, String username, String mail, int gesamtpunkte, int highscore, int idTier) {
            this.id = id;
            this.username = username;
            this.mail = mail;
            this.gesamtpunkte = gesamtpunkte;
            this.highscore = highscore;
            this.idTier = idTier;
        }

        private User(ResultSet rs) throws SQLException {
            this.id = rs.getInt("idUser");
            this.username = rs.getString("username");
            this.mail = rs.getString("email");
            this.gesamtpunkte = rs.getInt("gesamtpunkte");
            this.highscore = rs.getInt("gesamtpunkte");
            this.highscore = rs.getInt("highscore");
            this.idTier = rs.getInt("Tier_idTier");
        }

        /**
         * Updates the user if it already exists and creates it otherwise. Assumes an
         * autoincrement id column.
         */
        public void save() {
            db.withConnection(conn -> {
                String sql = "UPDATE User SET Username = ?, gesamtpunkte = ?, Email = ? WHERE UserId = ?";
                PreparedStatement stmt = conn.prepareStatement(sql);
                stmt.setString(1, this.username);
                stmt.setInt(2, this.gesamtpunkte);
                stmt.setString(3, this.mail);
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
                String sql = "DELETE FROM User WHERE UserId = ?";
                PreparedStatement stmt = conn.prepareStatement(sql);
                stmt.setInt(1, this.id);
                stmt.executeUpdate();
                stmt.close();
            });
        }

        public List<User> getFriends() {
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
        }

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
            this.save();
        }

        public int getHighscore() {
            return highscore;
        }

        public void setHighscore(int highscore) {
            this.highscore = highscore;
        }

        public int getIdTier() {
            return idTier;
        }

        public void setIdTier(int idTier) {
            this.idTier = idTier;
        }

        public String getMail() {
            return mail;
        }

        public void setMail(String mail) {
            this.mail = mail;
        }

        public int getGesamtpunkte() {
            return gesamtpunkte;
        }

        public void setGesamtpunkte(int gesamtpunkte) {
            this.gesamtpunkte = gesamtpunkte;
        }

        public void addGesamtpunkte(int gesamtpunkte) {
            this.gesamtpunkte += gesamtpunkte;
            this.save();
        }
    }
        public String[][] getTableData() {

            List<UserFactory.User> users = getAllUsers();
            String[][] data = new String[users.size()][2];
            User user;

            for (int i = 0; i < users.size(); i++) {
                user = getUserById(i+1);
                data[i][0] = user.getUsername();
                data[i][1] = String.valueOf(user.getHighscore());
            }
            return data;

        }

}
