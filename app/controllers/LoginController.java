package controllers;

import play.data.Form;
import play.data.FormFactory;
import play.mvc.*;
import viewmodels.LoginViewModel;
import views.html.login;

import javax.naming.AuthenticationException;

public class LoginController extends Controller {

    private final AssetsFinder assetsFinder;
    private final FormFactory formFactory;

    public LoginController(AssetsFinder assetsFinder, FormFactory formFactory) {
        this.assetsFinder = assetsFinder;
        this.formFactory = formFactory;
    }

    public Result login() {
        return ok(
                login.render("This is your Login Page", assetsFinder)
        );
    }

    public Result authenticate(Http.Request request) {
        Form<LoginViewModel> form = formFactory.form(LoginViewModel.class);
        LoginViewModel loginViewModel = form.bindFromRequest(request).get();
        return ok().addingToSession(request, "username", loginViewModel.username);
    }

    public Result logout(Http.Request request) {
        request.session().removing("username");
        return ok(login.render("This is your Profile Page", assetsFinder));
    }

}