package com.donaton.logistica.service;

import com.donaton.logistica.dto.LogisticaRequest;
import com.donaton.logistica.dto.LogisticaResponse;
import com.donaton.logistica.exception.ResourceNotFoundException;
import com.donaton.logistica.model.EstadoLogistica;
import com.donaton.logistica.model.Logistica;
import com.donaton.logistica.repository.LogisticaRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class LogisticaServiceTest {

    @Mock
    private LogisticaRepository logisticaRepository;

    @Mock
    private RabbitTemplate rabbitTemplate;

    @InjectMocks
    private LogisticaService logisticaService;

    private Logistica logisticaMock;

    @BeforeEach
    void setUp() {
        // Logistica(id, destino, lat, lng, necesidadId, estado, categoria, producto, cantidad, detalle)
        logisticaMock = new Logistica(1L, "Santiago Centro", -33.45, -70.66, 10L, EstadoLogistica.PENDIENTE, "Alimentos", "Arroz", 50.0, "Arroz integral");
    }

    @Test
    void listar_RetornaPagina() {
        Page<Logistica> page = new PageImpl<>(List.of(logisticaMock));
        when(logisticaRepository.findAll(any(PageRequest.class))).thenReturn(page);

        Page<LogisticaResponse> resultado = logisticaService.listar(PageRequest.of(0, 10));

        assertNotNull(resultado);
        assertEquals(1, resultado.getContent().size());
        assertEquals("Santiago Centro", resultado.getContent().get(0).destino());
    }

    @Test
    void obtenerPorId_Existe_RetornaResponse() {
        when(logisticaRepository.findById(1L)).thenReturn(Optional.of(logisticaMock));

        LogisticaResponse res = logisticaService.obtenerPorIdResponse(1L);

        assertNotNull(res);
        assertEquals("Arroz", res.producto());
        assertEquals(50.0, res.cantidad());
    }

    @Test
    void obtenerPorId_NoExiste_LanzaException() {
        when(logisticaRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> logisticaService.obtenerPorIdResponse(99L));
    }

    @Test
    void crear_Exito() {
        LogisticaRequest req = new LogisticaRequest(
                "Santiago Centro", -33.45, -70.66, 10L,
                null, "Alimentos", "Arroz", 50.0, "Arroz integral");

        when(logisticaRepository.save(any(Logistica.class))).thenReturn(logisticaMock);

        LogisticaResponse res = logisticaService.crear(req);

        assertNotNull(res);
        assertEquals(EstadoLogistica.PENDIENTE, res.estado());
        verify(logisticaRepository, times(1)).save(any(Logistica.class));
    }

    @Test
    void actualizarEstado_Exito() {
        when(logisticaRepository.findById(1L)).thenReturn(Optional.of(logisticaMock));
        when(logisticaRepository.save(any(Logistica.class))).thenReturn(logisticaMock);

        LogisticaResponse res = logisticaService.actualizarEstado(1L, "EN_TRANSITO");

        assertNotNull(res);
        assertEquals(EstadoLogistica.EN_TRANSITO, logisticaMock.getEstado());
        verify(logisticaRepository, times(1)).save(logisticaMock);
    }

    @Test
    void eliminar_Existe_Elimina() {
        when(logisticaRepository.findById(1L)).thenReturn(Optional.of(logisticaMock));

        logisticaService.eliminar(1L);

        verify(logisticaRepository, times(1)).deleteById(1L);
    }

    @Test
    void eliminar_NoExiste_LanzaException() {
        when(logisticaRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> logisticaService.eliminar(99L));
    }

    @Test
    void debeActualizarEstadoAEntregadoYEnviarEvento() {
        Logistica envio = new Logistica(
                1L,
                "Hogar de Cristo",
                null,
                null,
                1L,
                EstadoLogistica.PENDIENTE,
                "ROPA",
                "Polera",
                10.0,
                null);

        when(logisticaRepository.findById(1L)).thenReturn(Optional.of(envio));
        when(logisticaRepository.save(any(Logistica.class))).thenReturn(envio);

        LogisticaResponse resultado = logisticaService.actualizarEstado(1L, "ENTREGADO");

        assertNotNull(resultado);
        assertEquals(EstadoLogistica.ENTREGADO, resultado.estado());
        verify(logisticaRepository).save(envio);
        verify(rabbitTemplate, atLeastOnce()).convertAndSend(anyString(), anyString(), any(Object.class));
    }

    @Test
    void debeNoEnviarEventoSiYaEstabaEntregado() {
        Logistica envio = new Logistica(
                1L,
                "Hogar de Cristo",
                null,
                null,
                1L,
                EstadoLogistica.ENTREGADO,
                "ROPA",
                "Polera",
                10.0,
                null);

        when(logisticaRepository.findById(1L)).thenReturn(Optional.of(envio));

        LogisticaResponse resultado = logisticaService.actualizarEstado(1L, "ENTREGADO");

        assertNotNull(resultado);
        assertEquals(EstadoLogistica.ENTREGADO, resultado.estado());
        verify(logisticaRepository, never()).save(any());
        verify(rabbitTemplate, never()).convertAndSend(anyString(), anyString(), any(Object.class));
    }

    @Test
    void debeEliminarEnvioEntregadoYDevolverStock() {
        Logistica envio = new Logistica(
                1L,
                "Hogar de Cristo",
                null,
                null,
                1L,
                EstadoLogistica.ENTREGADO,
                "ROPA",
                "Polera",
                10.0,
                null);

        when(logisticaRepository.findById(1L)).thenReturn(Optional.of(envio));

        logisticaService.eliminar(1L);

        verify(logisticaRepository).deleteById(1L);
        verify(rabbitTemplate).convertAndSend(anyString(), anyString(), any(Object.class));
    }

    @Test
    void debeDescontarMasStockCuandoAumentaCantidadDeEnvioEntregado() {
        Logistica anterior = new Logistica(
                1L,
                "Hogar de Cristo",
                null,
                null,
                1L,
                EstadoLogistica.ENTREGADO,
                "ROPA",
                "Polera",
                10.0,
                null);

        LogisticaRequest nuevosDatos = new LogisticaRequest(
                "Hogar de Cristo",
                null,
                null,
                1L,
                EstadoLogistica.ENTREGADO,
                "ROPA",
                "Polera",
                15.0,
                null);

        when(logisticaRepository.findById(1L)).thenReturn(Optional.of(anterior));
        when(logisticaRepository.save(any(Logistica.class))).thenReturn(anterior);

        logisticaService.actualizar(1L, nuevosDatos);

        verify(rabbitTemplate).convertAndSend(anyString(), anyString(), any(Object.class));
    }

    @Test
    void debeDevolverStockCuandoDisminuyeCantidadDeEnvioEntregado() {
        Logistica anterior = new Logistica(
                1L,
                "Hogar de Cristo",
                null,
                null,
                1L,
                EstadoLogistica.ENTREGADO,
                "ROPA",
                "Polera",
                15.0,
                null);

        LogisticaRequest nuevosDatos = new LogisticaRequest(
                "Hogar de Cristo",
                null,
                null,
                1L,
                EstadoLogistica.ENTREGADO,
                "ROPA",
                "Polera",
                10.0,
                null);

        when(logisticaRepository.findById(1L)).thenReturn(Optional.of(anterior));
        when(logisticaRepository.save(any(Logistica.class))).thenReturn(anterior);

        logisticaService.actualizar(1L, nuevosDatos);

        verify(rabbitTemplate).convertAndSend(anyString(), anyString(), any(Object.class));
    }
}
