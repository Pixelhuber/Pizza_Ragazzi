package controllers;

import com.fasterxml.jackson.databind.ObjectMapper;
import factory.UserFactory;
import models.Achievement;
import models.Message;
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
import java.util.List;
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

    public Result getTierNameFromDatabase(Http.Request request) {
        String email = request.session().get("email").get();
        UserFactory.User user = userFactory.getUserByEmail(email);
        return ok(user.getNameFromTierId());
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

    public Result getAchievementsFromDatabase(Http.Request request) {
        String email = request.session().get("email").get();
        UserFactory.User user = userFactory.getUserByEmail(email);
        List<Achievement> achievements = user.getAchievements();
        String json = listToJson(achievements);
        return ok(json);
    }

    //gibt Messages mit bestimmtem Freund zurück
    public Result getMessagesFromDatabase(Http.Request request) {
        String email = request.session().get("email").get();
        String username = request.body().asJson().asText();
        UserFactory.User user1 = userFactory.getUserByEmail(email);
        UserFactory.User user2 = userFactory.getUserByUsername(username);
        List<Message> messages = user1.getMessages(user2);
        String json = listToJson(messages);
        return ok(json);
    }

    public Result addFriend(Http.Request request) {
        String email = request.session().get("email").get();
        UserFactory.User user = userFactory.getUserByEmail(email);

        String newFriendUsername = request.body().asJson().asText();
        UserFactory.User newFriendUser = userFactory.getUserByUsername(newFriendUsername);

        boolean successfull;
        if (newFriendUser != null) {
            successfull = user.addFriend(newFriendUser.getId());
        } else return badRequest("username not valid");

        if (successfull) return ok();
        else return badRequest("username not valid");
    }

    //macht aus einer beliebigen Liste ein Json
    public <T> String listToJson (List<T> list) {
        ObjectMapper objectMapper = new ObjectMapper();
        String json = "";
        try {
            json = objectMapper.writerWithDefaultPrettyPrinter().writeValueAsString(list);
        } catch(Exception e) {
            e.printStackTrace();
        }
        return json;
    }



    //AB HIER METHODEN ZUM ANSCHAUEN DES PROFILS EINES FREUNDES

    /**
     * returns the username
     * by getting the user from the db with it`s email from the session
     * @return Result
     */
    public Result friendGetUsernameFromDatabase(Http.Request request){
        String username = request.body().asJson().asText();
        UserFactory.User user = userFactory.getUserByUsername(username);
        return ok(user.getUsername());
    }

    //evtl getEmailFromSession verwenden oder getUsername
    public Result friendGetEmailFromDatabase(Http.Request request) {
        String username = request.body().asJson().asText();
        UserFactory.User user = userFactory.getUserByUsername(username);
        return ok(user.getEmail());
    }

    public Result friendGetGesamtpunkteFromDatabase(Http.Request request) {
        String username = request.body().asJson().asText();
        UserFactory.User user = userFactory.getUserByUsername(username);
        return ok(Integer.toString(user.getTotalPoints()));
    }

    public Result friendGetHighscoreFromDatabase(Http.Request request) {
        String username = request.body().asJson().asText();
        UserFactory.User user = userFactory.getUserByUsername(username);
        return ok(Integer.toString(user.getHighScore()));
    }

    public Result friendGetTierNameFromDatabase(Http.Request request) {
        String username = request.body().asJson().asText();
        UserFactory.User user = userFactory.getUserByUsername(username);
        return ok(user.getNameFromTierId());
    }

    public Result friendGetProfilePictureFromDatabase(Http.Request request) throws IOException {
        String username = request.body().asJson().asText();
        UserFactory.User user = userFactory.getUserByUsername(username);
        return ok(Json.toJson(user.getProfilePictureSrc()));
    }

    public Result friendFriendsData(Http.Request request) throws IOException{
        String username = request.body().asJson().asText();
        UserFactory.User user = userFactory.getUserByUsername(username);
        return ok(Json.toJson(user.getFriendsData()));
    }

    public Result friendGetAchievementsFromDatabase(Http.Request request) {
        String username = request.body().asJson().asText();
        UserFactory.User user = userFactory.getUserByUsername(username);
        List<Achievement> achievements = user.getAchievements();
        String json = listToJson(achievements);
        return ok(json);
    }
}
