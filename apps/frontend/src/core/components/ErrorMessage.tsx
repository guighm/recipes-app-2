import { TriangleAlert } from 'lucide-react';
import { errorClasses } from './ui/Field';

interface ErrorMessageProps {
  message?: string | null;
  className?: string;
}

/** Alerta de erro de API — usa a mesma receita de `Field.Error` + ícone. */
export default function ErrorMessage({ message, className = '' }: ErrorMessageProps) {
  if (!message) {
    return null;
  }
  return (
    <div role="alert" className={`${errorClasses} flex items-start gap-2 ${className}`}>
      <TriangleAlert aria-hidden="true" size={16} className="mt-[0.2rem] shrink-0" />
      <p>{message}</p>
    </div>
  );
}
