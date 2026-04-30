package com.Backend.Jobvista.controller;


import lombok.AllArgsConstructor;

import org.springframework.web.bind.annotation.RequestMapping;

import org.springframework.web.bind.annotation.RestController;


@RestController
@RequestMapping("/api/external-jobs")
@AllArgsConstructor
public class ExternalJobController {

   

//    @GetMapping
//    public List<ExternalJobDTO> searchExternal(
//            @RequestParam String keyword,
//            @RequestParam(defaultValue = "1") int page) {
//
//        return adzunaService.searchJobs(keyword, page);
//    }

}
