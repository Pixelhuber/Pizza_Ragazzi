package models;

import java.sql.ResultSet;
import java.sql.SQLException;

/**
 * The type Achievement.
 */
public class Achievement {

    private final int id;
    private final String name;
    private final String description;

    /**
     * Instantiates a new Achievement.
     *
     * @param rs the rs
     * @throws SQLException the sql exception
     */
    public Achievement(ResultSet rs) throws SQLException {
        this.id  =rs.getInt("idReward");
        this.name = rs.getString("name");
        this.description = rs.getString("description");
    }

    /**
     * Gets id.
     *
     * @return the id
     */
    public int getId() {
        return id;
    }

    /**
     * Gets name.
     *
     * @return the name
     */
    public String getName() {
        return name;
    }

    /**
     * Gets description.
     *
     * @return the description
     */
    public String getDescription() {
        return description;
    }
}
