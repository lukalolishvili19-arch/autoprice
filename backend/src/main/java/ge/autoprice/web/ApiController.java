package ge.autoprice.web;

import ge.autoprice.dto.Dto.*;
import ge.autoprice.service.CatalogService;
import ge.autoprice.service.FuelService;
import ge.autoprice.service.UserAdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class ApiController {
    private final CatalogService catalog;
    private final FuelService fuel;
    private final UserAdminService users;

    @GetMapping("/products")
    public PageDto<ProductCardDto> products(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) Long brandId,
            @RequestParam(required = false) Long storeId,
            @RequestParam(required = false) String viscosity,
            @RequestParam(required = false) String volume,
            @RequestParam(defaultValue = "false") boolean availableOnly,
            @RequestParam(defaultValue = "popular") String sort,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "24") int size) {
        return catalog.search(q, categoryId, brandId, storeId, viscosity, volume, availableOnly, sort, page, size);
    }

    @GetMapping("/products/search")
    public List<SearchHitDto> search(@RequestParam String q) {
        return catalog.suggest(q);
    }

    @GetMapping("/products/{id}")
    public ProductDetailDto product(@PathVariable Long id) {
        return catalog.detail(id);
    }

    @GetMapping("/products/slug/{slug}")
    public ProductDetailDto productSlug(@PathVariable String slug) {
        return catalog.detailBySlug(slug);
    }

    @GetMapping("/products/{id}/offers")
    public List<OfferDto> offers(@PathVariable Long id) {
        return catalog.offers(id);
    }

    @GetMapping("/products/{id}/price-history")
    public List<PricePointDto> productHistory(@PathVariable Long id) {
        return catalog.history(id);
    }

    @GetMapping("/products/{id}/similar")
    public List<ProductCardDto> similar(@PathVariable Long id) {
        return catalog.similar(id);
    }

    @GetMapping("/stores")
    public List<StoreDto> stores() {
        return catalog.autoStores();
    }

    @GetMapping("/stores/{id}")
    public StoreDto store(@PathVariable Long id) {
        return catalog.store(id);
    }

    @GetMapping("/stores/slug/{slug}")
    public StoreDto storeSlug(@PathVariable String slug) {
        return catalog.storeBySlug(slug);
    }

    @GetMapping("/categories")
    public List<CategoryDto> categories() {
        return catalog.categories();
    }

    @GetMapping("/brands")
    public List<BrandDto> brands() {
        return catalog.brands();
    }

    @GetMapping("/fuel/prices")
    public FuelSummaryDto fuelPrices(
            @RequestParam(defaultValue = "regular") String type,
            @RequestParam(defaultValue = "cheapest") String sort) {
        return fuel.prices(type, sort);
    }

    @GetMapping("/fuel/history")
    public List<FuelHistoryPointDto> fuelHistory(
            @RequestParam(defaultValue = "regular") String type,
            @RequestParam(defaultValue = "30d") String range) {
        return fuel.history(type, range);
    }

    @GetMapping("/fuel/companies")
    public List<FuelCompanyDto> fuelCompanies() {
        return fuel.companies();
    }

    @GetMapping("/fuel/companies/{slug}")
    public FuelCompanyDto fuelCompany(@PathVariable String slug) {
        return fuel.company(slug);
    }

    @GetMapping("/fuel/stations")
    public List<FuelStationDto> stations(
            @RequestParam(required = false) Long companyId,
            @RequestParam(required = false) String city,
            @RequestParam(required = false) String type) {
        return fuel.stations(companyId, city, type);
    }

    @GetMapping("/fuel/stations/{id}")
    public FuelStationDto station(@PathVariable Long id) {
        return fuel.station(id);
    }

    @GetMapping("/favorites")
    public List<FavoriteDto> favorites(@RequestHeader("X-Client-Key") String clientKey) {
        return users.listFavorites(clientKey);
    }

    @PostMapping("/favorites")
    public FavoriteDto addFavorite(@RequestHeader("X-Client-Key") String clientKey,
                                   @RequestBody Map<String, Object> body) {
        String type = String.valueOf(body.get("itemType"));
        Long itemId = Long.valueOf(String.valueOf(body.get("itemId")));
        return users.addFavorite(clientKey, type, itemId);
    }

    @DeleteMapping("/favorites/{type}/{itemId}")
    public void removeFavorite(@RequestHeader("X-Client-Key") String clientKey,
                               @PathVariable String type, @PathVariable Long itemId) {
        users.removeFavorite(clientKey, type, itemId);
    }

    @GetMapping("/alerts")
    public List<AlertDto> alerts(@RequestHeader("X-Client-Key") String clientKey) {
        return users.listAlerts(clientKey);
    }

    @PostMapping("/alerts")
    public AlertDto createAlert(@RequestHeader("X-Client-Key") String clientKey,
                                @RequestBody Map<String, Object> body) {
        String alertType = String.valueOf(body.getOrDefault("alertType", "product"));
        Long productId = body.get("productId") == null ? null : Long.valueOf(String.valueOf(body.get("productId")));
        if (productId == null && body.get("itemId") != null) {
            productId = Long.valueOf(String.valueOf(body.get("itemId")));
        }
        String fuelType = body.get("fuelType") == null ? null : String.valueOf(body.get("fuelType"));
        Long companyId = body.get("companyId") == null ? null : Long.valueOf(String.valueOf(body.get("companyId")));
        String city = body.get("city") == null ? null : String.valueOf(body.get("city"));
        BigDecimal target = new BigDecimal(String.valueOf(body.get("targetPrice")));
        return users.createAlert(clientKey, alertType, productId, fuelType, companyId, city, target);
    }

    @DeleteMapping("/alerts/{id}")
    public void deleteAlert(@RequestHeader("X-Client-Key") String clientKey, @PathVariable Long id) {
        users.deleteAlert(id, clientKey);
    }
}
