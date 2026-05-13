package com.humanitarian.authservice.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class UsuarioDTO {
    
    @NotBlank(message="Nombre de Usuario no puede estar vacio")
    private String nombre;

    @NotBlank(message="El correo electronico no puede estar vacio")
    @Email(message = "EL correo electronico ingresado no es valido")
    private String correo;

    @NotBlank(message="La clave no puede estar vacia")
    private String clave;
}
