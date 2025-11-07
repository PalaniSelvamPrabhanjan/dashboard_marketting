import { User, LayoutDashboard, FileText, Image, Calendar, Video, Palette, Bell, Settings, LogOut } from 'lucide-react';

interface SidebarProps {
  activeItem: string;
  onItemClick: (item: string) => void;
}

export function Sidebar({ activeItem, onItemClick }: SidebarProps) {
  const menuItems = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'post-draft', label: 'Post Draft', icon: FileText },
    { id: 'image-formatter', label: 'Image Formatter', icon: Image },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'video-editor', label: 'Video Editor', icon: Video },
    { id: 'theme', label: 'Theme', icon: Palette },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="w-64 bg-white h-screen fixed left-0 top-0 shadow-lg flex flex-col">
      <div className="p-6 border-b border-gray-100">
        <h1 className="text-2xl font-bold text-gray-800">Social Desk</h1>
        <p className="text-sm text-gray-500 mt-1">Analytics Platform</p>
      </div>

      <nav className="flex-1 py-6">
        <ul className="space-y-1 px-3">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeItem === item.id;

            return (
              <li key={item.id}>
                <button
                  onClick={() => onItemClick(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Icon size={20} />
                  <span className="font-medium">{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-3 border-t border-gray-100">
        <button
          onClick={() => onItemClick('logout')}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-all"
        >
          <LogOut size={20} />
          <span className="font-medium">Log Out</span>
        </button>
      </div>
    </div>
  );
}
