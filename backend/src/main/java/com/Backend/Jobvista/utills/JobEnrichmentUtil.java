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
                "AWS", "Docker", "Kubernetes", "SEO", "Excel"
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

        if (description == null) return "Not specified";

        Pattern pattern = Pattern.compile("(\\d+\\+?\\s?years?)", Pattern.CASE_INSENSITIVE);
        Matcher matcher = pattern.matcher(description);

        if (matcher.find()) {
            return matcher.group();
        }

        return "Not specified";
    }


    public static JobType detectJobType(String title) {
        String lower = title.toLowerCase();

        if (lower.contains("intern")) return JobType.INTERNSHIP;
        if (lower.contains("manager")) return JobType.MANAGER;
        if(lower.contains("job")) return  JobType.JOB;
        return JobType.JOB;
    }

    public static EmploymentType detectEmploymentType(String description){
        String lower = description.toLowerCase();

        if (lower.contains("full-time")) return  EmploymentType.FULL_TIME;
        if (lower.contains("part-time")) return  EmploymentType.PART_TIME;
        if (lower.contains("remote")) return  EmploymentType.REMOTE;

        return  EmploymentType.FULL_TIME;
    }

    public static String formatSalary(Double min, Double max) {
        if (min != null && max != null) {
            return "₹" + min.intValue() + " - ₹" + max.intValue();
        }
        return "Not disclosed";
    }

}
