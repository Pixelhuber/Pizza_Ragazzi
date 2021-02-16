package controllers;

import com.fasterxml.jackson.databind.ObjectMapper;
import factory.MemoryFactory;
import play.mvc.Controller;
import play.mvc.Http;
import play.mvc.Result;

import javax.inject.Inject;
import java.util.List;

public class MemoryController extends Controller {

    MemoryFactory memoryFactory;

    @Inject
    public MemoryController(MemoryFactory memoryFactory) {

        this.memoryFactory = memoryFactory;
    }

    public Result getMemoryIngredients(Http.Request request) {
        String email;
        if (request.session().get("email").isPresent())
            email = request.session().get("email").get();
        else
            return badRequest("Can't identify User: No E-Mail in session");

        List<MemoryFactory.MemoryIngredient> ingredients = memoryFactory.getMemoryIngredients(email);
        String json = listToJson(ingredients);
        return ok(json);
    }


    // converts any list into Json
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
}
