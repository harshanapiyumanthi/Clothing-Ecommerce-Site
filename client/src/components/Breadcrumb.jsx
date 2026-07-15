import { Link } from 'react-router-dom';
import { FiChevronRight } from 'react-icons/fi';

const Breadcrumb = ({ items = [] }) => {
  if (!items || items.length === 0) return null;

  return (
    <nav className="flex py-3 text-[10px] font-bold uppercase tracking-widest text-gray-400" aria-label="Breadcrumb">
      <ol className="inline-flex items-center space-x-1.5">
        <li className="inline-flex items-center">
          <Link to="/" className="hover:text-gold transition-colors">
            Home
          </Link>
        </li>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={index} className="flex items-center">
              <FiChevronRight className="mx-1 text-gray-300 dark:text-gray-750 shrink-0" size={10} />
              {isLast ? (
                <span className="text-gold font-extrabold truncate max-w-[150px] sm:max-w-none">{item.label}</span>
              ) : (
                <Link to={item.link} className="hover:text-gold transition-colors">
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumb;
