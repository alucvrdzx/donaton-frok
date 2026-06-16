package com.donaton.donaciones.service;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.amqp.rabbit.core.RabbitTemplate;

import com.donaton.donaciones.factory.DonacionFactory;
import com.donaton.donaciones.model.DonacionDetalle;
import com.donaton.donaciones.repository.DonacionRepository;

@ExtendWith(MockitoExtension.class)
class DonacionServiceTest {

    @Mock
    private DonacionRepository repository;

    @Mock
    private DonacionFactory factory;

    @Mock
    private RabbitTemplate rabbitTemplate;

    @InjectMocks
    private DonacionService service;

    @Test
    void debeCrearDonacionNueva() {
        DonacionDetalle donacion = new DonacionDetalle();

        donacion.setNombreDonante("Juan");
        donacion.setTipoDonacion("ROPA");
        donacion.setCantidad(10.0);
        donacion.setDetalle("Polera");
        donacion.setUnidadMedida("unidades");

        when(repository.findByNombreDonanteAndTipoDonacionAndDetalle(
                "Juan",
                "ROPA",
                "Polera"))
            .thenReturn(Optional.empty());

        when(factory.crearDonacion(
                "Juan",
                "ROPA",
                10.0,
                "Polera"))
            .thenReturn(donacion);

        when(repository.save(donacion))
            .thenReturn(donacion);

        DonacionDetalle resultado = service.crearDonacion(
                "Juan",
                "ROPA",
                10.0,
                "Polera");

        assertNotNull(resultado);
        assertEquals("Juan", resultado.getNombreDonante());
        assertEquals(10.0, resultado.getCantidad());

        verify(repository).save(donacion);
        verify(rabbitTemplate).convertAndSend(
            anyString(),
            anyString(),
            any(Object.class));
    }

    @Test
    void debeAcumularCantidadCuandoLaDonacionYaExiste() {
        DonacionDetalle existente = new DonacionDetalle();

        existente.setNombreDonante("Juan");
        existente.setTipoDonacion("ROPA");
        existente.setCantidad(10.0);
        existente.setDetalle("Polera");
        existente.setUnidadMedida("unidades");

        when(repository.findByNombreDonanteAndTipoDonacionAndDetalle(
                "Juan",
                "ROPA",
                "Polera"))
            .thenReturn(Optional.of(existente));

        when(repository.save(any(DonacionDetalle.class)))
            .thenReturn(existente);

        DonacionDetalle resultado = service.crearDonacion(
                "Juan",
                "ROPA",
                5.0,
                "Polera");

        assertNotNull(resultado);
        assertEquals(15.0, resultado.getCantidad());

        verify(repository).save(existente);
        verify(rabbitTemplate).convertAndSend(
                anyString(),
                anyString(),
                any(Object.class));
    }

    @Test
    void debeEliminarDonacionYEnviarEventoDeReversa() {
        DonacionDetalle donacion = new DonacionDetalle();

        donacion.setId(1L);
        donacion.setTipoDonacion("ROPA");
        donacion.setCantidad(10.0);
        donacion.setDetalle("Polera");
        donacion.setUnidadMedida("unidades");

        when(repository.findById(1L))
                .thenReturn(Optional.of(donacion));

        service.eliminar(1L);

        verify(repository).deleteById(1L);
        verify(rabbitTemplate).convertAndSend(
                anyString(),
                anyString(),
                any(Object.class));
    }

    @Test
    void debeActualizarDonacionAumentandoCantidad() {
        DonacionDetalle anterior = new DonacionDetalle();

        anterior.setId(1L);
        anterior.setNombreDonante("Juan");
        anterior.setTipoDonacion("ROPA");
        anterior.setCantidad(10.0);
        anterior.setDetalle("Polera");
        anterior.setUnidadMedida("unidades");

        DonacionDetalle actualizada = new DonacionDetalle();

        actualizada.setNombreDonante("Juan");
        actualizada.setTipoDonacion("ROPA");
        actualizada.setCantidad(15.0);
        actualizada.setDetalle("Polera");

        when(repository.findById(1L))
                .thenReturn(Optional.of(anterior));

        when(repository.save(any(DonacionDetalle.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        DonacionDetalle resultado = service.actualizar(1L, actualizada);

        assertNotNull(resultado);
        assertEquals(15.0, resultado.getCantidad());

        verify(repository).save(any(DonacionDetalle.class));
        verify(rabbitTemplate).convertAndSend(
                anyString(),
                anyString(),
                any(Object.class));
    }

    @Test
    void debeActualizarDonacionDisminuyendoCantidad() {
        DonacionDetalle anterior = new DonacionDetalle();

        anterior.setId(1L);
        anterior.setNombreDonante("Juan");
        anterior.setTipoDonacion("ROPA");
        anterior.setCantidad(15.0);
        anterior.setDetalle("Polera");
        anterior.setUnidadMedida("unidades");

        DonacionDetalle actualizada = new DonacionDetalle();

        actualizada.setNombreDonante("Juan");
        actualizada.setTipoDonacion("ROPA");
        actualizada.setCantidad(10.0);
        actualizada.setDetalle("Polera");

        when(repository.findById(1L))
                .thenReturn(Optional.of(anterior));

        when(repository.save(any(DonacionDetalle.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        DonacionDetalle resultado = service.actualizar(1L, actualizada);

        assertNotNull(resultado);
        assertEquals(10.0, resultado.getCantidad());

        verify(repository).save(any(DonacionDetalle.class));
        verify(rabbitTemplate).convertAndSend(
                anyString(),
                anyString(),
                any(Object.class));
    }

    @Test
    void noDebeEnviarEventoSiCantidadNoCambia() {
        DonacionDetalle anterior = new DonacionDetalle();

        anterior.setId(1L);
        anterior.setNombreDonante("Juan");
        anterior.setTipoDonacion("ROPA");
        anterior.setCantidad(10.0);
        anterior.setDetalle("Polera");
        anterior.setUnidadMedida("unidades");

        DonacionDetalle actualizada = new DonacionDetalle();

        actualizada.setNombreDonante("Juan");
        actualizada.setTipoDonacion("ROPA");
        actualizada.setCantidad(10.0);
        actualizada.setDetalle("Polera");

        when(repository.findById(1L))
                .thenReturn(Optional.of(anterior));

        when(repository.save(any(DonacionDetalle.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        DonacionDetalle resultado = service.actualizar(1L, actualizada);

        assertNotNull(resultado);
        assertEquals(10.0, resultado.getCantidad());

        verify(repository).save(any(DonacionDetalle.class));
        verify(rabbitTemplate, never()).convertAndSend(
                anyString(),
                anyString(),
                any(Object.class));
    }
}