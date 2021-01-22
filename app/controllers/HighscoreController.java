package controllers;

import factory.UserFactory;
import models.HighscoreData;
import play.libs.Json;
import play.mvc.Controller;
import play.mvc.Result;


import javax.inject.Inject;
import java.util.ArrayList;
import java.util.List;

public class HighscoreController extends Controller {
    private final HighscoreData highscoreData;
    private final UserFactory userFactory;

    @Inject
    public HighscoreController(HighscoreData highscoreData, UserFactory userFactory) {
        this.highscoreData = highscoreData;
        this.userFactory = userFactory;
    }

/*    public Result getTableData() {
        return ok(Json.toJson(highscoreData.getTableData()));
    }
}*/

    public Result getTableData() {
        return ok(Json.toJson(userFactory.getTableData()));
    }
}
