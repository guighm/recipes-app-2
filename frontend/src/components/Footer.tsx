import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <p>Desenvolvido por Guilherme Moraes</p>
      <div className="copyright">
        <p>&copy;</p>
        <p>{new Date().getFullYear()}</p>
      </div>
    </footer>
  );
}