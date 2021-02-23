package controllers;

import com.fasterxml.jackson.databind.ObjectMapper;
import factory.Menu;
import factory.UserFactory;
import play.mvc.Controller;
import play.mvc.Http;
import play.mvc.Result;

import javax.inject.Inject;

/**
 * The type Menu controller.
 */
public class MenuController extends Controller {

    private final Menu menu;
    private final UserFactory userFactory;

    /**
     * Instantiates a new Menu controller.
     *
     * @param menu        the menu
     * @param userFactory the user factory
     */
    @Inject
    public MenuController(Menu menu, UserFactory userFactory) {
        this.menu = menu;
        this.userFactory = userFactory;
    }

    /**
     * Check for tier level up of User.
     *
     * @param request the request
     * @return the result
     */
    public Result checkForLevelUp(Http.Request request) {
        String email = null;
        if (request.session().get("email").isPresent())
            email = request.session().get("email").get();
        else
            return badRequest("Couldn't retrieve email from session");

        UserFactory.User user = userFactory.getUserByEmail(email);

        return ok(listToJson(menu.checkForLevelUp(user)));
    }


    /**
     * Converts any list to json string.
     *
     * @param list the list
     * @return the string
     */
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
