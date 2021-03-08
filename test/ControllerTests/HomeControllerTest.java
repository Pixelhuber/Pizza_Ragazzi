package ControllerTests;

import controllers.AssetsFinder;
import controllers.HomeController;
import controllers.routes;
import org.junit.Before;
import org.junit.Test;
import play.mvc.Http;
import play.mvc.Result;
import play.test.Helpers;
import play.test.WithApplication;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;
import static play.mvc.Http.Status.OK;
import static play.test.Helpers.route;

public class HomeControllerTest extends WithApplication {
    private HomeController homeController;

    @Before
    public void provideHighscoreController() {
        this.homeController = new HomeController(provideApplication().injector().instanceOf(AssetsFinder.class));
    }

    @Test
    public void testIndex() {
        Http.RequestBuilder request = Helpers.fakeRequest(routes.HomeController.index());
        Result result = route(app, request);

        assertEquals(OK, result.status());
        assertEquals("application/json", result.contentType().get());
    }

    @Test
    public void testHighscore() {
        Http.RequestBuilder request = Helpers.fakeRequest(routes.HomeController.highscore());
        Result result = route(app, request);

        assertEquals(OK, result.status());
        assertEquals("application/json", result.contentType().get());
    }
}