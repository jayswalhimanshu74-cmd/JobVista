package com.Backend.Jobvista.exception;

public class UserNotFoundException extends Throwable {
    public  UserNotFoundException (String message){
        super(message);
    }
}
