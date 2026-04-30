package com.Backend.Jobvista.specification;

import com.Backend.Jobvista.entity.Job;
import org.springframework.data.jpa.domain.Specification;

public class JobSpecification  {

    public static Specification<Job> hasKeyword(String keyword) {
        return (root, query, cb) -> {
            if (keyword == null || keyword.isEmpty()) return null;

            return cb.like(
                    cb.lower(root.get("title")),
                    "%" + keyword.toLowerCase() + "%"
            );
        };
    }

    public static Specification<Job> hasLocation(String location) {
        return (root, query, cb) -> {
            if (location == null || location.isEmpty()) return null;

            return cb.like(
                    cb.lower(root.get("location")),
                    "%" + location.toLowerCase() + "%"
            );
        };
    }

    public static Specification<Job> hasSalary(Integer minSalary, Integer maxSalary) {
        return (root, query, cb) -> {
            if (minSalary == null && maxSalary == null) return null;

            if (minSalary != null && maxSalary != null) {
                return cb.between(root.get("salary"), minSalary, maxSalary);
            } else if (minSalary != null) {
                return cb.greaterThanOrEqualTo(root.get("salary"), minSalary);
            } else {
                return cb.lessThanOrEqualTo(root.get("salary"), maxSalary);
            }
        };
    }
}
