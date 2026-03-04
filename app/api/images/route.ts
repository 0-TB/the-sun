import { NextRequest, NextResponse } from "next/server";
import type { ImagesResponse } from "@/lib/types";

// Mock images — Unsplash-shaped objects for a Lisbon query.
// Real implementation will hit: https://api.unsplash.com/search/photos?query=...
const MOCK_IMAGES: ImagesResponse = {
  query: "Lisbon Portugal",
  images: [
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
      description: "Tram 28 on a winding Alfama street",
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
    {
      id: "lisbon-4",
      url: "https://images.unsplash.com/photo-1548707309-dcebeab9ea9b",
      thumbUrl: "https://images.unsplash.com/photo-1548707309-dcebeab9ea9b?w=400",
      description: "Colourful tiles on a Lisbon building facade",
      photographer: "Augusto Leguizamon",
      photographerUrl: "https://unsplash.com/@augusto",
    },
    {
      id: "lisbon-5",
      url: "https://images.unsplash.com/photo-1596422846543-75c6fc197f07",
      thumbUrl: "https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=400",
      description: "Pastéis de nata — the iconic Lisbon custard tart",
      photographer: "Cayla Zahoran",
      photographerUrl: "https://unsplash.com/@caylazahoran",
    },
  ],
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") ?? "Lisbon Portugal";
  void query;

  // Real implementation:
  // const res = await fetch(
  //   `https://api.unsplash.com/search/photos?query=${query}&per_page=10`,
  //   { headers: { Authorization: `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}` } }
  // );

  return NextResponse.json(MOCK_IMAGES);
}
