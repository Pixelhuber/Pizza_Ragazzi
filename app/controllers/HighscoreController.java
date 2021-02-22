package controllers;

import factory.UserFactory;
import play.libs.Json;
import play.mvc.Controller;
import play.mvc.Result;


import javax.inject.Inject;

/**
 * The type Highscore controller.
 */
public class HighscoreController extends Controller {
    private final UserFactory userFactory;

    /**
     * Instantiates a new Highscore controller.
     *
     * @param userFactory the user factory
     */
    @Inject
    public HighscoreController(UserFactory userFactory) {
        this.userFactory = userFactory;
    }

/*    public Result getTableData() {
        return ok(Json.toJson(highscoreData.getTableData()));
    }
}*/

    /**
     * Gets table data.
     *
     * @return the table data
     */
    public Result getTableData() {
        return ok(Json.toJson(userFactory.getHighscoreData()));
    }

}
