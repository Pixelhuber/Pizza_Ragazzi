package controllers;


import play.data.FormFactory;
import play.mvc.*;
import views.html.login;
import play.libs.Json;
import scala.util.parsing.json.JSON;
import com.fasterxml.jackson.databind.JsonNode;

import javax.inject.Inject;

public class LoginController extends Controller {

    private final AssetsFinder assetsFinder;

    @Inject
    public LoginController(AssetsFinder assetsFinder, FormFactory formFactory) {
        this.assetsFinder = assetsFinder;
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
}

