const API_BASE_URL = 'https://planty-api.shakenokiri.me';

export interface Flower {
  id: string;
  lat: number;
  lon: number;
  texture: 'flower1' | 'flower2';
  name: string;
  createdAt: string;
  witherAt?: string;
  ownerId: string;
  type: 'mine' | 'others';
}

export interface CreateFlowerInput {
  lat: number;
  lon: number;
  texture: 'flower1' | 'flower2';
  name: string;
}

export interface PaginatedFlower {
  items: Flower[];
  nextCursor?: string;
}

export interface Memory {
  id: string;
  title: string;
  description: string;
  memoryDate: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  locationId: string;
  lat: number;
  lon: number;
  locationName?: string;
}

export interface CreateMemoryInput {
  title: string;
  description: string;
  memoryDate?: string;
  lat: number;
  lon: number;
  locationName?: string;
}

export interface UpdateMemoryInput {
  title?: string;
  description?: string;
  memoryDate?: string;
}

export interface PaginatedMemory {
  items: Memory[];
  nextCursor?: string;
}

// Geohash utility function (simple implementation for location-based grouping)
function simpleGeohash(lat: number, lon: number, precision: number = 5): string {
  // Simple geohash implementation for location grouping
  // This is a basic implementation - in production, use a proper geohash library
  const latStr = lat.toFixed(precision).replace('.', '').replace('-', 'n');
  const lonStr = lon.toFixed(precision).replace('.', '').replace('-', 'n');
  return `${latStr}_${lonStr}`;
}

export class FlowerAPI {
  private static async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }
    return response.json();
  }

  static async getFlowers(cursor?: string, limit = 100): Promise<PaginatedFlower> {
    const params = new URLSearchParams();
    if (cursor) params.append('cursor', cursor);
    params.append('limit', limit.toString());

    const response = await fetch(`${API_BASE_URL}/flowers?${params}`);
    return this.handleResponse<PaginatedFlower>(response);
  }

  static async createFlower(flower: CreateFlowerInput): Promise<Flower> {
    const response = await fetch(`${API_BASE_URL}/flowers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(flower),
    });
    return this.handleResponse<Flower>(response);
  }

  static async getFlowerById(id: string): Promise<Flower> {
    const response = await fetch(`${API_BASE_URL}/flowers/${id}`);
    return this.handleResponse<Flower>(response);
  }

  static async deleteFlower(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/flowers/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }
  }
}

export class MemoryAPI {
  private static async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }
    return response.json();
  }

  static async getMemoriesByLocation(lat: number, lon: number, cursor?: string, limit = 50): Promise<PaginatedMemory> {
    const locationId = simpleGeohash(lat, lon);
    const params = new URLSearchParams();
    if (cursor) params.append('cursor', cursor);
    params.append('limit', limit.toString());

    const response = await fetch(`${API_BASE_URL}/locations/${locationId}/memories?${params}`);
    return this.handleResponse<PaginatedMemory>(response);
  }

  static async createMemory(lat: number, lon: number, memory: CreateMemoryInput): Promise<Memory> {
    const locationId = simpleGeohash(lat, lon);
    const response = await fetch(`${API_BASE_URL}/locations/${locationId}/memories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...memory,
        lat,
        lon,
      }),
    });
    return this.handleResponse<Memory>(response);
  }

  static async updateMemory(id: string, memory: UpdateMemoryInput): Promise<Memory> {
    const response = await fetch(`${API_BASE_URL}/memories/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(memory),
    });
    return this.handleResponse<Memory>(response);
  }

  static async deleteMemory(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/memories/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }
  }
}

// Export the geohash function for use in components
export { simpleGeohash };