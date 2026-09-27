package ge.autoprice.repo;

import ge.autoprice.domain.FuelPrice;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FuelPriceRepository extends JpaRepository<FuelPrice, Long> {
    @EntityGraph(attributePaths = {"company", "station"})
    List<FuelPrice> findByFuelTypeAndStationIsNull(String fuelType);

    @EntityGraph(attributePaths = {"company"})
    List<FuelPrice> findByStationIsNull();

    List<FuelPrice> findByStationId(Long stationId);
}
