package ge.autoprice.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Instant;

@Getter
@Setter
@Entity
@Table(name = "fuel_price_history")
public class FuelPriceHistory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(name = "company_id")
    private Long companyId;
    @Column(name = "station_id")
    private Long stationId;
    @Column(name = "fuel_type")
    private String fuelType;
    private BigDecimal price;
    @Column(name = "observed_at")
    private Instant observedAt;
    @Column(name = "source_url")
    private String sourceUrl;
}
