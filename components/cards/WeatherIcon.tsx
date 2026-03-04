import type { WeatherIcon as WeatherIconType } from "@/lib/types";

interface Props {
  icon: WeatherIconType;
  size?: number;
  color?: string;
}

export function WeatherIcon({ icon, size = 16, color = "white" }: Props) {
  const p = {
    width: size,
    height: size,
    fill: "none",
    viewBox: "0 0 20 20",
    style: { display: "inline-block", flexShrink: 0 },
  };

  switch (icon) {
    case "sunny":
      return (
        <svg {...p}>
          <circle cx="10" cy="10" r="3.5" stroke={color} strokeWidth="1.4" />
          <path
            d="M10 1.5v2M10 16.5v2M1.5 10h2M16.5 10h2M3.6 3.6l1.4 1.4M15 15l1.4 1.4M3.6 16.4l1.4-1.4M15 5l1.4-1.4"
            stroke={color}
            strokeWidth="1.4"
            strokeLinecap="round"
          />
        </svg>
      );

    case "partlyCloudy":
      return (
        <svg {...p}>
          <circle cx="7.5" cy="7.5" r="3" stroke={color} strokeWidth="1.3" />
          <path
            d="M7.5 2v1.5M7.5 12v1.5M2 7.5h1.5M12 7.5h1.5M3.7 3.7l1 1M11.8 11.8l1 1M3.7 11.3l1-1M11.8 3.7l-1 1"
            stroke={color}
            strokeWidth="1.1"
            strokeLinecap="round"
            opacity="0.7"
          />
          <path
            d="M15 14a3 3 0 0 0-2.6-4.5 4 4 0 0 0-7.6 1 2.5 2.5 0 0 0 .2 5z"
            stroke={color}
            strokeWidth="1.3"
            strokeLinejoin="round"
          />
        </svg>
      );

    case "cloudy":
      return (
        <svg {...p}>
          <path
            d="M16 13a3 3 0 0 0-2.6-4.5 4 4 0 0 0-7.6 1 2.5 2.5 0 0 0 .2 5z"
            stroke={color}
            strokeWidth="1.4"
            strokeLinejoin="round"
          />
        </svg>
      );

    case "rainy":
      return (
        <svg {...p}>
          <path
            d="M15 11a3 3 0 0 0-2.6-4.5 4 4 0 0 0-7.6 1 2.5 2.5 0 0 0 .2 5z"
            stroke={color}
            strokeWidth="1.3"
            strokeLinejoin="round"
          />
          <path
            d="M7 15.5v1.5M10 15.5v2M13 15.5v1.5"
            stroke={color}
            strokeWidth="1.3"
            strokeLinecap="round"
          />
        </svg>
      );

    case "thunderstorm":
      return (
        <svg {...p}>
          <path
            d="M15 11a3 3 0 0 0-2.6-4.5 4 4 0 0 0-7.6 1 2.5 2.5 0 0 0 .2 5z"
            stroke={color}
            strokeWidth="1.3"
            strokeLinejoin="round"
          />
          <path
            d="M11.5 14l-2.5 4h3.5l-2.5 4"
            stroke={color}
            strokeWidth="1.3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );

    case "snowy":
      return (
        <svg {...p}>
          <path
            d="M15 11a3 3 0 0 0-2.6-4.5 4 4 0 0 0-7.6 1 2.5 2.5 0 0 0 .2 5z"
            stroke={color}
            strokeWidth="1.3"
            strokeLinejoin="round"
          />
          <path
            d="M7 15.5h0M10 15.5h0M13 15.5h0"
            stroke={color}
            strokeWidth="2.2"
            strokeLinecap="round"
          />
        </svg>
      );

    default:
      return null;
  }
}
