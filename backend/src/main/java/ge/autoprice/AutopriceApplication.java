package ge.autoprice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;

@SpringBootApplication
@EnableCaching
public class AutopriceApplication {
    public static void main(String[] args) {
        SpringApplication.run(AutopriceApplication.class, args);
    }
}
