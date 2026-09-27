package ge.autoprice.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Map;

public final class Dto {
    private Dto() {}

    public record ImageDto(String url, String alt, boolean primary) {}

    public record StoreDto(Long id, String slug, String name, String nameEn, String type,
                           String websiteUrl, String logoUrl, Instant lastChecked, Long productCount) {}

    public record CategoryDto(Long id, String slug, String nameKa, String nameEn, String icon,
                              String bgClass, String borderClass, long productCount) {}

    public record BrandDto(Long id, String slug, String name, String logoUrl) {}

    public record OfferDto(Long storeId, String storeSlug, String storeName, String logoUrl,
                           BigDecimal price, BigDecimal oldPrice, String currency, boolean available,
                           String productUrl, Instant lastChecked, boolean cheapest) {}

    public record PriceStats(BigDecimal cheapest, BigDecimal highest, BigDecimal average,
                             BigDecimal savings, long availableStoreCount) {}

    public record ProductCardDto(Long id, String slug, String name, String brand, String spec,
                                 String volume, String viscosity, String categorySlug,
                                 String primaryImage, PriceStats prices, Instant lastChecked) {}

    public record ProductDetailDto(Long id, String slug, String name, String brand, String description,
                                   String sku, String ean, String partNumber, String viscosity, String volume,
                                   String unit, String compatibility, String categoryKa, String categoryEn,
                                   List<ImageDto> images, Map<String, String> attributes,
                                   PriceStats prices, List<OfferDto> offers) {}

    public record PageDto<T>(List<T> items, int page, int size, long total, int totalPages) {}

    public record SearchHitDto(Long id, String slug, String name, String brand, String image, BigDecimal cheapest) {}

    public record PricePointDto(Instant at, String store, BigDecimal price) {}

    public record FuelCompanyDto(Long id, String slug, String name, String logoUrl, String websiteUrl,
                                 String colorDot, String chartColor, Integer stationCount,
                                 Instant lastChecked, Map<String, BigDecimal> prices) {}

    public record FuelPriceRowDto(Long companyId, String slug, String name, String colorDot, String chartColor,
                                  BigDecimal price, Instant lastChecked, Integer stationCount, String sourceUrl) {}

    public record FuelSummaryDto(String fuelType, FuelPriceRowDto cheapest, FuelPriceRowDto highest,
                                 BigDecimal average, BigDecimal difference, BigDecimal change30d,
                                 List<FuelPriceRowDto> rows) {}

    public record FuelHistoryPointDto(Instant at, String companySlug, BigDecimal price) {}

    public record FuelStationDto(Long id, Long companyId, String companySlug, String companyName,
                                 String name, String city, String address,
                                 BigDecimal latitude, BigDecimal longitude, Instant lastChecked,
                                 Map<String, BigDecimal> prices) {}

    public record FavoriteDto(Long id, String itemType, Long itemId) {}

    public record AlertDto(Long id, String alertType, Long productId, String fuelType, Long companyId,
                           String city, BigDecimal targetPrice, boolean active) {}

    public record ScrapeRunDto(Long id, String collector, String status, Instant startedAt,
                               Instant finishedAt, int itemsOk, int itemsFailed, String message) {}
}
