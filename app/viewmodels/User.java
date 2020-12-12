package viewmodels;


public class User {

    private final LoginViewModel loginViewModel;


    public User(String username, String password) {
        this.loginViewModel = new LoginViewModel(username, password);
    }

    public String getUsername() {
        return loginViewModel.getUsername();
    }

    public String getPassword() {
        return loginViewModel.getPassword();
    }
}
