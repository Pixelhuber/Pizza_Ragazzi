package models.pizza_rush;

import org.h2.engine.Database;

import javax.inject.Inject;
import javax.inject.Singleton;
import java.awt.image.BufferedImage;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.*;

@Singleton
public class IngredientFactory {@Singleton
    Database db;

    @Inject
    public IngredientFactory(Database db){
        this.db=db;
    }

    public List<Ingredient> getAllIngredients(){
        return null;//TODO noch machen sowie andere wichtige Funktionen
    }


    public class Ingredient{
        int id;
        String name;
        BufferedImage picture_raw;
        BufferedImage picture_raw_distractor;
        BufferedImage picture_processed;
        BufferedImage picture_baked;
        BufferedImage picture_burnt;
        int tier;

        public Ingredient (ResultSet rs) throws SQLException {
            id=rs.getInt("idIngredient");
            //TODO rest noch machen
        }

    }


}
