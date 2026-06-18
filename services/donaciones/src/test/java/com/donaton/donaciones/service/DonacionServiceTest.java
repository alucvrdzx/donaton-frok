package com.donaton.donaciones.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import org.junit.jupiter.api.BeforeEach;
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
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

import com.donaton.donaciones.dto.DonacionRequest;
import com.donaton.donaciones.dto.DonacionResponse;
import com.donaton.donaciones.exception.ResourceNotFoundException;
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

    private Donacion donacionMock;

    @BeforeEach
    void setUp() {
        donacionMock = new Donacion();
        donacionMock.setId(1L);
        donacionMock.setNombreDonante("Juan");
        donacionMock.setCategoria("ROPA");
        donacionMock.setProducto("Polera");
        donacionMock.setCantidad(10.0);
        donacionMock.setDetalle("Polera talla M");
        donacionMock.setUnidadMedida("unidades");
        donacionMock.setFechaDonacion(LocalDateTime.now());
    }

    @Test
    void debeCrearDonacionNueva() {
        DonacionRequest request = new DonacionRequest("Juan", "ROPA", "Polera", 10.0, "Polera talla M");

        when(repository.findByNombreDonanteAndCategoriaAndProductoAndDetalle(
                "Juan", "ROPA", "Polera", "Polera talla M"))
            .thenReturn(Optional.empty());

        when(factory.crearDonacion("Juan", "ROPA", "Polera", 10.0, "Polera talla M"))
            .thenReturn(donacionMock);

        when(repository.save(donacionMock)).thenReturn(donacionMock);

        DonacionResponse resultado = service.crearDonacion(request);

        assertNotNull(resultado);
        assertEquals("Juan", resultado.nombreDonante());
        assertEquals(10.0, resultado.cantidad());

        verify(repository).save(donacionMock);
        verify(rabbitTemplate).convertAndSend(anyString(), anyString(), any(Object.class));
    }

    @Test
    void debeAcumularCantidadCuandoLaDonacionYaExiste() {
        DonacionRequest request = new DonacionRequest("Juan", "ROPA", "Polera", 5.0, "Polera talla M");

        when(repository.findByNombreDonanteAndCategoriaAndProductoAndDetalle(
                "Juan", "ROPA", "Polera", "Polera talla M"))
            .thenReturn(Optional.of(donacionMock));

        when(repository.save(any(Donacion.class))).thenReturn(donacionMock);

        DonacionResponse resultado = service.crearDonacion(request);

        assertNotNull(resultado);
        // donacionMock.cantidad was 10, +5 = 15
        assertEquals(15.0, donacionMock.getCantidad());

        verify(repository).save(donacionMock);
        verify(rabbitTemplate).convertAndSend(anyString(), anyString(), any(Object.class));
    }

    @Test
    void listar_RetornaPagina() {
        Page<Donacion> page = new PageImpl<>(List.of(donacionMock));
        when(repository.findAll(any(PageRequest.class))).thenReturn(page);

        Page<DonacionResponse> resultado = service.listar(PageRequest.of(0, 10));

        assertNotNull(resultado);
        assertEquals(1, resultado.getTotalElements());
        assertEquals("Juan", resultado.getContent().get(0).nombreDonante());
    }

    @Test
    void obtenerPorId_Existe_RetornaResponse() {
        when(repository.findById(1L)).thenReturn(Optional.of(donacionMock));

        DonacionResponse resultado = service.obtenerPorId(1L);

        assertNotNull(resultado);
        assertEquals("Polera", resultado.producto());
    }

    @Test
    void obtenerPorId_NoExiste_LanzaException() {
        when(repository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> service.obtenerPorId(99L));
    }

    @Test
    void debeEliminarDonacionYEnviarEventoDeReversa() {
        when(repository.findById(1L)).thenReturn(Optional.of(donacionMock));

        service.eliminar(1L);

        verify(repository).deleteById(1L);
        verify(rabbitTemplate).convertAndSend(anyString(), anyString(), any(Object.class));
    }

    @Test
    void debeActualizarDonacionAumentandoCantidad() {
        DonacionRequest request = new DonacionRequest("Juan", "ROPA", "Polera", 15.0, "Polera talla M");

        when(repository.findById(1L)).thenReturn(Optional.of(donacionMock));
        when(repository.save(any(Donacion.class))).thenAnswer(inv -> inv.getArgument(0));

        DonacionResponse resultado = service.actualizar(1L, request);

        assertNotNull(resultado);
        assertEquals(15.0, resultado.cantidad());

        verify(repository).save(any(Donacion.class));
        // diferencia = 15 - 10 = 5 > 0, so event sent
        verify(rabbitTemplate).convertAndSend(anyString(), anyString(), any(Object.class));
    }

    @Test
    void debeActualizarDonacionDisminuyendoCantidad() {
        DonacionRequest request = new DonacionRequest("Juan", "ROPA", "Polera", 5.0, "Polera talla M");

        when(repository.findById(1L)).thenReturn(Optional.of(donacionMock));
        when(repository.save(any(Donacion.class))).thenAnswer(inv -> inv.getArgument(0));

        DonacionResponse resultado = service.actualizar(1L, request);

        assertNotNull(resultado);
        assertEquals(5.0, resultado.cantidad());

        verify(repository).save(any(Donacion.class));
        // diferencia = 5 - 10 = -5 < 0, so revert event sent
        verify(rabbitTemplate).convertAndSend(anyString(), anyString(), any(Object.class));
    }

    @Test
    void noDebeEnviarEventoSiCantidadNoCambia() {
        DonacionRequest request = new DonacionRequest("Juan", "ROPA", "Polera", 10.0, "Polera talla M");

        when(repository.findById(1L)).thenReturn(Optional.of(donacionMock));
        when(repository.save(any(Donacion.class))).thenAnswer(inv -> inv.getArgument(0));

        DonacionResponse resultado = service.actualizar(1L, request);

        assertNotNull(resultado);
        assertEquals(10.0, resultado.cantidad());

        verify(repository).save(any(Donacion.class));
        // diferencia = 0, no event should be sent for update
        // but crearDonacion was never called, so no event at all here
        verify(rabbitTemplate, never()).convertAndSend(anyString(), anyString(), any(Object.class));
    }
}