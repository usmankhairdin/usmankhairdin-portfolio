import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Search, X, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CreateGroupModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const mockUsers = [
  {
    id: "1",
    name: "Sarah Johnson",
    username: "@sarah_runner",
    avatar: "https://i.pravatar.cc/150?img=1",
    sport: "Marathon Runner"
  },
  {
    id: "2", 
    name: "Mike Chen",
    username: "@mike_cyclist",
    avatar: "https://i.pravatar.cc/150?img=2",
    sport: "Cyclist"
  },
  {
    id: "3",
    name: "Emma Wilson",
    username: "@emma_tri",
    avatar: "https://i.pravatar.cc/150?img=3",
    sport: "Triathlete"
  },
  {
    id: "4",
    name: "Alex Rivera",
    username: "@alex_swim", 
    avatar: "https://i.pravatar.cc/150?img=4",
    sport: "Swimmer"
  }
];

export const CreateGroupModal = ({ open, onOpenChange }: CreateGroupModalProps) => {
  const [groupName, setGroupName] = useState("");
  const [description, setDescription] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [selectedUsers, setSelectedUsers] = useState<typeof mockUsers>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  const filteredUsers = mockUsers.filter(user => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.sport.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddUser = (user: typeof mockUsers[0]) => {
    if (!selectedUsers.find(u => u.id === user.id)) {
      setSelectedUsers([...selectedUsers, user]);
    }
  };

  const handleRemoveUser = (userId: string) => {
    setSelectedUsers(selectedUsers.filter(u => u.id !== userId));
  };

  const handleCreateGroup = () => {
    if (!groupName.trim()) {
      toast({
        title: "Group name required",
        description: "Please enter a name for your group.",
        variant: "destructive"
      });
      return;
    }

    if (!description.trim()) {
      toast({
        title: "Description required", 
        description: "Please enter a description for your group.",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Group created successfully!",
      description: `"${groupName}" has been created with ${selectedUsers.length} members.`
    });

    // Reset form
    setGroupName("");
    setDescription("");
    setIsPublic(true);
    setSelectedUsers([]);
    setSearchQuery("");
    onOpenChange(false);
  };

  const handleClose = () => {
    setGroupName("");
    setDescription("");
    setIsPublic(true);
    setSelectedUsers([]);
    setSearchQuery("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Plus className="mr-2" size={20} />
            Create New Group
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Group Name */}
          <div className="space-y-2">
            <Label htmlFor="groupName">Group Name</Label>
            <Input
              id="groupName"
              placeholder="e.g. Vegan Athletes, Marathon Runners, Gluten-Free Nutrition"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe what your group is about, goals, and what members can expect..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          {/* Privacy Setting */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="space-y-1">
              <Label className="text-base font-medium">
                {isPublic ? "Public Group" : "Private Group"}
              </Label>
              <p className="text-sm text-gray-600">
                {isPublic 
                  ? "Anyone can find and join this group" 
                  : "Only invited members can join this group"
                }
              </p>
            </div>
            <Switch
              checked={isPublic}
              onCheckedChange={setIsPublic}
            />
          </div>

          {/* Add Members */}
          <div className="space-y-4">
            <Label className="text-base font-medium">Add Members (Optional)</Label>
            
            {/* Selected Members */}
            {selectedUsers.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm text-gray-600">Selected Members ({selectedUsers.length})</Label>
                <div className="flex flex-wrap gap-2">
                  {selectedUsers.map(user => (
                    <Badge key={user.id} variant="secondary" className="flex items-center gap-2 px-3 py-1">
                      <Avatar className="h-5 w-5">
                        <img src={user.avatar} alt={user.name} />
                      </Avatar>
                      <span>{user.name}</span>
                      <X 
                        size={14} 
                        className="cursor-pointer hover:text-red-500" 
                        onClick={() => handleRemoveUser(user.id)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Search Users */}
            <div className="space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <Input
                  placeholder="Search athletes to add..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* User Results */}
              <div className="max-h-48 overflow-y-auto space-y-2">
                {filteredUsers
                  .filter(user => !selectedUsers.find(u => u.id === user.id))
                  .map(user => (
                    <div 
                      key={user.id} 
                      className="flex items-center justify-between p-3 bg-white border rounded-lg hover:bg-gray-50 cursor-pointer"
                      onClick={() => handleAddUser(user)}
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <img src={user.avatar} alt={user.name} />
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm">{user.name}</p>
                          <p className="text-xs text-gray-600">{user.username} • {user.sport}</p>
                        </div>
                      </div>
                      <Button size="sm" variant="outline">
                        Add
                      </Button>
                    </div>
                  ))}
                
                {filteredUsers.filter(user => !selectedUsers.find(u => u.id === user.id)).length === 0 && searchQuery && (
                  <p className="text-center text-gray-500 py-4">No users found</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleCreateGroup}
            className="bg-szalty-blue text-white"
          >
            Create Group
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};