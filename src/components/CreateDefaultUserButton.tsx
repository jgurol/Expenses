
import React from 'react';
import { Button } from '@/components/ui/button';
import { createDefaultUser } from '@/utils/createDefaultUser';
import { toast } from '@/hooks/use-toast';
import { UserPlus } from 'lucide-react';

export const CreateDefaultUserButton = () => {
  const handleCreateUser = async () => {
    const result = await createDefaultUser();
    
    if (result.success) {
      toast({
        title: 'Success',
        description: 'Default admin user jim@gurol.net created successfully',
      });
    } else {
      toast({
        title: 'Error',
        description: result.error?.message || 'Failed to create default user',
        variant: 'destructive',
      });
    }
  };

  return (
    <Button
      onClick={handleCreateUser}
      variant="outline"
      className="flex items-center gap-2"
    >
      <UserPlus className="h-4 w-4" />
      Create Admin User (jim@gurol.net)
    </Button>
  );
};
