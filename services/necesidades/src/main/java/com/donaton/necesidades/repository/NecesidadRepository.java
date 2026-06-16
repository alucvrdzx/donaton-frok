package com.donaton.necesidades.repository;

import com.donaton.necesidades.model.EstadoNecesidad;
import com.donaton.necesidades.model.Necesidad;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NecesidadRepository extends JpaRepository<Necesidad, Long> {

    List<Necesidad> findByEstado(EstadoNecesidad estado);

    List<Necesidad> findByCategoria(String categoria);
}
