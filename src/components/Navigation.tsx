
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Menu, X, User, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { CartSidebar } from './CartSidebar';
import { AuthModal } from './AuthModal';
import { useAuth } from '@/contexts/AuthContext';

export function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <img 
              src="/lovable-uploads/f39391b1-7ea2-4b3f-9f06-15ca980668cb.png" 
              alt="ALDENAIR Logo" 
              className="h-10 w-auto"
            />
            <span className="text-xl font-bold text-foreground">ALDENAIR</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-foreground hover:text-luxury-gold transition-colors">
              Home
            </Link>
            <Link to="/perfumes" className="text-foreground hover:text-luxury-gold transition-colors">
              Parfüms
            </Link>
            <Link to="/brands" className="text-foreground hover:text-luxury-gold transition-colors">
              Marken
            </Link>
            <Link to="/about" className="text-foreground hover:text-luxury-gold transition-colors">
              Über uns
            </Link>
          </div>

          {/* Search Bar */}
          <div className="hidden lg:flex items-center space-x-4 flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                type="text"
                placeholder="Parfüm suchen..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center space-x-4">
            <CartSidebar />
            
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem disabled>
                    {user.email}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Abmelden
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <AuthModal>
                <Button variant="ghost" size="icon">
                  <User className="h-5 w-5" />
                </Button>
              </AuthModal>
            )}
            
            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <div className="flex flex-col space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Parfüm suchen..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Link 
                to="/" 
                className="text-foreground hover:text-luxury-gold transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link 
                to="/perfumes" 
                className="text-foreground hover:text-luxury-gold transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Parfüms
              </Link>
              <Link 
                to="/brands" 
                className="text-foreground hover:text-luxury-gold transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Marken
              </Link>
              <Link 
                to="/about" 
                className="text-foreground hover:text-luxury-gold transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Über uns
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
