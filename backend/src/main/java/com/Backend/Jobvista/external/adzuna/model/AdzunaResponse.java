package com.Backend.Jobvista.external.adzuna.model;

import lombok.Data;

import java.util.List;

@Data
public class AdzunaResponse {
    private List<AdzunaJob> results;
}
