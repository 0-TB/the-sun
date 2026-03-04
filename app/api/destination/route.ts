import { NextRequest, NextResponse } from "next/server";
import type { DestinationRequest, DestinationFull } from "@/lib/types";

// Full mock destination — Lisbon, the cheapest card from /api/search.
// This is the data shape the modal will be built against.
const MOCK_DESTINATION: DestinationFull = {
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
  dailyWeather: [
    {
      date: "2025-03-07",
      tempHighC: 18,
      tempLowC: 11,
      icon: "sunny",
      description: "Clear and bright — ideal arrival day",
    },
    {
      date: "2025-03-08",
      tempHighC: 17,
      tempLowC: 10,
      icon: "partlyCloudy",
      description: "Some cloud but warm enough to explore all day",
    },
    {
      date: "2025-03-09",
      tempHighC: 16,
      tempLowC: 12,
      icon: "partlyCloudy",
      description: "Overcast in the morning, clearing by afternoon",
    },
    {
      date: "2025-03-10",
      tempHighC: 17,
      tempLowC: 11,
      icon: "sunny",
      description: "Sunny send-off — perfect for a final coffee in the sun",
    },
  ],
  highlights: [
    "Wander the winding streets of Alfama at golden hour",
    "Ride the iconic Tram 28 to Belém Tower",
    "Eat pastéis de nata at Pastéis de Belém",
    "Watch the sunset from Miradouro da Graça",
  ],
  itinerary: [
    {
      day: 1,
      date: "2025-03-07",
      title: "Arrival & Alfama",
      activities: [
        "Land at Lisbon Airport, take the Metro (€1.65) to Baixa-Chiado",
        "Check in and drop bags — most hotels allow early bag drop",
        "Lunch at Time Out Market: petiscos and a glass of Vinho Verde",
        "Afternoon: explore Alfama on foot — São Jorge Castle, Se Cathedral",
        "Golden hour at Miradouro das Portas do Sol",
        "Dinner in Alfama: bacalhau à Brás at a traditional tasca",
      ],
    },
    {
      day: 2,
      date: "2025-03-08",
      title: "Belém & Chiado",
      activities: [
        "Morning: Tram 15E to Belém (or Uber, ~€10)",
        "Pastéis de nata at Pastéis de Belém — the original, since 1837",
        "Belém Tower and the Monument to the Discoveries",
        "Lunch: fresh seafood near the waterfront",
        "Afternoon: Chiado neighbourhood — bookshops, cafés, MAAT gallery",
        "Evening: rooftop drinks at Park Bar (above a car park, genuinely great)",
      ],
    },
    {
      day: 3,
      date: "2025-03-09",
      title: "LX Factory & Príncipe Real",
      activities: [
        "Morning market at LX Factory — vintage, books, local food",
        "Walk through Príncipe Real: garden square, antique shops, palaces",
        "Lunch: Mercado de Campo de Ourique",
        "Afternoon: Museu Nacional do Azulejo (tile museum) — genuinely beautiful",
        "Sunset at Miradouro da Graça — quieter than Alfama, better views",
        "Farewell dinner: Cervejaria Ramiro for shellfish and cold beer",
      ],
    },
    {
      day: 4,
      date: "2025-03-10",
      title: "Final Morning & Departure",
      activities: [
        "Slow morning coffee and pastel de nata near the hotel",
        "Last wander through Baixa — pick up ceramics or cork souvenirs",
        "Check out and head to the airport (Metro ~30 min, Red Line)",
        "Flight home: LIS → LHR 18:20",
      ],
    },
  ],
  packingList: [
    "Light jacket — evenings can be cool in March",
    "Comfortable walking shoes (Alfama cobblestones are unforgiving)",
    "Sunglasses — even in winter the light is bright",
    "European plug adapter",
    "Euros (most places accept card but small tascas prefer cash)",
    "Reusable water bottle — tap water is safe and good",
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
  bookingLinks: {
    flights:
      "https://www.google.com/travel/flights/search?tfs=CBwQAhoeEgoyMDI1LTAzLTA3agcIARIDTEhScgcIARIDTElTGh4SCjIwMjUtMDMtMTBqBwgBEgNMSVNyBwgBEgNMSFI",
    hotels:
      "https://www.booking.com/searchresults.html?ss=Lisbon&checkin=2025-03-07&checkout=2025-03-10&group_adults=1",
    airbnb:
      "https://www.airbnb.com/s/Lisbon--Portugal/homes?checkin=2025-03-07&checkout=2025-03-10&adults=1",
  },
  images: {
    hero: "https://images.unsplash.com/photo-1558642891-54be180ea339?w=1200",
    collage: [
      "https://images.unsplash.com/photo-1513735539098-19c4acaadad4?w=600",
      "https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=600",
    ],
    all: [
      {
        id: "lisbon-1",
        url: "https://images.unsplash.com/photo-1558642891-54be180ea339",
        thumbUrl: "https://images.unsplash.com/photo-1558642891-54be180ea339?w=400",
        description: "Aerial view of Lisbon's terracotta rooftops",
        photographer: "Andre Iv",
        photographerUrl: "https://unsplash.com/@andre_iv",
      },
      {
        id: "lisbon-2",
        url: "https://images.unsplash.com/photo-1513735539098-19c4acaadad4",
        thumbUrl: "https://images.unsplash.com/photo-1513735539098-19c4acaadad4?w=400",
        description: "Tram on a narrow Lisbon street",
        photographer: "Maximilian Weisbecker",
        photographerUrl: "https://unsplash.com/@maxweisbecker",
      },
      {
        id: "lisbon-3",
        url: "https://images.unsplash.com/photo-1555881400-74d7acaacd8b",
        thumbUrl: "https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=400",
        description: "Belém Tower at golden hour",
        photographer: "Henrique Ferreira",
        photographerUrl: "https://unsplash.com/@henriqueferreira",
      },
    ],
  },
  vibes: ["city break", "culture", "food & drink"],
};

export async function POST(request: NextRequest) {
  const body: DestinationRequest = await request.json().catch(() => ({}));
  void body;

  // Real implementation: use body.destination + body.dates to call Claude + Open-Meteo + Unsplash
  return NextResponse.json(MOCK_DESTINATION);
}
