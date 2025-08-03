import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getToken } from '../utils/auth';

function Dashboard() {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ email: '', phone: '', password: '' });
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ email: '', phone: '' });
  const navigate = useNavigate();

  const fetchUsers = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/auth/login', {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      setUsers(res.data);
    } catch (err) {
      alert("Unauthorized or Error");
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleAddUser = async () => {
    try {
      await axios.post('http://localhost:5000/ph', form);
      setForm({ email: '', phone: '', password: '' });
      fetchUsers();
    } catch (err) {
      alert("Add Error");
    }
  };

  const handleDelete = async (id) => {
    await axios.delete(`http://localhost:5000/api/blogs/${id}`, {
      headers: { Authorization: `Bearer ${getToken()}` }
    });
    fetchUsers();
  };

  const handleEditClick = (user) => {
    setEditingId(user._id);
    setEditForm({ email: user.email, phone: user.phone });
  };

  const handleSaveEdit = async (id) => {
    try {
      await axios.put(`http://localhost:5000/api/blogs/${id}`, editForm, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      setEditingId(null);
      fetchUsers();
    } catch (err) {
      alert("Edit Error");
    }
  };

  const handleGoBack = () => {
    navigate("/pro"); // or navigate('/login')
  };

  return (
    <div style={styles.container}>
      <button style={styles.goBackButton} onClick={handleGoBack}>← Go Back</button>
      <h2 style={styles.heading}>Admin Dashboard</h2>

      <div style={styles.form}>
        <input
          style={styles.input}
          placeholder="Email"
          value={form.email}
          onChange={e => setForm({ ...form, email: e.target.value })}
        />
        <input
          style={styles.input}
          placeholder="Phone"
          value={form.phone}
          onChange={e => setForm({ ...form, phone: e.target.value })}
        />
        <input
          style={styles.input}
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={e => setForm({ ...form, password: e.target.value })}
        />
        <button style={styles.button} onClick={handleAddUser}>Add User</button>
      </div>

      <ul style={styles.userList}>
        {users.map(user => (
          <li key={user._id} style={styles.userItem}>
            {editingId === user._id ? (
              <>
                <input
                  style={styles.input}
                  value={editForm.email}
                  onChange={e => setEditForm({ ...editForm, email: e.target.value })}
                />
                <input
                  style={styles.input}
                  value={editForm.phone}
                  onChange={e => setEditForm({ ...editForm, phone: e.target.value })}
                />
                <button style={styles.saveButton} onClick={() => handleSaveEdit(user._id)}>Save</button>
                <button style={styles.cancelButton} onClick={() => setEditingId(null)}>Cancel</button>
              </>
            ) : (
              <>
                <span>{user.email} | {user.phone}</span>
                <div>
                  <button style={styles.editButton} onClick={() => handleEditClick(user)}>Edit</button>
                  <button style={styles.deleteButton} onClick={() => handleDelete(user._id)}>Delete</button>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '2rem',
    fontFamily: 'Arial, sans-serif',
    backgroundColor: '#f9f9f9',
    borderRadius: '10px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
  },
  heading: {
    textAlign: 'center',
    marginBottom: '1.5rem',
    color: '#333',
  },
  goBackButton: {
    marginBottom: '20px',
    padding: '8px 16px',
    backgroundColor: '#888',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
  form: {
    display: 'flex',
    gap: '10px',
    marginBottom: '20px',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  input: {
    padding: '10px',
    fontSize: '14px',
    border: '1px solid #ccc',
    borderRadius: '5px',
    width: '200px',
  },
  button: {
    padding: '10px 20px',
    backgroundColor: '#4CAF50',
    color: '#fff',
    fontWeight: 'bold',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
  userList: {
    listStyleType: 'none',
    padding: 0,
  },
  userItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: '10px 15px',
    marginBottom: '8px',
    borderRadius: '6px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
    flexWrap: 'wrap',
  },
  editButton: {
    backgroundColor: '#3498db',
    border: 'none',
    color: '#fff',
    padding: '5px 10px',
    marginRight: '5px',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  saveButton: {
    backgroundColor: '#2ecc71',
    border: 'none',
    color: '#fff',
    padding: '5px 10px',
    marginRight: '5px',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  cancelButton: {
    backgroundColor: '#95a5a6',
    border: 'none',
    color: '#fff',
    padding: '5px 10px',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  deleteButton: {
    backgroundColor: '#e74c3c',
    border: 'none',
    color: '#fff',
    padding: '5px 10px',
    borderRadius: '4px',
    cursor: 'pointer',
  }
};

export default Dashboard;
