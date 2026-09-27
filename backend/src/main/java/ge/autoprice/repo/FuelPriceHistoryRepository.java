package ge.autoprice.repo;

import ge.autoprice.domain.FuelPriceHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;

public interface FuelPriceHistoryRepository extends JpaRepository<FuelPriceHistory, Long> {
    @Query("""
        SELECT h FROM FuelPriceHistory h
        WHERE h.fuelType = :fuelType
        AND h.stationId IS NULL
        AND h.observedAt >= :from
        ORDER BY h.observedAt ASC
        """)
    List<FuelPriceHistory> historySince(@Param("fuelType") String fuelType, @Param("from") Instant from);

    @Query("""
        SELECT h FROM FuelPriceHistory h
        WHERE h.fuelType = :fuelType
        AND h.stationId IS NULL
        ORDER BY h.observedAt ASC
        """)
    List<FuelPriceHistory> historyAll(@Param("fuelType") String fuelType);
}
