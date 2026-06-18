package com.donaton.donaciones.service;

import java.util.List;

import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.donaton.donaciones.config.RabbitMQConfig;
import com.donaton.donaciones.dto.DonacionEvent;
import com.donaton.donaciones.dto.DonacionRequest;
import com.donaton.donaciones.dto.DonacionResponse;
import com.donaton.donaciones.exception.ResourceNotFoundException;
import com.donaton.donaciones.factory.DonacionFactory;
import com.donaton.donaciones.model.Donacion;
import com.donaton.donaciones.repository.DonacionRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class DonacionService {

    private final DonacionRepository repository;
    private final DonacionFactory factory;
    private final RabbitTemplate rabbitTemplate;

    @Transactional
    public DonacionResponse crearDonacion(DonacionRequest request) {
        // Buscar si ya existe una donación del mismo donante, tipo y detalle
        java.util.Optional<Donacion> existente = repository
                .findByNombreDonanteAndCategoriaAndProductoAndDetalle(
                        request.nombreDonante(), request.categoria(), request.producto(), request.detalle());

        Donacion guardada;
        double cantidadParaInventario;

        if (existente.isPresent()) {
            // Si ya existe, sumar la cantidad
            Donacion donacionExistente = existente.get();
            cantidadParaInventario = request.cantidad(); // Solo la cantidad nueva va al inventario
            donacionExistente.setCantidad(donacionExistente.getCantidad() + request.cantidad());
            guardada = repository.save(donacionExistente);
        } else {
            // Si no existe, crear nueva
            Donacion donacion = factory.crearDonacion(request.nombreDonante(), request.categoria(), request.producto(), request.cantidad(), request.detalle());
            guardada = repository.save(donacion);
            cantidadParaInventario = request.cantidad();
        }

        // Publicar evento a RabbitMQ para que inventario se actualice (solo la cantidad nueva)
        DonacionEvent evento = new DonacionEvent(
                guardada.getCategoria(),
                guardada.getProducto(),
                cantidadParaInventario,
                guardada.getDetalle(),
                guardada.getUnidadMedida());
        rabbitTemplate.convertAndSend(RabbitMQConfig.EXCHANGE, RabbitMQConfig.ROUTING_KEY, evento);

        return toResponse(guardada);
    }

    @Transactional(readOnly = true)
    public Page<DonacionResponse> listar(Pageable pageable) {
        return repository.findAll(pageable).map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public Page<DonacionResponse> buscarPorDetalle(String detalle, Pageable pageable) {
        return repository.findByDetalleContaining(detalle, pageable).map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public Page<DonacionResponse> buscarPorTipoDonacion(String categoria, Pageable pageable) {
        return repository.findByCategoria(categoria, pageable).map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public DonacionResponse obtenerPorId(Long id) {
        return toResponse(repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Donación no encontrada con ID: " + id)));
    }

    @Transactional
    public void eliminar(Long id) {
        // Revertir el efecto en inventario antes de borrar
        Donacion anterior = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Donación no encontrada con ID: " + id));
        repository.deleteById(id);

        DonacionEvent revertir = new DonacionEvent(
                anterior.getCategoria(),
                anterior.getProducto(),
                anterior.getCantidad(),
                anterior.getDetalle(),
                anterior.getUnidadMedida());
        rabbitTemplate.convertAndSend(RabbitMQConfig.EXCHANGE, RabbitMQConfig.ROUTING_KEY_REVERTIDA, revertir);
    }

    @Transactional
    public DonacionResponse actualizar(Long id, DonacionRequest request) {
        // 1. Obtener la donación anterior
        Donacion anterior = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Donación no encontrada con ID: " + id));

        // 2. Guardar la cantidad vieja ANTES de modificar
        double cantidadAnterior = anterior.getCantidad();

        // 3. Actualizar los campos directamente en la entidad existente
        anterior.setNombreDonante(request.nombreDonante());
        anterior.setCategoria(request.categoria());
        anterior.setProducto(request.producto());
        anterior.setCantidad(request.cantidad());
        anterior.setDetalle(request.detalle());
        Donacion guardada = repository.save(anterior);

        // 4. Calcular la diferencia neta y enviar UN SOLO mensaje
        double diferencia = guardada.getCantidad() - cantidadAnterior;

        if (diferencia > 0) {
            DonacionEvent evento = new DonacionEvent(
                    guardada.getCategoria(),
                    guardada.getProducto(),
                    diferencia,
                    guardada.getDetalle(),
                    guardada.getUnidadMedida());
            rabbitTemplate.convertAndSend(RabbitMQConfig.EXCHANGE, RabbitMQConfig.ROUTING_KEY, evento);
        } else if (diferencia < 0) {
            DonacionEvent evento = new DonacionEvent(
                    guardada.getCategoria(),
                    guardada.getProducto(),
                    Math.abs(diferencia),
                    guardada.getDetalle(),
                    guardada.getUnidadMedida());
            rabbitTemplate.convertAndSend(RabbitMQConfig.EXCHANGE, RabbitMQConfig.ROUTING_KEY_REVERTIDA, evento);
        }

        return toResponse(guardada);
    }

    private DonacionResponse toResponse(Donacion donacion) {
        return new DonacionResponse(
                donacion.getId(),
                donacion.getNombreDonante(),
                donacion.getCategoria(),
                donacion.getProducto(),
                donacion.getCantidad(),
                donacion.getUnidadMedida(),
                donacion.getDetalle(),
                donacion.getFechaDonacion()
        );
    }
}