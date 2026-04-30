package com.Backend.Jobvista.service.impl;

import com.Backend.Jobvista.dto.user.UserMapper;
import com.Backend.Jobvista.dto.user.UserRequestDTO;
import com.Backend.Jobvista.dto.user.UserResponseDTO;
import com.Backend.Jobvista.entity.Role;
import com.Backend.Jobvista.entity.User;
import com.Backend.Jobvista.exception.UserNotFoundException;
import com.Backend.Jobvista.repository.JobSeekersRepository;
import com.Backend.Jobvista.repository.CompanyRepository;
import com.Backend.Jobvista.repository.UserRepository;
import com.Backend.Jobvista.service.UserService;
import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
public class UserServiceImplementation implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JobSeekersRepository jobSeekerRepository;
    private final CompanyRepository companyRepository;

    @Override
    public UserResponseDTO registerUser(UserRequestDTO dto) {

        if (userRepository.existsByEmail(dto.getEmail())) {
            throw new RuntimeException("Email already exists");
        }
        User user = UserMapper.toEntity(dto);
        user.setPassword(passwordEncoder.encode(dto.getPassword()));
        User savedUser = userRepository.save(user);
        return UserMapper.toResponse(savedUser);
    }


    @Override
    public UserResponseDTO getUserByEmail(String email) throws UserNotFoundException {

        return  UserMapper.toResponse(userRepository.findByEmail(email)
                .orElseThrow());

    }
    @Override
    public List<UserResponseDTO> getAllUsers() throws UserNotFoundException {
        return userRepository.findAll()
                .stream()
                .map(UserMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public UserResponseDTO updateUser(  String  email ,UserRequestDTO dto) throws  UserNotFoundException {


        User existingUser = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (dto.getName() != null && !dto.getName().trim().isEmpty()) {
            existingUser.setName(dto.getName());
        }
        if (dto.getEmail() != null && !dto.getEmail().trim().isEmpty()) {
            existingUser.setEmail(dto.getEmail());
        }
        if (dto.getMobileNumber() != null && !dto.getMobileNumber().trim().isEmpty()) {
            existingUser.setMobileNumber(dto.getMobileNumber());
        }
        
        existingUser.setUpdatedAt(LocalDateTime.now());

        User updated = userRepository.save(existingUser);
        return UserMapper.toResponse(updated);
    }

    public UserResponseDTO findByEmail(String email){
        return UserMapper.toResponse(userRepository.findByEmail(email).orElseThrow(()->new UsernameNotFoundException("Invalid ")));
    }

    public Page<UserResponseDTO> findAll(int page , int size,String sort) {
        Pageable pageable = PageRequest.of(page,size, Sort.by("email").ascending());
        Page<User> userPage = userRepository.findAll(pageable);
        return userPage.map(UserMapper::toResponse);


    }

    @Override
    public UserResponseDTO getUserById(Long id) {
        return UserMapper.toResponse(userRepository.findById(id).orElseThrow(()->new RuntimeException( " User Not Found ")));
    }


    @Override
    @Transactional
    public void deleteUserByEmail(String email) throws  UserNotFoundException {
        User user = userRepository.findByEmail(email).orElseThrow(() -> new UserNotFoundException("User not found"));
        // We need to delete dependent records first to avoid foreign key violations
        jobSeekerRepository.findByUser(user).ifPresent(jobSeekerRepository::delete);
        companyRepository.findByUser(user).ifPresent(companyRepository::delete);
        // Assuming companyRepository is available, but UserServiceImplementation doesn't have it injected.
        // It's better to inject it or handle it.
        userRepository.delete(user);
    }
}

