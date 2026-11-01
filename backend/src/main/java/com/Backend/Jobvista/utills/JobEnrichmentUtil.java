package com.Backend.Jobvista.utills;

import com.Backend.Jobvista.entity.EmploymentType;
import com.Backend.Jobvista.entity.JobType;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class JobEnrichmentUtil {

    public static String extractSkills(String description) {
        if (description == null) return "Not specified";

        List<String> commonSkills = List.of(
                "Java", "Spring", "SQL", "Python", "React",
                "AWS", "Docker", "Kubernetes", "SEO", "Excel", "Node.js", 
                "MongoDB", "MySQL", "Git", "REST API", "HTML", "CSS", 
                "JavaScript", "TypeScript", "Angular", "Vue.js", "jQuery", 
                "Bootstrap", "Tailwind CSS", "PostgreSQL", "Redis", "Kafka", 
                "Microservices", "Agile", "Scrum", "JIRA", "Linux", "Shell",
                "REST", "GraphQL", "JSON", "XML", "Postman", "IntelliJ", 
                "VS Code", "Android", "iOS", "Flutter", "React Native"
        );

        List<String> found = new ArrayList<>();

        for (String skill : commonSkills) {
            if (description.toLowerCase().contains(skill.toLowerCase())) {
                found.add(skill);
            }
        }

        return found.isEmpty() ? "Not specified" : String.join(", ", found);
    }

    public static String extractExperience(String description) {
        return String.valueOf(parseExperience(description));
    }

    public static int parseExperience(String description) {
        if (description == null || description.isBlank()) return 0;
        try {
            Pattern pattern = Pattern.compile("(\\d+)\\+?\\s?years?", Pattern.CASE_INSENSITIVE);
            Matcher matcher = pattern.matcher(description);
            if (matcher.find()) {
                String digits = matcher.group(1).replaceAll("[^0-9]", "");
                if (!digits.isEmpty()) {
                    int val = Integer.parseInt(digits);
                    return Math.min(Math.max(val, 0), 50);
                }
            }
        } catch (Exception e) {
            // fallback to default
        }
        return 0;
    }

    public static JobType detectJobType(String title) {
        if (title == null) return JobType.JOB;
        String lower = title.toLowerCase();

        if (lower.contains("intern")) return JobType.INTERNSHIP;
        if (lower.contains("manager")) return JobType.MANAGER;
        if (lower.contains("job")) return JobType.JOB;
        return JobType.JOB;
    }

    public static EmploymentType detectEmploymentType(String description) {
        if (description == null) return EmploymentType.FULL_TIME;
        String lower = description.toLowerCase();

        if (lower.contains("full-time")) return EmploymentType.FULL_TIME;
        if (lower.contains("part-time")) return EmploymentType.PART_TIME;
        if (lower.contains("remote")) return EmploymentType.REMOTE;

        return EmploymentType.FULL_TIME;
    }

    public static String formatSalary(Double min, Double max) {
        if (min != null && max != null) {
            return "₹" + min.intValue() + " - ₹" + max.intValue();
        }
        return "Not disclosed";
    }

    public static String truncate(String text, int maxLength) {
        if (text == null) return null;
        if (text.length() <= maxLength) return text;
        return text.substring(0, maxLength);
    }
}
