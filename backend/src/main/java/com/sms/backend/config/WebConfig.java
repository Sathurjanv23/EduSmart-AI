package com.sms.backend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Web MVC configuration.
 * Static resource mapping for /uploads/** has been replaced by the protected FileDownloadController
 * to enforce object-level authorization on all academic file attachments.
 */
@Configuration
public class WebConfig implements WebMvcConfigurer {
}
