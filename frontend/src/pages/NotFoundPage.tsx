import { Link } from 'react-router';
import './NotFoundPage.css';

export default function NotFoundPage() {
  return (
    <div className="not-found">
      <h2>Erro 404</h2>
      <p>A página que você procura não existe!</p>
      <Link to="/" className="ancora">Voltar para a Home</Link>
    </div>
  );
}