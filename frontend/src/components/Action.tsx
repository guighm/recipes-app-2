import './Action.css';

interface ActionProps {
  label: string;
  message: string;
  onClick: () => void;
}

export default function Action({ label, message, onClick }: ActionProps) {
  return (
    <div className="tooltip">
      <button className="label" onClick={onClick}>{label}</button>
      <span className="tooltip-text">{message}</span>
    </div>
  );
}