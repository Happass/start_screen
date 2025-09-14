import json
import random

# Read the downloaded cities.json file
with open('/Users/boudenyuuma/home/dev/start_screen/cities.json', 'r') as f:
    cities_data = json.load(f)

flowers = []
# Randomly sample 125 cities
# Ensure we don't try to sample more than available cities
num_cities_to_sample = min(125, len(cities_data))
sampled_cities = random.sample(cities_data, num_cities_to_sample)

# Assign textures: 75 flower1, 50 flower2
flower1_count = 0
flower2_count = 0

for i, city in enumerate(sampled_cities):
    texture_type = ""
    if flower1_count < 75:
        texture_type = "flower1"
        flower1_count += 1
    elif flower2_count < 50:
        texture_type = "flower2"
        flower2_count += 1
    else:
        # Should not happen if num_cities_to_sample is 125
        # Fallback to flower1 if somehow more cities are processed
        texture_type = "flower1"

    flowers.append({
        "lat": float(city["lat"]), # Ensure float type
        "lon": float(city["lng"]), # Ensure float type
        "texture": texture_type,
        "name": city["name"]
    })

random.shuffle(flowers) # Shuffle to mix flower1 and flower2

print(json.dumps(flowers, indent=2))
