import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import AdminLayout from "@/components/admin-layout";
import { Plus, User, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function AdminUsers() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    username: "",
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    role: "user"
  });

  const { data: users, isLoading } = useQuery({
    queryKey: ["/api/users"],
  });

  const createUserMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("/api/users", "POST", newUser);
    },
    onSuccess: () => {
      toast({
        title: "User created",
        description: "New user has been created successfully",
      });
      setIsAddModalOpen(false);
      setNewUser({
        username: "",
        email: "",
        password: "",
        firstName: "",
        lastName: "",
        role: "user"
      });
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create user",
        variant: "destructive",
      });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      return apiRequest(`/api/users/${userId}`, "DELETE");
    },
    onSuccess: () => {
      toast({
        title: "User deleted",
        description: "User has been deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete user",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.username || !newUser.password) {
      toast({
        title: "Error",
        description: "Username and password are required",
        variant: "destructive",
      });
      return;
    }
    createUserMutation.mutate();
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "admin":
        return "destructive";
      case "staff":
        return "default";
      default:
        return "secondary";
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground uppercase">
              User Management
            </h1>
            <p className="text-muted-foreground">Manage system users and their permissions</p>
          </div>
          
          <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
            <DialogTrigger asChild>
              <Button className="bg-accent text-accent-foreground hover:bg-gold-600" data-testid="button-add-user">
                <Plus className="w-4 h-4 mr-2" />
                Add User
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New User</DialogTitle>
                <DialogDescription>
                  Create a new user account with login credentials
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="username">Username *</Label>
                    <Input
                      id="username"
                      value={newUser.username}
                      onChange={(e) => setNewUser(prev => ({ ...prev, username: e.target.value }))}
                      placeholder="Enter username"
                      data-testid="input-username"
                      disabled={createUserMutation.isPending}
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={newUser.email}
                      onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="Enter email"
                      data-testid="input-email"
                      disabled={createUserMutation.isPending}
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="password">Password *</Label>
                  <Input
                    id="password"
                    type="password"
                    value={newUser.password}
                    onChange={(e) => setNewUser(prev => ({ ...prev, password: e.target.value }))}
                    placeholder="Enter password"
                    data-testid="input-password"
                    disabled={createUserMutation.isPending}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={newUser.firstName}
                      onChange={(e) => setNewUser(prev => ({ ...prev, firstName: e.target.value }))}
                      placeholder="Enter first name"
                      data-testid="input-first-name"
                      disabled={createUserMutation.isPending}
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={newUser.lastName}
                      onChange={(e) => setNewUser(prev => ({ ...prev, lastName: e.target.value }))}
                      placeholder="Enter last name"
                      data-testid="input-last-name"
                      disabled={createUserMutation.isPending}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="role">Role</Label>
                  <Select value={newUser.role} onValueChange={(value) => setNewUser(prev => ({ ...prev, role: value }))}>
                    <SelectTrigger data-testid="select-role">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="staff">Staff</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsAddModalOpen(false)}
                    disabled={createUserMutation.isPending}
                    data-testid="button-cancel"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="bg-accent text-accent-foreground hover:bg-gold-600"
                    disabled={createUserMutation.isPending}
                    data-testid="button-create-user"
                  >
                    {createUserMutation.isPending ? "Creating..." : "Create User"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Users List */}
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading users...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.isArray(users) && users.map((user: any) => (
              <Card key={user.id} className="card-shadow" data-testid={`card-user-${user.id}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-accent" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg" data-testid={`text-username-${user.id}`}>
                        {user.username}
                      </CardTitle>
                      <Badge variant={getRoleBadgeVariant(user.role)} className="mt-1" data-testid={`badge-role-${user.id}`}>
                        {user.role.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  {user.firstName && user.lastName && (
                    <p className="text-sm text-muted-foreground" data-testid={`text-name-${user.id}`}>
                      {user.firstName} {user.lastName}
                    </p>
                  )}
                  {user.email && (
                    <p className="text-sm text-muted-foreground" data-testid={`text-email-${user.id}`}>
                      {user.email}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground" data-testid={`text-created-${user.id}`}>
                    Created: {new Date(user.createdAt).toLocaleDateString()}
                  </p>
                  <div className="flex items-center justify-between">
                    <Badge variant={user.isActive ? "default" : "secondary"} data-testid={`badge-status-${user.id}`}>
                      {user.isActive ? "Active" : "Inactive"}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteUserMutation.mutate(user.id)}
                      disabled={deleteUserMutation.isPending}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      data-testid={`button-delete-user-${user.id}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {Array.isArray(users) && users.length === 0 && (
          <div className="text-center py-12" data-testid="text-no-users">
            <p className="text-xl text-muted-foreground">No users found</p>
            <p className="text-muted-foreground">Add your first user to get started</p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}