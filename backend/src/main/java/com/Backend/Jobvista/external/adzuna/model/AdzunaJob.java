package com.Backend.Jobvista.external.adzuna.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

@Data
@Getter
@Setter
@AllArgsConstructor
public class AdzunaJob {


    private String id;
    private String title;
    private String description;

    @JsonProperty("redirect_url")
    private String redirectUrl;

    @JsonProperty("salary_min")
    private Double salaryMin;

    @JsonProperty("salary_max")
    private Double salaryMax;

    private Company company;
    private Location location;

    @Getter
    @Setter
    public static class Company {
        @JsonProperty("display_name")
        private String displayName;
    }

    @Getter
    @Setter
    public static class Location {
        @JsonProperty("display_name")
        private String displayName;
    }

}
