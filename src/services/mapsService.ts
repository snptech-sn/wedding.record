export interface MapsPlace {
  title: string;
  uri: string;
  address?: string;
  placeAnswerSources?: {
    reviewSnippets?: Array<{
      reviewText?: string;
      authorAttribution?: {
        displayName?: string;
      };
    }>;
  };
}

export interface MapsGroundingResult {
  text: string;
  places: MapsPlace[];
  groundingChunks: any[];
}

/**
 * Fetch grounded Google Maps data via our server-side Gemini 2.5 Flash API
 */
export async function searchMapsGrounding(
  query: string,
  location?: { latitude: number; longitude: number } | null,
  eventContext?: string
): Promise<MapsGroundingResult> {
  const response = await fetch('/api/maps/grounding', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query,
      location: location || undefined,
      eventContext,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.error || `HTTP error ${response.status}: បរាជ័យក្នុងការទាញយកទិន្នន័យ Google Maps`
    );
  }

  const data = await response.json();
  return {
    text: data.text || '',
    places: data.places || [],
    groundingChunks: data.groundingChunks || [],
  };
}

/**
 * Get current browser geolocation coordinates
 */
export function getCurrentCoordinates(): Promise<{ latitude: number; longitude: number }> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('ឧបករណ៍របស់អ្នកមិនគាំទ្រ Geolocation ទេ'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        resolve({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
      },
      (err) => {
        reject(err);
      },
      {
        timeout: 10000,
        enableHighAccuracy: true,
      }
    );
  });
}
