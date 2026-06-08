package com.donaton.necesidades.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "necesidades")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Necesidad {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String titulo;

    @Column(nullable = false, length = 1000)
    private String descripcion;

    @Column(nullable = false)
    private Integer cantidadRequerida;

    @Column(nullable = false)
    private Integer cantidadCubierta;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EstadoNecesidad estado;

    @Column(nullable = false)
    private String categoria;

    @Column(nullable = false)
    private String ubicacion;

    @Column(name = "creado_en", nullable = false, updatable = false)
    private LocalDateTime creadoEn;

    @PrePersist
    protected void onCreate() {
        this.creadoEn = LocalDateTime.now();
        if (this.cantidadCubierta == null) {
            this.cantidadCubierta = 0;
        }
        if (this.estado == null) {
            this.estado = EstadoNecesidad.PENDIENTE;
        }
    }
}
