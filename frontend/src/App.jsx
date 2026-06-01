import React, { useState, useEffect } from 'react';

const API_BASE = "http://127.0.0.1:8000/api/v1";

export default function App() {
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [authMode, setAuthMode] = useState("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");

  const [tasks, setTasks] = useState([]);
  const [taskId, setTaskId] = useState("");
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDesc, setTaskDesc] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  const [notification, setNotification] = useState({ message: "", isSuccess: true, show: false });

  useEffect(() => {
    if (token) {
      loadTasks();
    }
  }, [token]);

  const triggerNotification = (message, isSuccess = true) => {
    setNotification({ message, isSuccess, show: true });
    setTimeout(() => setNotification({ message: "", isSuccess: true, show: false }), 4000);
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    if (authMode === "register") {
      try {
        const res = await fetch(`${API_BASE}/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password, role })
        });
        const data = await res.json();
        if (res.ok) {
          triggerNotification("Registration successful! Please login.");
          setAuthMode("login");
        } else {
          triggerNotification(data.detail || "Registration failed", false);
        }
      } catch (err) {
        triggerNotification("Server connection failed", false);
      }
    } else {
      const formData = new URLSearchParams();
      formData.append("username", username);
      formData.append("password", password);

      try {
        const res = await fetch(`${API_BASE}/login`, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: formData
        });
        const data = await res.json();
        if (res.ok) {
          localStorage.setItem("token", data.access_token);
          setToken(data.access_token);
          triggerNotification("Welcome back! Login successful.");
        } else {
          triggerNotification(data.detail || "Invalid credentials", false);
        }
      } catch (err) {
        triggerNotification("Server login communication error", false);
      }
    }
  };

  const loadTasks = async () => {
    try {
      const res = await fetch(`${API_BASE}/tasks/`, {
        headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
      });
      const data = await res.json();
      if (res.ok) {
        setTasks(data);
      }
    } catch (err) {
      triggerNotification("Could not sync tasks mapping", false);
    }
  };

  const saveTask = async (e) => {
    e.preventDefault();
    const url = isEditing ? `${API_BASE}/tasks/${taskId}` : `${API_BASE}/tasks/`;
    const method = isEditing ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ title: taskTitle, description: taskDesc })
      });

      if (res.ok) {
        triggerNotification(isEditing ? "Task updated smoothly!" : "New task created successfully!");
        resetTaskForm();
        loadTasks();
      } else {
        const data = await res.json();
        triggerNotification(data.detail || "Operation unauthorized/failed", false);
      }
    } catch (err) {
      triggerNotification("Error syncing form data", false);
    }
  };

  const editTaskSetup = (task) => {
    setTaskId(task.id);
    setTaskTitle(task.title);
    setTaskDesc(task.description || "");
    setIsEditing(true);
  };

  const resetTaskForm = () => {
    setTaskId("");
    setTaskTitle("");
    setTaskDesc("");
    setIsEditing(false);
  };

  const deleteTask = async (id) => {
    if (!window.confirm("Are you sure you want to delete this task permanently?")) return;
    try {
      const res = await fetch(`${API_BASE}/tasks/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        triggerNotification("Task discarded context successfully.");
        loadTasks();
      } else {
        const data = await res.json();
        triggerNotification(data.detail || "Deletion restricted", false);
      }
    } catch (err) {
      triggerNotification("Error resolving server deletion", false);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken("");
    setTasks([]);
    triggerNotification("Logged out cleanly. Goodbye!");
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans antialiased selection:bg-indigo-500 selection:text-white">
      
      {/* Premium Navbar */}
      <nav className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white px-6 py-4 shadow-lg sticky top-0 z-50 backdrop-blur-md bg-opacity-95">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-tr from-indigo-500 to-emerald-400 p-2 rounded-xl shadow-md">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
            </div>
            <span className="text-xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-indigo-200">
              Primetrade<span className="text-emerald-400">.ai</span> Portal
            </span>
          </div>
          {token && (
            <button onClick={logout} className="flex items-center space-x-2 bg-rose-500 hover:bg-rose-600 px-4 py-2 rounded-xl text-sm font-bold tracking-wide transition-all shadow-md hover:shadow-rose-500/20 active:scale-95">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
              <span>Logout</span>
            </button>
          )}
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-4 md:p-8">
        
        {/* Dynamic Alerts */}
        {notification.show && (
          <div className={`mb-6 p-4 rounded-2xl text-sm shadow-xl flex items-center space-x-3 border animate-bounce ${notification.isSuccess ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-rose-50 text-rose-800 border-rose-200'}`}>
            <span>{notification.isSuccess ? '✨' : '⚠️'}</span>
            <span className="font-semibold">{notification.message}</span>
          </div>
        )}

        {/* ========================================== */}
        {/* ========================================== */}
        {!token ? (
          <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100 max-w-md mx-auto mt-12 transition-all duration-300 hover:shadow-2xl">
            <div className="flex bg-slate-100 p-1.5 rounded-2xl mb-8">
              <button onClick={() => setAuthMode("login")} className={`w-1/2 py-2.5 text-sm font-bold rounded-xl transition-all duration-300 ${authMode === "login" ? "bg-white text-indigo-950 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}>Login</button>
              <button onClick={() => setAuthMode("register")} className={`w-1/2 py-2.5 text-sm font-bold rounded-xl transition-all duration-300 ${authMode === "register" ? "bg-white text-indigo-950 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}>Register</button>
            </div>

            <h2 className="text-2xl font-black text-slate-900 mb-6 tracking-tight">{authMode === "register" ? "Create Account" : "Welcome Back"}</h2>

            <form onSubmit={handleAuth} className="space-y-5">
              <div>
                <label className="block text-slate-700 text-xs font-bold uppercase tracking-wider mb-2">Username</label>
                <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all text-sm" placeholder="Enter username" />
              </div>
              <div>
                <label className="block text-slate-700 text-xs font-bold uppercase tracking-wider mb-2">Password</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all text-sm" placeholder="••••••••" />
              </div>
              {authMode === "register" && (
                <div className="animate-fadeIn">
                  <label className="block text-slate-700 text-xs font-bold uppercase tracking-wider mb-2">Access Role Level</label>
                  <select value={role} onChange={(e) => setRole(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all text-sm font-medium">
                    <option value="user">Standard User (Own CRUD Access Only)</option>
                    <option value="admin">Administrator Role (Full System Access)</option>
                  </select>
                </div>
              )}
              <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-lg shadow-indigo-600/20 active:scale-98 mt-2">
                {authMode === "register" ? "Set Up Account" : "Sign In To Workspace"}
              </button>
            </form>
          </div>
        ) : (
          
          /* ========================================== */
          /* ========================================== */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-4">
            
            {/* Left Column: Input Form (Span 4) */}
            <div className="lg:col-span-4 lg:sticky lg:top-24 h-fit">
              <div className="bg-white p-6 rounded-3xl shadow-md border border-slate-100">
                <div className="flex items-center space-x-2 mb-4">
                  <div className={`p-1.5 rounded-lg ${isEditing ? 'bg-amber-100 text-amber-700' : 'bg-indigo-100 text-indigo-700'}`}>
                    {isEditing ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                    )}
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 tracking-tight">{isEditing ? "Update Task Entry" : "Create New Task"}</h3>
                </div>
                
                <form onSubmit={saveTask} className="space-y-4">
                  <div>
                    <label className="block text-slate-700 text-xs font-bold uppercase tracking-wider mb-1">Task Title</label>
                    <input type="text" value={taskTitle} onChange={(e) => setTaskTitle(e.target.value)} required className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all text-sm" placeholder="What needs to be done?" />
                  </div>
                  <div>
                    <label className="block text-slate-700 text-xs font-bold uppercase tracking-wider mb-1">Detailed Description</label>
                    <textarea value={taskDesc} onChange={(e) => setTaskDesc(e.target.value)} rows="4" className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all text-sm" placeholder="Provide extra architectural steps or notes..."></textarea>
                  </div>
                  <div className="flex flex-col space-y-2 pt-2">
                    <button type="submit" className={`w-full font-bold py-2.5 px-4 rounded-xl transition-all text-sm shadow-md active:scale-98 ${isEditing ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/10' : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/10'}`}>
                      {isEditing ? "Save Form Changes" : "Commit New Task"}
                    </button>
                    {isEditing && (
                      <button type="button" onClick={resetTaskForm} className="w-full bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold py-2 px-4 rounded-xl transition-all text-sm active:scale-98">
                        Cancel Editing
                      </button>
                    )}
                  </div>
                </form>
              </div>
            </div>

            <div className="lg:col-span-8">
              <div className="bg-white p-6 rounded-3xl shadow-md border border-slate-100">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-slate-900 tracking-tight">Active Sync Workspace</h3>
                  <span className="bg-indigo-50 text-indigo-700 font-bold text-xs px-3 py-1 rounded-full border border-indigo-100">
                    {tasks.length} {tasks.length === 1 ? 'Task Found' : 'Tasks Synced'}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {tasks.length === 0 ? (
                    <div className="col-span-2 py-12 flex flex-col items-center justify-center text-center bg-slate-50 border border-dashed border-slate-200 rounded-2xl">
                      <svg className="w-12 h-12 text-slate-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0a2 2 0 01-2 2H6a2 2 0 01-2-2m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>
                      <p className="text-slate-500 text-sm font-medium">Your task directory data payload is empty.</p>
                      <p className="text-xs text-slate-400 mt-1">Add a container model object on the left.</p>
                    </div>
                  ) : (
                    tasks.map((task) => (
                      <div key={task.id} className="bg-slate-50 hover:bg-white p-5 rounded-2xl border border-slate-100 hover:border-slate-200 transition-all duration-300 flex flex-col justify-between shadow-sm hover:shadow-xl group relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-500 rounded-r"></div>
                        <div className="pl-2">
                          <h4 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors break-words">{task.title}</h4>
                          <p className="text-sm text-slate-600 mt-2 whitespace-pre-line break-words leading-relaxed">{task.description || 'No execution metadata context provided.'}</p>
                        </div>
                        <div className="flex justify-end space-x-2 border-t border-slate-200/60 pt-4 mt-5 pl-2">
                          <button onClick={() => editTaskSetup(task)} className="flex items-center space-x-1.5 bg-white text-indigo-600 hover:bg-indigo-50 text-xs font-bold py-1.5 px-3 border border-slate-200 rounded-xl transition-all active:scale-95 shadow-sm">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                            <span>Edit</span>
                          </button>
                          <button onClick={() => deleteTask(task.id)} className="flex items-center space-x-1.5 bg-white text-rose-600 hover:bg-rose-50 text-xs font-bold py-1.5 px-3 border border-slate-200 rounded-xl transition-all active:scale-95 shadow-sm">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            <span>Delete</span>
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}