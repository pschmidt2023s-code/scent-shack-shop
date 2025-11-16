import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

export function Breadcrumbs() {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  const breadcrumbNameMap: Record<string, string> = {
    'products': 'Produkte',
    'favorites': 'Favoriten',
    'profile': 'Profil',
    'contact': 'Kontakt',
    'returns': 'Retouren',
    'faq': 'FAQ',
    'newsletter': 'Newsletter',
    'privacy': 'Datenschutz',
    'terms': 'AGB',
    'imprint': 'Impressum',
    'partner': 'Partner werden',
    'admin': 'Admin',
    'checkout': 'Kasse',
    'contest': 'Gewinnspiel',
  };

  if (pathnames.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className="py-3 px-4 sm:px-6 lg:px-8 bg-muted/30">
      <ol className="flex items-center space-x-2 text-sm">
        <li>
          <Link 
            to="/" 
            className="flex items-center text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Zur Startseite"
          >
            <Home className="h-4 w-4" />
            <span className="sr-only">Startseite</span>
          </Link>
        </li>
        {pathnames.map((name, index) => {
          const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
          const isLast = index === pathnames.length - 1;
          const displayName = breadcrumbNameMap[name] || name.charAt(0).toUpperCase() + name.slice(1);

          return (
            <li key={routeTo} className="flex items-center">
              <ChevronRight className="h-4 w-4 mx-1 text-muted-foreground" />
              {isLast ? (
                <span className="text-foreground font-medium" aria-current="page">
                  {displayName}
                </span>
              ) : (
                <Link
                  to={routeTo}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {displayName}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
