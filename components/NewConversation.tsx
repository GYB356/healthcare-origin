import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'react-toastify';

interface User {
  id: string;
  name: string;
  image: string;
  role: 'doctor' | 'patient';
}

export default function NewConversation({ onConversationCreated }: { onConversationCreated: () => void }) {
  const { data: session } = useSession();
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [session?.user?.role]);

  const fetchUsers = async () => {
    try {
      const role = session?.user?.role === 'doctor' ? 'patients' : 'doctors';
      const response = await fetch(`/api/users/${role}`);
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/conversations/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          doctorId: session?.user?.role === 'doctor' ? session.user.id : selectedUserId,
          patientId: session?.user?.role === 'patient' ? session.user.id : selectedUserId,
        }),
      });

      if (!response.ok) throw new Error('Failed to create conversation');

      toast.success('Conversation created successfully');
      onConversationCreated();
      setSelectedUserId('');
    } catch (error) {
      console.error('Error creating conversation:', error);
      toast.error('Failed to create conversation');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 bg-white rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">Start New Conversation</h3>
      <div className="space-y-4">
        <div>
          <label htmlFor="user" className="block text-sm font-medium text-gray-700">
            Select {session?.user?.role === 'doctor' ? 'Patient' : 'Doctor'}
          </label>
          <select
            id="user"
            value={selectedUserId}
            onChange={(e) => setSelectedUserId(e.target.value)}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            required
          >
            <option value="">Select a {session?.user?.role === 'doctor' ? 'patient' : 'doctor'}</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          disabled={isLoading || !selectedUserId}
          className="w-full bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Creating...' : 'Start Conversation'}
        </button>
      </div>
    </form>
  );
} 