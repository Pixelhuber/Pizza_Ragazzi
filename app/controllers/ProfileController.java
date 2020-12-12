package controllers;

import play.data.Form;
import play.data.FormFactory;
import play.libs.Json;
import play.mvc.Controller;
import play.mvc.Http;
import play.mvc.Result;
import play.mvc.Results;
import viewmodels.Achievement;
import viewmodels.User;

import javax.inject.Inject;
import java.util.ArrayList;


public class ProfileController extends Controller {

    private final AssetsFinder assetsFinder;

    @Inject
    public ProfileController(AssetsFinder assetsFinder, FormFactory formFactory) {
        this.assetsFinder = assetsFinder;
    }

    // Sets the username to the value in the request-body
    public Result setUsername(Http.Request request) {

        String newUsername = request.body().asJson().get("username").asText(); // Liest den Usernamen aus dem body vom request

        return ok().addingToSession(request, "username", newUsername); // Gibt ein erfolgreiches 'Result' mit dem gespeicherten Usernamen zurück
    }

    // Reads key "username" from session and returns it
    public Result getUsernameFromSession(Http.Request request) {

        return request
                .session()
                .get("username")
                .map(Results::ok)
                .orElseGet(() -> unauthorized("Default Username")); // Gibt das zurück, wenn kein Wert in der Session gefunden wurde
    }
}
