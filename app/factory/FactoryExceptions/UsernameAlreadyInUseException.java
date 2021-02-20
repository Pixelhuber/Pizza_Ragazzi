package factory.FactoryExceptions;

public class UsernameAlreadyInUseException extends RuntimeException {

    public UsernameAlreadyInUseException(String message) {
        super(message);
    }
}