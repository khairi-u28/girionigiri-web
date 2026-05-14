export function GuestFooter() {
  return (
    <footer className="mt-12 border-t-4 border-giri-black bg-giri-white">
      <div className="mx-auto w-full max-w-4xl px-4 py-6 text-sm text-giri-black">
        © {new Date().getFullYear()} Giri-giri Onigiri
      </div>
    </footer>
  );
}
