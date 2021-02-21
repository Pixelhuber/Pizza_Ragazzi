package models;

import java.sql.ResultSet;
import java.sql.SQLException;

public class Achievement {

    private final int id;
    private final String name;
    private final String description;

    public Achievement(ResultSet rs) throws SQLException {
        this.id  =rs.getInt("idReward");
        this.name = rs.getString("name");
        this.description = rs.getString("description");
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
}
