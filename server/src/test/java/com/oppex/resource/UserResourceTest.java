package com.oppex.resource;

import static io.restassured.RestAssured.given;
import static org.hamcrest.CoreMatchers.equalTo;
import static org.hamcrest.CoreMatchers.notNullValue;
import static org.junit.jupiter.api.Assertions.assertNotNull;

import com.oppex.repository.UserRepository;
import io.quarkus.test.junit.QuarkusTest;
import io.restassured.http.ContentType;
import jakarta.inject.Inject;
import org.junit.jupiter.api.MethodOrderer;
import org.junit.jupiter.api.Order;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestMethodOrder;

@QuarkusTest
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
class UserResourceTest {

    private static final String EMAIL = "integration@example.com";
    private static final String PASSWORD = "SecurePass1";

    @Inject
    UserRepository userRepository;

    @Test
    @Order(1)
    void signupReturnsCreatedUser() {
        given().contentType(ContentType.JSON)
                .body("{\"email\":\"" + EMAIL + "\",\"password\":\"" + PASSWORD + "\"}")
                .when()
                .post("/api/users/signup")
                .then()
                .statusCode(201)
                .body("email", equalTo(EMAIL))
                .body("verified", equalTo(false))
                .body("id", notNullValue());
    }

    @Test
    @Order(2)
    void duplicateSignupReturnsConflict() {
        given().contentType(ContentType.JSON)
                .body("{\"email\":\"" + EMAIL + "\",\"password\":\"" + PASSWORD + "\"}")
                .when()
                .post("/api/users/signup")
                .then()
                .statusCode(409)
                .body("message", equalTo("Email already registered: " + EMAIL));
    }

    @Test
    @Order(3)
    void loginBeforeVerifyReturnsUnverifiedMessage() {
        given().contentType(ContentType.JSON)
                .body("{\"email\":\"" + EMAIL + "\",\"password\":\"" + PASSWORD + "\"}")
                .when()
                .post("/api/users/login")
                .then()
                .statusCode(200)
                .body("verified", equalTo(false))
                .body(
                        "message",
                        equalTo("You need to validate your email to access the portal"));
    }

    @Test
    @Order(4)
    void verifyOtpSucceeds() {
        String otp = userRepository
                .findByEmail(EMAIL)
                .map(user -> user.verificationOtp)
                .orElse(null);
        assertNotNull(otp);

        given().contentType(ContentType.JSON)
                .body("{\"email\":\"" + EMAIL + "\",\"otp\":\"" + otp + "\"}")
                .when()
                .post("/api/users/verify")
                .then()
                .statusCode(200)
                .body("message", equalTo("Email verified successfully"));
    }

    @Test
    @Order(5)
    void loginAfterVerifyReturnsVerifiedMessage() {
        given().contentType(ContentType.JSON)
                .body("{\"email\":\"" + EMAIL + "\",\"password\":\"" + PASSWORD + "\"}")
                .when()
                .post("/api/users/login")
                .then()
                .statusCode(200)
                .body("verified", equalTo(true))
                .body(
                        "message",
                        equalTo("Your email is validated. You can access the portal"));
    }

    @Test
    @Order(6)
    void loginWithWrongPasswordReturnsUnauthorized() {
        given().contentType(ContentType.JSON)
                .body("{\"email\":\"" + EMAIL + "\",\"password\":\"WrongPass1\"}")
                .when()
                .post("/api/users/login")
                .then()
                .statusCode(401)
                .body("message", equalTo("Invalid email or password"));
    }

    @Test
    @Order(7)
    void verifyWithWrongOtpReturnsBadRequest() {
        given().contentType(ContentType.JSON)
                .body("{\"email\":\"wrong@example.com\",\"otp\":\"000000\"}")
                .when()
                .post("/api/users/verify")
                .then()
                .statusCode(400)
                .body("message", equalTo("Invalid verification code"));
    }
}
