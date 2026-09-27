package ge.autoprice.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Instant;

@Getter
@Setter
@Entity
@Table(name = "price_history")
public class PriceHistory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(name = "offer_id")
    private Long offerId;
    @Column(name = "product_id")
    private Long productId;
    @Column(name = "store_id")
    private Long storeId;
    private BigDecimal price;
    private boolean available;
    @Column(name = "observed_at")
    private Instant observedAt;
}
