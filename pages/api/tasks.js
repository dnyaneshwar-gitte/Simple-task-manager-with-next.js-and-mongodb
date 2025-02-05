import { connectDB } from '/lib/mongodb';
import Task from '/models/Task'; 
export default async function handler(req, res) {
  await connectDB();

  if (req.method === 'GET') {
   
    const tasks = await Task.find();
    res.status(200).json(tasks);
  } else if (req.method === 'POST') {
   
    const { title, description, dueDate } = req.body;

    if (!title || !description || !dueDate) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    try {
      const newTask = new Task({ title, description, dueDate });
      await newTask.save();
      res.status(201).json(newTask);
    } catch (error) {
      console.error('Error saving task:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  } else if (req.method === 'PUT') {
    
    const { id, isComplete } = req.body;

    try {
      const task = await Task.findByIdAndUpdate(id, { isComplete }, { new: true });
      res.status(200).json(task);
    } catch (error) {
      console.error('Error updating task:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  } else if (req.method === 'DELETE') {
   
    const { id } = req.body;

    try {
      await Task.findByIdAndDelete(id);
      res.status(200).json({ message: 'Task deleted successfully' });
    } catch (error) {
      console.error('Error deleting task:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
}
