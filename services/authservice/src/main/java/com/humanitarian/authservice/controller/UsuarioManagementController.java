package com.humanitarian.authservice.controller;

import com.humanitarian.authservice.dto.UsuarioDTO;
import com.humanitarian.authservice.model.Usuario;
import com.humanitarian.authservice.service.UsuarioService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/usuarios")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')") // Protege todo el controlador: Solo ADMIN puede entrar
public class UsuarioManagementController {

    private final UsuarioService usuarioService;

    @GetMapping
    public ResponseEntity<List<Usuario>> listarTodos() {
        return ResponseEntity.ok(usuarioService.listarTodos());
    }

    @PostMapping("/registrar-personal")
    public ResponseEntity<Usuario> registrarPersonal(@RequestBody UsuarioDTO usuarioDTO) {
        return new ResponseEntity<>(usuarioService.registrarPersonal(usuarioDTO), HttpStatus.CREATED);
    }

    @PutMapping("/{id}/rol")
    public ResponseEntity<Usuario> actualizarRol(@PathVariable Long id, @RequestBody Map<String, String> body) {
        String nuevoRol = body.get("rol");
        return ResponseEntity.ok(usuarioService.actualizarRol(id, nuevoRol));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarUsuario(@PathVariable Long id) {
        usuarioService.eliminarUsuario(id);
        return ResponseEntity.noContent().build();
    }
}
