package ge.autoprice.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Instant;

@Getter
@Setter
@Entity
@Table(name = "price_alerts")
public class PriceAlert {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(name = "client_key")
    private String clientKey;
    @Column(name = "alert_type")
    private String alertType;
    @Column(name = "product_id")
    private Long productId;
    @Column(name = "fuel_type")
    private String fuelType;
    @Column(name = "company_id")
    private Long companyId;
    private String city;
    @Column(name = "target_price")
    private BigDecimal targetPrice;
    private boolean active = true;
    @Column(name = "created_at")
    private Instant createdAt;
}
