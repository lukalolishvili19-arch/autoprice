package ge.autoprice.web;

import ge.autoprice.dto.Dto.ScrapeRunDto;
import ge.autoprice.dto.Dto.StoreDto;
import ge.autoprice.service.CatalogService;
import ge.autoprice.service.UserAdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {
    private final CatalogService catalog;
    private final UserAdminService admin;

    @GetMapping("/stores")
    public List<StoreDto> stores() {
        return catalog.autoStores();
    }

    @GetMapping("/scrape-runs")
    public List<ScrapeRunDto> runs() {
        return admin.runs();
    }

    @GetMapping("/scrape-errors")
    public Object errors() {
        return admin.errors();
    }

    @GetMapping("/matches")
    public Object matches() {
        return admin.mappings();
    }

    @PostMapping("/collectors/{name}")
    public Map<String, Object> trigger(@PathVariable String name) {
        return admin.trigger(name);
    }

    @GetMapping("/status")
    public Map<String, Object> status() {
        return Map.of("ok", true, "runs", admin.runs().size());
    }
}
