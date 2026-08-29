import { Link } from 'react-router';
import './Tooltip.css';

interface TooltipProps {
  label: string;
  message: string;
  link: string;
}

export default function Tooltip({ label, message, link }: TooltipProps) {
  return (
    <div className="tooltip">
      <Link to={link} className="label">{label}</Link>
      <span className="tooltip-text">{message}</span>
    </div>
  );
}