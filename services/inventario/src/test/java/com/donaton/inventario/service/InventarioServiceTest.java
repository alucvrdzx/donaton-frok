package com.donaton.inventario.service;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import static org.mockito.ArgumentMatchers.any;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;

import com.donaton.inventario.model.Inventario;
import com.donaton.inventario.repository.InventarioRepository;

@ExtendWith(MockitoExtension.class)
class InventarioServiceTest {

    @Mock
    private InventarioRepository repository;

    @InjectMocks
    private InventarioService service;

@Test
void debeSumarStockCuandoProductoYaExiste() {

    Inventario existente = new Inventario(
            1L,
            "ROPA",
            "Polera",
            10.0,
            "Polera",
            "unidades");

    Inventario nuevaEntrada = new Inventario(
            null,
            "ROPA",
            "Polera",
            5.0,
            "Polera",
            "unidades");

    when(repository.findByCategoriaAndProductoAndDetalle(
            "ROPA",
            "Polera",
            "Polera"))
            .thenReturn(Optional.of(existente));

    when(repository.save(any(Inventario.class)))
            .thenReturn(existente);

    Inventario resultado = service.crear(nuevaEntrada);

    assertNotNull(resultado);

    assertEquals(15.0, resultado.getStock());

    verify(repository).save(existente);
}

@Test
void debeImpedirStockNegativo() {

    Inventario inventario = new Inventario(
            1L,
            "ROPA",
            "Polera",
            5.0,
            "Polera",
            "unidades");

    when(repository.findByCategoriaAndProductoAndDetalle(
            "ROPA",
            "Polera",
            "Polera"))
            .thenReturn(Optional.of(inventario));

    service.descontarStock(
            "ROPA",
            "Polera",
            "Polera",
            10.0);

    assertEquals(0.0, inventario.getStock());

    verify(repository).save(inventario);
}

@Test
void debeCrearProductoNuevoCuandoNoExisteEnInventario() {

    when(repository.findByCategoriaAndProductoAndDetalle(
            "ALIMENTO",
            "Arroz",
            "Arroz"))
            .thenReturn(Optional.empty());

    service.agregarStock(
            "ALIMENTO",
            "Arroz",
            "Arroz",
            20.0,
            "kilos");

    verify(repository).save(any(Inventario.class));
}
}