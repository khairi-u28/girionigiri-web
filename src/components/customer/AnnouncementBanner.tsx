interface AnnouncementBannerProps {
  title: string;
  body: string;
  active: boolean;
}

export function AnnouncementBanner({
  title,
  body,
  active,
}: AnnouncementBannerProps) {
  if (!active) return null;

  return (
    <div className="border-b-4 border-giri-black bg-giri-yellow px-4 py-3">
      <div className="mx-auto max-w-6xl">
        <p className="text-center font-bold text-giri-black">
          <span className="font-black uppercase">{title}</span>
          {body ? ` — ${body}` : ""}
        </p>
      </div>
    </div>
  );
}
