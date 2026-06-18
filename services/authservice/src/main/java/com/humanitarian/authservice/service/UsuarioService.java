package com.humanitarian.authservice.service;

import com.humanitarian.authservice.dto.AuthResponseDTO;
import com.humanitarian.authservice.dto.UsuarioDTO;
import com.humanitarian.authservice.model.Usuario;
import com.humanitarian.authservice.repository.UsuarioRepository;
import com.humanitarian.authservice.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final BCryptPasswordEncoder codificadorDeClaves;
    private final JwtService jwtService;

    // Registro PÚBLICO (Cualquiera se puede registrar, siempre será USER)
    public Usuario registrarUsuario(UsuarioDTO usuarioDTO) {
        if (usuarioRepository.existsByCorreo(usuarioDTO.getCorreo())) {
            throw new RuntimeException("El correo ya esta registrado en el sistema");
        }
        
        String claveEncriptada = codificadorDeClaves.encode(usuarioDTO.getClave());

        Usuario nuevoUsuario = Usuario.builder()
            .nombre(usuarioDTO.getNombre())
            .correo(usuarioDTO.getCorreo())
            .clave(claveEncriptada)
            .rol("USER") // Público siempre es USER
            .build();
        
        @SuppressWarnings("null")
        Usuario saved = usuarioRepository.save(nuevoUsuario);
        return saved;
    }

    // Registro para ADMIN (Este sí detecta dominios @administrador y @donaton)
    public Usuario registrarPersonal(UsuarioDTO usuarioDTO) {
        if (usuarioRepository.existsByCorreo(usuarioDTO.getCorreo())) {
            throw new RuntimeException("El correo ya existe");
        }
        
        String correo = usuarioDTO.getCorreo().toLowerCase();
        String rolAsignado = "USER";
        
        if (correo.contains("@administrador.")) rolAsignado = "ADMIN";
        else if (correo.contains("@donaton.")) rolAsignado = "TRABAJADOR";

        Usuario personal = Usuario.builder()
            .nombre(usuarioDTO.getNombre())
            .correo(usuarioDTO.getCorreo())
            .clave(codificadorDeClaves.encode(usuarioDTO.getClave()))
            .rol(rolAsignado)
            .build();
        
        @SuppressWarnings("null")
        Usuario savedPersonal = usuarioRepository.save(personal);
        return savedPersonal;
    }

    // --- Métodos de Gestión (Solo Admin) ---

    public java.util.List<Usuario> listarTodos() {
        return usuarioRepository.findAll();
    }

    public void eliminarUsuario(Long id) {
        usuarioRepository.deleteById(id);
    }

    public Usuario actualizarRol(Long id, String nuevoRol) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        usuario.setRol(nuevoRol.toUpperCase());
        return usuarioRepository.save(usuario);
    }

    public AuthResponseDTO loguearUsuario(String correo, String clave) {
        Usuario usuario = usuarioRepository.findByCorreo(correo)
                .orElseThrow(() -> new RuntimeException("Credenciales inválidas"));
        
        if (!codificadorDeClaves.matches(clave, usuario.getClave())) {
            throw new RuntimeException("Credenciales inválidas");
        }
        
        String token = jwtService.generarToken(usuario);
        return AuthResponseDTO.builder()
                .token(token)
                .build();
    }
    
}
