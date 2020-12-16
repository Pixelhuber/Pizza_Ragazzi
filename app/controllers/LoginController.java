package controllers;


import play.data.Form;
import play.data.FormFactory;
import play.mvc.*;
import viewmodels.LoginViewModel;
import views.html.login;
import play.libs.Json;
import scala.util.parsing.json.JSON;
import com.fasterxml.jackson.databind.JsonNode;

import javax.inject.Inject;
import javax.naming.AuthenticationException;

public class LoginController extends Controller {

    private final AssetsFinder assetsFinder;
    private final FormFactory formFactory;

    @Inject
    public LoginController(AssetsFinder assetsFinder, FormFactory formFactory) {
        this.assetsFinder = assetsFinder;
        this.formFactory = formFactory;
    }


    public Result authenticate(Http.Request request) {
        JsonNode json = request.body().asJson();
        if (json == null) {
            return badRequest("Expecting Json data");
        } else {
            String name = json.findPath("username").textValue();
            if (name == null) {
                return badRequest("Fehler");
            } else {
                return ok().addingToSession(request, "username", name);

            }
        }
    }

    public Result logout(Http.Request request) {
        request.session().removing("username");
        return ok(login.render("This is your Profile Page", assetsFinder));
    }


    public Result getUsernameFromSession(Http.Request request) {

        return request
                .session()
                .get("username")
                .map(Results::ok)
                .orElseGet(() -> unauthorized("Default Username"));
    }
}

