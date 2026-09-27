package ge.autoprice.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Instant;

@Getter
@Setter
@Entity
@Table(name = "fuel_prices")
public class FuelPrice {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id")
    private FuelCompany company;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "station_id")
    private FuelStation station;
    @Column(name = "fuel_type")
    private String fuelType;
    private BigDecimal price;
    private String currency;
    @Column(name = "source_url")
    private String sourceUrl;
    @Column(name = "last_checked")
    private Instant lastChecked;
}
