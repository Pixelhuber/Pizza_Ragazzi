package controllers;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
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
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.sql.Timestamp;
import java.text.SimpleDateFormat;
import java.time.Instant;
import java.time.LocalDate;
import java.util.Date;
import java.util.List;
import java.util.Optional;


/**
 * The type Profile controller.
 */
public class ProfileController extends Controller {

    private final AssetsFinder assetsFinder;
    private final FormFactory formFactory;
    private final UserFactory userFactory;

    /**
     * Instantiates a new Profile controller.
     *
     * @param assetsFinder the assets finder
     * @param formFactory  the form factory
     * @param userFactory  the user factory
     */
    @Inject
    public ProfileController(AssetsFinder assetsFinder, FormFactory formFactory, UserFactory userFactory) {
        this.assetsFinder = assetsFinder;
        this.formFactory = formFactory;
        this.userFactory = userFactory;
    }

    /**
     * Sets username.
     *
     * @param request the request
     * @return the username
     */
// Sets the username to the value in the request-body
    public Result setUsername(Http.Request request) {
        Form<UserViewModel> form = formFactory.form(UserViewModel.class); // Ein ViewModel gibt quasi die Form vor, wie aus einem request gelesen werden soll (dafür auch das Package "ViewModels" :))
        UserViewModel userViewModel = form.bindFromRequest(request).get();

        String email = request.session().get("email").get();
        UserFactory.User user = userFactory.getUserByEmail(email);
        user.setUsername(userViewModel.getUsername());

        return ok(userViewModel.getUsername()).addingToSession(request, "username", userViewModel.getUsername()); // Speichert den Username in der Session unter dem Key "username"
    }

    /**
     * Set profile picture result.
     *
     * @param request the request
     * @return the result
     */
    public Result setProfilePicture(Http.Request request) throws JsonProcessingException {
        String email = request.session().get("email").get();
        UserFactory.User user = userFactory.getUserByEmail(email);

        InputStream image = null;
        try {
            ObjectMapper objectMapper = new ObjectMapper();
            JsonNode json = request.body().asJson().get("img");
            byte[] bytes = objectMapper.writeValueAsBytes(json);
            image = new ByteArrayInputStream(bytes);
        }catch (JsonProcessingException e){
            e.printStackTrace();
        }
        user.updateProfilePicture(image);
        System.out.println();
        boolean successfull;
        //user.setProfilePicture(image);
        return ok();
    }

    /**
     * Gets email from session.
     *
     * @param request the request
     * @return the email from session
     */
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
     *
     * @param request the request
     * @return result
     */
    public Result getUsernameFromDatabase(Http.Request request){
        String email = request.session().get("email").get();
        UserFactory.User user = userFactory.getUserByEmail(email);
        return ok(user.getUsername());
    }

    /**
     * Gets email from database.
     *
     * @param request the request
     * @return the email from database
     */
//evtl getEmailFromSession verwenden oder getUsername
    public Result getEmailFromDatabase(Http.Request request) {
        String email = request.session().get("email").get();
        UserFactory.User user = userFactory.getUserByEmail(email);
        return ok(user.getEmail());
    }

    /**
     * Gets gesamtpunkte from database.
     *
     * @param request the request
     * @return the gesamtpunkte from database
     */
    public Result getGesamtpunkteFromDatabase(Http.Request request) {
        String email = request.session().get("email").get();
        UserFactory.User user = userFactory.getUserByEmail(email);
        return ok(Integer.toString(user.getTotalPoints()));
    }

    /**
     * Gets highscore from database.
     *
     * @param request the request
     * @return the highscore from database
     */
    public Result getHighscoreFromDatabase(Http.Request request) {
        String email = request.session().get("email").get();
        UserFactory.User user = userFactory.getUserByEmail(email);
        return ok(Integer.toString(user.getHighScore()));
    }

    /**
     * Gets tier name from database.
     *
     * @param request the request
     * @return the tier name from database
     */
    public Result getTierNameFromDatabase(Http.Request request) {
        String email = request.session().get("email").get();
        UserFactory.User user = userFactory.getUserByEmail(email);
        return ok(user.getNameFromTierId());
    }

    /**
     * Gets profile picture from database.
     *
     * @param request the request
     * @return the profile picture from database
     * @throws IOException the io exception
     */
    public Result getProfilePictureFromDatabase(Http.Request request) throws IOException {
        String email = request.session().get("email").get();
        UserFactory.User user = userFactory.getUserByEmail(email);
        return ok(Json.toJson(user.getProfilePictureSrc()));
    }

