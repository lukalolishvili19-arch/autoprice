from src.stations import collect_lukoil_stations, collect_portal_stations


def test_lukoil_stations_parse():
    rows = collect_lukoil_stations()
    assert len(rows) >= 10
    assert rows[0]["company_slug"] == "lukoil"
    assert rows[0]["city"]


def test_portal_stations_have_coords():
    rows = collect_portal_stations()
    assert len(rows) >= 5
    assert rows[0]["latitude"] is not None
    assert rows[0]["longitude"] is not None
