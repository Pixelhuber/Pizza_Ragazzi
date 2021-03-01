import org.junit.Test;
import play.Application;
import play.test.Helpers;
import play.test.TestBrowser;
import play.test.WithBrowser;

import static org.junit.Assert.assertTrue;
import static play.test.Helpers.*;

public class BrowserTest extends WithBrowser {

    protected Application provideApplication() {
        return fakeApplication(inMemoryDatabase());
    }

    protected TestBrowser provideBrowser(int port) {
        return Helpers.testBrowser(port);
    }
    //TODO https://www.playframework.com/documentation/2.8.x/JavaFunctionalTest

    @Test
    public void testLogin() {
        browser.goTo("http://localhost:" + play.api.test.Helpers.testServerPort());
        assertTrue(browser.pageSource().contains("PIZZA RAGAZZI"));
    }

    @Test
    public void testProfile() {
        browser.goTo("http://localhost:" + play.api.test.Helpers.testServerPort() + "/profile");
        assertTrue(browser.pageSource().contains("Your new application is ready."));
    }

    @Test
    public void testCreateAccount() {
        browser.goTo("http://localhost:" + play.api.test.Helpers.testServerPort() + "/createAccount");
        assertTrue(browser.pageSource().contains("Your new application is ready."));
    }

    @Test
    public void testPizzaRush() {
        browser.goTo("http://localhost:" + play.api.test.Helpers.testServerPort() + "/pizzaRush");
        assertTrue(browser.pageSource().contains("Your new application is ready."));
    }

    @Test
    public void testMenu() {
        browser.goTo("http://localhost:" + play.api.test.Helpers.testServerPort() + "/menu");
        assertTrue(browser.pageSource().contains("Your new application is ready."));
    }

    @Test
    public void testMemory() {
        browser.goTo("http://localhost:" + play.api.test.Helpers.testServerPort() + "/memory");
        assertTrue(browser.pageSource().contains("Your new application is ready."));
    }

    @Test
    public void testTutorial() {
        browser.goTo("http://localhost:" + play.api.test.Helpers.testServerPort() + "/tutorial");
        assertTrue(browser.pageSource().contains("Your new application is ready."));
    }
}
