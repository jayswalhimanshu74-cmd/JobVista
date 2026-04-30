package com.Backend.Jobvista.dto.user;

import com.Backend.Jobvista.entity.User;
import lombok.AllArgsConstructor;


@AllArgsConstructor
public class UserMapper {

    public static User toEntity(UserRequestDTO dto) {
        User user = new User();
        user.setName(dto.getName());
        user.setEmail(dto.getEmail());
        user.setPassword(dto.getPassword());
        user.setRole(dto.getRole());
        user.setMobileNumber(dto.getMobileNumber());
        return user;
    }

    public static UserResponseDTO toResponse(User user) {
        UserResponseDTO dto = new UserResponseDTO();
        dto.setId(user.getId());
        dto.setUserId(user.getUserId());
        dto.setCreatedAt(user.getCreatedAt());
        dto.setStatus(user.getStatus());
        dto.setUpdatedAt(user.getUpdatedAt());
        dto.setPassword(user.getPassword());
        dto.setName(user.getName());
        dto.setEmail(user.getEmail());
        dto.setRole(user.getRole());
        dto.setMobileNumber(user.getMobileNumber());
        return dto;
    }
}