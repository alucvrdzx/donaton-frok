package com.donaton.inventario.service;

import com.donaton.inventario.dto.InventarioRequest;
import com.donaton.inventario.dto.InventarioResponse;
import com.donaton.inventario.exception.ResourceNotFoundException;
import com.donaton.inventario.model.Inventario;
import com.donaton.inventario.repository.InventarioRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class InventarioServiceTest {

    @Mock
    private InventarioRepository inventarioRepository;

    @InjectMocks
    private InventarioService inventarioService;

    private Inventario inventarioMock;

    @BeforeEach
    void setUp() {
        // Inventario(id, categoria, producto, stock, detalle, unidadMedida, version)
        inventarioMock = new Inventario(1L, "Alimentos", "Arroz", 100.0, "Arroz integral", "kilos", 0L);
    }

    @Test
    void listar_DebeRetornarPagina() {
        Page<Inventario> pageMock = new PageImpl<>(List.of(inventarioMock));
        when(inventarioRepository.findAll(any(PageRequest.class))).thenReturn(pageMock);

        Page<InventarioResponse> resultado = inventarioService.listar(PageRequest.of(0, 10));

        assertNotNull(resultado);
        assertEquals(1, resultado.getTotalElements());
        assertEquals("Arroz", resultado.getContent().get(0).producto());
        verify(inventarioRepository, times(1)).findAll(any(PageRequest.class));
    }

    @Test
    void crear_NuevoProducto_CreaRegistro() {
        InventarioRequest req = new InventarioRequest("Alimentos", "Arroz", 50.0, "Arroz integral", "kilos");

        when(inventarioRepository.findByCategoriaAndProductoAndDetalle("Alimentos", "Arroz", "Arroz integral"))
                .thenReturn(Optional.empty());
        when(inventarioRepository.save(any(Inventario.class))).thenReturn(inventarioMock);

        InventarioResponse resultado = inventarioService.crear(req);

        assertNotNull(resultado);
        assertEquals("Arroz", resultado.producto());
        verify(inventarioRepository, times(1)).save(any(Inventario.class));
    }

    @Test
    void crear_ProductoExistente_SumaStock() {
        InventarioRequest req = new InventarioRequest("Alimentos", "Arroz", 50.0, "Arroz integral", "kilos");

        when(inventarioRepository.findByCategoriaAndProductoAndDetalle("Alimentos", "Arroz", "Arroz integral"))
                .thenReturn(Optional.of(inventarioMock));
        when(inventarioRepository.save(any(Inventario.class))).thenReturn(inventarioMock);

        InventarioResponse resultado = inventarioService.crear(req);

        assertNotNull(resultado);
        // Stock was 100 + 50 = 150
        assertEquals(150.0, inventarioMock.getStock());
        verify(inventarioRepository, times(1)).save(inventarioMock);
    }

    @Test
    void actualizar_Existe_ActualizaCampos() {
        InventarioRequest req = new InventarioRequest("Alimentos", "Arroz", 200.0, "Arroz blanco", "kilos");

        when(inventarioRepository.findById(1L)).thenReturn(Optional.of(inventarioMock));
        when(inventarioRepository.save(any(Inventario.class))).thenReturn(inventarioMock);

        InventarioResponse resultado = inventarioService.actualizar(1L, req);

        assertNotNull(resultado);
        assertEquals(200.0, inventarioMock.getStock());
        assertEquals("Arroz blanco", inventarioMock.getDetalle());
        verify(inventarioRepository, times(1)).save(inventarioMock);
    }

    @Test
    void actualizar_NoExiste_LanzaException() {
        InventarioRequest req = new InventarioRequest("Alimentos", "Arroz", 50.0, "Arroz integral", "kilos");

        when(inventarioRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> inventarioService.actualizar(99L, req));
        verify(inventarioRepository, never()).save(any());
    }

    @Test
    void eliminar_Existe_EliminaRegistro() {
        when(inventarioRepository.existsById(1L)).thenReturn(true);

        inventarioService.eliminar(1L);

        verify(inventarioRepository, times(1)).deleteById(1L);
    }

    @Test
    void eliminar_NoExiste_LanzaException() {
        when(inventarioRepository.existsById(99L)).thenReturn(false);

        assertThrows(ResourceNotFoundException.class, () -> inventarioService.eliminar(99L));
        verify(inventarioRepository, never()).deleteById(any());
    }

    @Test
    void debeImpedirStockNegativo() {
        Inventario inventario = new Inventario(
                1L,
                "ROPA",
                "Polera",
                5.0,
                "Polera",
                "unidades", null); // added null for version to match constructor

        when(inventarioRepository.findByCategoriaAndProductoAndDetalle(
                "ROPA",
                "Polera",
                "Polera"))
                .thenReturn(Optional.of(inventario));

        inventarioService.descontarStock(
                "ROPA",
                "Polera",
                "Polera",
                10.0);

        assertEquals(0.0, inventario.getStock());

        verify(inventarioRepository).save(inventario);
    }

    @Test
    void debeCrearProductoNuevoCuandoNoExisteEnInventario() {
        when(inventarioRepository.findByCategoriaAndProductoAndDetalle(
                "ALIMENTO",
                "Arroz",
                "Arroz"))
                .thenReturn(Optional.empty());

        inventarioService.agregarStock(
                "ALIMENTO",
                "Arroz",
                "Arroz",
                20.0,
                "kilos");

        verify(inventarioRepository).save(any(Inventario.class));
    }
}
