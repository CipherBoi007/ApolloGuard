import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {
  MessageSquare,
  Search,
  Send,
  Paperclip,
  MoreVertical,
  Phone,
  Video,
  Info,
  Check,
  CheckCheck,
  RefreshCw,
  User,
  Calendar,
  FileText,
  Inbox,
  Archive,
  Trash2,
  Star
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

const PatientMessages = () => {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('inbox'); // inbox, archived, starred
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.id);
    }
  }, [selectedConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchConversations = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/patient/messages');
      console.log('Conversations:', response.data);
      setConversations(response.data);
      
      if (response.data.length > 0 && !selectedConversation) {
        setSelectedConversation(response.data[0]);
      }
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
      toast.error('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (conversationId) => {
    try {
      // This would be a real API call
      // For now, simulate messages
      const mockMessages = [
        {
          id: '1',
          sender: 'doctor',
          sender_name: 'Dr. Sarah Chen',
          content: 'Hello! How are you feeling today?',
          timestamp: new Date(Date.now() - 3 * 3600000).toISOString(),
          status: 'read'
        },
        {
          id: '2',
          sender: 'patient',
          content: 'I have a mild headache, but otherwise okay.',
          timestamp: new Date(Date.now() - 2.5 * 3600000).toISOString(),
          status: 'read'
        },
        {
          id: '3',
          sender: 'doctor',
          sender_name: 'Dr. Sarah Chen',
          content: 'Have you been taking your medication regularly?',
          timestamp: new Date(Date.now() - 2 * 3600000).toISOString(),
          status: 'read'
        },
        {
          id: '4',
          sender: 'patient',
          content: 'Yes, every day as prescribed.',
          timestamp: new Date(Date.now() - 1.5 * 3600000).toISOString(),
          status: 'read'
        },
        {
          id: '5',
          sender: 'doctor',
          sender_name: 'Dr. Sarah Chen',
          content: 'Great! Your blood pressure readings look good. Keep up the good work!',
          timestamp: new Date(Date.now() - 1 * 3600000).toISOString(),
          status: 'delivered'
        }
      ];

      setMessages(mockMessages);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
      toast.error('Failed to load messages');
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchConversations();
    setRefreshing(false);
    toast.success('Messages updated');
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;

    const message = {
      id: Date.now().toString(),
      sender: 'patient',
      content: newMessage,
      timestamp: new Date().toISOString(),
      status: 'sending'
    };

    setMessages([...messages, message]);
    setNewMessage('');
    scrollToBottom();

    // Simulate sending
    setTimeout(() => {
      setMessages(prev =>
        prev.map(m =>
          m.id === message.id ? { ...m, status: 'sent' } : m
        )
      );
    }, 1000);

    // Simulate reply after 3 seconds
    setTimeout(() => {
      const reply = {
        id: (Date.now() + 1).toString(),
        sender: 'doctor',
        sender_name: selectedConversation.from,
        content: 'Thank you for your message. I will respond shortly.',
        timestamp: new Date().toISOString(),
        status: 'delivered'
      };
      setMessages(prev => [...prev, reply]);
      scrollToBottom();
    }, 3000);

    try {
      await axios.post('http://localhost:5000/api/patient/messages', {
        to_id: selectedConversation.from_id,
        subject: 'New message',
        content: newMessage
      });
    } catch (error) {
      console.error('Failed to send message:', error);
      toast.error('Failed to send message');
    }
  };

  const handleFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      toast.success(`File "${file.name}" selected for upload`);
      // Implement actual file upload
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const getMessageStatusIcon = (status) => {
    switch(status) {
      case 'sending':
        return <Clock className="w-3 h-3 text-gray-400" />;
      case 'sent':
        return <Check className="w-3 h-3 text-gray-400" />;
      case 'delivered':
        return <CheckCheck className="w-3 h-3 text-gray-400" />;
      case 'read':
        return <CheckCheck className="w-3 h-3 text-blue-500" />;
      default:
        return null;
    }
  };

  const filteredConversations = conversations.filter(conv =>
    conv.from?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.subject?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
            <p className="text-gray-500 mt-1">Communicate with your healthcare providers</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 text-gray-600 ${refreshing ? 'animate-spin' : ''}`} />
              <span className="text-sm text-gray-600">Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div className="h-[calc(100vh-180px)] px-8 py-6">
        <div className="bg-white rounded-xl border border-gray-200 h-full flex overflow-hidden">
          {/* Conversations Sidebar */}
          <div className="w-80 border-r border-gray-200 flex flex-col">
            {/* Search and Filters */}
            <div className="p-4 border-b border-gray-200">
              <div className="relative mb-3">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search messages..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition"
                />
              </div>
              <div className="flex space-x-1">
                {['inbox', 'starred', 'archived'].map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                      filter === f
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {f.charAt(0).toUpperCase() + f.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Conversation List */}
            <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
              {filteredConversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => setSelectedConversation(conv)}
                  className={`w-full p-4 hover:bg-gray-50 transition-colors text-left ${
                    selectedConversation?.id === conv.id ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="relative">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                        {conv.from?.split(' ').map(n => n[0]).join('')}
                      </div>
                      {conv.unread > 0 && (
                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                          {conv.unread}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {conv.from}
                        </p>
                        <span className="text-xs text-gray-400">
                          {formatDistanceToNow(new Date(conv.date), { addSuffix: true })}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">{conv.subject}</p>
                      <p className="text-xs text-gray-600 mt-1 truncate">{conv.content}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Chat Area */}
          {selectedConversation ? (
            <div className="flex-1 flex flex-col">
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                    {selectedConversation.from?.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold text-gray-900">{selectedConversation.from}</h2>
                    <p className="text-xs text-gray-500">Online</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <Phone className="w-4 h-4 text-gray-600" />
                  </button>
                  <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <Video className="w-4 h-4 text-gray-600" />
                  </button>
                  <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <Info className="w-4 h-4 text-gray-600" />
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === 'patient' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg p-3 ${
                        message.sender === 'patient'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      {message.sender !== 'patient' && (
                        <p className="text-xs font-semibold mb-1 text-blue-600">
                          {message.sender_name}
                        </p>
                      )}
                      <p className="text-sm">{message.content}</p>
                      <div className={`flex items-center justify-end space-x-1 mt-1 text-xs ${
                        message.sender === 'patient' ? 'text-blue-100' : 'text-gray-400'
                      }`}>
                        <span>{format(new Date(message.timestamp), 'h:mm a')}</span>
                        {message.sender === 'patient' && getMessageStatusIcon(message.status)}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200">
                <div className="flex items-center space-x-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={handleFileUpload}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Paperclip className="w-5 h-5 text-gray-500" />
                  </button>
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition"
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim()}
                    className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">Select a conversation to start messaging</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientMessages;