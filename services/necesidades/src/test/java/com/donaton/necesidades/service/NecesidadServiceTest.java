package com.donaton.necesidades.service;

import com.donaton.necesidades.dto.NecesidadRequest;
import com.donaton.necesidades.dto.NecesidadResponse;
import com.donaton.necesidades.exception.ResourceNotFoundException;
import com.donaton.necesidades.model.EstadoNecesidad;
import com.donaton.necesidades.model.Necesidad;
import com.donaton.necesidades.repository.NecesidadRepository;
import com.donaton.necesidades.repository.OutboxEventRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class NecesidadServiceTest {

    @Mock
    private NecesidadRepository necesidadRepository;

    @Mock
    private OutboxEventRepository outboxEventRepository;

    @Mock
    private ObjectMapper objectMapper;

    @InjectMocks
    private NecesidadService necesidadService;

    private Necesidad necesidadMock;

    @BeforeEach
    void setUp() {
        necesidadMock = new Necesidad();
        necesidadMock.setId(1L);
        necesidadMock.setTitulo("Titulo");
        necesidadMock.setDescripcion("Desc");
        necesidadMock.setCantidadRequerida(100.0);
        necesidadMock.setCantidadCubierta(0.0);
        necesidadMock.setEstado(EstadoNecesidad.PENDIENTE);
        necesidadMock.setCategoria("Cat");
        necesidadMock.setProducto("Prod");
        necesidadMock.setUbicacion("Ubi");
        necesidadMock.setLat(0.0);
        necesidadMock.setLng(0.0);
        necesidadMock.setCreadoEn(LocalDateTime.now());
    }

    @Test
    void listarTodas_RetornaPagina() {
        Page<Necesidad> page = new PageImpl<>(List.of(necesidadMock));
        when(necesidadRepository.findAll(any(PageRequest.class))).thenReturn(page);

        Page<NecesidadResponse> resultado = necesidadService.listarTodas(PageRequest.of(0, 10));

        assertNotNull(resultado);
        assertEquals(1, resultado.getContent().size());
        assertEquals("Titulo", resultado.getContent().get(0).titulo());
    }

    @Test
    void obtenerPorId_Existe_RetornaResponse() {
        when(necesidadRepository.findById(1L)).thenReturn(Optional.of(necesidadMock));

        NecesidadResponse res = necesidadService.obtenerPorIdResponse(1L);

        assertNotNull(res);
        assertEquals("Desc", res.descripcion());
    }

    @Test
    void obtenerPorId_NoExiste_LanzaException() {
        when(necesidadRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> necesidadService.obtenerPorIdResponse(99L));
    }

    @Test
    void crearNecesidad_Exito() throws Exception {
        NecesidadRequest req = new NecesidadRequest("Titulo", "Desc", 100.0, "Cat", "Prod", "Ubi", 0.0, 0.0);
        when(necesidadRepository.save(any(Necesidad.class))).thenReturn(necesidadMock);
        when(objectMapper.writeValueAsString(any())).thenReturn("{}");

        NecesidadResponse res = necesidadService.crearNecesidad(req);

        assertNotNull(res);
        assertEquals(EstadoNecesidad.PENDIENTE, res.estado());
        verify(necesidadRepository, times(1)).save(any(Necesidad.class));
    }

    @Test
    void actualizarEstado_Exito() {
        when(necesidadRepository.findById(1L)).thenReturn(Optional.of(necesidadMock));
        when(necesidadRepository.save(any(Necesidad.class))).thenReturn(necesidadMock);

        NecesidadResponse res = necesidadService.actualizarEstado(1L, EstadoNecesidad.EN_PROCESO);

        assertNotNull(res);
        assertEquals(EstadoNecesidad.EN_PROCESO, necesidadMock.getEstado());
    }
}
