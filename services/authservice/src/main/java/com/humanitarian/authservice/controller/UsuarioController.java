package com.humanitarian.authservice.controller;

import com.humanitarian.authservice.dto.AuthResponseDTO;
import com.humanitarian.authservice.dto.LoginDTO;
import com.humanitarian.authservice.dto.UsuarioDTO;
import com.humanitarian.authservice.model.Usuario;
import com.humanitarian.authservice.service.UsuarioService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class UsuarioController {

    private final UsuarioService usuarioService;

    // Este es el punto de entrada para registrar usuarios
    @PostMapping("/registrar")
    public ResponseEntity<Usuario> registrar(@Valid @RequestBody UsuarioDTO usuarioDTO) {
        Usuario usuarioGuardado = usuarioService.registrarUsuario(usuarioDTO);
        return new ResponseEntity<>(usuarioGuardado, HttpStatus.CREATED);
    }

    // Este es el punto de entrada para loguear usuarios
    @PostMapping("/login")
    public ResponseEntity<AuthResponseDTO> login(@Valid @RequestBody LoginDTO loginDTO) {
        AuthResponseDTO response = usuarioService.loguearUsuario(loginDTO.getCorreo(), loginDTO.getClave());
        return ResponseEntity.ok(response);
    }
}