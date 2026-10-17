"""Turns raw OpenStreetMap exports (cafes.json, places.json) into src/data/cafes.json.
Data © OpenStreetMap contributors, ODbL 1.0. Re-run after a fresh Overpass download."""
import json, math, sys, re
raw_dir = sys.argv[1]
cafes = json.load(open(f'{raw_dir}/cafes.json'))['elements']

# Districts people actually name, with approximate centres (WGS84). A café takes the nearest one;
# anything further than 4.5 km from every centre is labelled "Greater Cairo".
DISTRICTS = [
    ('Zamalek', 'الزمالك', 30.0626, 31.2197), ('Downtown', 'وسط البلد', 30.0478, 31.2400),
    ('Garden City', 'جاردن سيتي', 30.0360, 31.2315), ('Dokki', 'الدقي', 30.0385, 31.2120),
    ('Mohandessin', 'المهندسين', 30.0560, 31.2010), ('Agouza', 'العجوزة', 30.0570, 31.2125),
    ('Manial', 'المنيل', 30.0200, 31.2280), ('Maadi', 'المعادي', 29.9600, 31.2570),
    ('Heliopolis', 'مصر الجديدة', 30.0910, 31.3260), ('Nasr City', 'مدينة نصر', 30.0560, 31.3400),
    ('New Cairo', 'القاهرة الجديدة', 30.0280, 31.4700), ('Nozha', 'النزهة', 30.1050, 31.3600),
    ('Giza', 'الجيزة', 30.0130, 31.2090), ('Haram', 'الهرم', 29.9930, 31.1700),
    ('Abbasiya', 'العباسية', 30.0720, 31.2830), ('Shubra', 'شبرا', 30.1050, 31.2450),
    ('Islamic Cairo', 'القاهرة الإسلامية', 30.0450, 31.2620), ('Mokattam', 'المقطم', 30.0200, 31.3000),
    ('Imbaba', 'إمبابة', 30.0760, 31.2080), ('Ain Shams', 'عين شمس', 30.1300, 31.3200),
    ('Zeitoun', 'الزيتون', 30.1050, 31.3100), ('Old Cairo', 'مصر القديمة', 30.0060, 31.2300),
    ('Rehab', 'الرحاب', 30.0600, 31.4900), ('Madinaty', 'مدينتي', 30.1000, 31.6300),
    ('Katameya', 'القطامية', 29.9900, 31.4100),
]
areas = [{'en': a, 'ar': b, 'lat': c, 'lon': d} for a, b, c, d in DISTRICTS]

def dist(a, b, c, d):
    r = math.radians
    x = r(d - b) * math.cos(r((a + c) / 2)); y = r(c - a)
    return 6371 * math.hypot(x, y)

def yn(v):
    if v is None: return None
    return v not in ('no', 'none')

out = []
for e in cafes:
    t = e.get('tags', {})
    if 'name' not in t: continue
    lat = e.get('lat') or e.get('center', {}).get('lat'); lon = e.get('lon') or e.get('center', {}).get('lon')
    if lat is None: continue
    near = min(areas, key=lambda a: dist(lat, lon, a['lat'], a['lon']))
    if dist(lat, lon, near['lat'], near['lon']) > 4.5: near = {'en': 'Greater Cairo', 'ar': 'القاهرة الكبرى'}
    name = t.get('name'); en = t.get('name:en') or (name if re.match(r'^[A-Za-z0-9]', name) else None)
    ar = t.get('name:ar') or (name if not re.match(r'^[A-Za-z0-9]', name) else None)
    wifi = t.get('internet_access')
    out.append({
        'id': f"{e['type'][0]}{e['id']}",
        'name': en or ar, 'nameAr': ar or en,
        'lat': round(lat, 6), 'lon': round(lon, 6),
        'area': near['en'], 'areaAr': near['ar'],
        'hours': t.get('opening_hours'),
        'wifi': None if wifi is None else wifi in ('yes', 'wlan', 'wifi'),
        'wifiFree': None if wifi is None else (t.get('internet_access:fee') == 'no' or None),
        'outdoor': yn(t.get('outdoor_seating')), 'ac': yn(t.get('air_conditioning')),
        'smoking': t.get('smoking'), 'takeaway': yn(t.get('takeaway')),
        'wheelchair': t.get('wheelchair'),
        'chain': bool(t.get('brand') or t.get('brand:wikidata')),
        'cuisine': t.get('cuisine'),
        'street': t.get('addr:street:en') or t.get('addr:street'),
        'phone': t.get('phone') or t.get('contact:phone'),
        'website': t.get('website') or t.get('contact:website'),
        'instagram': t.get('contact:instagram'),
    })
# drop empty keys to keep the file small
out = [{k: v for k, v in c.items() if v is not None} for c in out]
out.sort(key=lambda c: c['name'].lower())
json.dump(out, open(sys.argv[2], 'w'), ensure_ascii=False, separators=(',', ':'))
from collections import Counter
print(len(out), 'cafes;', Counter(c['area'] for c in out).most_common(14))
