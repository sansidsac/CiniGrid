import React, { useState, useEffect } from 'react';
import { boardService, sceneService, taskService } from '../services/productionService';
import { notificationService } from '../services/notificationService';
import { useProject } from '../context/ProjectContext';
import type { Scene, Task, BoardData, CreateSceneRequest, CreateTaskRequest } from '../types';

interface KanbanCard {
  _id: string;
  title: string;
  time?: string;
  date?: string;
  priority: 'High' | 'Medium' | 'Low';
  type: 'scene' | 'task';
  status: string;
  description?: string;
  sceneData?: Scene;
  taskData?: Task;
}

const BoardScreen: React.FC = () => {
  const { currentProject } = useProject();
  const [columns] = useState([
    'backlogged',
    'pre-production', 
    'ready',
    'ongoing',
    'in review',
    'completed'
  ]);

  // State for board data
  const [boardData, setBoardData] = useState<BoardData>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // State for notifications
  const [notificationLoading, setNotificationLoading] = useState<string | null>(null);
  
  // State for move functionality
  const [showMoveDropdown, setShowMoveDropdown] = useState<string | null>(null);
  
  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createType, setCreateType] = useState<'scene' | 'task'>('scene');
  const [targetStatus, setTargetStatus] = useState<string>('backlogged');
  
  // Form states
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'Medium' as 'High' | 'Medium' | 'Low',
    time: '',
    date: '',
  });

  // Load board data
  const loadBoardData = async () => {
    if (!currentProject) {
      setBoardData({});
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      const response = await boardService.getBoardData({}, currentProject._id);
      setBoardData(response.data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load board data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBoardData();
  }, [currentProject?._id]); // Reload when project changes

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.move-dropdown-container')) {
        setShowMoveDropdown(null);
      }
    };

    if (showMoveDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showMoveDropdown]);

  // Convert scenes and tasks to kanban cards
  const getCardsForColumn = (columnName: string): KanbanCard[] => {
    const statusData = boardData[columnName];
    if (!statusData) return [];

    const cards: KanbanCard[] = [];

    // Add scenes
    statusData.scenes?.forEach(scene => {
      cards.push({
        _id: scene._id,
        title: scene.title,
        time: scene.time,
        date: scene.date,
        priority: scene.priority,
        type: 'scene',
        status: scene.status,
        description: scene.description,
        sceneData: scene,
      });
    });

    // Add tasks
    statusData.tasks?.forEach(task => {
      cards.push({
        _id: task._id,
        title: task.title,
        time: task.time,
        date: task.date,
        priority: task.priority,
        type: 'task',
        status: task.status,
        description: task.description,
        taskData: task,
      });
    });

    return cards;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return '#FF4444';
      case 'Medium': return '#FF9800';
      case 'Low': return '#4CAF50';
      default: return '#7A7A7A';
    }
  };

  const getTypeGradient = (type: string) => {
    return type === 'scene' 
      ? 'linear-gradient(135deg, #D0D0D0 0%, #FFFFFF 100%)'
      : 'linear-gradient(135deg, #F5F5DC 0%, #FDF5E6 100%)';
  };

  const formatColumnName = (name: string) => {
    return name.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  // Handle form submission
  const handleCreateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentProject) {
      setError('No project selected');
      return;
    }
    
    try {
      const commonData = {
        title: formData.title,
        description: formData.description,
        priority: formData.priority,
        time: formData.time || undefined,
        date: formData.date || undefined,
        status: targetStatus,
      };

      if (createType === 'scene') {
        const sceneData: CreateSceneRequest = {
          ...commonData,
          status: targetStatus as 'backlogged' | 'pre-production' | 'ready' | 'ongoing' | 'in review' | 'completed',
        };
        await sceneService.createScene(sceneData, currentProject?._id);
      } else {
        const taskData: CreateTaskRequest = {
          ...commonData,
          status: targetStatus as 'backlogged' | 'pre-production' | 'ready' | 'ongoing' | 'in review' | 'completed',
          type: 'other',
        };
        await taskService.createTask(taskData, currentProject?._id);
      }

      // Reset form and close modal
      setFormData({
        title: '',
        description: '',
        priority: 'Medium',
        time: '',
        date: '',
      });
      setShowCreateModal(false);
      
      // Reload board data
      await loadBoardData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create item');
    }
  };

  // Handle status change (drag and drop simulation)
  const handleStatusChange = async (cardId: string, cardType: 'scene' | 'task', newStatus: string) => {
    try {
      await boardService.moveItem(cardId, cardType, newStatus);
      await loadBoardData(); // Reload to get updated data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to move item');
    }
  };

  // Handle sending schedule notifications
  const handleNotifySchedule = async (card: KanbanCard) => {
    if (!currentProject) return;
    
    try {
      setNotificationLoading(card._id);
      
      const result = await notificationService.sendScheduleNotification(
        card._id,
        card.type,
        currentProject._id
      );
      
      if (result.success) {
        // Show success feedback (you could use a toast library here)
        alert('Schedule notification sent to all assigned crew members!');
      } else {
        setError(result.message || 'Failed to send notification');
      }
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send notification');
    } finally {
      setNotificationLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center" style={{ backgroundColor: '#FFFFFF' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading board...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full p-6" style={{ backgroundColor: '#FFFFFF' }}>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold" style={{ color: '#1F1F1F' }}>
          Production Board
        </h1>
        <button 
          className="px-4 py-2 font-bold rounded-md hover:opacity-80 transition-opacity"
          style={{ backgroundColor: '#1F1F1F', color: '#FCCA00' }}
          onClick={() => setShowCreateModal(true)}
        >
          + Add New Item
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* Kanban Board */}
      <div className="grid grid-cols-6 gap-4 h-[calc(100vh-200px)]">
        {columns.map((columnName) => {
          const cards = getCardsForColumn(columnName);
          return (
            <div
              key={columnName}
              className="rounded-lg p-4 flex flex-col"
              style={{ backgroundColor: '#D0D0D0' }}
            >
              {/* Column Header */}
              <div className="mb-4">
                <h3 className="font-bold text-sm text-center" style={{ color: '#1F1F1F' }}>
                  {formatColumnName(columnName)}
                </h3>
                <div className="text-xs text-center mt-1" style={{ color: '#7A7A7A' }}>
                  {cards.length} items
                </div>
              </div>

              {/* Cards Container */}
              <div className="flex-1 overflow-y-auto space-y-3">
                {cards.map((card) => (
                  <div
                    key={card._id}
                    className="p-3 rounded-md shadow-sm cursor-pointer hover:shadow-md transition-shadow relative group"
                    style={{ 
                      background: getTypeGradient(card.type),
                      border: `2px solid ${getPriorityColor(card.priority)}`
                    }}
                    onClick={() => {
                      // TODO: Open detail modal/panel
                      console.log('Card clicked:', card);
                    }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold px-2 py-1 rounded" 
                            style={{ backgroundColor: getPriorityColor(card.priority), color: '#FFFFFF' }}>
                        {card.priority}
                      </span>
                      <span className="text-xs" style={{ color: '#7A7A7A' }}>
                        {card.type.toUpperCase()}
                      </span>
                    </div>
                    <h4 className="font-semibold text-sm mb-2" style={{ color: '#1F1F1F' }}>
                      {card.title}
                    </h4>
                    {card.description && (
                      <p className="text-xs mb-2 line-clamp-2" style={{ color: '#7A7A7A' }}>
                        {card.description}
                      </p>
                    )}
                    <div className="text-xs" style={{ color: '#7A7A7A' }}>
                      {card.date && <div>{card.date}</div>}
                      {card.time && <div>{card.time}</div>}
                    </div>
                    
                    {/* Action buttons */}
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="flex gap-1">
                        {/* Notify Schedule button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleNotifySchedule(card);
                          }}
                          disabled={notificationLoading === card._id}
                          className="text-xs px-2 py-1 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-400 flex items-center gap-1"
                          title="Notify all assigned crew about this schedule"
                        >
                          {notificationLoading === card._id ? (
                            <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <>
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5-5-5h5V7a6 6 0 10-12 0v10h5z" />
                              </svg>
                              Notify
                            </>
                          )}
                        </button>

                        {/* Move button with dropdown */}
                        <div className="relative">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowMoveDropdown(showMoveDropdown === card._id ? null : card._id);
                            }}
                            className="text-xs px-2 py-1 rounded bg-black text-white hover:bg-gray-800 flex items-center gap-1"
                            title="Move to different queue"
                          >
                            Move
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>
                          
                          {/* Dropdown menu */}
                          {showMoveDropdown === card._id && (
                            <div className="absolute top-full right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-10 min-w-[120px]">
                              {columns.filter(col => col !== columnName).map(status => (
                                <button
                                  key={status}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleStatusChange(card._id, card.type, status);
                                    setShowMoveDropdown(null);
                                  }}
                                  className="block w-full text-left px-3 py-2 text-xs hover:bg-gray-100 text-gray-700 first:rounded-t-md last:rounded-b-md"
                                >
                                  {formatColumnName(status)}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Button */}
              <button 
                className="mt-3 p-2 rounded-md border-2 border-dashed hover:bg-opacity-20 transition-all"
                style={{ borderColor: '#7A7A7A', color: '#7A7A7A' }}
                onClick={() => {
                  setTargetStatus(columnName);
                  setShowCreateModal(true);
                }}
              >
                + Add Item
              </button>
            </div>
          );
        })}
      </div>

      {/* Create Item Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-bold mb-4">Create New {createType === 'scene' ? 'Scene' : 'Task'}</h3>
            
            <form onSubmit={handleCreateItem}>
              {/* Type selector */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Type</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setCreateType('scene')}
                    className={`px-4 py-2 rounded text-sm font-medium ${
                      createType === 'scene'
                        ? 'bg-black text-yellow-400'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    Scene
                  </button>
                  <button
                    type="button"
                    onClick={() => setCreateType('task')}
                    className={`px-4 py-2 rounded text-sm font-medium ${
                      createType === 'task'
                        ? 'bg-black text-yellow-400'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    Task
                  </button>
                </div>
              </div>

              {/* Title */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded"
                  required
                />
              </div>

              {/* Description */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded h-20"
                  required
                />
              </div>

              {/* Priority */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Priority</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({...formData, priority: e.target.value as 'High' | 'Medium' | 'Low'})}
                  className="w-full p-2 border border-gray-300 rounded"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>

              {/* Date and Time */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Date</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Time</label>
                  <input
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData({...formData, time: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded"
                  />
                </div>
              </div>

              {/* Status */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Status</label>
                <select
                  value={targetStatus}
                  onChange={(e) => setTargetStatus(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded"
                >
                  {columns.map(status => (
                    <option key={status} value={status}>
                      {formatColumnName(status)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Buttons */}
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-medium rounded hover:opacity-80"
                  style={{ backgroundColor: '#1F1F1F', color: '#FCCA00' }}
                >
                  Create {createType === 'scene' ? 'Scene' : 'Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BoardScreen;