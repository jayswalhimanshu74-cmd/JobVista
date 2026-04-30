    package com.Backend.Jobvista.service.impl;

    import com.Backend.Jobvista.dto.company.CompanyMapper;
    import com.Backend.Jobvista.dto.company.CompanyRequestDTO;
    import com.Backend.Jobvista.dto.company.CompanyResponseDTO;
    import com.Backend.Jobvista.entity.Company;
    import com.Backend.Jobvista.entity.Role;
    import com.Backend.Jobvista.entity.User;
    import com.Backend.Jobvista.repository.CompanyRepository;
    import com.Backend.Jobvista.repository.UserRepository;
    import com.Backend.Jobvista.service.CompanyService;
    import jakarta.transaction.Transactional;
    import lombok.AllArgsConstructor;
    import org.springframework.data.domain.Page;
    import org.springframework.data.domain.PageRequest;
    import org.springframework.data.domain.Pageable;
    import org.springframework.data.domain.Sort;
    import org.springframework.stereotype.Service;

    @Service
    @AllArgsConstructor
    public class CompanyServiceImplementation implements CompanyService {

        private final CompanyRepository companyRepository;
        private final UserRepository userRepository;


        @Override
        @Transactional
        public CompanyResponseDTO createCompany(CompanyRequestDTO dto, String email) {

            // 1. Get user
                User user = userRepository.findByEmail(email)
                        .orElseThrow(() -> new RuntimeException("User not found"));

            // 2. Check if already company
            if (companyRepository.existsByUser(user)) {
                throw new RuntimeException("Company already exists for this user");
            }
            // 3. Create company
                Company company = CompanyMapper.toEntity(dto, user);
            Company savedCompany = companyRepository.save(company);

            // 4. 🔥 UPGRADE ROLE
            user.setRole(Role.COMPANY);
            userRepository.save(user);

            return CompanyMapper.toResponse(savedCompany);
        }

        @Override
        public CompanyResponseDTO updateCompany(Long id, CompanyRequestDTO company) {
            Company existing = companyRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Company not found"));

            existing.setCompanyId(company.getUserId());
            existing.setCompanyName(company.getCompanyName());
            existing.setCompanyEmail(company.getCompanyEmail());
            existing.setDescription(company.getDescription());
            existing.setLocation(company.getLocation());
            existing.setLogoUrl(company.getLogoUrl());

            return CompanyMapper.toResponse(companyRepository.save(existing));
        }

        @Override
        public CompanyResponseDTO updateCompanyByEmail(String email, CompanyRequestDTO company) {
            User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
            Company existing = companyRepository.findByUser(user).orElseGet(() -> {
                Company newComp = new Company();
                newComp.setUser(user);
                return newComp;
            });
            
            existing.setCompanyName(company.getCompanyName());
            existing.setCompanyEmail(company.getCompanyEmail());
            existing.setDescription(company.getDescription());
            existing.setLocation(company.getLocation());
            existing.setLogoUrl(company.getLogoUrl());
            
            return CompanyMapper.toResponse(companyRepository.save(existing));
        }

        @Override
        public void deleteCompany(Long id) {

            Company company = companyRepository.findById(id).orElseThrow(()-> new RuntimeException("Invalid Company ID :" ));
            companyRepository.delete(company);
        }

        @Override
        public CompanyResponseDTO getCompanyById(Long id) {
            Company existing = companyRepository.findById(id).orElseThrow(()-> new RuntimeException("Invalid Company Id :"));
            return  CompanyMapper.toResponse(existing);
        }

        @Override
        public CompanyResponseDTO getCompanyByEmail(String email) {
            User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
            Company company = companyRepository.findByUser(user).orElseGet(() -> {
                Company newComp = new Company();
                newComp.setUser(user);
                // Cannot save directly if it lacks required fields, but wait, returning it might cause issue if not saved.
                return newComp;
            });
            // If it's a new company, maybe we should just return empty or throw?
            // Actually, if it's new, it has no ID. The user's PUT request will hit updateMyCompany.
            // But updateMyCompany does: companyService.updateCompany(company.getId(), dto).
            // If it has no ID, updateCompany fails.
            // Let's check updateMyCompany in Controller.
            return CompanyMapper.toResponse(company);
        }

        @Override
        public Page<CompanyResponseDTO> getAllCompanies(int page, int size) {

            Pageable pageable = PageRequest.of(page, size, Sort.by("companyName").ascending());

            Page<Company> companyPage = companyRepository.findAll(pageable);

            return companyPage.map(CompanyMapper::toResponse);
        }

        @Override
        public Page<CompanyResponseDTO> searchCompanies(String keyword, int page, int size) {

            Pageable pageable = PageRequest.of(page, size);

            Page<Company> companyPage =
                    companyRepository.findByCompanyNameContainingIgnoreCase(keyword, pageable);

            return companyPage.map(CompanyMapper::toResponse);
        }
    }
