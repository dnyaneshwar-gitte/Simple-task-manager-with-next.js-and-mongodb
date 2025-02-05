import { useState, useEffect } from 'react';

const Home = () => {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState({ title: '', description: '', dueDate: '', completed: false });
  const [message, setMessage] = useState('');
  const [isEdit, setIsEdit] = useState(false);
  const [editTaskId, setEditTaskId] = useState(null);

  useEffect(() => {
    const fetchTasks = async () => {
      const res = await fetch('/api/tasks');
      const data = await res.json();
      setTasks(data);
    };
    fetchTasks();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/tasks', {
        method: isEdit ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(isEdit ? { ...newTask, id: editTaskId } : newTask),
      });

      const data = await res.json();
      if (res.ok) {
        setTasks((prevTasks) => 
          isEdit ? prevTasks.map((task) => (task._id === editTaskId ? data : task)) : [...prevTasks, data]
        );
        setMessage(`Task "${data.title}" ${isEdit ? 'updated' : 'added'} successfully!`);
        setNewTask({ title: '', description: '', dueDate: '', completed: false });
        setIsEdit(false);
        setEditTaskId(null);
      } else {
        setMessage(data.message || 'Error submitting the task');
      }
    } catch (error) {
      setMessage('Error submitting the task');
    }
  };

  const handleUpdate = (id) => {
    const taskToEdit = tasks.find((task) => task._id === id);
    setNewTask({ title: taskToEdit.title, description: taskToEdit.description, dueDate: taskToEdit.dueDate, completed: taskToEdit.completed });
    setIsEdit(true);
    setEditTaskId(id);
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch('/api/tasks', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        setMessage('Task deleted successfully');
        setTasks((prev) => prev.filter((task) => task._id !== id));
      } else {
        setMessage('Error deleting task');
      }
    } catch (error) {
      setMessage('Error deleting task');
    }
  };

  const toggleCompletion = async (id) => {
    try {
      const task = tasks.find((t) => t._id === id);
      const updatedTask = { ...task, completed: !task.completed };
      const res = await fetch('/api/tasks', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedTask),
      });
      if (res.ok) {
        setTasks((prev) => prev.map((t) => (t._id === id ? updatedTask : t)));
      } else {
        setMessage('Error updating task status');
      }
    } catch (error) {
      setMessage('Error updating task status');
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: 'auto', padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ textAlign: 'center', color: '#333' }}>Task Manager</h1>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
        <input type="text" placeholder="Title" value={newTask.title} onChange={(e) => setNewTask({ ...newTask, title: e.target.value })} required style={{ padding: '8px' }} />
        <textarea placeholder="Description" value={newTask.description} onChange={(e) => setNewTask({ ...newTask, description: e.target.value })} required style={{ padding: '8px' }} />
        <input type="date" value={newTask.dueDate} onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })} required style={{ padding: '8px' }} />
        <button type="submit" style={{ padding: '10px', backgroundColor: '#007bff', color: 'white', border: 'none', cursor: 'pointer' }}>{isEdit ? 'Update Task' : 'Add Task'}</button>
      </form>

      {message && <p style={{ textAlign: 'center', color: 'green' }}>{message}</p>}

      <ul style={{ listStyle: 'none', padding: 0 }}>
        {tasks.map((task) => (
          <li key={task._id} style={{ padding: '10px', marginBottom: '10px', border: '1px solid #ccc', borderRadius: '5px' }}>
            <h3>{task.title}</h3>
            <p>{task.description}</p>
            <p>Due: {new Date(task.dueDate).toLocaleDateString()}</p>
            <p>Status: {task.completed ? '✅ Completed' : '❌ Incomplete'}</p>
            <button onClick={() => toggleCompletion(task._id)} style={{ marginRight: '10px', padding: '5px', cursor: 'pointer' }}>
              {task.completed ? 'Mark Incomplete' : 'Mark Complete'}
            </button>
            <button onClick={() => handleUpdate(task._id)} style={{ marginRight: '10px', padding: '5px', cursor: 'pointer' }}>Edit</button>
            <button onClick={() => handleDelete(task._id)} style={{ padding: '5px', cursor: 'pointer', backgroundColor: 'red', color: 'white' }}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Home;
