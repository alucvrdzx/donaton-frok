package com.donaton.logistica.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import com.donaton.logistica.model.Logistica;

public interface LogisticaRepository extends JpaRepository<Logistica, Long> {
    
    // Si queremos listar todo paginado, JpaRepository ya provee findAll(Pageable)
}