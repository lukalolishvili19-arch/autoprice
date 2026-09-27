package ge.autoprice.repo;

import ge.autoprice.domain.Favorite;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface FavoriteRepository extends JpaRepository<Favorite, Long> {
    List<Favorite> findByClientKeyOrderByCreatedAtDesc(String clientKey);
    Optional<Favorite> findByClientKeyAndItemTypeAndItemId(String clientKey, String itemType, Long itemId);
    void deleteByClientKeyAndItemTypeAndItemId(String clientKey, String itemType, Long itemId);
}
