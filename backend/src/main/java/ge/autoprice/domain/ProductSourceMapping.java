package ge.autoprice.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Instant;

@Getter
@Setter
@Entity
@Table(name = "product_source_mapping")
public class ProductSourceMapping {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(name = "product_id")
    private Long productId;
    @Column(name = "store_id")
    private Long storeId;
    @Column(name = "external_id")
    private String externalId;
    @Column(name = "source_name")
    private String sourceName;
    @Column(name = "source_url")
    private String sourceUrl;
    private String ean;
    private String sku;
    @Column(name = "match_method")
    private String matchMethod;
    private BigDecimal confidence;
    @Column(name = "auto_merged")
    private boolean autoMerged;
    @Column(name = "created_at")
    private Instant createdAt;
}
