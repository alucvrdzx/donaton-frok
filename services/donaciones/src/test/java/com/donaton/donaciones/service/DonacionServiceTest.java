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
import com.donaton.donaciones.model.Donacion;
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
        Donacion donacion = new Donacion();

        donacion.setNombreDonante("Juan");
        donacion.setCategoria("ROPA");
        donacion.setProducto("Polera");
        donacion.setCantidad(10.0);
        donacion.setDetalle("Polera");
        donacion.setUnidadMedida("unidades");

        when(repository.findByNombreDonanteAndCategoriaAndProductoAndDetalle(
                "Juan",
                "ROPA",
                "Polera",
                "Polera"))
            .thenReturn(Optional.empty());

        when(factory.crearDonacion(
                "Juan",
                "ROPA",
                "Polera",
                10.0,
                "Polera"))
            .thenReturn(donacion);

        when(repository.save(donacion))
            .thenReturn(donacion);

        Donacion resultado = service.crearDonacion(
                "Juan",
                "ROPA",
                "Polera",
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
        Donacion existente = new Donacion();

        existente.setNombreDonante("Juan");
        existente.setCategoria("ROPA");
        existente.setProducto("Polera");
        existente.setCantidad(10.0);
        existente.setDetalle("Polera");
        existente.setUnidadMedida("unidades");

        when(repository.findByNombreDonanteAndCategoriaAndProductoAndDetalle(
                "Juan",
                "ROPA",
                "Polera",
                "Polera"))
            .thenReturn(Optional.of(existente));

        when(repository.save(any(Donacion.class)))
            .thenReturn(existente);

        Donacion resultado = service.crearDonacion(
                "Juan",
                "ROPA",
                "Polera",
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
        Donacion donacion = new Donacion();

        donacion.setId(1L);
        donacion.setCategoria("ROPA");
        donacion.setProducto("Polera");
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
        Donacion anterior = new Donacion();

        anterior.setId(1L);
        anterior.setNombreDonante("Juan");
        anterior.setCategoria("ROPA");
        anterior.setProducto("Polera");
        anterior.setCantidad(10.0);
        anterior.setDetalle("Polera");
        anterior.setUnidadMedida("unidades");

        Donacion actualizada = new Donacion();

        actualizada.setNombreDonante("Juan");
        actualizada.setCategoria("ROPA");
        actualizada.setProducto("Polera");
        actualizada.setCantidad(15.0);
        actualizada.setDetalle("Polera");

        when(repository.findById(1L))
                .thenReturn(Optional.of(anterior));

        when(repository.save(any(Donacion.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        Donacion resultado = service.actualizar(1L, actualizada);

        assertNotNull(resultado);
        assertEquals(15.0, resultado.getCantidad());

        verify(repository).save(any(Donacion.class));
        verify(rabbitTemplate).convertAndSend(
                anyString(),
                anyString(),
                any(Object.class));
    }

    @Test
    void debeActualizarDonacionDisminuyendoCantidad() {
        Donacion anterior = new Donacion();

        anterior.setId(1L);
        anterior.setNombreDonante("Juan");
        anterior.setCategoria("ROPA");
        anterior.setProducto("Polera");
        anterior.setCantidad(15.0);
        anterior.setDetalle("Polera");
        anterior.setUnidadMedida("unidades");

        Donacion actualizada = new Donacion();

        actualizada.setNombreDonante("Juan");
        actualizada.setCategoria("ROPA");
        actualizada.setProducto("Polera");
        actualizada.setCantidad(10.0);
        actualizada.setDetalle("Polera");

        when(repository.findById(1L))
                .thenReturn(Optional.of(anterior));

        when(repository.save(any(Donacion.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        Donacion resultado = service.actualizar(1L, actualizada);

        assertNotNull(resultado);
        assertEquals(10.0, resultado.getCantidad());

        verify(repository).save(any(Donacion.class));
        verify(rabbitTemplate).convertAndSend(
                anyString(),
                anyString(),
                any(Object.class));
    }

    @Test
    void noDebeEnviarEventoSiCantidadNoCambia() {
        Donacion anterior = new Donacion();

        anterior.setId(1L);
        anterior.setNombreDonante("Juan");
        anterior.setCategoria("ROPA");
        anterior.setProducto("Polera");
        anterior.setCantidad(10.0);
        anterior.setDetalle("Polera");
        anterior.setUnidadMedida("unidades");

        Donacion actualizada = new Donacion();

        actualizada.setNombreDonante("Juan");
        actualizada.setCategoria("ROPA");
        actualizada.setProducto("Polera");
        actualizada.setCantidad(10.0);
        actualizada.setDetalle("Polera");

        when(repository.findById(1L))
                .thenReturn(Optional.of(anterior));

        when(repository.save(any(Donacion.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        Donacion resultado = service.actualizar(1L, actualizada);

        assertNotNull(resultado);
        assertEquals(10.0, resultado.getCantidad());

        verify(repository).save(any(Donacion.class));
        verify(rabbitTemplate, never()).convertAndSend(
                anyString(),
                anyString(),
                any(Object.class));
    }
}