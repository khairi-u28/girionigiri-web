interface AnnouncementBannerProps {
  title: string;
  body: string;
  active: boolean;
}

export function AnnouncementBanner({ title, body, active }: AnnouncementBannerProps) {
  if (!active) return null;

  return (
    <div className="border-b-4 border-giri-black bg-giri-yellow px-4 py-3">
      <p className="font-heading text-lg font-bold text-giri-black">{title}</p>
      <p className="text-giri-black">{body}</p>
    </div>
  );
}
