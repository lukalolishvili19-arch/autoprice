from src.base import fetch_html, session
import re

_, soup = fetch_html("https://www.lukoil.ge/stations")
text = soup.get_text("\n", strip=True)
lines = [ln.strip() for ln in text.split("\n") if ln.strip()]
for i, ln in enumerate(lines):
    if ln == "სადგურების ჩამონათვალი":
        print("found list at", i)
        print(lines[i : i + 25])
        break

r = session().get("https://portal.com.ge/ka/stations", timeout=25)
print("portal lat", r.text.lower().count("latitude"))
for m in re.finditer(r'"latitude"\s*:\s*([0-9.]+)', r.text):
    print("lat", m.group(1))
    break
