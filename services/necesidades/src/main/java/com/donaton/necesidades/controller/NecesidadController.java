package com.donaton.necesidades.controller;

import com.donaton.necesidades.dto.NecesidadRequest;
import com.donaton.necesidades.model.EstadoNecesidad;
import com.donaton.necesidades.model.Necesidad;
import com.donaton.necesidades.service.NecesidadService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/necesidades")
@CrossOrigin(origins = "*")
@Tag(name = "Necesidades", description = "API para la gestión de necesidades humanitarias")
public class NecesidadController {

    @Autowired
    private NecesidadService necesidadService;

    @Operation(summary = "Crear una nueva necesidad y notificar asincrónicamente")
    @PostMapping
    public ResponseEntity<Necesidad> crear(@Valid @RequestBody NecesidadRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(necesidadService.crearNecesidad(request));
    }

    @Operation(summary = "Obtener el listado de todas las necesidades")
    @GetMapping
    public List<Necesidad> listar() {
        return necesidadService.listarTodas();
    }

    @Operation(summary = "Obtener los detalles de una necesidad específica")
    @GetMapping("/{id}")
    public Necesidad obtenerPorId(@PathVariable Long id) {
        return necesidadService.obtenerPorId(id);
    }

    @Operation(summary = "Actualizar el estado de una necesidad")
    @PatchMapping("/{id}/estado")
    public Necesidad actualizarEstado(@PathVariable Long id, @RequestParam EstadoNecesidad estado) {
        return necesidadService.actualizarEstado(id, estado);
    }

    @Operation(summary = "Eliminar una necesidad")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        necesidadService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
