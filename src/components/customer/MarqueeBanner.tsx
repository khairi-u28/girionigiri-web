interface MarqueeBannerProps {
  text: string;
}

export function MarqueeBanner({ text }: MarqueeBannerProps) {
  const content = text || "🍙 Onigiri segar setiap hari!";

  return (
    <div className="marquee-container border-b-2 border-giri-black bg-giri-yellow py-2 text-sm font-bold uppercase tracking-widest">
      <span className="animate-marquee">
        ⚡ {content} ⚡ {content} ⚡
      </span>
    </div>
  );
}
