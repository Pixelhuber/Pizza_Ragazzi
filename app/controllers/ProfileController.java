package controllers;

import play.data.Form;
import play.data.FormFactory;
import play.libs.Json;
import play.mvc.Controller;
import play.mvc.Http;
import play.mvc.Result;
import play.mvc.Results;
import viewmodels.UserViewModel;

import javax.inject.Inject;
import java.io.File;


public class ProfileController extends Controller {

    private final AssetsFinder assetsFinder;
    private final FormFactory formFactory;
    private final UserFactory userFactory;

    @Inject
    public ProfileController(AssetsFinder assetsFinder, FormFactory formFactory, UserFactory userFactory) {
        this.assetsFinder = assetsFinder;
        this.formFactory = formFactory;
        this.userFactory = userFactory;
    }

    // Sets the username to the value in the request-body
    public Result setUsername(Http.Request request) {
        Form<UserViewModel> form = formFactory.form(UserViewModel.class); // Ein ViewModel gibt quasi die Form vor, wie aus einem request gelesen werden soll (dafür auch das Package "ViewModels" :))
        UserViewModel userViewModel = form.bindFromRequest(request).get();

        return ok(userViewModel.getUsername()).addingToSession(request, "username", userViewModel.getUsername()); // Speichert den Username in der Session unter dem Key "username"
    }

    // Reads key "email" from session and returns it
    public Result getEmailFromSession(Http.Request request) {
        return request
                .session()
                .get("email") // Sucht nach dem Wert in der Session, der unter dem Key "Username" abgelegt ist
                .map(Results::ok)
                .orElseGet(Results::notFound);
    }

    //TODO: rename this to getUsername
    // it should return the username by getting the user from the db with it`s email
    public Result getMailFromDatabase() {
        UserFactory.User user = userFactory.getUserById(2);  //TODO muss angepasst werden auf den eingeloggten Nutzer; gilt auch für alle Methoden drunter
        return ok(user.getMail());
    }

    public Result getGesamtpunkteFromDatabase() {
        UserFactory.User user = userFactory.getUserById(2);
        return ok(Integer.toString(user.getGesamtpunkte()));
    }

    public Result getHighscoreFromDatabase() {
        UserFactory.User user = userFactory.getUserById(2);
        return ok(Integer.toString(user.getHighscore()));
    }

    public Result getPasswordFromSession(Http.Request request) {

        return request
                .session()
                .get("password") // Sucht nach dem Wert in der Session, der unter dem Key "password" abgelegt ist
                .map(Results::ok)
                .orElseGet(Results::notFound);
    }

    public Result getFriendsData() {
        UserFactory.User user = userFactory.getUserById(2);
        return ok(Json.toJson(user.getFriendsData()));
    }
}
