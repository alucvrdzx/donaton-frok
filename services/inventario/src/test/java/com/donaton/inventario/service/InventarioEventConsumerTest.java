package com.donaton.inventario.service;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.verify;
import org.mockito.junit.jupiter.MockitoExtension;

import com.donaton.inventario.dto.DonacionEvent;

@ExtendWith(MockitoExtension.class)
class InventarioEventConsumerTest {

    @Mock
    private InventarioService inventarioService;

    @InjectMocks
    private InventarioEventConsumer consumer;

    @Test
    void debeProcesarDonacionYLlamarAgregarStock() {

        DonacionEvent evento = new DonacionEvent(
                "ROPA",
                10.0,
                "Polera",
                "unidades");

        consumer.procesarDonacion(evento);

        verify(inventarioService).agregarStock(
                "ROPA",
                "Polera",
                10.0,
                "unidades");
    }
}