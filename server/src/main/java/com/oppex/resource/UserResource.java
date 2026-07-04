package com.oppex.resource;

import com.oppex.dto.LoginRequest;
import com.oppex.dto.LoginResponse;
import com.oppex.dto.MessageResponse;
import com.oppex.dto.ResendCodeRequest;
import com.oppex.dto.SignupRequest;
import com.oppex.dto.UserResponse;
import com.oppex.dto.VerifyOtpRequest;
import com.oppex.service.UserService;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

@Path("/api/users")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class UserResource {

    @Inject
    UserService userService;

    @POST
    @Path("/signup")
    public Response signup(@Valid SignupRequest request) {
        UserResponse user = userService.signup(request.email(), request.password());
        return Response.status(Response.Status.CREATED).entity(user).build();
    }

    @POST
    @Path("/verify")
    public MessageResponse verify(@Valid VerifyOtpRequest request) {
        return userService.verifyOtp(request.email(), request.otp());
    }

    @POST
    @Path("/resend-code")
    public MessageResponse resendCode(@Valid ResendCodeRequest request) {
        return userService.resendVerificationCode(request.email());
    }

    @POST
    @Path("/login")
    public LoginResponse login(@Valid LoginRequest request) {
        return userService.login(request.email(), request.password());
    }
}
