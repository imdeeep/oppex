package com.oppex.exception;

import com.oppex.dto.ErrorResponse;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.ConstraintViolationException;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.ext.ExceptionMapper;
import jakarta.ws.rs.ext.Provider;
import java.util.stream.Collectors;

@Provider
public class ApiExceptionMapper implements ExceptionMapper<Exception> {

    @Override
    public Response toResponse(Exception exception) {
        if (exception instanceof DuplicateEmailException duplicateEmail) {
            return Response.status(Response.Status.CONFLICT)
                    .entity(new ErrorResponse(duplicateEmail.getMessage()))
                    .build();
        }

        if (exception instanceof InvalidCredentialsException invalidCredentials) {
            return Response.status(Response.Status.UNAUTHORIZED)
                    .entity(new ErrorResponse(invalidCredentials.getMessage()))
                    .build();
        }

        if (exception instanceof InvalidOtpException invalidOtp) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(new ErrorResponse(invalidOtp.getMessage()))
                    .build();
        }

        if (exception instanceof ExpiredOtpException expiredOtp) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(new ErrorResponse(expiredOtp.getMessage()))
                    .build();
        }

        if (exception instanceof ConstraintViolationException constraintViolation) {
            String message = constraintViolation.getConstraintViolations().stream()
                    .map(ConstraintViolation::getMessage)
                    .collect(Collectors.joining(", "));
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(new ErrorResponse(message))
                    .build();
        }

        return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                .entity(new ErrorResponse("An unexpected error occurred"))
                .build();
    }
}
