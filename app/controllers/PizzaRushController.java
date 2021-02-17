package controllers;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.ObjectReader;
import factory.UserFactory;
import factory.UserFactory.User;
import models.pizza_rush.PizzaRushFactory;
import models.pizza_rush.PizzaValidation;
import play.mvc.Controller;
import play.mvc.Http;
import play.mvc.Result;
import play.mvc.Results;

import javax.inject.Inject;
import java.io.IOException;
import java.util.List;


public class PizzaRushController extends Controller {
    private final AssetsFinder assetsFinder;
    private final PizzaRushFactory pizzaRushFactory;
    private final UserFactory userFactory;

    @Inject
    public PizzaRushController(AssetsFinder assetsFinder, PizzaRushFactory pizzaRushFactory, UserFactory userFactory) {
        this.assetsFinder = assetsFinder;
        this.pizzaRushFactory = pizzaRushFactory;
        this.userFactory = userFactory;
    }


    //TODO fertig übersetzen
    public Result validatePizza(Http.Request request) throws IOException {
        int orderPoints = 0;
        List<Integer> orderIngredientIds = null;
        List<Integer> createdPizzaIngredientIds = null;
        int createdPizzaBakeStatus = 0;
        try {
            ObjectMapper mapper = new ObjectMapper();
            ObjectReader reader = mapper.readerFor(new TypeReference<List<String>>() {
            });

            orderPoints = request.body().asJson().get("orderPoints").asInt();
            orderIngredientIds = reader.readValue(request.body().asJson().get("orderIngredientIds"));
            createdPizzaIngredientIds = reader.readValue(request.body().asJson().get("createdPizzaIngredientIds"));
            createdPizzaBakeStatus = request.body().asJson().get("createdPizzaBakeStatus").asInt();

        } catch (IOException JsonListTo) {
            System.out.println("Das übergebene Json konnte nicht in eine Liste übersetzt werden");
        }
        PizzaValidation validation = new PizzaValidation(orderPoints, orderIngredientIds, createdPizzaIngredientIds, createdPizzaBakeStatus);

        int currentPoints = getCurrentPointsFromSession(request.session());

        String points = String.valueOf(currentPoints + validation.calculatePoints()); // temporär
        return ok().addingToSession(request, "currentPizzaRushPoints", points);
    }

    public Result getCurrentPointsFromSession(Http.Request request) {
        getCurrentPointsFromSession(request.session());
        return request
                .session()
                .get("currentPizzaRushPoints")
                .map(Results::ok)
                .orElseGet(() -> unauthorized("0"));
    }

    private int getCurrentPointsFromSession(Http.Session session) {
        if (session.get("currentPizzaRushPoints").isPresent()) {
            String current = session.get("currentPizzaRushPoints").get();
            return Integer.parseInt(current);
        }
        session.adding("currentPizzaRushPoints", "0");
        return 0;
    }

    public Result setPlayerPoints(Http.Request request) {
        JsonNode json = request.body().asJson();
        String email = request.session().get("email").get();
        if (json == null) {
            return badRequest("Expecting Json data");
        } else {
            int newTotalPoints = json.findPath("newTotalPoints").asInt();
            int newHighscore= json.findPath("newHighscore").asInt();
            if (email.isEmpty()) {
                return badRequest("usermail was empty");
            }
            UserFactory.User user = userFactory.getUserByEmail(email);
            if (user == null) {
                return badRequest("user co uld be fetched via mail");
            }
            user.setTotalPoints(newTotalPoints);
            user.setHighScore(newHighscore);
            return ok("TotalPoints and Highscore successfully updated");
        }
    }

    public Result resetPoints(Http.Request request) {
        return ok().addingToSession(request, "currentPizzaRushPoints", "0");
    }

    public Result getAvailableIngredients(Http.Request request) {
        String email;
        if (request.session().get("email").isPresent())
            email = request.session().get("email").get();
        else
            return badRequest("Can't identify User: No E-Mail in session");

        List<PizzaRushFactory.Ingredient> ingredients = pizzaRushFactory.getIngredients(email);
        String json = listToJson(ingredients);
        return ok(json);
    }

    public Result getAvailablePizzas(Http.Request request) {
        String email;
        if (request.session().get("email").isPresent())
            email = request.session().get("email").get();
        else
            return badRequest("Can't identify User: No E-Mail in session");

        List<PizzaRushFactory.Order> orders = pizzaRushFactory.getPizzas(email);
        String json = listToJson(orders);
        return ok(json);
    }


    // converts any list into Json
    public <T> String listToJson(List<T> list) {
        ObjectMapper objectMapper = new ObjectMapper();
        String json = "";
        try {
            json = objectMapper.writerWithDefaultPrettyPrinter().writeValueAsString(list);
        } catch (Exception e) {
            e.printStackTrace();
        }
        return json;
    }
}
