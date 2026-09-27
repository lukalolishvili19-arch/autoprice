package ge.autoprice.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Instant;

@Getter
@Setter
@Entity
@Table(name = "offers")
public class Offer {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id")
    private Product product;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "store_id")
    private Store store;
    private BigDecimal price;
    @Column(name = "old_price")
    private BigDecimal oldPrice;
    private String currency;
    private boolean available;
    @Column(name = "product_url")
    private String productUrl;
    @Column(name = "external_id")
    private String externalId;
    @Column(name = "last_checked")
    private Instant lastChecked;
}
