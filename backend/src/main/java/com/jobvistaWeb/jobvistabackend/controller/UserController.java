package com.jobvistaWeb.jobvistabackend.controller;

import com.jobvistaWeb.jobvistabackend.entity.User;
import com.jobvistaWeb.jobvistabackend.services.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173")
public class UserController {

    @Autowired
    private UserService userService;

    @PostMapping("/register")
    public User register(@RequestBody User user) {
        return userService.register(user);
    }

//    @PostMapping("/login")
//    public User login(@RequestBody LoginRequest request) {
//        return userService.login(request.getEmail(), request.getPassword());
//    }
}
