const Task = require("../models/Task");
const User = require("../models/User");

async function createTask(req, res) {
  try {
    const { title, description, assignedTo, dueDate } = req.body;

    if (!title || !assignedTo) {
      return res.status(400).json({ message: "title and assignedTo are required." });
    }

    const assignee = await User.findById(assignedTo).lean();
    if (!assignee) {
      return res.status(404).json({ message: "Assigned user not found." });
    }

    const task = await Task.create({
      title,
      description: description || "",
      assignedTo,
      createdBy: req.user.userId,
      dueDate: dueDate || null,
    });

    const populated = await Task.findById(task._id)
      .populate("assignedTo", "name email")
      .populate("createdBy", "name email")
      .lean();

    return res.status(201).json({ task: formatTask(populated) });
  } catch (err) {
    console.error("[task.controller] createTask:", err);
    return res.status(500).json({ message: "Internal server error." });
  }
}

async function getTasks(req, res) {
  try {
    const isAdmin = req.user.role === "ADMIN";
    const filter = isAdmin ? {} : { assignedTo: req.user.userId };

    const tasks = await Task.find(filter)
      .populate("assignedTo", "name email")
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({ tasks: tasks.map(formatTask) });
  } catch (err) {
    console.error("[task.controller] getTasks:", err);
    return res.status(500).json({ message: "Internal server error." });
  }
}

async function updateTask(req, res) {
  try {
    const { id } = req.params;
    const { status, title, description, dueDate } = req.body;

    const task = await Task.findById(id).lean();
    if (!task) {
      return res.status(404).json({ message: "Task not found." });
    }

    const isAdmin = req.user.role === "ADMIN";
    const isAssignee = String(task.assignedTo) === req.user.userId;

    if (!isAdmin && !isAssignee) {
      return res.status(403).json({ message: "You are not authorized to update this task." });
    }

    const updatePayload = {};
    if (status !== undefined) {
      if (!["todo", "in-progress", "done"].includes(status)) {
        return res.status(400).json({ message: "Invalid status value." });
      }
      updatePayload.status = status;
    }
    if (isAdmin) {
      if (title !== undefined) updatePayload.title = title;
      if (description !== undefined) updatePayload.description = description;
      if (dueDate !== undefined) updatePayload.dueDate = dueDate;
    }

    const updated = await Task.findByIdAndUpdate(id, updatePayload, { new: true })
      .populate("assignedTo", "name email")
      .populate("createdBy", "name email")
      .lean();

    return res.status(200).json({ task: formatTask(updated) });
  } catch (err) {
    console.error("[task.controller] updateTask:", err);
    return res.status(500).json({ message: "Internal server error." });
  }
}

async function getTaskStats(req, res) {
  try {
    const isAdmin = req.user.role === "ADMIN";
    const filter = isAdmin ? {} : { assignedTo: req.user.userId };

    const now = new Date();

    const [total, completed, overdue] = await Promise.all([
      Task.countDocuments(filter),
      Task.countDocuments({ ...filter, status: "done" }),
      Task.countDocuments({ ...filter, dueDate: { $lt: now }, status: { $ne: "done" } }),
    ]);

    return res.status(200).json({ total, completed, overdue });
  } catch (err) {
    console.error("[task.controller] getTaskStats:", err);
    return res.status(500).json({ message: "Internal server error." });
  }
}

function formatTask(task) {
  return {
    id: String(task._id),
    title: task.title,
    description: task.description,
    status: task.status,
    dueDate: task.dueDate,
    assignedTo: task.assignedTo
      ? { id: String(task.assignedTo._id), name: task.assignedTo.name, email: task.assignedTo.email }
      : null,
    createdBy: task.createdBy
      ? { id: String(task.createdBy._id), name: task.createdBy.name, email: task.createdBy.email }
      : null,
    createdAt: task.createdAt,
    updatedAt: task.updatedAt,
  };
}

module.exports = { createTask, getTasks, updateTask, getTaskStats };
