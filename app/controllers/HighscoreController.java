package controllers;

import models.HighscoreData;
import play.libs.Json;
import play.mvc.Controller;
import play.mvc.Result;

import javax.inject.Inject;

public class HighscoreController extends Controller {
    private final HighscoreData highscoreData;

    @Inject
    public HighscoreController(HighscoreData highscoreData) {
        this.highscoreData = highscoreData;
    }

    public Result getTableData() {
        return ok(Json.toJson(highscoreData.getTableData()));
    }
}
