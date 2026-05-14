interface MarqueeBannerProps {
  text: string;
}

export function MarqueeBanner({ text }: MarqueeBannerProps) {
  const content = text || "🍙 Onigiri segar setiap hari!";
  return (
    <div className="overflow-hidden border-y-4 border-giri-black bg-giri-black py-2 text-giri-white">
      <div className="animate-marquee whitespace-nowrap font-heading font-bold">
        {content} &nbsp;&nbsp;•&nbsp;&nbsp; {content}
      </div>
    </div>
  );
}
