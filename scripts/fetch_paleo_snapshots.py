#!/usr/bin/env python3
"""
Busca dados paleogeográficos do GPlates Web Service e salva em public/data/paleo/.
Idempotente: pula arquivos que já existem.
Uso: python3 scripts/fetch_paleo_snapshots.py
"""
import requests
import json
import os
import sys

PALEO_DIR = "public/data/paleo"
BASE_URL = "https://gws.gplates.org/reconstruct/coastlines/"

# Snapshots alinhados aos principais limites geológicos (em Ma)
SNAPSHOTS = [0, 5, 10, 20, 50, 66, 100, 150, 200, 252, 300, 359, 443, 485, 541]

def model_for_time(t):
    # TorsvikCocks2017 cobre 0-540 Ma; ZAHIROVIC2022 é mais preciso para 0-410 Ma
    return "TorsvikCocks2017" if t > 410 else "ZAHIROVIC2022"

os.makedirs(PALEO_DIR, exist_ok=True)

errors = []
for time_ma in SNAPSHOTS:
    out_path = f"{PALEO_DIR}/coastlines_{time_ma}Ma.geojson"
    if os.path.exists(out_path):
        size_kb = os.path.getsize(out_path) // 1024
        print(f"  ✓ {time_ma:4d} Ma — já existe ({size_kb} KB), pulando")
        continue

    model = model_for_time(time_ma)
    url = f"{BASE_URL}?time={time_ma}&model={model}&wrap=true"
    print(f"  ↓ {time_ma:4d} Ma ({model}) …", end=" ", flush=True)

    try:
        r = requests.get(url, timeout=60)
        r.raise_for_status()
        data = r.json()
        with open(out_path, "w") as f:
            json.dump(data, f, separators=(",", ":"))  # minificado
        size_kb = os.path.getsize(out_path) // 1024
        print(f"salvo ({size_kb} KB)")
    except Exception as e:
        print(f"ERRO: {e}")
        errors.append((time_ma, str(e)))

if errors:
    print(f"\n⚠️  {len(errors)} snapshot(s) falharam:")
    for t, err in errors:
        print(f"   {t} Ma: {err}")
    sys.exit(1)
else:
    print(f"\n✅ Todos os {len(SNAPSHOTS)} snapshots disponíveis em {PALEO_DIR}/")
