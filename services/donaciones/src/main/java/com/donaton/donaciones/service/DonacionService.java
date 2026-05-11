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
        DonacionDetalle donacion = factory.crearDonacion(nombreDonante, tipoDonacion, cantidad, detalle);
        DonacionDetalle guardada = repository.save(donacion);

        // Publicar evento a RabbitMQ para que inventario se actualice
        DonacionEvent evento = new DonacionEvent(
                guardada.getTipoDonacion(),
                guardada.getCantidad(),
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
        repository.deleteById(id);
    }

    public DonacionDetalle actualizar(Long id, DonacionDetalle d) {
        DonacionDetalle actualizada = factory.crearDonacion(d.getNombreDonante(), d.getTipoDonacion(), d.getCantidad(),
                d.getDetalle());
        actualizada.setId(id);
        return repository.save(actualizada);
    }
}