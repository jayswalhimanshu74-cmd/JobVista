package com.Backend.Jobvista.repository;

import com.Backend.Jobvista.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByUserIdOrderByTimestampDesc(String userId);
    long countByUserIdAndIsReadFalse(String userId);
}
