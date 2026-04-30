package com.Backend.Jobvista.service;

import com.Backend.Jobvista.dto.user.UserRequestDTO;
import com.Backend.Jobvista.dto.user.UserResponseDTO;
import com.Backend.Jobvista.exception.UserNotFoundException;
import org.jspecify.annotations.Nullable;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;

import java.util.List;


@Service
public interface UserService {


    UserResponseDTO registerUser( UserRequestDTO dto);

    UserResponseDTO getUserByEmail(String email) throws UserNotFoundException;

    List<UserResponseDTO> getAllUsers() throws UserNotFoundException;

    UserResponseDTO updateUser( String email ,UserRequestDTO dto) throws UserNotFoundException;

    void deleteUserByEmail(String email) throws UserNotFoundException;

    UserResponseDTO findByEmail(String email);
    Page<UserResponseDTO> findAll(int page , int size, String sort);


    UserResponseDTO getUserById(Long id);
}
