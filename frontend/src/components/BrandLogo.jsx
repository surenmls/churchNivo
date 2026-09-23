import { Link } from 'react-router-dom';

export default function BrandLogo({ className = '', textClassName = 'text-gray-900', light = false, onClick }) {
  const textColor = light ? 'text-white' : textClassName;

  return (
    <Link to="/" className={`flex items-center gap-2.5 ${className}`} onClick={onClick}>
      <img
        src="/logo-icon.svg"
        alt=""
        className="h-10 w-10 shrink-0 rounded-xl shadow-lg shadow-primary-500/30"
        width={40}
        height={40}
      />
      <span className={`font-display text-xl font-bold ${textColor}`}>ChurchNivo</span>
    </Link>
  );
}
