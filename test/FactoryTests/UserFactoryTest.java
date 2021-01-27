package FactoryTests;

import com.google.common.collect.ImmutableMap;
import factory.FactoryExceptions.EmailAlreadyInUseException;
import factory.UserFactory;

import org.junit.*;
//import org.junit.After;
//import org.junit.Before;
//import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.MethodOrderer;
import org.junit.jupiter.api.Order;
import org.junit.jupiter.api.TestMethodOrder;

import play.db.Database;
import play.db.Databases;


import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertThrows;


@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
public class UserFactoryTest {

    private Database database;
    private UserFactory userFactory;

    @Before
    public void setupDatabase() {
        database = Databases.createFrom(
                "mydatabase",
                "com.mysql.cj.jdbc.Driver",
                "jdbc:mysql://cypher.informatik.uni-wuerzburg.de:38336/sopra-2020WS-team01?useSSL=false",
                ImmutableMap.of(
                        "username", "sopra-2020WS-team01",
                        "password", "M3vfDjc8"));
        userFactory = new factory.UserFactory(database);
    }

    @After
    public void shutdownDatabase() {
        database.shutdown();
    }

    @Test
    @Order(1)
    public void createUserTest() {
        UserFactory.User actualUser = userFactory.createUser("test@mail.lel", "testUser1", "test");
        assertEquals(actualUser.getUsername(),"testUser1");
        assertEquals(actualUser.getEmail(),"test@mail.lel");
        assertEquals(actualUser.getTotalPoints(),0);
        assertEquals(actualUser.getHighScore(),0);
        assertEquals(actualUser.getCurrentTier(),0);
    }

    @Test
    @Order(2)
    public void createUserTest2(){
        Exception exception = assertThrows(EmailAlreadyInUseException.class, () -> {
            UserFactory.User actualUser = userFactory.createUser("test@mail.lel", "testUser2", "test");
        });
        String expectedMessage = "The e-mail test@mail.lel is already in use";
        String actualMessage = exception.getMessage();
        assertEquals(expectedMessage,actualMessage);
    }

    @Test
    public void isEmailAvailableTest(){
        boolean expected = true;
        boolean actual = userFactory.isEmailAvailable("free@free.free");
        assertEquals(expected,actual);
    }

    @Test
    @Order(3)
    public void isEmailAvailableTest2(){
        boolean expected = false;
        boolean actual = userFactory.isEmailAvailable("test@mail.lel");
        assertEquals(expected,actual);
    }

    @Test
    @Order(4)
    public void authenticateUserTest(){
        UserFactory.User actualUser = userFactory.authenticateUser("test@test.lel","test");
        assertEquals(actualUser.getUsername(),"testUser3");
        assertEquals(actualUser.getEmail(),"test@test.lel");
        assertEquals(actualUser.getTotalPoints(),0);
        assertEquals(actualUser.getHighScore(),0);
        assertEquals(actualUser.getCurrentTier(),0);
    }

    @Test
    @Order(5)
    public void authenticateUserTest2(){
        UserFactory.User actualUser = userFactory.authenticateUser("test@mail.lel","wrong");
        UserFactory.User expectedUser = null;
        assertEquals(actualUser,expectedUser);
    }

    @Test
    @Order(6)
    public void deleteUserByEmailTest(){
        userFactory.getUserByEmail("test@mail.lel").delete();
        boolean expected = true;
        boolean actual = userFactory.isEmailAvailable("test@mail.lel");
        assertEquals(expected,actual);
    }


}
