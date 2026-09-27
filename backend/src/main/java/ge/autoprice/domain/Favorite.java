package ge.autoprice.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@Getter
@Setter
@Entity
@Table(name = "favorites")
public class Favorite {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(name = "client_key")
    private String clientKey;
    @Column(name = "item_type")
    private String itemType;
    @Column(name = "item_id")
    private Long itemId;
    @Column(name = "created_at")
    private Instant createdAt;
}
