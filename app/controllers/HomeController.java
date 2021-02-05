package controllers;

import com.fasterxml.jackson.databind.JsonNode;
import play.libs.Json;
import play.mvc.*;
import play.db.*;

import scala.util.parsing.json.JSON;
import views.html.*;

import javax.inject.Inject;
import java.sql.Connection;
import java.sql.SQLException;

/**
 * This controller contains an action to handle HTTP requests
 * to the application's home page.
 */
public class HomeController extends Controller {

    private final AssetsFinder assetsFinder;

    @Inject
    public HomeController(AssetsFinder assetsFinder) {
        this.assetsFinder = assetsFinder;
    }

    /**
     * An action that renders an HTML page with a welcome message.
     * The configuration in the <code>routes</code> file means that
     * this method will be called when the application receives a
     * <code>GET</code> request with a path of <code>/</code>.
     */
    public Result index(Http.Request request) {
        if (request.session().get("email").isPresent()) // check if User is logged in

            return ok(pizzarush.render("Login", assetsFinder));
        else
            return ok(login.render("Login", assetsFinder));
    }

    public Result highscore(Http.Request request) {
        if (request.session().get("email").isPresent()) // check if User is logged in

            return ok(highscore.render("Highscores", assetsFinder));
        else
            return ok(login.render("Login", assetsFinder));
    }

    public Result profile(Http.Request request) {
        if (request.session().get("email").isPresent()) // check if User is logged in

            return ok(profile.render("Profile", assetsFinder));
        else
            return ok(login.render("Login", assetsFinder));
    }

    public Result menu(Http.Request request){
        if (request.session().get("email").isPresent()) // check if User is logged in
            return ok(menu.render("Menu",assetsFinder));
        else
            return ok(login.render("Login", assetsFinder));
    }

    public Result createAccount() {
        return ok(createAccount.render("CreateAccount", assetsFinder));
    }

    public Result pizzaRush(Http.Request request) {
        if (request.session().get("email").isPresent()) // check if User is logged in

            return ok(pizzarush.render("Pizza-Rush", assetsFinder));
        else
            return ok(login.render("Login", assetsFinder));
    }

    public Result memory(Http.Request request){
        if (request.session().get("email").isPresent()) // check if User is logged in
            return ok(memory.render("Memory",assetsFinder));
        else
            return ok(login.render("Login", assetsFinder));
    }

}
