#!/usr/bin/env python3
"""One-off probe script for Lukoil station page."""
from src.base import session
import re

r = session().get("https://www.lukoil.ge/stations", timeout=25)
text = r.text
print("lat keys", len(re.findall(r"lat", text, re.I)))
print("google maps", "google.maps" in text)
pairs = re.findall(r"(4[12]\.\d{5,})", text)
print("geo sample", pairs[:15])
