
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Shield, UserCog, Eye, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface UserRole {
  id: string;
  user_id: string;
  role: 'admin' | 'moderator' | 'user';
  created_at: string;
  profiles?: {
    full_name: string;
    username: string;
  };
}

const ROLE_COLORS = {
  admin: 'bg-red-100 text-red-800',
  moderator: 'bg-blue-100 text-blue-800',
  user: 'bg-green-100 text-green-800'
};

const ROLE_PERMISSIONS = {
  admin: ['manage_users', 'manage_prompts', 'view_analytics', 'manage_system'],
  moderator: ['manage_prompts', 'view_analytics', 'moderate_content'],
  user: ['create_prompts', 'view_prompts']
};

export const UserRoleManager: React.FC = () => {
  const [users, setUsers] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState<string>('');

  const fetchUsers = async () => {
    try {
      // Mock data for now - will be replaced with actual Supabase calls once types are updated
      const mockUsers: UserRole[] = [
        {
          id: '1',
          user_id: 'user-1',
          role: 'admin',
          created_at: new Date().toISOString(),
          profiles: {
            full_name: 'John Admin',
            username: 'johnadmin'
          }
        },
        {
          id: '2',
          user_id: 'user-2',
          role: 'moderator',
          created_at: new Date().toISOString(),
          profiles: {
            full_name: 'Jane Moderator',
            username: 'janemoderator'
          }
        },
        {
          id: '3',
          user_id: 'user-3',
          role: 'user',
          created_at: new Date().toISOString(),
          profiles: {
            full_name: 'Bob User',
            username: 'bobuser'
          }
        }
      ];
      
      setUsers(mockUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId: string, newRole: string) => {
    try {
      // Mock update - will be replaced with actual Supabase calls
      setUsers(prevUsers =>
        prevUsers.map(user =>
          user.user_id === userId
            ? { ...user, role: newRole as 'admin' | 'moderator' | 'user' }
            : user
        )
      );
      
      toast.success('User role updated successfully');
    } catch (error) {
      console.error('Error updating user role:', error);
      toast.error('Failed to update user role');
    }
  };

  const removeUser = async (userId: string) => {
    try {
      // Mock removal - will be replaced with actual Supabase calls
      setUsers(prevUsers => prevUsers.filter(user => user.user_id !== userId));
      toast.success('User removed successfully');
    } catch (error) {
      console.error('Error removing user:', error);
      toast.error('Failed to remove user');
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <UserCog className="w-5 h-5 mr-2" />
          User Role Management
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Quick Role Assignment */}
          <div className="flex gap-4 p-4 bg-gray-50 rounded-lg">
            <Select value={selectedUserId} onValueChange={setSelectedUserId}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Select user" />
              </SelectTrigger>
              <SelectContent>
                {users.map((user) => (
                  <SelectItem key={user.user_id} value={user.user_id}>
                    {user.profiles?.full_name || user.profiles?.username || user.user_id}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="moderator">Moderator</SelectItem>
                <SelectItem value="user">User</SelectItem>
              </SelectContent>
            </Select>
            
            <Button 
              onClick={() => {
                if (selectedUserId && selectedRole) {
                  updateUserRole(selectedUserId, selectedRole);
                  setSelectedUserId('');
                  setSelectedRole('');
                }
              }}
              disabled={!selectedUserId || !selectedRole}
            >
              Update Role
            </Button>
          </div>

          {/* Users Table */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Permissions</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">
                        {user.profiles?.full_name || 'Unknown User'}
                      </div>
                      <div className="text-sm text-gray-500">
                        @{user.profiles?.username || user.user_id.slice(0, 8)}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={ROLE_COLORS[user.role]}>
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {ROLE_PERMISSIONS[user.role].slice(0, 2).map((permission) => (
                        <Badge key={permission} variant="outline" className="text-xs">
                          {permission.replace('_', ' ')}
                        </Badge>
                      ))}
                      {ROLE_PERMISSIONS[user.role].length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{ROLE_PERMISSIONS[user.role].length - 2} more
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {new Date(user.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => removeUser(user.user_id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
