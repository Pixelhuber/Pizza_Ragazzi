package controllers;

import factory.UserFactory;
import play.data.Form;
import play.data.FormFactory;
import play.libs.Json;
import play.mvc.Controller;
import play.mvc.Http;
import play.mvc.Result;
import play.mvc.Results;
import scala.Console;
import viewmodels.UserViewModel;

import javax.inject.Inject;
import java.io.File;
import java.io.IOException;
import java.util.Optional;

public class MenuController extends Controller{

    private final AssetsFinder assetsFinder;
    private final FormFactory formFactory;
    private final UserFactory userFactory;

    @Inject
    public MenuController(AssetsFinder assetsFinder, FormFactory formFactory, UserFactory userFactory) {
        this.assetsFinder = assetsFinder;
        this.formFactory = formFactory;
        this.userFactory = userFactory;
    }
}
