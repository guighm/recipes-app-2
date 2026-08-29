export default function Footer() {
  return (
    <footer className="border-t border-border bg-white">
      <p className="label py-[1.1rem] text-center text-[0.72rem] text-ink-soft">
        Built by Guilherme Moraes · © {new Date().getFullYear()}
      </p>
    </footer>
  );
}