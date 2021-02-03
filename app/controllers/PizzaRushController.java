package controllers;

import models.pizza_rush.Pizza;
import play.libs.Json;
import play.mvc.Controller;
import play.mvc.Http;
import play.mvc.Result;
import play.mvc.Results;

import java.util.List;


public class PizzaRushController extends Controller {


    public Result validatePizza(Http.Request request) {

        // read json data
        String pizzaType = request.body().asJson().get("pizza").asText();

        List<String> ingredients = request.body().asJson().findValuesAsText("ingredients");//TODO Das hier findet bis jetzt noch garkeine zutaten
        Pizza pizza = new Pizza(pizzaType, ingredients);

        int currentPoints = getCurrentPointsFromSession(request.session());

        if (pizza.validatePizza()) {
            String points = String.valueOf(currentPoints + 10);
            return ok().addingToSession(request, "currentPizzaRushPoints", points);
        } else
            return ok();
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


}
