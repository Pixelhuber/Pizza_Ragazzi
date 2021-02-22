package factory;

import play.db.Database;

import javax.inject.Inject;
import java.sql.PreparedStatement;
import java.sql.ResultSet;

public class MenuFactory {
    Database db;

    @Inject
    public MenuFactory(Database db) {
        this.db = db;
    }


    public boolean checkForLevelUp(UserFactory.User user) {
        int userTotalPoints = user.getTotalPoints();
        int userCurrentTier = user.getCurrentTier();

        return db.withConnection(conn -> {
            String sql = "SELECT * FROM Tier WHERE gesamtpunkte < ?";
            PreparedStatement stmt = conn.prepareStatement(sql);
            stmt.setInt(1, userTotalPoints);
            ResultSet rs = stmt.executeQuery();

            int idTier = 0;
            while (rs.next())
                idTier = rs.getInt("idTier");

            boolean ret = idTier > userCurrentTier;
            stmt.close();
            return ret;
        });
    }
}
