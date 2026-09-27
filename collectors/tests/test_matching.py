from src.matching import match, normalize_name


def test_normalize_mobil_variants():
    a = normalize_name("Mobil 1 ESP 5W30 4L")
    b = normalize_name("MOBIL1 ESP 5W-30 4 L")
    assert a == b


def test_ean_automerge():
    cands = [{"id": 1, "ean": "123", "name": "x", "brand": "Mobil 1"}]
    r = match(ean="123", sku=None, brand=None, name="other", viscosity=None, volume=None, candidates=cands)
    assert r.auto_merge and r.method == "ean"


def test_fuzzy_never_automerge():
    cands = [{"id": 1, "ean": None, "sku": None, "name": "Mobil 1 ESP 5W-30 4L", "brand": "Mobil 1",
              "viscosity": "5W-30", "volume": "4L", "part_number": None}]
    r = match(ean=None, sku=None, brand="Castrol", name="Castrol Edge 5W-30 4L",
              viscosity="5W-30", volume="4L", candidates=cands)
    assert r.auto_merge is False


def test_amboli_name_merges_seed_master():
    cands = [{
        "id": 1, "ean": None, "sku": None, "part_number": None,
        "name": "Totachi EURODRIVE ECO 5W-30 4L", "brand": "Totachi",
        "viscosity": "5W-30", "volume": "4L",
    }]
    r = match(
        ean=None, sku=None, brand="Totachi",
        name="Totachi EURODRIVE ECO 5W30 4 (ENGINE OIL)",
        viscosity="5W-30", volume="4L", candidates=cands,
    )
    assert r.auto_merge and r.product_id == 1


def test_parenthetical_tyre_volume():
    from src.products import _norm_volume
    assert _norm_volume("GOODYEAR EAGLE SPORT 2 225/50R17 SUMMER (TYRE)") == "225/50R17"
