package controllers;

import play.mvc.*;
import play.db.*;

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
    public Result index() {
        return ok(
            index.render(
                "Your new application is ready.",
                assetsFinder
            ));
    }
    public Result highscore() {
        return ok(
                highscore.render(
                        "Highscores",
                        assetsFinder
                ));
    }
    public Result profile(){
        return ok(profile.render("Profiles",
                assetsFinder));
    }
    public Result main(){
        return ok(
                pizzarush.render(
                        "Pizza-Rush",
                        assetsFinder
                ));
    }
}
