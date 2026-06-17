package com.donaton.donaciones.service;

import java.util.List;

import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.donaton.donaciones.config.RabbitMQConfig;
import com.donaton.donaciones.dto.DonacionEvent;
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
    public Donacion crearDonacion(String nombreDonante, String categoria, String producto, Double cantidad, String detalle) {
        // Buscar si ya existe una donación del mismo donante, tipo y detalle
        java.util.Optional<Donacion> existente = repository
                .findByNombreDonanteAndCategoriaAndProductoAndDetalle(nombreDonante, categoria, producto, detalle);

        Donacion guardada;
        double cantidadParaInventario;

        if (existente.isPresent()) {
            // Si ya existe, sumar la cantidad
            Donacion donacionExistente = existente.get();
            cantidadParaInventario = cantidad; // Solo la cantidad nueva va al inventario
            donacionExistente.setCantidad(donacionExistente.getCantidad() + cantidad);
            guardada = repository.save(donacionExistente);
        } else {
            // Si no existe, crear nueva
            Donacion donacion = factory.crearDonacion(nombreDonante, categoria, producto, cantidad, detalle);
            guardada = repository.save(donacion);
            cantidadParaInventario = cantidad;
        }

        // Publicar evento a RabbitMQ para que inventario se actualice (solo la cantidad nueva)
        DonacionEvent evento = new DonacionEvent(
                guardada.getCategoria(),
                guardada.getProducto(),
                cantidadParaInventario,
                guardada.getDetalle(),
                guardada.getUnidadMedida());
        rabbitTemplate.convertAndSend(RabbitMQConfig.EXCHANGE, RabbitMQConfig.ROUTING_KEY, evento);

        return guardada;
    }

    @Transactional(readOnly = true)
    public List<Donacion> listar() {
        return repository.findAll();
    }

    @Transactional(readOnly = true)
    public List<Donacion> buscarPorDetalle(String detalle) {
        return repository.findByDetalleContaining(detalle);
    }

    @Transactional(readOnly = true)
    public List<Donacion> buscarPorTipoDonacion(String categoria) {
        return repository.findByCategoria(categoria);
    }

    @Transactional(readOnly = true)
    public Donacion obtenerPorId(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Donación no encontrada con ID: " + id));
    }

    @Transactional
    public void eliminar(Long id) {
        // Revertir el efecto en inventario antes de borrar
        Donacion anterior = obtenerPorId(id);
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
    public Donacion actualizar(Long id, Donacion d) {
        // 1. Obtener la donación anterior
        Donacion anterior = obtenerPorId(id);

        // 2. Guardar la cantidad vieja ANTES de modificar
        double cantidadAnterior = anterior.getCantidad();

        // 3. Actualizar los campos directamente en la entidad existente
        anterior.setNombreDonante(d.getNombreDonante());
        anterior.setCategoria(d.getCategoria());
        anterior.setProducto(d.getProducto());
        anterior.setCantidad(d.getCantidad());
        anterior.setDetalle(d.getDetalle());
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

        return guardada;
    }
}