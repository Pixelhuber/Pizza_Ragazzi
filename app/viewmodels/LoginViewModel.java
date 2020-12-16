package viewmodels;

public class LoginViewModel {

    private String username;
    private String password;

    public String getUsername() {
        return username;
    }

    public LoginViewModel setUsername(String username) {
        this.username = username;
        return this;
    }

    public String getPassword() {
        return password;
    }

    public LoginViewModel setPassword(String password) {
        this.password = password;
        return this;
    }
}

