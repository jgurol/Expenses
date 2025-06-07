
import { supabase } from '@/integrations/supabase/client';

export const createDefaultUser = async () => {
  try {
    const { data, error } = await supabase.functions.invoke('create-user', {
      body: {
        email: 'jim@californiatelecom.com',
        password: 'Roadster7!',
        firstName: 'Jim',
        lastName: 'Gurol',
        roles: ['admin'] // Making Jim an admin so he can manage other users
      }
    });

    if (error) {
      console.error('Error creating default user:', error);
      return { success: false, error };
    }

    console.log('Default user created successfully:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Error creating default user:', error);
    return { success: false, error };
  }
};
