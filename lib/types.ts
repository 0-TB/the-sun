// ─── Shared types for The Sun ─────────────────────────────────────────────

export type WeatherIcon = "sunny" | "partlyCloudy" | "cloudy" | "rainy" | "thunderstorm" | "snowy";

export type Vibe = "city break" | "beach" | "culture" | "adventure" | "nature" | "food & drink";

// ─── Images ───────────────────────────────────────────────────────────────

export interface DestinationImage {
  id: string;
  url: string;         // full-size
  thumbUrl: string;    // ~400px wide, for cards
  description: string;
  photographer: string;
  photographerUrl: string;
}

// ─── Weather ──────────────────────────────────────────────────────────────

export interface WeatherSummary {
  avgTempC: number;
  icon: WeatherIcon;
  summary: string;       // e.g. "Warm and sunny"
  description: string;   // e.g. "19°C, mostly sunny"
}

export interface DailyWeather {
  date: string;          // ISO date "2025-03-07"
  tempHighC: number;
  tempLowC: number;
  icon: WeatherIcon;
  description: string;
}

// ─── Flights ──────────────────────────────────────────────────────────────

export interface FlightLeg {
  from: string;          // IATA code, e.g. "LHR"
  to: string;
  departureTime: string; // "07:30"
  arrivalTime: string;
  airline: string;
  duration: string;      // "2h 15m"
  priceGBP: number;
}

export interface FlightInfo {
  outbound: FlightLeg;
  return: FlightLeg;
}

// ─── Cost ─────────────────────────────────────────────────────────────────

export interface CostBreakdown {
  total: number;
  currency: "GBP";
  flights: number;
  accommodation: number;
}

// ─── Itinerary ────────────────────────────────────────────────────────────

export interface ItineraryDay {
  day: number;
  date: string;          // ISO date
  title: string;         // e.g. "Arrival & Alfama"
  activities: string[];
}

// ─── Booking links ────────────────────────────────────────────────────────

export interface BookingLinks {
  flights: string;      // Google Flights deep link
  hotels: string;       // Booking.com deep link
  airbnb: string;       // Airbnb deep link
}

// ─── Destination Card (summary — used on the search results page) ─────────

export interface DestinationCard {
  id: string;
  destination: {
    city: string;
    country: string;
    countryCode: string; // ISO 3166-1 alpha-2, e.g. "PT"
  };
  dates: {
    departure: string;   // ISO date
    return: string;
    nights: number;
  };
  cost: CostBreakdown;
  weather: WeatherSummary;
  highlights: string[];  // 3–4 bullet points
  flightInfo: FlightInfo;
  images: {
    hero: string;        // single hero URL
    collage: string[];   // 2–3 additional URLs
  };
  vibes: Vibe[];
}

// ─── Full Destination (used in the modal) ─────────────────────────────────

export interface DestinationFull extends DestinationCard {
  dailyWeather: DailyWeather[];
  itinerary: ItineraryDay[];
  packingList: string[];
  bookingLinks: BookingLinks;
  images: {
    hero: string;
    collage: string[];
    all: DestinationImage[];
  };
}

// ─── API request/response shapes ──────────────────────────────────────────

export interface SearchRequest {
  budget?: number;
  tripLength?: "long weekend" | "5 days" | "1 week";
  vibe?: Vibe | "surprise me";
}

export interface SearchResponse {
  destinations: DestinationCard[];
}

export interface DestinationRequest {
  destination: string;  // city name
  dates: {
    departure: string;
    return: string;
  };
}

export interface ImagesResponse {
  query: string;
  images: DestinationImage[];
}
