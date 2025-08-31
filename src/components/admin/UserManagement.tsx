import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { User, Shield, ShieldCheck } from 'lucide-react';

interface UserProfile {
  id: string;
  full_name: string | null;
  phone: string | null;
  created_at: string;
  role?: string;
}

export default function UserManagement() {
  const { toast } = useToast();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      // First get all profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // Then get user roles
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');

      if (rolesError) throw rolesError;

      // Combine the data
      const usersWithRoles = profiles?.map(profile => {
        const userRole = roles?.find(role => role.user_id === profile.id);
        return {
          ...profile,
          role: userRole?.role || 'user'
        };
      }) || [];

      setUsers(usersWithRoles);
    } catch (error) {
      console.error('Error loading users:', error);
      toast({
        title: "Fehler",
        description: "Benutzer konnten nicht geladen werden",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId: string, newRole: 'admin' | 'user') => {
    try {
      const { data, error } = await supabase.functions.invoke('update-user-role', {
        body: {
          userId,
          role: newRole
        }
      });

      if (error) {
        throw new Error(error.message || 'Failed to update role');
      }

      if (!data.success) {
        throw new Error(data.error || 'Failed to update role');
      }

      toast({
        title: "Rolle aktualisiert",
        description: `Benutzer wurde erfolgreich zum ${newRole === 'admin' ? 'Administrator' : 'Benutzer'} gemacht.`,
      });

      // Reload users to show updated data
      loadUsers();
    } catch (error) {
      console.error('Error updating user role:', error);
      toast({
        title: "Fehler",
        description: error instanceof Error ? error.message : "Rolle konnte nicht aktualisiert werden.",
        variant: "destructive",
      });
    }
  };

  const getRoleBadge = (role: string) => {
    const variants = {
      admin: 'destructive',
      user: 'secondary',
    } as const;

    const icons = {
      admin: <ShieldCheck className="w-3 h-3 mr-1" />,
      user: <User className="w-3 h-3 mr-1" />,
    };

    return (
      <Badge variant={variants[role as keyof typeof variants] || 'secondary'} className="flex items-center">
        {icons[role as keyof typeof icons] || <Shield className="w-3 h-3 mr-1" />}
        {role === 'admin' ? 'Administrator' : 'Benutzer'}
      </Badge>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Benutzer werden geladen...</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Benutzerverwaltung ({users.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {users.map((user) => (
              <div key={user.id} className="border rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">
                        {user.full_name || 'Unbekannt'}
                      </span>
                      {getRoleBadge(user.role || 'user')}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Registriert: {new Date(user.created_at).toLocaleDateString('de-DE')}
                    </p>
                    {user.phone && (
                      <p className="text-sm text-muted-foreground">
                        Telefon: {user.phone}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Select
                      value={user.role || 'user'}
                      onValueChange={(value) => updateUserRole(user.id, value as 'admin' | 'user')}
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">Benutzer</SelectItem>
                        <SelectItem value="admin">Administrator</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="text-xs text-muted-foreground">
                  User ID: {user.id}
                </div>
              </div>
            ))}
            
            {users.length === 0 && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Keine Benutzer gefunden.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}