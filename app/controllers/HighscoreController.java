package controllers;

import models.Highscore;
import play.mvc.Controller;
import play.mvc.Http;
import play.mvc.Result;
import play.mvc.Results;

public class HighscoreController extends Controller {
    private final Highscore highscore;

    public HighscoreController(Highscore highscore) {
        this.highscore = highscore;
    }

    public Result getUsername(Http.Request request) {
        return request
                .session()
                .get("username")
                .map(Results::ok)
                .orElseGet(() -> unauthorized("Default Username"));
    }

    public Result getPoints(Http.Request request) {
        return request
                .session()
                .get("points")
                .map(Results::ok)
                .orElseGet(() -> unauthorized("Default Points"));
    }

    public Result updateHighscoreTable(Http.Request request) {
        return null;
    }
}
