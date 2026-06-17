package com.donaton.necesidades;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class NecesidadesApplication {

	public static void main(String[] args) {
		SpringApplication.run(NecesidadesApplication.class, args);
	}
}
