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

}