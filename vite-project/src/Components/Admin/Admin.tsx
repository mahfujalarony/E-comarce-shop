import { useState, useEffect } from 'react';
import { 
  Menu, 
  X, 
  Home, 
  Package, 
  ShoppingCart, 
  Users, 
  BarChart3, 
  Settings, 
  Bell,
  Search,
  User,
  LogOut,
  ChevronDown,
  TrendingUp,
  DollarSign,
  Package2
} from 'lucide-react';

const Admin = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  // Sample data - পরে real API থেকে data আনতে পারবেন
  const stats = [
    {
      title: 'Total Sales',
      value: '৳২,৩৪,৫৬৭',
      change: '+১২.৫%',
      icon: DollarSign,
      color: 'bg-green-500'
    },
    {
      title: 'Orders',
      value: '১,২৩৪',
      change: '+৮.৭%',
      icon: ShoppingCart,
      color: 'bg-blue-500'
    },
    {
      title: 'Products',
      value: '৫৬৭',
      change: '+৩.২%',
      icon: Package2,
      color: 'bg-purple-500'
    },
    {
      title: 'Customers',
      value: '৮৯০',
      change: '+১৫.৩%',
      icon: Users,
      color: 'bg-orange-500'
    }
  ];

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'orders', label: 'Orders', icon: ShoppingCart },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setProfileDropdownOpen(false);
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
              {stats.map((stat, index) => (
                <div key={index} className="bg-white rounded-lg shadow-sm border p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                      <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                      <p className="text-sm text-green-600 flex items-center mt-1">
                        <TrendingUp className="h-4 w-4 mr-1" />
                        {stat.change}
                      </p>
                    </div>
                    <div className={`${stat.color} p-3 rounded-lg`}>
                      <stat.icon className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Charts and Tables Section */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 lg:gap-6">
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Orders</h3>
                <div className="space-y-4">
                  {[1, 2, 3, 4].map((item) => (
                    <div key={item} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                          <Package className="h-5 w-5 text-gray-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">Order #100{item}</p>
                          <p className="text-sm text-gray-500">Customer {item}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">৳{item * 1000}</p>
                        <p className="text-sm text-green-600">Completed</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Products</h3>
                <div className="space-y-4">
                  {[1, 2, 3, 4].map((item) => (
                    <div key={item} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Package2 className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">Product {item}</p>
                          <p className="text-sm text-gray-500">{item * 10} sold</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">৳{item * 500}</p>
                        <p className="text-sm text-gray-500">Revenue</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      
      default:
        return (
          <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {menuItems.find(item => item.id === activeTab)?.label} Component
              </h3>
              <p className="text-gray-600 mb-4">
                এখানে আপনার {menuItems.find(item => item.id === activeTab)?.label} component render হবে।
              </p>
              <div className="bg-gray-50 rounded-lg p-4 text-left">
                <code className="text-sm text-gray-700">
                  {`// Example import:\n// import ${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}Component from './components/${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}Component';\n\n// Then render it here:\n// <${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}Component />`}
                </code>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0 transition-transform duration-300 ease-in-out lg:relative lg:flex lg:flex-col`}>
        
        {/* Logo */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Package className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">Admin Panel</span>
          </div>
          <button 
            className="lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-6 w-6 text-gray-500" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="mt-6 px-4">
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => {
                    setActiveTab(item.id);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                    activeTab === item.id
                      ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-0 lg:ml-0 overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm border-b px-4 lg:px-6 py-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                className="lg:hidden"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-6 w-6 text-gray-600" />
              </button>
              
              <h1 className="text-2xl font-bold text-gray-900">
                {menuItems.find(item => item.id === activeTab)?.label || 'Dashboard'}
              </h1>
            </div>

            <div className="flex items-center space-x-4">
              {/* Search */}
              <div className="hidden md:flex relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Notifications */}
              <button className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              {/* Profile Dropdown */}
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setProfileDropdownOpen(!profileDropdownOpen);
                  }}
                  className="flex items-center space-x-2 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
                >
                  <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4" />
                  </div>
                  <span className="hidden md:block font-medium">Admin</span>
                  <ChevronDown className="h-4 w-4" />
                </button>

                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border py-2 z-50">
                    <a href="#" className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-50">
                      <User className="h-4 w-4" />
                      <span>Profile</span>
                    </a>
                    <a href="#" className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-50">
                      <Settings className="h-4 w-4" />
                      <span>Settings</span>
                    </a>
                    <hr className="my-2" />
                    <a href="#" className="flex items-center space-x-2 px-4 py-2 text-red-600 hover:bg-red-50">
                      <LogOut className="h-4 w-4" />
                      <span>Logout</span>
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-6 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Admin;