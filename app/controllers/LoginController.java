package controllers;


import factory.UserFactory;
import play.data.FormFactory;
import play.mvc.*;
import views.html.login;
import play.libs.Json;
import scala.util.parsing.json.JSON;
import com.fasterxml.jackson.databind.JsonNode;

import javax.inject.Inject;

public class LoginController extends Controller {

    private final AssetsFinder assetsFinder;
    private final UserFactory userFactory;

    @Inject
    public LoginController(AssetsFinder assetsFinder, UserFactory userFactory) {
        this.assetsFinder = assetsFinder;
        this.userFactory = userFactory;
    }


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
                String authenticatedUserUsername = authenticatedUser.getUsername();
                return ok().addingToSession(request, "username", authenticatedUserUsername);
            }
        }
    }

    public Result createAccount(Http.Request request){
        JsonNode json = request.body().asJson();
        if (json == null) {
            return badRequest("Expecting Json data");
        } else {
            String username = json.findPath("username").textValue();
            String email = json.findPath("email").textValue();
            String password = json.findPath("password").textValue();
            String password2 = json.findPath("password2").textValue();
            if (!password.equals(password2)){
                return badRequest("password does not match password2");
            }else{

            }
        }
        Http.Session session = new Http.Session().adding("username", json.get("data").textValue());
        System.out.println(json.get("data").textValue());
        return ok().withSession(session);
    }

    public Result logout(Http.Request request) {
        request.session().removing("username");
        return ok(login.render("This is your Profile Page", assetsFinder));
    }

}