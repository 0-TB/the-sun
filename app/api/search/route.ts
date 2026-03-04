import { NextRequest, NextResponse } from "next/server";
import type { SearchRequest, SearchResponse, DestinationCard } from "@/lib/types";

// Mock data — realistic shape matching what Claude will eventually return.
// Three destinations ordered cheapest → most expensive for a long weekend Fri–Mon.
const MOCK_DESTINATIONS: DestinationCard[] = [
  {
    id: "lisbon-2025-03-07",
    destination: {
      city: "Lisbon",
      country: "Portugal",
      countryCode: "PT",
    },
    dates: {
      departure: "2025-03-07",
      return: "2025-03-10",
      nights: 3,
    },
    cost: {
      total: 285,
      currency: "GBP",
      flights: 120,
      accommodation: 165,
    },
    weather: {
      avgTempC: 17,
      icon: "partlyCloudy",
      summary: "Mild and pleasant",
      description: "17°C, mix of sun and cloud",
    },
    highlights: [
      "Wander the winding streets of Alfama at golden hour",
      "Ride the iconic Tram 28 to Belém Tower",
      "Eat pastéis de nata at Pastéis de Belém",
      "Watch the sunset from Miradouro da Graça",
    ],
    flightInfo: {
      outbound: {
        from: "LHR",
        to: "LIS",
        departureTime: "07:30",
        arrivalTime: "10:45",
        airline: "TAP Air Portugal",
        duration: "2h 15m",
        priceGBP: 60,
      },
      return: {
        from: "LIS",
        to: "LHR",
        departureTime: "18:20",
        arrivalTime: "20:15",
        airline: "TAP Air Portugal",
        duration: "2h 55m",
        priceGBP: 60,
      },
    },
    images: {
      hero: "https://images.unsplash.com/photo-1558642891-54be180ea339?w=1200",
      collage: [
        "https://images.unsplash.com/photo-1513735539098-19c4acaadad4?w=600",
        "https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=600",
      ],
    },
    vibes: ["city break", "culture", "food & drink"],
  },
  {
    id: "seville-2025-03-07",
    destination: {
      city: "Seville",
      country: "Spain",
      countryCode: "ES",
    },
    dates: {
      departure: "2025-03-07",
      return: "2025-03-10",
      nights: 3,
    },
    cost: {
      total: 390,
      currency: "GBP",
      flights: 175,
      accommodation: 215,
    },
    weather: {
      avgTempC: 20,
      icon: "sunny",
      summary: "Warm and sunny",
      description: "20°C, clear skies all weekend",
    },
    highlights: [
      "Explore the vast Alcázar palace and its Moorish gardens",
      "Get lost in the medieval streets of the Barrio Santa Cruz",
      "Climb the Giralda tower for panoramic rooftop views",
      "Tapas crawl along Calle Mateos Gago",
    ],
    flightInfo: {
      outbound: {
        from: "STN",
        to: "SVQ",
        departureTime: "06:45",
        arrivalTime: "10:10",
        airline: "Ryanair",
        duration: "2h 25m",
        priceGBP: 88,
      },
      return: {
        from: "SVQ",
        to: "STN",
        departureTime: "19:30",
        arrivalTime: "22:00",
        airline: "Ryanair",
        duration: "2h 30m",
        priceGBP: 87,
      },
    },
    images: {
      hero: "https://images.unsplash.com/photo-1559564484-b7dffc5eca3c?w=1200",
      collage: [
        "https://images.unsplash.com/photo-1597996470289-e60d11e1dc02?w=600",
        "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=600",
      ],
    },
    vibes: ["city break", "culture", "food & drink"],
  },
  {
    id: "dubrovnik-2025-03-07",
    destination: {
      city: "Dubrovnik",
      country: "Croatia",
      countryCode: "HR",
    },
    dates: {
      departure: "2025-03-07",
      return: "2025-03-10",
      nights: 3,
    },
    cost: {
      total: 520,
      currency: "GBP",
      flights: 240,
      accommodation: 280,
    },
    weather: {
      avgTempC: 13,
      icon: "partlyCloudy",
      summary: "Cool and crisp",
      description: "13°C, mostly clear — perfect for walking the walls",
    },
    highlights: [
      "Walk the ancient city walls at sunrise before the crowds arrive",
      "Take the cable car up Mount Srđ for views across the Adriatic",
      "Swim in the impossibly blue sea at Banje Beach",
      "Explore the old town's marble streets and baroque architecture",
    ],
    flightInfo: {
      outbound: {
        from: "LHR",
        to: "DBV",
        departureTime: "09:15",
        arrivalTime: "13:00",
        airline: "British Airways",
        duration: "2h 45m",
        priceGBP: 120,
      },
      return: {
        from: "DBV",
        to: "LHR",
        departureTime: "14:30",
        arrivalTime: "17:00",
        airline: "British Airways",
        duration: "2h 30m",
        priceGBP: 120,
      },
    },
    images: {
      hero: "https://images.unsplash.com/photo-1555990793-da11153b2473?w=1200",
      collage: [
        "https://images.unsplash.com/photo-1573208927878-5a6eaf78fb63?w=600",
        "https://images.unsplash.com/photo-1603815028400-1ebcfc7fa5ad?w=600",
      ],
    },
    vibes: ["city break", "culture", "adventure"],
  },
];

export async function POST(request: NextRequest) {
  // Parse request body (budget / tripLength / vibe filters)
  // Ignored for mock — real implementation will pass these to Claude
  const body: SearchRequest = await request.json().catch(() => ({}));
  void body;

  const response: SearchResponse = {
    destinations: MOCK_DESTINATIONS,
  };

  return NextResponse.json(response);
}
