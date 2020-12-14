package controllers;

import com.fasterxml.jackson.databind.node.ObjectNode;

import play.libs.Json;
import play.mvc.Controller;
import play.mvc.Http;
import play.mvc.Result;
import play.mvc.Results;


public class PizzaRushController extends Controller {


    public Result validatePizza(Http.Request request) {

        //request is currently ignored
        //evtl zum überprüfen der funktionalität json daten auslesen -- jaaaaa es geht
        //String pizzaName = request.body().asJson().get("pizzaName").asText();

        int currentPoints = getCurrentPointsFromSession(request.session());
        String points = String.valueOf(currentPoints + 10);

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


}
