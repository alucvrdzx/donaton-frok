package com.donaton.donaciones.service;

import java.util.List;

import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.donaton.donaciones.config.RabbitMQConfig;
import com.donaton.donaciones.dto.DonacionEvent;
import com.donaton.donaciones.factory.DonacionFactory;
import com.donaton.donaciones.model.DonacionDetalle;
import com.donaton.donaciones.repository.DonacionRepository;

@Service
public class DonacionService {

    @Autowired
    private DonacionRepository repository;

    @Autowired
    private DonacionFactory factory;

    @Autowired
    private RabbitTemplate rabbitTemplate;

    public DonacionDetalle crearDonacion(String nombreDonante, String tipoDonacion, Double cantidad, String detalle) {
        // Buscar si ya existe una donación del mismo donante, tipo y detalle
        java.util.Optional<DonacionDetalle> existente = repository
                .findByNombreDonanteAndTipoDonacionAndDetalle(nombreDonante, tipoDonacion, detalle);

        DonacionDetalle guardada;
        double cantidadParaInventario;

        if (existente.isPresent()) {
            // Si ya existe, sumar la cantidad
            DonacionDetalle donacionExistente = existente.get();
            cantidadParaInventario = cantidad; // Solo la cantidad nueva va al inventario
            donacionExistente.setCantidad(donacionExistente.getCantidad() + cantidad);
            guardada = repository.save(donacionExistente);
        } else {
            // Si no existe, crear nueva
            DonacionDetalle donacion = factory.crearDonacion(nombreDonante, tipoDonacion, cantidad, detalle);
            guardada = repository.save(donacion);
            cantidadParaInventario = cantidad;
        }

        // Publicar evento a RabbitMQ para que inventario se actualice (solo la cantidad nueva)
        DonacionEvent evento = new DonacionEvent(
                guardada.getTipoDonacion(),
                cantidadParaInventario,
                guardada.getDetalle(),
                guardada.getUnidadMedida());
        rabbitTemplate.convertAndSend(RabbitMQConfig.EXCHANGE, RabbitMQConfig.ROUTING_KEY, evento);

        return guardada;
    }

    public List<DonacionDetalle> listar() {
        return repository.findAll();
    }

    public List<DonacionDetalle> buscarPorDetalle(String detalle) {
        return repository.findByDetalleContaining(detalle);
    }

    public List<DonacionDetalle> buscarPorTipoDonacion(String tipoDonacion) {
        return repository.findByTipoDonacion(tipoDonacion);
    }

    public DonacionDetalle obtenerPorId(Long id) {
        return repository.findById(id).orElse(null);
    }

    public void eliminar(Long id) {
        // Revertir el efecto en inventario antes de borrar
        DonacionDetalle anterior = repository.findById(id).orElse(null);
        repository.deleteById(id);

        if (anterior != null) {
            DonacionEvent revertir = new DonacionEvent(
                    anterior.getTipoDonacion(),
                    anterior.getCantidad(),
                    anterior.getDetalle(),
                    anterior.getUnidadMedida());
            rabbitTemplate.convertAndSend(RabbitMQConfig.EXCHANGE, RabbitMQConfig.ROUTING_KEY_REVERTIDA, revertir);
        }
    }

    public DonacionDetalle actualizar(Long id, DonacionDetalle d) {
        // 1. Obtener la donación anterior
        DonacionDetalle anterior = repository.findById(id).orElse(null);
        if (anterior == null) return null;

        // 2. Guardar la cantidad vieja ANTES de modificar
        double cantidadAnterior = anterior.getCantidad();

        // 3. Actualizar los campos directamente en la entidad existente
        anterior.setNombreDonante(d.getNombreDonante());
        anterior.setTipoDonacion(d.getTipoDonacion());
        anterior.setCantidad(d.getCantidad());
        anterior.setDetalle(d.getDetalle());
        DonacionDetalle guardada = repository.save(anterior);

        // 4. Calcular la diferencia neta y enviar UN SOLO mensaje
        double diferencia = guardada.getCantidad() - cantidadAnterior;

        if (diferencia > 0) {
            // La cantidad aumentó → sumar la diferencia al inventario
            DonacionEvent evento = new DonacionEvent(
                    guardada.getTipoDonacion(),
                    diferencia,
                    guardada.getDetalle(),
                    guardada.getUnidadMedida());
            rabbitTemplate.convertAndSend(RabbitMQConfig.EXCHANGE, RabbitMQConfig.ROUTING_KEY, evento);
        } else if (diferencia < 0) {
            // La cantidad disminuyó → descontar la diferencia del inventario
            DonacionEvent evento = new DonacionEvent(
                    guardada.getTipoDonacion(),
                    Math.abs(diferencia),
                    guardada.getDetalle(),
                    guardada.getUnidadMedida());
            rabbitTemplate.convertAndSend(RabbitMQConfig.EXCHANGE, RabbitMQConfig.ROUTING_KEY_REVERTIDA, evento);
        }
        // Si diferencia == 0, no hacer nada en inventario

        return guardada;
    }
}