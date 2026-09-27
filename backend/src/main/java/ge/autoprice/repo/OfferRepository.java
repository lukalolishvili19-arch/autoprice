package ge.autoprice.repo;

import ge.autoprice.domain.Offer;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OfferRepository extends JpaRepository<Offer, Long> {
    @EntityGraph(attributePaths = {"store"})
    List<Offer> findByProductId(Long productId);
}
