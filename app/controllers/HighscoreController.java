package controllers;

import factory.UserFactory;
import play.libs.Json;
import play.mvc.Controller;
import play.mvc.Result;


import javax.inject.Inject;

public class HighscoreController extends Controller {
    private final UserFactory userFactory;

    @Inject
    public HighscoreController(UserFactory userFactory) {
        this.userFactory = userFactory;
    }

/*    public Result getTableData() {
        return ok(Json.toJson(highscoreData.getTableData()));
    }
}*/

    public Result getTableData() {
        return ok(Json.toJson(userFactory.getHighscoreData()));
    }

}
