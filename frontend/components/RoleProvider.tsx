'use client';

import * as React from 'react';

export type Role = 'STUDENT' | 'TEACHER' | 'PARENT' | 'ADMIN';

interface RoleContextType {
  role: Role;
  setRole: (role: Role) => void;
}

const RoleContext = React.createContext<RoleContextType | undefined>(undefined);

export function RoleProvider({ children }: { children: React.ReactNode }) {
  // In a real app, this would initialize from a JWT token or session.
  // For this anti-gravity demo, we default to ADMIN and allow switching.
  const [role, setRole] = React.useState<Role>('ADMIN');

  // We can add an effect to store the role in localStorage for persistence
  React.useEffect(() => {
    const savedRole = localStorage.getItem('demo-role') as Role;
    if (savedRole) {
      setRole(savedRole);
    }
  }, []);

  const handleSetRole = (newRole: Role) => {
    setRole(newRole);
    localStorage.setItem('demo-role', newRole);
  };

  return (
    <RoleContext.Provider value={{ role, setRole: handleSetRole }}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const context = React.useContext(RoleContext);
  if (context === undefined) {
    throw new Error('useRole must be used within a RoleProvider');
  }
  return context;
}
