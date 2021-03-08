package ControllerTests;

import controllers.AssetsFinder;
import controllers.LoginController;
import controllers.routes;
import models.factory.UserFactory;
import org.junit.Before;
import org.junit.Test;
import play.mvc.Http;
import play.mvc.Result;
import play.test.Helpers;
import play.test.WithApplication;

import static org.junit.Assert.assertEquals;
import static play.mvc.Http.Status.OK;
import static play.test.Helpers.GET;
import static play.test.Helpers.route;

public class LoginControllerTest extends WithApplication {
    private LoginController loginController;

    @Before
    public void provideLoginController() {
        this.loginController = new LoginController(provideApplication().injector().instanceOf(AssetsFinder.class), provideApplication().injector().instanceOf(UserFactory.class));
    }

    @Test
    public void testAuthenticate() {
        Http.RequestBuilder request = Helpers.fakeRequest(routes.LoginController.authenticate());
        Result result = route(app, request);

        assertEquals(OK, result.status());
        assertEquals("application/json", result.contentType().get());
    }

    @Test
    public void testLogout() {
        Http.RequestBuilder request = Helpers.fakeRequest().method(GET).uri("/logout");
        Result result = route(app, request);

        assertEquals(OK, result.status());
        assertEquals("application/json", result.contentType().get());
    }

}
