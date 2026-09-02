export default function Footer() {
  return (
    <footer className="border-t border-borda bg-branco">
      {/* <div aria-hidden="true" className="friso" /> */}
      <p className="rotulo py-[1.1rem] text-center text-[0.72rem] text-tinta-suave">
        Desenvolvido por Guilherme Moraes · © {new Date().getFullYear()}
      </p>
    </footer>
  );
}