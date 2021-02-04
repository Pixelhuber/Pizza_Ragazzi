package controllers;

import factory.UserFactory;
import models.pizza_rush.IngredientFactory;
import models.pizza_rush.OrderFactory;
import models.pizza_rush.PizzaCreation;
import play.mvc.Controller;
import play.mvc.Http;
import play.mvc.Result;
import play.mvc.Results;

import javax.inject.Inject;
import java.util.List;


public class PizzaRushController extends Controller {
    private final AssetsFinder assetsFinder;
    private final OrderFactory orderFactory;
    private final IngredientFactory ingredientFactory;

    @Inject
    public PizzaRushController(AssetsFinder assetsFinder, OrderFactory orderFactory, IngredientFactory ingredientFactory) {
        this.assetsFinder = assetsFinder;
        this.orderFactory = orderFactory;
        this.ingredientFactory = ingredientFactory;
    }


    public Result validatePizza(Http.Request request) {

        // read json data
        List<String> ingredients = request.body().asJson().get("pizza").findValuesAsText("ingredients");
        //TODO korrekte zutaten der gemachten Pizza auslesen und als liste formatieren, bisher noch falsch
        PizzaCreation pizzaCreation = new PizzaCreation(ingredients);

        int currentPoints = getCurrentPointsFromSession(request.session());

        if (pizzaCreation.validatePizza()) {
            String points = String.valueOf(currentPoints + 10);//temporär
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
