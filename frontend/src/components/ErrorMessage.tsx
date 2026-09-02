interface ErrorMessageProps {
  message?: string | null;
  className?: string;
}

export default function ErrorMessage({ message, className = '' }: ErrorMessageProps) {
  if (!message) {
    return null;
  }
  return (
    <div
      role="alert"
      className={`rounded-lg bg-erro-nevoa px-[0.8rem] py-[0.6rem] text-[0.85rem] font-medium text-erro ${className}`}
    >
      {message}
    </div>
  );
}