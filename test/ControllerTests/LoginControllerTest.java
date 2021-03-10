package ControllerTests;

import com.fasterxml.jackson.databind.JsonNode;
import controllers.AssetsFinder;
import controllers.LoginController;
import models.factory.UserFactory;
import org.junit.Before;
import org.junit.Test;
import play.mvc.Http;
import play.mvc.Result;
import play.test.Helpers;
import play.test.WithApplication;
import org.mockito.Mockito;

import java.util.HashMap;
import java.util.Map;

import static org.junit.Assert.assertEquals;
import static play.mvc.Http.Status.OK;
import static play.test.Helpers.GET;
import static play.test.Helpers.route;

import static org.mockito.Mockito.*;

public class LoginControllerTest extends WithApplication {

    private AssetsFinder mockedAssetsFinder;
    private UserFactory mockedUserFactory;
    private UserFactory.User mockedUser;

    private LoginController loginController;

    private final String VALID_EMAIL = "test@test.com";
    private final String VALID_PASSWORD = "password";


    @Before
    public void setUp() {
        mockedAssetsFinder = mock(AssetsFinder.class);
        mockedUserFactory = mock(UserFactory.class);
        mockedUser = mock(UserFactory.User.class);

        when(mockedUserFactory.isEmailAvailable(any())).thenReturn(false);
        when(mockedUserFactory.authenticateUser(any(), any())).thenReturn(mockedUser);
        when(mockedUser.getEmail()).thenReturn(VALID_EMAIL);

        this.loginController = new LoginController(mockedAssetsFinder, mockedUserFactory);
    }

    @Test
    public void testAuthenticate() {
        Http.Request fakeRequest = mock(Http.Request.class);

        JsonNode mockedJsonNode = mock(JsonNode.class);
        //when(mockedJsonNode.isNull()).thenReturn(false);
        when(mockedJsonNode.findPath(anyString())).thenReturn(any());
        when(mockedJsonNode.findPath("email").textValue()).thenReturn(VALID_EMAIL);
        when(mockedJsonNode.findPath("password").textValue()).thenReturn(VALID_PASSWORD);

        when(fakeRequest.body().asJson()).thenReturn(mockedJsonNode);

        //Result result = route(app, request);
        Result result = loginController.authenticate(fakeRequest);

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

    @Test
    public void testCreateAccount() {
        Map<String, String> testSession = new HashMap<>();
        testSession.put("username", "test");
        testSession.put("email", VALID_EMAIL);
        testSession.put("password", "test");
        testSession.put("password2", "test");

        Http.RequestBuilder requestBuilder = Helpers.fakeRequest().bodyForm(testSession);

        //Http.RequestBuilder request = Helpers.fakeRequest().method(GET).uri("/login/authenticate");

        //Result result = route(app, request);
        Result result = loginController.createAccount(requestBuilder.build());

        assertEquals(OK, result.status());
        assertEquals("application/json", result.contentType().get());
    }

}
