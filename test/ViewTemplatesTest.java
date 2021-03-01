import controllers.AssetsFinder;
import org.junit.Before;
import org.junit.Test;
import play.test.WithApplication;
import play.twirl.api.Content;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * A functional test starts a Play application for every test.
 *
 * https://www.playframework.com/documentation/latest/JavaFunctionalTest
 */
public class ViewTemplatesTest extends WithApplication {
    AssetsFinder assetsFinder;

    @Before
    public void provideAssetsFinder() {
        assetsFinder = provideApplication().injector().instanceOf(AssetsFinder.class);
    }

    @Test
    public void renderCreateAccountTemplate() {
        Content html = views.html.createAccount.render("CreateAccount", assetsFinder);
        assertThat("text/html").isEqualTo(html.contentType());
        assertThat(html.body()).contains("PIZZA RAGAZZI");
    }

    @Test
    public void renderFriendlistTemplate() {
        Content html = views.html.friendlist.render(assetsFinder);
        assertThat("text/html").isEqualTo(html.contentType());
        assertThat(html.body()).contains("friendlist");
    }

    @Test
    public void renderHighscoreTemplate() {
        Content html = views.html.highscore.render("Highscore", assetsFinder);
        assertThat("text/html").isEqualTo(html.contentType());
        assertThat(html.body()).contains("Highscores");
    }

    @Test
    public void renderIndexTemplate() {
        Content html = views.html.index.render("index", assetsFinder);
        assertThat("text/html").isEqualTo(html.contentType());
        assertThat(html.body()).contains("Welcome to Play");
    }

    @Test
    public void renderLoginTemplate() {
        Content html = views.html.login.render("Login", assetsFinder);
        assertThat("text/html").isEqualTo(html.contentType());
        assertThat(html.body()).contains("PIZZA RAGAZZI");
    }

    @Test
    public void renderMemoryTemplate() {
        Content html = views.html.memory.render("Memory", assetsFinder);
        assertThat("text/html").isEqualTo(html.contentType());
        assertThat(html.body()).contains("Memory");
    }

    @Test
    public void renderMenuTemplate() {
        Content html = views.html.menu.render("Menu", assetsFinder);
        assertThat("text/html").isEqualTo(html.contentType());
        assertThat(html.body()).contains("Menu");
    }

    @Test
    public void renderNavbarTemplate() {
        Content html = views.html.navbar.render(assetsFinder);
        assertThat("text/html").isEqualTo(html.contentType());
        assertThat(html.body()).contains("menu");
    }

    @Test
    public void renderPizzarushTemplate() {
        Content html = views.html.pizzarush.render("Navbar", assetsFinder);
        assertThat("text/html").isEqualTo(html.contentType());
        assertThat(html.body()).contains("menu");
    }

    @Test
    public void renderProfileTemplate() {
        Content html = views.html.profile.render("Profile", assetsFinder);
        assertThat("text/html").isEqualTo(html.contentType());
        assertThat(html.body()).contains("Profile");
    }

    @Test
    public void renderTutorialTemplate() {
        Content html = views.html.tutorial.render(assetsFinder);
        assertThat("text/html").isEqualTo(html.contentType());
        assertThat(html.body()).contains("Tutorial");
    }
}
