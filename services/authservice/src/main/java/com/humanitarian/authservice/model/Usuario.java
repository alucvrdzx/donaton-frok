package com.humanitarian.authservice.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "usuarios")
public class Usuario {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message="Nombre de Usuario no puede estar VACIO")
    private String nombre;

    @NotBlank(message="El Correo no puede estar VACIO")
    @Email(message="Correo no es valido")
    @Column(unique = true, nullable=false)
    private String correo;

    @NotBlank(message= "Clave no puede estar vacia")
    @JsonIgnore
    private String clave;

    private String rol;
}
