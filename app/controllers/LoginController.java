package controllers;


import factory.UserFactory;
import play.data.FormFactory;
import play.mvc.*;
import views.html.login;
import play.libs.Json;
import scala.util.parsing.json.JSON;
import com.fasterxml.jackson.databind.JsonNode;

import javax.inject.Inject;

/**
 * The type Login controller.
 */
public class LoginController extends Controller {

    private final AssetsFinder assetsFinder;
    private final UserFactory userFactory;

    /**
     * Instantiates a new Login controller.
     *
     * @param assetsFinder the assets finder
     * @param userFactory  the user factory
     */
    @Inject
    public LoginController(AssetsFinder assetsFinder, UserFactory userFactory) {
        this.assetsFinder = assetsFinder;
        this.userFactory = userFactory;
    }


    /**
     * Authenticate result.
     *
     * @param request the request
     * @return the result
     */
    public Result authenticate(Http.Request request) {
        JsonNode json = request.body().asJson();
        if (json == null) {
            return badRequest("Expecting Json data");
        } else {
            String email = json.findPath("email").textValue();
            String password = json.findPath("password").textValue();
            if (email == null || !email.matches("[a-zA-Z0-9._%+-]+[@]+[a-zA-Z0-9.-]+[.]+[a-zA-Z]{2,6}")) {
                return badRequest("email is not valid");
            } else if(password == null || password.isEmpty()) {
                return badRequest("password is empty");
            }else if (userFactory.isEmailAvailable(email)){
                //if the email is available then there is no user with it
                return badRequest("no user with this email");
            }else {
                UserFactory.User authenticatedUser = userFactory.authenticateUser(email,password);
                if (authenticatedUser == null){
                    return badRequest("wrong password");
                }
                String authenticatedUserEmail = authenticatedUser.getEmail();
                return ok().addingToSession(request, "email", authenticatedUserEmail);
            }
        }
    }

    /**
     * Create account result.
     *
     * @param request the request
     * @return the result
     */
    public Result createAccount(Http.Request request){
        JsonNode json = request.body().asJson();
        if (json == null) {
            return badRequest("Expecting Json data");
        } else {
            String username = json.findPath("username").textValue();
            String email = json.findPath("email").textValue();
            String password = json.findPath("password").textValue();
            String password2 = json.findPath("password2").textValue();
            if(username == null || username.isEmpty()) {
                return badRequest("username is empty");
            }else if (email == null || !email.matches("[a-zA-Z0-9._%+-]+[@]+[a-zA-Z0-9.-]+[.]+[a-zA-Z]{2,6}")) {
                return badRequest("email is not valid");
            } else if(password == null || password.isEmpty()) {
                return badRequest("password is empty");
            }else if (!password.equals(password2)){
                return badRequest("password does not match password2");
            }else if (!userFactory.isEmailAvailable(email)){
                return badRequest("email already in use");
            }else if (!userFactory.isUsernameAvailable(username)){
                return badRequest("username already in use");
            }else {
                UserFactory.User authenticatedUser = userFactory.createUser(email,username,password);
                if (authenticatedUser == null){
                    return badRequest("user could not be created");
                }
                String authenticatedUserEmail = authenticatedUser.getEmail();
                return ok().addingToSession(request, "email", authenticatedUserEmail);
            }
        }
    }

    /**
     * Logout result.
     *
     * @param request the request
     * @return the result
     */
    public Result logout(Http.Request request) {
        return ok(login.render("Login", assetsFinder)).withNewSession();
    }

}