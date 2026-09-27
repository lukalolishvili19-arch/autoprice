package ge.autoprice.repo;

import ge.autoprice.domain.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ProductRepository extends JpaRepository<Product, Long> {
    @EntityGraph(attributePaths = {"brand", "category", "images"})
    Optional<Product> findWithDetailsById(Long id);

    @EntityGraph(attributePaths = {"brand", "category", "images"})
    Optional<Product> findBySlug(String slug);

    @Query("""
        SELECT DISTINCT p FROM Product p
        LEFT JOIN p.brand b
        LEFT JOIN p.category c
        LEFT JOIN p.offers o
        WHERE (:q IS NULL OR :q = '' OR lower(p.name) LIKE lower(concat('%', :q, '%'))
            OR lower(p.nameNormalized) LIKE lower(concat('%', :q, '%'))
            OR lower(coalesce(p.sku,'')) LIKE lower(concat('%', :q, '%'))
            OR lower(coalesce(p.ean,'')) LIKE lower(concat('%', :q, '%'))
            OR lower(coalesce(b.name,'')) LIKE lower(concat('%', :q, '%'))
            OR lower(coalesce(p.viscosity,'')) LIKE lower(concat('%', :q, '%'))
            OR lower(coalesce(p.volume,'')) LIKE lower(concat('%', :q, '%')))
        AND (:categoryId IS NULL OR c.id = :categoryId)
        AND (:brandId IS NULL OR b.id = :brandId)
        AND (:storeId IS NULL OR o.store.id = :storeId)
        AND (:viscosity IS NULL OR :viscosity = '' OR p.viscosity = :viscosity)
        AND (:volume IS NULL OR :volume = '' OR p.volume = :volume)
        AND (:availableOnly = false OR EXISTS (
            SELECT 1 FROM Offer ox WHERE ox.product = p AND ox.available = true AND ox.price IS NOT NULL
        ))
        """)
    Page<Product> search(
            @Param("q") String q,
            @Param("categoryId") Long categoryId,
            @Param("brandId") Long brandId,
            @Param("storeId") Long storeId,
            @Param("viscosity") String viscosity,
            @Param("volume") String volume,
            @Param("availableOnly") boolean availableOnly,
            Pageable pageable);

    @Query("""
        SELECT p FROM Product p
        WHERE p.category.id = :categoryId AND p.id <> :id
        ORDER BY p.popularity DESC
        """)
    List<Product> findSimilar(@Param("categoryId") Long categoryId, @Param("id") Long id, Pageable pageable);
}
