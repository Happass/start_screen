// 座標検証ユーティリティ

export interface CoordinateValidationResult {
  isValid: boolean;
  lat: number;
  lon: number;
  errors: string[];
}

/**
 * 緯度経度を正規化し、検証する
 */
export function validateAndNormalizeCoordinates(lat: number, lon: number): CoordinateValidationResult {
  const errors: string[] = [];
  let normalizedLat = lat;
  let normalizedLon = lon;

  // 緯度の検証と正規化 (-90 to 90)
  if (isNaN(normalizedLat)) {
    errors.push('緯度は数値である必要があります');
    normalizedLat = 0;
  } else {
    // 緯度を-90から90の範囲にクランプ
    if (normalizedLat > 90) {
      normalizedLat = 90;
      errors.push('緯度は90度を超えることはできません。90度に調整されました。');
    } else if (normalizedLat < -90) {
      normalizedLat = -90;
      errors.push('緯度は-90度を下回ることはできません。-90度に調整されました。');
    }
  }

  // 経度の検証と正規化 (-180 to 180)
  if (isNaN(normalizedLon)) {
    errors.push('経度は数値である必要があります');
    normalizedLon = 0;
  } else {
    // 経度を-180から180の範囲に正規化（周回処理）
    while (normalizedLon > 180) {
      normalizedLon -= 360;
    }
    while (normalizedLon < -180) {
      normalizedLon += 360;
    }
  }

  return {
    isValid: errors.length === 0,
    lat: normalizedLat,
    lon: normalizedLon,
    errors
  };
}

/**
 * 座標文字列を検証する（ユーザー入力用）
 */
export function validateCoordinateInput(latStr: string, lonStr: string): CoordinateValidationResult {
  const lat = parseFloat(latStr);
  const lon = parseFloat(lonStr);

  const errors: string[] = [];

  if (latStr.trim() === '') {
    errors.push('緯度を入力してください');
  }
  if (lonStr.trim() === '') {
    errors.push('経度を入力してください');
  }

  if (errors.length > 0) {
    return {
      isValid: false,
      lat: 0,
      lon: 0,
      errors
    };
  }

  return validateAndNormalizeCoordinates(lat, lon);
}

/**
 * THREE.Vector3座標から緯度経度を安全に取得
 */
export function safeFromXYZ(position: { x: number; y: number; z: number }, radius: number = 1.01): { lat: number; lon: number } {
  const x = position.x;
  const y = position.y;
  const z = position.z;

  // NaNやInfinityをチェック
  if (!isFinite(x) || !isFinite(y) || !isFinite(z)) {
    console.warn('Invalid position coordinates detected:', position);
    return { lat: 0, lon: 0 };
  }

  const lat = (Math.PI / 2 - Math.acos(Math.max(-1, Math.min(1, y / radius)))) * (180 / Math.PI);
  const lon = Math.atan2(z, -x) * (180 / Math.PI) - 180;

  // 結果を検証して正規化
  const validated = validateAndNormalizeCoordinates(lat, lon);

  if (!validated.isValid) {
    console.warn('Coordinate validation failed:', validated.errors);
  }

  return {
    lat: validated.lat,
    lon: validated.lon
  };
}