package com.donaton.necesidades.controller;

import com.donaton.necesidades.dto.NecesidadRequest;
import com.donaton.necesidades.dto.NecesidadResponse;
import com.donaton.necesidades.model.EstadoNecesidad;
import com.donaton.necesidades.service.NecesidadService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/necesidades")
@CrossOrigin(origins = "*")
@Tag(name = "Necesidades", description = "API para la gestión de necesidades humanitarias")
@RequiredArgsConstructor
public class NecesidadController {

    private final NecesidadService necesidadService;

    @Operation(summary = "Crear una nueva necesidad y notificar asincrónicamente")
    @PostMapping
    public ResponseEntity<NecesidadResponse> crear(@Valid @RequestBody NecesidadRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(necesidadService.crearNecesidad(request));
    }

    @Operation(summary = "Obtener el listado paginado de todas las necesidades")
    @GetMapping
    public Page<NecesidadResponse> listar(Pageable pageable) {
        return necesidadService.listarTodas(pageable);
    }

    @Operation(summary = "Obtener los detalles de una necesidad específica")
    @GetMapping("/{id}")
    public NecesidadResponse obtenerPorId(@PathVariable Long id) {
        return necesidadService.obtenerPorIdResponse(id);
    }

    @Operation(summary = "Actualizar el estado de una necesidad")
    @PatchMapping("/{id}/estado")
    public NecesidadResponse actualizarEstado(@PathVariable Long id, @RequestParam EstadoNecesidad estado) {
        return necesidadService.actualizarEstado(id, estado);
    }

    @Operation(summary = "Eliminar una necesidad")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        necesidadService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
