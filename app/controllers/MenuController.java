package controllers;

import factory.MenuFactory;
import factory.UserFactory;
import play.mvc.Controller;
import play.mvc.Http;
import play.mvc.Result;

import javax.inject.Inject;

public class MenuController extends Controller {

    private final MenuFactory menuFactory;
    private final UserFactory userFactory;

    @Inject
    public MenuController(MenuFactory menuFactory, UserFactory userFactory) {
        this.menuFactory = menuFactory;
        this.userFactory = userFactory;
    }

    public Result checkForLevelUp(Http.Request request) {
        String email = null;
        if (request.session().get("email").isPresent())
            email = request.session().get("email").get();
        else
            return badRequest("Couldn't retrieve email from session");

        UserFactory.User user = userFactory.getUserByEmail(email);

        return ok(Boolean.toString(menuFactory.checkForLevelUp(user)));
    }
}
