import type { RoleDefinition } from '../types';
import { useTheme } from '../contexts/ThemeContext';
import './RoleSelection.css';

interface RoleSelectionProps {
  roles: RoleDefinition[];
  selectedRoleId: string | null;
  onRoleSelect: (roleId: string | null) => void;
}

export function RoleSelection({ roles, selectedRoleId, onRoleSelect }: RoleSelectionProps) {
  const { theme } = useTheme();
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const roleId = e.target.value;
    onRoleSelect(roleId === '' ? null : roleId);
  };

  return (
    <div className={`role-selection-container ${theme}`}>
      <label htmlFor="role-select" className="role-selection-label">
        Choose Your Target Role
      </label>
      <select
        id="role-select"
        value={selectedRoleId || ''}
        onChange={handleChange}
        className="role-select"
      >
        <option value="">Select a role...</option>
        {roles.map(role => (
          <option key={role.id} value={role.id}>
            {role.name}
          </option>
        ))}
      </select>
    </div>
  );
}

