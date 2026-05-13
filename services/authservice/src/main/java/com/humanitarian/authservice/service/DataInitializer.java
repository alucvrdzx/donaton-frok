package com.humanitarian.authservice.service;

import com.humanitarian.authservice.model.Usuario;
import com.humanitarian.authservice.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UsuarioRepository usuarioRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // Si no hay usuarios, creamos el administrador inicial
        if (usuarioRepository.count() == 0) {
            Usuario admin = Usuario.builder()
                    .nombre("Administrador Inicial")
                    .correo("admin@administrador.cl")
                    .clave(passwordEncoder.encode("admin123"))
                    .rol("ADMIN")
                    .build();
            usuarioRepository.save(admin);
            System.out.println(">>> Administrador inicial creado: admin@administrador.cl / admin123");
        }
    }
}
