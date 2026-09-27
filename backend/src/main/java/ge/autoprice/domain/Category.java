package ge.autoprice.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "categories")
public class Category {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String slug;
    @Column(name = "name_ka")
    private String nameKa;
    @Column(name = "name_en")
    private String nameEn;
    private String icon;
    @Column(name = "bg_class")
    private String bgClass;
    @Column(name = "border_class")
    private String borderClass;
    @Column(name = "sort_order")
    private Integer sortOrder;
}
