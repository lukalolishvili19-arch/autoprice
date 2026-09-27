package ge.autoprice.service;

import ge.autoprice.domain.*;
import ge.autoprice.dto.Dto.*;
import ge.autoprice.repo.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CatalogService {
    private final ProductRepository products;
    private final OfferRepository offers;
    private final StoreRepository stores;
    private final CategoryRepository categories;
    private final BrandRepository brands;
    private final PriceHistoryRepository priceHistory;

    public List<CategoryDto> categories() {
        Map<Long, Long> counts = new HashMap<>();
        products.findAll().forEach(p -> {
            if (p.getCategory() != null) {
                counts.merge(p.getCategory().getId(), 1L, Long::sum);
            }
        });
        return categories.findAllByOrderBySortOrderAsc().stream()
                .map(c -> new CategoryDto(c.getId(), c.getSlug(), c.getNameKa(), c.getNameEn(),
                        c.getIcon(), c.getBgClass(), c.getBorderClass(), counts.getOrDefault(c.getId(), 0L)))
                .toList();
    }

    public List<BrandDto> brands() {
        return brands.findAll().stream()
                .map(b -> new BrandDto(b.getId(), b.getSlug(), b.getName(), b.getLogoUrl()))
                .toList();
    }

    public List<StoreDto> autoStores() {
        return stores.findByTypeOrderByIdAsc("AUTO").stream().map(this::toStore).toList();
    }

    public StoreDto store(Long id) {
        Store s = stores.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        return toStore(s);
    }

    public StoreDto storeBySlug(String slug) {
        Store s = stores.findBySlug(slug).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        return toStore(s);
    }

    public PageDto<ProductCardDto> search(String q, Long categoryId, Long brandId, Long storeId,
                                          String viscosity, String volume, boolean availableOnly,
                                          String sort, int page, int size) {
        Sort s = switch (sort == null ? "popular" : sort) {
            case "cheapest" -> Sort.by("id");
            case "expensive" -> Sort.by("id");
            case "updated" -> Sort.by(Sort.Direction.DESC, "updatedAt");
            default -> Sort.by(Sort.Direction.DESC, "popularity");
        };
        var result = products.search(q, categoryId, brandId, storeId, viscosity, volume, availableOnly,
                PageRequest.of(page, Math.min(size, 48), s));
        List<ProductCardDto> cards = result.getContent().stream().map(this::toCard).toList();
        if ("cheapest".equals(sort)) {
            cards = cards.stream().sorted(Comparator.comparing(c -> c.prices().cheapest(),
                    Comparator.nullsLast(BigDecimal::compareTo))).toList();
        } else if ("expensive".equals(sort)) {
            cards = cards.stream().sorted(Comparator.comparing((ProductCardDto c) -> c.prices().highest(),
                    Comparator.nullsLast(BigDecimal::compareTo)).reversed()).toList();
        }
        return new PageDto<>(cards, page, size, result.getTotalElements(), result.getTotalPages());
    }

    public List<SearchHitDto> suggest(String q) {
        if (q == null || q.isBlank()) return List.of();
        return search(q, null, null, null, null, null, false, "popular", 0, 8).items().stream()
                .map(c -> new SearchHitDto(c.id(), c.slug(), c.name(), c.brand(), c.primaryImage(),
                        c.prices().cheapest()))
                .toList();
    }

    public ProductDetailDto detail(Long id) {
        Product p = products.findWithDetailsById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        return toDetail(p);
    }

    public ProductDetailDto detailBySlug(String slug) {
        Product p = products.findBySlug(slug)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        return toDetail(p);
    }

    public List<OfferDto> offers(Long productId) {
        products.findById(productId).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        return offerDtos(productId);
    }

    public List<PricePointDto> history(Long productId) {
        return priceHistory.findByProductIdOrderByObservedAtAsc(productId).stream()
                .map(h -> new PricePointDto(h.getObservedAt(), String.valueOf(h.getStoreId()), h.getPrice()))
                .toList();
    }

    public List<ProductCardDto> similar(Long productId) {
        Product p = products.findById(productId).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        if (p.getCategory() == null) return List.of();
        return products.findSimilar(p.getCategory().getId(), productId, PageRequest.of(0, 6)).stream()
                .map(this::toCard).toList();
    }

    private List<OfferDto> offerDtos(Long productId) {
        List<Offer> existing = offers.findByProductId(productId);
        Map<Long, Offer> byStore = existing.stream().collect(Collectors.toMap(o -> o.getStore().getId(), o -> o));
        PriceStats stats = PriceEngine.fromOffers(existing);
        BigDecimal cheapest = stats.cheapest();
        List<OfferDto> rows = new ArrayList<>();
        for (Store store : stores.findByTypeOrderByIdAsc("AUTO")) {
            Offer o = byStore.get(store.getId());
            if (o == null) {
                rows.add(new OfferDto(store.getId(), store.getSlug(), store.getName(), store.getLogoUrl(),
                        null, null, "GEL", false, store.getWebsiteUrl(), store.getLastChecked(), false));
                continue;
            }
            boolean isCheapest = o.isAvailable() && o.getPrice() != null && cheapest != null
                    && o.getPrice().compareTo(cheapest) == 0;
            rows.add(new OfferDto(store.getId(), store.getSlug(), store.getName(), store.getLogoUrl(),
                    o.getPrice(), o.getOldPrice(), o.getCurrency(), o.isAvailable(), o.getProductUrl(),
                    o.getLastChecked(), isCheapest));
        }
        return rows;
    }

    private ProductCardDto toCard(Product p) {
        List<Offer> o = offers.findByProductId(p.getId());
        Instant checked = o.stream().map(Offer::getLastChecked).filter(Objects::nonNull)
                .max(Instant::compareTo).orElse(p.getUpdatedAt());
        String img = p.getImages() == null ? null : p.getImages().stream()
                .sorted(Comparator.comparing((ProductImage i) -> !i.isPrimary()).thenComparingInt(ProductImage::getSortOrder))
                .map(ProductImage::getUrl).findFirst().orElse(null);
        String spec = join(p.getViscosity(), p.getVolume());
        String brand = p.getBrand() == null ? "" : p.getBrand().getName();
        String cat = p.getCategory() == null ? null : p.getCategory().getSlug();
        return new ProductCardDto(p.getId(), p.getSlug(), p.getName(), brand, spec, p.getVolume(),
                p.getViscosity(), cat, img, PriceEngine.fromOffers(o), checked);
    }

    private ProductDetailDto toDetail(Product p) {
        List<ImageDto> images = p.getImages().stream()
                .map(i -> new ImageDto(i.getUrl(), i.getAltText(), i.isPrimary())).toList();
        Map<String, String> attrs = p.getAttributes().stream()
                .collect(Collectors.toMap(ProductAttribute::getAttrKey, ProductAttribute::getAttrValue, (a, b) -> a));
        if (p.getViscosity() != null) attrs.putIfAbsent("viscosity", p.getViscosity());
        if (p.getVolume() != null) attrs.putIfAbsent("volume", p.getVolume());
        List<OfferDto> offerRows = offerDtos(p.getId());
        PriceStats stats = PriceEngine.fromOffers(offers.findByProductId(p.getId()));
        String brand = p.getBrand() == null ? "" : p.getBrand().getName();
        String ka = p.getCategory() == null ? "" : p.getCategory().getNameKa();
        String en = p.getCategory() == null ? "" : p.getCategory().getNameEn();
        return new ProductDetailDto(p.getId(), p.getSlug(), p.getName(), brand, p.getDescription(),
                p.getSku(), p.getEan(), p.getPartNumber(), p.getViscosity(), p.getVolume(), p.getUnit(),
                p.getCompatibility(), ka, en, images, attrs, stats, offerRows);
    }

    private StoreDto toStore(Store s) {
        long count = offers.findAll().stream().filter(o -> o.getStore().getId().equals(s.getId()) && o.isAvailable()).count();
        return new StoreDto(s.getId(), s.getSlug(), s.getName(), s.getNameEn(), s.getType(),
                s.getWebsiteUrl(), s.getLogoUrl(), s.getLastChecked(), count);
    }

    private static String join(String a, String b) {
        if (a == null) return b;
        if (b == null) return a;
        return a + " · " + b;
    }
}
