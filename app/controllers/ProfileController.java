package controllers;

import factory.UserFactory;
import play.data.Form;
import play.data.FormFactory;
import play.libs.Json;
import play.mvc.Controller;
import play.mvc.Http;
import play.mvc.Result;
import play.mvc.Results;
import scala.Console;
import viewmodels.UserViewModel;

import javax.inject.Inject;
import java.io.File;
import java.io.IOException;
import java.util.Optional;


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

        String email = request.session().get("email").get();
        UserFactory.User user = userFactory.getUserByEmail(email);
        user.setUsername(userViewModel.getUsername());

        return ok(userViewModel.getUsername()).addingToSession(request, "username", userViewModel.getUsername()); // Speichert den Username in der Session unter dem Key "username"
    }

    public Result setProfilePicture(Http.Request request){
        return badRequest();
    }

    // Reads key "email" from session and returns it
    public Result getEmailFromSession(Http.Request request) {
        return request
                .session()
                .get("email") // Sucht nach dem Wert in der Session, der unter dem Key "Username" abgelegt ist
                .map(Results::ok)
                .orElseGet(Results::notFound);
    }

    /**
     * returns the username
     * by getting the user from the db with it`s email from the session
     * @param request
     * @return
     */
    public Result getUsernameFromDatabase(Http.Request request){
        String email = request.session().get("email").get();
        UserFactory.User user = userFactory.getUserByEmail(email);
        return ok(user.getUsername());
    }

    //evtl getEmailFromSession verwenden oder getUsername
    public Result getEmailFromDatabase(Http.Request request) {
        String email = request.session().get("email").get();
        UserFactory.User user = userFactory.getUserByEmail(email);
        return ok(user.getEmail());
    }

    public Result getGesamtpunkteFromDatabase(Http.Request request) {
        String email = request.session().get("email").get();
        UserFactory.User user = userFactory.getUserByEmail(email);
        return ok(Integer.toString(user.getTotalPoints()));
    }

    public Result getHighscoreFromDatabase(Http.Request request) {
        String email = request.session().get("email").get();
        UserFactory.User user = userFactory.getUserByEmail(email);
        return ok(Integer.toString(user.getHighScore()));
    }

    public Result getTierFromDatabase(Http.Request request) {
        String email = request.session().get("email").get();
        UserFactory.User user = userFactory.getUserByEmail(email);
        return ok(Integer.toString(user.getCurrentTier()));
    }

    public Result getProfilePictureFromDatabase(Http.Request request) throws IOException {
        String email = request.session().get("email").get();
        UserFactory.User user = userFactory.getUserByEmail(email);
        return ok(Json.toJson(user.getProfilePictureSrc()));
    }

    public Result getPasswordFromSession(Http.Request request) {

        return request
                .session()
                .get("password") // Sucht nach dem Wert in der Session, der unter dem Key "password" abgelegt ist
                .map(Results::ok)
                .orElseGet(Results::notFound);
    }

    public Result getFriendsData(Http.Request request) throws IOException {
        String email = request.session().get("email").get();
        UserFactory.User user = userFactory.getUserByEmail(email);
        return ok(Json.toJson(user.getFriendsData()));
    }
}
