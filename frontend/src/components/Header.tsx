import { Link } from 'react-router';
import { useIsAuthenticated } from '../stores/auth';
import './Header.css';

export default function Header() {
  const isAuthenticated = useIsAuthenticated();

  return (
    <header>
      <nav className="navegacao">
        <div className="navegacao__opcao">
          <Link to="/" className="navegacao__link">Home</Link>
          <div className="navegacao__listra"></div>
        </div>
        {!isAuthenticated && (
          <div className="navegacao__opcao">
            <Link to="/login" className="navegacao__link">Fazer Login</Link>
            <div className="navegacao__listra"></div>
          </div>
        )}
      </nav>
    </header>
  );
}