import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Edit, Trash2, Users, Loader2, Mail, Home, Key, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUserManagement, UserProfile } from '@/hooks/useUserManagement';
import { ProtectedRoute } from '@/components/ProtectedRoute';

const UserManagement = () => {
  const navigate = useNavigate();
  const { 
    users, 
    isLoading, 
    createUser, 
    updateUserRoles, 
    updateUserProfile, 
    deleteUser, 
    sendTempPassword, 
    setUserPassword, 
    isCreating, 
    isUpdating, 
    isUpdatingProfile, 
    isDeleting, 
    isSendingTempPassword, 
    isSettingPassword 
  } = useUserManagement();
  
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [timezoneDialogOpen, setTimezoneDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);

  // Create user form state
  const [newUser, setNewUser] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    timezone: 'UTC',
    roles: [] as string[]
  });

  // Edit user roles state
  const [editRoles, setEditRoles] = useState<string[]>([]);

  // Set password state
  const [newPassword, setNewPassword] = useState('');

  // Timezone state
  const [selectedTimezone, setSelectedTimezone] = useState('UTC');

  const roleOptions = ['admin', 'bookkeeper', 'classifier'];
  
  // Common timezones
  const timezoneOptions = [
    'UTC',
    'America/New_York',
    'America/Chicago',
    'America/Denver',
    'America/Los_Angeles',
    'Europe/London',
    'Europe/Paris',
    'Europe/Berlin',
    'Asia/Tokyo',
    'Asia/Shanghai',
    'Australia/Sydney'
  ];

  const handleCreateUser = () => {
    createUser(newUser);
    setCreateDialogOpen(false);
    setNewUser({ email: '', password: '', firstName: '', lastName: '', timezone: 'UTC', roles: [] });
  };

  const handleEditUser = (user: UserProfile) => {
    setSelectedUser(user);
    setEditRoles(user.roles);
    setEditDialogOpen(true);
  };

  const handleUpdateRoles = () => {
    if (selectedUser) {
      updateUserRoles({ userId: selectedUser.id, roles: editRoles });
      setEditDialogOpen(false);
      setSelectedUser(null);
      setEditRoles([]);
    }
  };

  const handleEditTimezone = (user: UserProfile) => {
    setSelectedUser(user);
    setSelectedTimezone(user.timezone || 'UTC');
    setTimezoneDialogOpen(true);
  };

  const handleUpdateTimezone = () => {
    if (selectedUser) {
      updateUserProfile({ userId: selectedUser.id, timezone: selectedTimezone });
      setTimezoneDialogOpen(false);
      setSelectedUser(null);
      setSelectedTimezone('UTC');
    }
  };

  const handleDeleteUser = (userId: string) => {
    if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      deleteUser(userId);
    }
  };

  const handleSendTempPassword = (user: UserProfile) => {
    if (confirm(`Are you sure you want to send a temporary password to ${user.email}?`)) {
      sendTempPassword({ email: user.email });
    }
  };

  const handleSetPassword = (user: UserProfile) => {
    setSelectedUser(user);
    setNewPassword('');
    setPasswordDialogOpen(true);
  };

  const handleUpdatePassword = () => {
    if (selectedUser && newPassword) {
      setUserPassword({ userId: selectedUser.id, password: newPassword });
      setPasswordDialogOpen(false);
      setSelectedUser(null);
      setNewPassword('');
    }
  };

  const toggleRole = (role: string, isCreating: boolean = false) => {
    if (isCreating) {
      setNewUser(prev => ({
        ...prev,
        roles: prev.roles.includes(role)
          ? prev.roles.filter(r => r !== role)
          : [...prev.roles, role]
      }));
    } else {
      setEditRoles(prev =>
        prev.includes(role)
          ? prev.filter(r => r !== role)
          : [...prev, role]
      );
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin': return 'destructive';
      case 'bookkeeper': return 'default';
      case 'classifier': return 'secondary';
      default: return 'outline';
    }
  };

  return (
    <ProtectedRoute requiredRoles={['admin']}>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={() => navigate("/")}
                className="flex items-center gap-2"
              >
                <Home className="h-4 w-4" />
                Home
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-slate-900">User Management</h1>
                <p className="text-slate-600">Manage users and their roles</p>
              </div>
            </div>
            
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Create User
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New User</DialogTitle>
                  <DialogDescription>
                    Create a new user account with specific roles
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        value={newUser.firstName}
                        onChange={(e) => setNewUser(prev => ({ ...prev, firstName: e.target.value }))}
                        placeholder="John"
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        value={newUser.lastName}
                        onChange={(e) => setNewUser(prev => ({ ...prev, lastName: e.target.value }))}
                        placeholder="Doe"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={newUser.email}
                      onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="john.doe@example.com"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={newUser.password}
                      onChange={(e) => setNewUser(prev => ({ ...prev, password: e.target.value }))}
                      placeholder="Enter password"
                    />
                  </div>

                  <div>
                    <Label htmlFor="timezone">Timezone</Label>
                    <Select value={newUser.timezone} onValueChange={(value) => setNewUser(prev => ({ ...prev, timezone: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select timezone" />
                      </SelectTrigger>
                      <SelectContent>
                        {timezoneOptions.map(timezone => (
                          <SelectItem key={timezone} value={timezone}>
                            {timezone}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label>Roles</Label>
                    <div className="flex flex-col gap-2 mt-2">
                      {roleOptions.map(role => (
                        <div key={role} className="flex items-center space-x-2">
                          <Checkbox
                            id={`role-${role}`}
                            checked={newUser.roles.includes(role)}
                            onCheckedChange={() => toggleRole(role, true)}
                          />
                          <Label htmlFor={`role-${role}`} className="capitalize">{role}</Label>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button onClick={handleCreateUser} disabled={isCreating} className="flex-1">
                      {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Create User
                    </Button>
                    <Button variant="outline" onClick={() => setCreateDialogOpen(false)} className="flex-1">
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Users ({users.length})
              </CardTitle>
              <CardDescription>
                Manage user accounts and permissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin mr-2" />
                  <span>Loading users...</span>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Timezone</TableHead>
                      <TableHead>Roles</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">
                          {user.first_name} {user.last_name}
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{user.timezone || 'UTC'}</TableCell>
                        <TableCell>
                          <div className="flex gap-1 flex-wrap">
                            {user.roles.map(role => (
                              <Badge key={role} variant={getRoleBadgeVariant(role)} className="text-xs">
                                {role}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          {new Date(user.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-2 justify-end">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditUser(user)}
                              title="Edit roles"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditTimezone(user)}
                              title="Edit timezone"
                            >
                              <Clock className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleSetPassword(user)}
                              title="Set password"
                            >
                              <Key className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleSendTempPassword(user)}
                              disabled={isSendingTempPassword}
                              title="Send temporary password"
                            >
                              <Mail className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteUser(user.id)}
                              disabled={isDeleting}
                              title="Delete user"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Edit User Roles Dialog */}
          <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit User Roles</DialogTitle>
                <DialogDescription>
                  Update roles for {selectedUser?.first_name} {selectedUser?.last_name}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Roles</Label>
                  <div className="flex flex-col gap-2 mt-2">
                    {roleOptions.map(role => (
                      <div key={role} className="flex items-center space-x-2">
                        <Checkbox
                          id={`edit-role-${role}`}
                          checked={editRoles.includes(role)}
                          onCheckedChange={() => toggleRole(role, false)}
                        />
                        <Label htmlFor={`edit-role-${role}`} className="capitalize">{role}</Label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button onClick={handleUpdateRoles} disabled={isUpdating} className="flex-1">
                    {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Update Roles
                  </Button>
                  <Button variant="outline" onClick={() => setEditDialogOpen(false)} className="flex-1">
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Edit Timezone Dialog */}
          <Dialog open={timezoneDialogOpen} onOpenChange={setTimezoneDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit User Timezone</DialogTitle>
                <DialogDescription>
                  Update timezone for {selectedUser?.first_name} {selectedUser?.last_name}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="editTimezone">Timezone</Label>
                  <Select value={selectedTimezone} onValueChange={setSelectedTimezone}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select timezone" />
                    </SelectTrigger>
                    <SelectContent>
                      {timezoneOptions.map(timezone => (
                        <SelectItem key={timezone} value={timezone}>
                          {timezone}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex gap-2">
                  <Button onClick={handleUpdateTimezone} disabled={isUpdatingProfile} className="flex-1">
                    {isUpdatingProfile && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Update Timezone
                  </Button>
                  <Button variant="outline" onClick={() => setTimezoneDialogOpen(false)} className="flex-1">
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Set Password Dialog */}
          <Dialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Set User Password</DialogTitle>
                <DialogDescription>
                  Set a new password for {selectedUser?.first_name} {selectedUser?.last_name}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                  />
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    onClick={handleUpdatePassword} 
                    disabled={isSettingPassword || !newPassword} 
                    className="flex-1"
                  >
                    {isSettingPassword && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Set Password
                  </Button>
                  <Button variant="outline" onClick={() => setPasswordDialogOpen(false)} className="flex-1">
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default UserManagement;
