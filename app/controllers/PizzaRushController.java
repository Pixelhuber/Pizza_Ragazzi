package controllers;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.ObjectReader;
import models.pizza_rush.PizzaRushFactory;
import models.pizza_rush.PizzaValidation;
import play.libs.Json;
import play.mvc.Controller;
import play.mvc.Http;
import play.mvc.Result;
import play.mvc.Results;
import scala.util.parsing.json.JSONArray;

import javax.inject.Inject;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;


public class PizzaRushController extends Controller {
    private final AssetsFinder assetsFinder;
    private final PizzaRushFactory pizzaRushFactory;

    @Inject
    public PizzaRushController(AssetsFinder assetsFinder, PizzaRushFactory pizzaRushFactory) {
        this.assetsFinder = assetsFinder;
        this.pizzaRushFactory = pizzaRushFactory;
    }


    public Result validatePizza(Http.Request request) throws IOException {
        //TODO fertig übersetzen

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

        }catch (IOException JsonListTo){
            System.out.println("Das übergebene Json konnte nicht in eine Liste übersetzt werden");
        }
        PizzaValidation validation = new PizzaValidation(orderPoints,orderIngredientIds,createdPizzaIngredientIds,createdPizzaBakeStatus);

        int currentPoints = getCurrentPointsFromSession(request.session());

        String points = String.valueOf(currentPoints + validation.calculatePoints());//temporär
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

    public Result resetPoints(Http.Request request) {
        return ok().addingToSession(request, "currentPizzaRushPoints", "0");
    }

    public Result getAvailableIngredients(Http.Request request) {
        String email = request.session().get("email").get();
        List<PizzaRushFactory.Ingredient> ingredients = pizzaRushFactory.getAvailableIngredients(email);
        String json = listToJson(ingredients);
        return ok(json);
    }

    public Result getAvailablePizzas(Http.Request request) {
        String email = request.session().get("email").get();
        List<PizzaRushFactory.Order> orders = pizzaRushFactory.getAvailablePizzas(email);
        String json = listToJson(orders);
        return ok(json);
    }

    public Result getAvailableFlightBehaviors(Http.Request request) {
        /*List<String> ids = request.body().asJson().get("ingredients").findValuesAsText("id");
        for (String id : ids) {
            System.out.println(id);
        }
         */
        return ok();
    }

    //macht aus einer beliebigen Liste ein Json
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
