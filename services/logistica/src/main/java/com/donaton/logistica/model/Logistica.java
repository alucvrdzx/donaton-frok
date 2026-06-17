package com.donaton.logistica.model;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Column;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Logistica {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String destino;
    private Double lat;
    private Double lng;
    private Long necesidadId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EstadoLogistica estado = EstadoLogistica.PENDIENTE;

    private String categoria;

    private String producto;
    private Double cantidad;

    private String detalle;
}