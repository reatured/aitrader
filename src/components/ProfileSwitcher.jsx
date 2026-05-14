import { useState, useEffect, useRef } from 'react';
import { ChevronDown, Check, Pencil, Trash2, Plus } from 'lucide-react';

const ProfileSwitcher = ({
  profiles,
  activeProfile,
  onSelect,
  onCreate,
  onRename,
  onDelete,
}) => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  // Close on outside click.
  useEffect(() => {
    if (!open) return;
    const handleClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  if (!activeProfile) return null;

  const meta = `${activeProfile.symbols.length} stock${activeProfile.symbols.length === 1 ? '' : 's'} · $${activeProfile.config.contribution}/wk · ${activeProfile.config.duration}`;

  const handleCreate = () => {
    const name = window.prompt('New profile name:');
    if (name && name.trim()) {
      onCreate(name.trim());
      setOpen(false);
    }
  };

  const handleRename = (profile) => {
    const name = window.prompt('Rename profile:', profile.name);
    if (name && name.trim()) {
      onRename(profile.id, name.trim());
    }
  };

  const handleDelete = (profile) => {
    if (profiles.length <= 1) return;
    if (window.confirm(`Delete profile "${profile.name}"?`)) {
      onDelete(profile.id);
    }
  };

  return (
    <div className="mb-8 relative" ref={containerRef}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-2 p-3 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors text-left"
      >
        <div className="min-w-0">
          <div className="font-bold text-gray-900 truncate">{activeProfile.name}</div>
          <div className="text-xs text-gray-500 truncate">{meta}</div>
        </div>
        <ChevronDown
          size={18}
          className={`text-gray-400 flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div className="absolute z-50 mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden animate-fade-in">
          <ul className="max-h-64 overflow-y-auto py-1">
            {profiles.map(profile => {
              const isActive = profile.id === activeProfile.id;
              return (
                <li
                  key={profile.id}
                  className={`flex items-center gap-1 px-2 py-2 group ${isActive ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
                >
                  <button
                    onClick={() => { onSelect(profile.id); setOpen(false); }}
                    className="flex items-center gap-2 flex-1 min-w-0 text-left"
                  >
                    <Check
                      size={16}
                      className={isActive ? 'text-blue-600 flex-shrink-0' : 'text-transparent flex-shrink-0'}
                    />
                    <span className={`truncate text-sm ${isActive ? 'font-semibold text-blue-700' : 'text-gray-700'}`}>
                      {profile.name}
                    </span>
                  </button>
                  <button
                    onClick={() => handleRename(profile)}
                    className="p-1 rounded text-gray-400 hover:text-blue-600 hover:bg-gray-100 transition-colors"
                    title={`Rename ${profile.name}`}
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(profile)}
                    disabled={profiles.length <= 1}
                    className="p-1 rounded text-gray-400 hover:text-red-600 hover:bg-gray-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:text-gray-400 disabled:hover:bg-transparent"
                    title={profiles.length <= 1 ? 'Cannot delete the last profile' : `Delete ${profile.name}`}
                  >
                    <Trash2 size={14} />
                  </button>
                </li>
              );
            })}
          </ul>
          <button
            onClick={handleCreate}
            className="w-full flex items-center gap-2 px-3 py-2.5 text-sm font-medium text-blue-600 border-t border-gray-100 hover:bg-blue-50 transition-colors"
          >
            <Plus size={16} />
            New profile
          </button>
        </div>
      )}
    </div>
  );
};

export default ProfileSwitcher;
