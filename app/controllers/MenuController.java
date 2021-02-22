package controllers;

import com.fasterxml.jackson.databind.ObjectMapper;
import factory.Menu;
import factory.UserFactory;
import play.mvc.Controller;
import play.mvc.Http;
import play.mvc.Result;

import javax.inject.Inject;

public class MenuController extends Controller {

    private final Menu menu;
    private final UserFactory userFactory;

    @Inject
    public MenuController(Menu menu, UserFactory userFactory) {
        this.menu = menu;
        this.userFactory = userFactory;
    }

    public Result checkForLevelUp(Http.Request request) {
        String email = null;
        if (request.session().get("email").isPresent())
            email = request.session().get("email").get();
        else
            return badRequest("Couldn't retrieve email from session");

        UserFactory.User user = userFactory.getUserByEmail(email);

        return ok(listToJson(menu.checkForLevelUp(user)));
    }


    // converts any list into Json
    public String listToJson(Menu.LevelUpViewModel list) {
        ObjectMapper objectMapper = new ObjectMapper();
        String json = "";
        try {
            json = objectMapper.writeValueAsString(list);
        } catch (Exception e) {
            e.printStackTrace();
        }
        return json;
    }
}
