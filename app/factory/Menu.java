package factory;

import com.fasterxml.jackson.databind.ObjectMapper;
import play.db.Database;
import scala.util.parsing.json.JSONObject;

import javax.inject.Inject;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.ArrayList;
import java.util.List;

public class Menu {
    Database db;

    @Inject
    public Menu(Database db) {
        this.db = db;
    }


    public LevelUpViewModel checkForLevelUp(UserFactory.User user) {
        int userTotalPoints = user.getTotalPoints();
        int userCurrentTier = user.getCurrentTier();

        return db.withConnection(conn -> {
            String sql = "SELECT * FROM Tier";
            PreparedStatement stmt = conn.prepareStatement(sql);
            ResultSet rs = stmt.executeQuery();


            ArrayList<String[]> rsAsList = new ArrayList<>();
            while (rs.next())
                rsAsList.add(new String[]{rs.getString("idTier"), rs.getString("name"), rs.getString("gesamtpunkte")});

            int iHighestPossibleTier = 0;
            for (int i = 0; i < rsAsList.size(); i++) {
                String[] current = rsAsList.get(i);

                if (Integer.parseInt(current[2]) < userTotalPoints)
                    iHighestPossibleTier = i;
            }

            String[] highestPossibleTier = rsAsList.get(iHighestPossibleTier);
            boolean isLevelUpPossible = Integer.parseInt(rsAsList.get(iHighestPossibleTier)[0]) > userCurrentTier;

            if (isLevelUpPossible) // User can level up
                return new LevelUpViewModel(true, highestPossibleTier[1], Integer.parseInt(highestPossibleTier[2]));
            else if (iHighestPossibleTier < rsAsList.size()-1) // User can't level up yet
                return new LevelUpViewModel(false, rsAsList.get(iHighestPossibleTier+1)[1], Integer.parseInt(rsAsList.get(iHighestPossibleTier+1)[2]));
            else // User already is highest level
                return new LevelUpViewModel(false, "", 0);
        });
    }

    public class LevelUpViewModel {

        boolean isLevelUpPossible;
        String nextTier;
        int nextTierPoints;

        public LevelUpViewModel(boolean isLevelUpPossible, String nextTier, int nextTierPoints) {
            this.isLevelUpPossible = isLevelUpPossible;
            this.nextTier = nextTier;
            this.nextTierPoints = nextTierPoints;
        }

        public boolean isLevelUpPossible() {
            return isLevelUpPossible;
        }

        public String getNextTier() {
            return nextTier;
        }

        public int getNextTierPoints() {
            return nextTierPoints;
        }
    }
}
