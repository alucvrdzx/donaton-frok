package com.humanitarian.authservice.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class LoginDTO {
    
    @NotBlank(message="El correo electronico no puede estar vacio")
    @Email(message = "El correo electronico ingresado no es valido")
    private String correo;

    @NotBlank(message="La clave no puede estar vacia")
    private String clave;
}
