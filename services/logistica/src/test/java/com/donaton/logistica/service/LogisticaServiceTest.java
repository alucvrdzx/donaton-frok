package com.donaton.logistica.service;

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

import com.donaton.logistica.model.Logistica;
import com.donaton.logistica.repository.LogisticaRepository;

@ExtendWith(MockitoExtension.class)
class LogisticaServiceTest {

    @Mock
    private LogisticaRepository repository;

    @Mock
    private RabbitTemplate rabbitTemplate;

    @InjectMocks
    private LogisticaService service;

    @Test
void debeActualizarEstadoAEntregadoYEnviarEvento() {

    Logistica envio = new Logistica(
            1L,
            "Hogar de Cristo",
            "PENDIENTE",
            "ROPA",
            10.0,
            "Polera");

    when(repository.findById(1L))
            .thenReturn(Optional.of(envio));

    when(repository.save(any(Logistica.class)))
            .thenReturn(envio);

    Logistica resultado = service.actualizarEstado(
            1L,
            "ENTREGADO");

    assertNotNull(resultado);

    assertEquals("ENTREGADO", resultado.getEstado());

    verify(repository).save(envio);

    verify(rabbitTemplate).convertAndSend(
            anyString(),
            anyString(),
            any(Object.class));
}
@Test
void debeNoEnviarEventoSiYaEstabaEntregado() {

    Logistica envio = new Logistica(
            1L,
            "Hogar de Cristo",
            "ENTREGADO",
            "ROPA",
            10.0,
            "Polera");

    when(repository.findById(1L))
            .thenReturn(Optional.of(envio));

    Logistica resultado = service.actualizarEstado(
            1L,
            "ENTREGADO");

    assertNotNull(resultado);

    assertEquals("ENTREGADO", resultado.getEstado());

    verify(repository, never()).save(any());

    verify(rabbitTemplate, never()).convertAndSend(
            anyString(),
            anyString(),
            any(Object.class));
}

@Test
void debeEliminarEnvioEntregadoYDevolverStock() {

    Logistica envio = new Logistica(
            1L,
            "Hogar de Cristo",
            "ENTREGADO",
            "ROPA",
            10.0,
            "Polera");

    when(repository.findById(1L))
            .thenReturn(Optional.of(envio));

    service.eliminar(1L);

    verify(repository).deleteById(1L);

    verify(rabbitTemplate).convertAndSend(
            anyString(),
            anyString(),
            any(Object.class));
}
@Test
void debeDescontarMasStockCuandoAumentaCantidadDeEnvioEntregado() {

    Logistica anterior = new Logistica(
            1L,
            "Hogar de Cristo",
            "ENTREGADO",
            "ROPA",
            10.0,
            "Polera");

    Logistica nuevosDatos = new Logistica(
            null,
            "Hogar de Cristo",
            "ENTREGADO",
            "ROPA",
            15.0,
            "Polera");

    when(repository.findById(1L))
            .thenReturn(Optional.of(anterior));

    when(repository.save(any(Logistica.class)))
            .thenReturn(anterior);

    service.actualizar(1L, nuevosDatos);

    verify(rabbitTemplate).convertAndSend(
            anyString(),
            anyString(),
            any(Object.class));
}
@Test
void debeDevolverStockCuandoDisminuyeCantidadDeEnvioEntregado() {

    Logistica anterior = new Logistica(
            1L,
            "Hogar de Cristo",
            "ENTREGADO",
            "ROPA",
            15.0,
            "Polera");

    Logistica nuevosDatos = new Logistica(
            null,
            "Hogar de Cristo",
            "ENTREGADO",
            "ROPA",
            10.0,
            "Polera");

    when(repository.findById(1L))
            .thenReturn(Optional.of(anterior));

    when(repository.save(any(Logistica.class)))
            .thenReturn(anterior);

    service.actualizar(1L, nuevosDatos);

    verify(rabbitTemplate).convertAndSend(
            anyString(),
            anyString(),
            any(Object.class));
}
}