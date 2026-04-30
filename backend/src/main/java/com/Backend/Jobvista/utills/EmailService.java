package com.Backend.Jobvista.utills;


import com.Backend.Jobvista.entity.EmailType;
import lombok.AllArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
@AllArgsConstructor
public class EmailService {

    private  EmailTemplate  templateService;
    private JavaMailSender javaMailSender;

    public void sendMail(
            String to,
            EmailType type,
            Map<String, String> data
    ) {


        String subject = templateService.getSubject(type);
        String body = templateService.getBody(type, data);

        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject(subject);
        message.setText(body);
        message.setFrom("jayswalhimanshu74@gmail.com");

        javaMailSender.send(message);
    }

}
