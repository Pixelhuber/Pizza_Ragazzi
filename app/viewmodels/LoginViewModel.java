package viewmodels;

/**
 * The type Login view model.
 */
public class LoginViewModel {

    private String username;
    private String password;

    /**
     * Gets username.
     *
     * @return the username
     */
    public String getUsername() {
        return username;
    }

    /**
     * Sets username.
     *
     * @param username the username
     * @return the username
     */
    public LoginViewModel setUsername(String username) {
        this.username = username;
        return this;
    }

    /**
     * Gets password.
     *
     * @return the password
     */
    public String getPassword() {
        return password;
    }

    /**
     * Sets password.
     *
     * @param password the password
     * @return the password
     */
    public LoginViewModel setPassword(String password) {
        this.password = password;
        return this;
    }
}

