'use client';

interface MapPanelProps {
  address: string;
  name: string;
  latitude?: number;
  longitude?: number;
}

export function MapPanel({ address, name, latitude, longitude }: MapPanelProps) {
  const location =
    latitude !== undefined && longitude !== undefined
      ? `${latitude},${longitude}`
      : address;

  const query = encodeURIComponent(location);

  return (
    <div className="bg-card rounded-xl border border-border p-4 shadow-sm">
      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-border">
        <div className="w-4 h-4 text-muted-foreground flex items-center justify-center">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
        </div>
        <h3 className="text-sm font-semibold text-foreground">Location</h3>
      </div>
      <p className="text-xs text-muted-foreground mb-2">{name}</p>
      <div className="rounded-lg overflow-hidden border border-border">
        <iframe
          src={`https://www.google.com/maps?q=${query}&output=embed`}
          width="100%"
          height="180"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>
    </div>
  );
}
