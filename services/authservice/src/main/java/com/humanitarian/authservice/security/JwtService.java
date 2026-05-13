package com.humanitarian.authservice.security;

import com.humanitarian.authservice.model.Usuario;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@Service
public class JwtService {

    // Clave secreta fija de 256 bits para permitir validación en el filtro
    private static final String SECRET_STRING = "esta_es_una_clave_secreta_muy_larga_y_segura_123456";
    private final Key SECRET_KEY = io.jsonwebtoken.security.Keys.hmacShaKeyFor(SECRET_STRING.getBytes());

    public String generarToken(Usuario usuario) {
        Map<String, Object> extraClaims = new HashMap<>();
        extraClaims.put("rol", usuario.getRol());
        extraClaims.put("nombre", usuario.getNombre());

        return Jwts.builder()
                .setClaims(extraClaims)
                .setSubject(usuario.getCorreo())
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + 1000 * 60 * 60 * 24)) // 24 horas
                .signWith(SECRET_KEY)
                .compact();
    }
}
