package com.Backend.Jobvista.repository;

import com.Backend.Jobvista.entity.Company;
import com.Backend.Jobvista.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
@EnableJpaRepositories
public interface CompanyRepository extends JpaRepository<Company, Long> {

    Optional<Company> findByCompanyId(UUID companyId);

     Optional<Company> findByUser(User user);

    Page<Company> findByCompanyNameContainingIgnoreCase(String companyName, Pageable pageable);

    Optional<Company> findByCompanyName(String companyName);

    boolean existsByUser(User user);
}