    /**
     * Gets password from session.
     *
     * @param request the request
     * @return the password from session
     */
    public Result getPasswordFromSession(Http.Request request) {

        return request
                .session()
                .get("password") // Sucht nach dem Wert in der Session, der unter dem Key "password" abgelegt ist
                .map(Results::ok)
                .orElseGet(Results::notFound);
    }

    /**
     * Gets friends data.
     *
     * @param request the request
     * @return the friends data
     * @throws IOException the io exception
     */
    public Result getFriendsData(Http.Request request) throws IOException {
        String email = request.session().get("email").get();
        UserFactory.User user = userFactory.getUserByEmail(email);
        return ok(Json.toJson(user.getFriendsData()));
    }

    /**
     * Gets achievements from database.
     *
     * @param request the request
     * @return the achievements from database
     */
    public Result getAchievementsFromDatabase(Http.Request request) {
        String email = request.session().get("email").get();
        UserFactory.User user = userFactory.getUserByEmail(email);
        List<Achievement> achievements = user.getAchievements();
        String json = listToJson(achievements);
        return ok(json);
    }

    /**
     * Gets messages from database.
     *
     * @param request the request
     * @return the messages from database
     */
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

    /**
     * Send message result.
     *
     * @param request the request
     * @return the result
     */
    public Result sendMessage(Http.Request request) {
        String email = request.session().get("email").get();
        UserFactory.User sender = userFactory.getUserByEmail(email);
        UserFactory.User receiver = userFactory.getUserByUsername(request.body().asJson().get("receiver").asText());
        String message_text = request.body().asJson().get("message_text").asText();
        long time = request.body().asJson().get("time").asLong();
        Timestamp timestampSQL = new Timestamp(time + 3600000); //milliseconds to add for localTime
        sender.sendMessage(receiver.getId(), timestampSQL, message_text);
        return ok();
    }

    /**
     * Add friend result.
     *
     * @param request the request
     * @return the result
     */
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

    /**
     * List to json string.
     *
     * @param <T>  the type parameter
     * @param list the list
     * @return the string
     */
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
     *
     * @param request the request
     * @return Result result
     */
    public Result friendGetUsernameFromDatabase(Http.Request request){
        String username = request.body().asJson().asText();
        UserFactory.User user = userFactory.getUserByUsername(username);
        return ok(user.getUsername());
    }

    /**
     * Friend get email from database result.
     *
     * @param request the request
     * @return the result
     */
//evtl getEmailFromSession verwenden oder getUsername
    public Result friendGetEmailFromDatabase(Http.Request request) {
        String username = request.body().asJson().asText();
        UserFactory.User user = userFactory.getUserByUsername(username);
        return ok(user.getEmail());
    }

    /**
     * Friend get gesamtpunkte from database result.
     *
     * @param request the request
     * @return the result
     */
    public Result friendGetGesamtpunkteFromDatabase(Http.Request request) {
        String username = request.body().asJson().asText();
        UserFactory.User user = userFactory.getUserByUsername(username);
        return ok(Integer.toString(user.getTotalPoints()));
    }

    /**
     * Friend get highscore from database result.
     *
     * @param request the request
     * @return the result
     */
    public Result friendGetHighscoreFromDatabase(Http.Request request) {
        String username = request.body().asJson().asText();
        UserFactory.User user = userFactory.getUserByUsername(username);
        return ok(Integer.toString(user.getHighScore()));
    }

    /**
     * Friend get tier name from database result.
     *
     * @param request the request
     * @return the result
     */
    public Result friendGetTierNameFromDatabase(Http.Request request) {
        String username = request.body().asJson().asText();
        UserFactory.User user = userFactory.getUserByUsername(username);
        return ok(user.getNameFromTierId());
    }

    /**
     * Friend get profile picture from database result.
     *
     * @param request the request
     * @return the result
     * @throws IOException the io exception
     */
    public Result friendGetProfilePictureFromDatabase(Http.Request request) throws IOException {
        String username = request.body().asJson().asText();
        UserFactory.User user = userFactory.getUserByUsername(username);
        return ok(Json.toJson(user.getProfilePictureSrc()));
    }

    /**
     * Friend friends data result.
     *
     * @param request the request
     * @return the result
     * @throws IOException the io exception
     */
    public Result friendFriendsData(Http.Request request) throws IOException{
        String username = request.body().asJson().asText();
        UserFactory.User user = userFactory.getUserByUsername(username);
        return ok(Json.toJson(user.getFriendsData()));
    }

    /**
     * Friend get achievements from database result.
     *
     * @param request the request
     * @return the result
     */
    public Result friendGetAchievementsFromDatabase(Http.Request request) {
        String username = request.body().asJson().asText();
        UserFactory.User user = userFactory.getUserByUsername(username);
        List<Achievement> achievements = user.getAchievements();
        String json = listToJson(achievements);
        return ok(json);
    }
}
