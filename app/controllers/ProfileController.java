package controllers;

import play.data.Form;
import play.data.FormFactory;
import play.mvc.Controller;
import play.mvc.Http;
import play.mvc.Result;
import play.mvc.Results;
import viewmodels.UserViewModel;

import javax.inject.Inject;


public class ProfileController extends Controller {

    private final AssetsFinder assetsFinder;
    private final FormFactory formFactory;

    @Inject
    public ProfileController(AssetsFinder assetsFinder, FormFactory formFactory) {
        this.assetsFinder = assetsFinder;
        this.formFactory = formFactory;
    }

    // Sets the username to the value in the request-body
    public Result setUsername(Http.Request request) {
        Form<UserViewModel> form = formFactory.form(UserViewModel.class); // Ein ViewModel gibt quasi die Form vor, wie aus einem request gelesen werden soll (dafür auch das Package "ViewModels" :))
        UserViewModel userViewModel = form.bindFromRequest(request).get();

        return ok(userViewModel.getUsername()).addingToSession(request, "username", userViewModel.getUsername()); // Speichert den Username in der Session unter dem Key "username"
    }

    // Reads key "username" from session and returns it
    public Result getUsernameFromSession(Http.Request request) {

        return request
                .session()
                .get("username") // Sucht nach dem Wert in der Session, der unter dem Key "Username" abgelegt ist
                .map(Results::ok)
                .orElseGet(Results::notFound);
    }
}
