package factory;

import com.fasterxml.jackson.databind.ObjectMapper;
import play.db.Database;
import scala.util.parsing.json.JSONObject;

import javax.inject.Inject;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.ArrayList;
import java.util.List;

/**
 * The type Menu.
 */
public class Menu {
    /**
     * The Db.
     */
    Database db;

    /**
     * Instantiates a new Menu.
     *
     * @param db the db
     */
    @Inject
    public Menu(Database db) {
        this.db = db;
    }


    /**
     * Check for level up level up view model.
     *
     * @param user the user
     * @return the level up view model
     */
    public LevelUpViewModel checkForLevelUp(UserFactory.User user) {
        int userTotalPoints = user.getTotalPoints();
        int userCurrentTier = user.getCurrentTier();
        int userNextTier = userCurrentTier+1;

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

                if (Integer.parseInt(current[2]) <= userTotalPoints)
                    iHighestPossibleTier = i;
            }

            String[] highestPossibleTier = rsAsList.get(iHighestPossibleTier);
            boolean isLevelUpPossible = Integer.parseInt(rsAsList.get(iHighestPossibleTier)[0]) > userCurrentTier;

            if (isLevelUpPossible) // User can level up
                return new LevelUpViewModel(true, highestPossibleTier[1], Integer.parseInt(highestPossibleTier[2]), userNextTier);
            else if (iHighestPossibleTier < rsAsList.size()-1) // User can't level up yet
                return new LevelUpViewModel(false, rsAsList.get(iHighestPossibleTier+1)[1], Integer.parseInt(rsAsList.get(iHighestPossibleTier+1)[2]), userNextTier);
            else // User already is highest level
                return new LevelUpViewModel(false, "", 0, userNextTier);
        });
    }

    /**
     * The type Level up view model.
     */
    public class LevelUpViewModel {

        /**
         * The Is level up possible.
         */
        boolean isLevelUpPossible;
        /**
         * The Next tier.
         */
        String nextTier;
        /**
         * The Next tier points.
         */
        int nextTierPoints;

        int nextTierAsFigure;

        /**
         * Instantiates a new Level up view model.
         *
         * @param isLevelUpPossible the is level up possible
         * @param nextTier          the next tier
         * @param nextTierPoints    the next tier points
         */
        public LevelUpViewModel(boolean isLevelUpPossible, String nextTier, int nextTierPoints, int nextTierAsFigure) {
            this.isLevelUpPossible = isLevelUpPossible;
            this.nextTier = nextTier;
            this.nextTierPoints = nextTierPoints;
            this.nextTierAsFigure = nextTierAsFigure;
        }

        /**
         * Is level up possible boolean.
         *
         * @return the boolean
         */
        public boolean isLevelUpPossible() {
            return isLevelUpPossible;
        }

        /**
         * Gets next tier.
         *
         * @return the next tier
         */
        public String getNextTier() {
            return nextTier;
        }

        /**
         * Gets next tier points.
         *
         * @return the next tier points
         */
        public int getNextTierPoints() {
            return nextTierPoints;
        }
        public int getNextTierAsFigure() {
            return nextTierAsFigure;
        }
    }
}
