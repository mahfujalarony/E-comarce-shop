import axios from 'axios';
import React from 'react';
import LoadingSpinner from '../ui/LoadingSpinner';

interface CustomersProps {
  name: string;
  email: string;
  imgUrl: string;
  createdAt: string;
  updatedAt: string;
  id: string;
}

const Customers: React.FC = () => {
  const [users, setUsers] = React.useState<CustomersProps[]>([]);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:3001/api/fetchUsers', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.status !== 200) {
        throw new Error('Failed to fetch users');
      }
      setUsers(response.data);
      console.log('Users fetched successfully:', response.data);
    } catch (error) {
      setError('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchUsers();
  }, []);

  // Message button handler (for demo)
  const handleMessage = (user: CustomersProps) => {
    alert(`Message to: ${user.name} (${user.email})`);
  };

  return (
    <div className="max-w-5xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-2">Manage Customers</h1>
      <p className="mb-6 text-gray-600">This section will allow you to manage customer information.</p>

      {loading && <LoadingSpinner message="Loading customers..." />}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      {!loading && !error && users.length === 0 && (
        <div className="text-gray-500 text-center py-10">No customers found.</div>
      )}

      {!loading && !error && users.length > 0 && (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-2 px-4 border-b text-left">#</th>
                <th className="py-2 px-4 border-b text-left">Photo</th>
                <th className="py-2 px-4 border-b text-left">Name</th>
                <th className="py-2 px-4 border-b text-left">Email</th>
                <th className="py-2 px-4 border-b text-left">Joined</th>
                <th className="py-2 px-4 border-b text-left">Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, idx) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="py-2 px-4 border-b">{idx + 1}</td>
                  <td className="py-2 px-4 border-b">
                    <img
                      src={user.imgUrl || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user.name)}
                      alt={user.name}
                      className="w-10 h-10 rounded-full object-cover border"
                    />
                  </td>
                  <td className="py-2 px-4 border-b">{user.name}</td>
                  <td className="py-2 px-4 border-b">{user.email}</td>
                  <td className="py-2 px-4 border-b">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-2 px-4 border-b">
                    <button
                      onClick={() => handleMessage(user)}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm font-medium transition"
                    >
                      Message
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Customers;