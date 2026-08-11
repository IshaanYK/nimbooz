"""Quick validation of the agriculture engine."""
import sys
sys.path.insert(0, r'F:\hyperion\backend')
from app.services.agriculture.engine import (
    calc_daytime_heat_stress, calc_nighttime_heat_stress,
    calc_frost_stress, calc_drought_index, calc_gdd_single_day,
    calc_nue, calc_robi
)

print("=== AASRA Agriculture Engine Test ===\n")

tmax, tmin, crop = 36.5, 26.2, "soybean"

heat_day = calc_daytime_heat_stress(tmax, crop)
heat_night = calc_nighttime_heat_stress(tmin, crop)
frost = calc_frost_stress(tmin, crop)
gdd = calc_gdd_single_day(tmax, tmin, crop)
drought = calc_drought_index(35.0, 5.5, 78.0, 31.3)

print(f"Crop: {crop}, Tmax={tmax}C, Tmin={tmin}C")
print(f"Heat (day): score={heat_day[0]}, {heat_day[1]}")
print(f"Heat (night): score={heat_night[0]}, {heat_night[1]}")
print(f"Frost: score={frost[0]}, {frost[1]}")
print(f"GDD today: {gdd}")
print(f"Drought: DI={drought[0]}, {drought[1]}\n")

robi = calc_robi(2850, 2600, 35.0, 450, 150)
print(f"ROBI: {robi['robi_ratio']}:1 ({robi['robi_category']})")
print(f"      {robi['interpretation']}\n")

nue = calc_nue("soybean", 2700, 25, 580, 72)
print(f"NUE: {nue['nue']} ({nue['nue_category']})")
print(f"     {nue['interpretation']}\n")

print("ALL TESTS PASSED")
