package com.donaton.logistica.util;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.assertEquals;

class DistanceCalculatorTest {

    @Test
    void testCalcularDistancia() {
        // Coordenadas aproximadas de Santiago
        double latSantiago = -33.4489;
        double lonSantiago = -70.6693;

        // Coordenadas aproximadas de Valparaíso
        double latValparaiso = -33.0472;
        double lonValparaiso = -71.6127;

        double distancia = DistanceCalculator.calcularDistancia(latSantiago, lonSantiago, latValparaiso, lonValparaiso);
        
        // La distancia aproximada en línea recta es de unos 98-105 km
        assertEquals(99.0, distancia, 10.0, "La distancia debe estar alrededor de 99 km (+/- 10km)");
    }
}
