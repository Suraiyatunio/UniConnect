import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, Search, MessageSquare, Check, CheckCheck, 
  User, Phone, Mail, Clock 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ApiService } from '../services/api';
import { Contact, Message } from '../types';

interface MessagesPageProps {
  searchQuery: string;
}

export const MessagesPage: React.FC<MessagesPageProps> = ({ searchQuery }) => {
  const { user } = useAuth();

  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [thread, setThread] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(true);

  const threadEndRef = useRef<HTMLDivElement>(null);

  const loadContacts = async () => {
    if (!user) return;
    try {
      const list = await ApiService.getContacts(user.id);
      setContacts(list || []);
      if (!selectedContact && list && list.length > 0) {
        setSelectedContact(list[0]);
      }
    } catch (err) {
      console.error('Failed to load contacts:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadThread = async () => {
    if (!user || !selectedContact) return;
    try {
      const messages = await ApiService.getThread(user.id, selectedContact.id);
      setThread(messages || []);
    } catch (err) {
      console.error('Failed to load thread:', err);
    }
  };

  useEffect(() => {
    loadContacts();
  }, [user]);

  useEffect(() => {
    loadThread();
    const interval = setInterval(loadThread, 5000);
    return () => clearInterval(interval);
  }, [user, selectedContact]);

  useEffect(() => {
    threadEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [thread]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !user || !selectedContact) return;

    const content = messageText.trim();
    setMessageText('');

    try {
      await ApiService.sendMessage({
        senderId: user.id,
        receiverId: selectedContact.id,
        content,
      });
      await loadThread();
      await loadContacts();
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  const filteredContacts = contacts.filter((c) =>
    c.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm h-[calc(100vh-140px)] flex">
      {/* Left Contacts List */}
      <div className="w-80 border-r border-slate-200 flex flex-col h-full bg-slate-50/50">
        <div className="p-4 border-b border-slate-200 bg-white">
          <h3 className="text-sm font-bold text-slate-900">Direct Conversations</h3>
          <p className="text-[11px] text-slate-500">
            Faculty, student peers, and academic advising
          </p>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
          {filteredContacts.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-400">
              No contacts found.
            </div>
          ) : (
            filteredContacts.map((contact) => {
              const isSelected = selectedContact?.id === contact.id;
              return (
                <button
                  key={contact.id}
                  onClick={() => setSelectedContact(contact)}
                  className={`w-full p-3.5 text-left transition flex items-start gap-3 ${
                    isSelected ? 'bg-blue-50/80 border-l-4 border-blue-600' : 'hover:bg-slate-100/60'
                  }`}
                >
                  <div className="relative">
                    <img
                      src={contact.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(contact.full_name)}`}
                      alt={contact.full_name}
                      className="w-9 h-9 rounded-full object-cover border border-slate-200"
                    />
                    {contact.unread_count && contact.unread_count > 0 ? (
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                        {contact.unread_count}
                      </span>
                    ) : null}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 truncate">
                        {contact.full_name}
                      </span>
                      <span className="text-[10px] text-slate-400 capitalize">
                        {contact.role}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 truncate mt-0.5">
                      {contact.last_message || 'Start a conversation...'}
                    </p>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Right Chat Thread */}
      <div className="flex-1 flex flex-col h-full bg-white">
        {selectedContact ? (
          <>
            {/* Thread Header */}
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-white z-10">
              <div className="flex items-center gap-3">
                <img
                  src={selectedContact.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(selectedContact.full_name)}`}
                  alt={selectedContact.full_name}
                  className="w-9 h-9 rounded-full object-cover border border-slate-200"
                />
                <div>
                  <h4 className="text-xs font-bold text-slate-900">{selectedContact.full_name}</h4>
                  <p className="text-[11px] text-slate-500 flex items-center gap-1.5 capitalize">
                    <span>{selectedContact.role}</span>
                    <span>•</span>
                    <span>{selectedContact.email}</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Messages Scroll Area */}
            <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-slate-50/40">
              {thread.length === 0 ? (
                <div className="py-16 text-center text-slate-400 text-xs flex flex-col items-center gap-2">
                  <MessageSquare className="w-8 h-8 text-slate-300" />
                  <span>No messages yet. Send a greeting to begin this conversation.</span>
                </div>
              ) : (
                thread.map((msg) => {
                  const isMe = msg.sender_id === user?.id;
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                    >
                      <div
                        className={`max-w-md px-4 py-2.5 rounded-2xl text-xs shadow-sm ${
                          isMe
                            ? 'bg-blue-600 text-white rounded-br-none'
                            : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none'
                        }`}
                      >
                        <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                      </div>
                      <span className="text-[10px] text-slate-400 mt-1 px-1">
                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  );
                })
              )}
              <div ref={threadEndRef} />
            </div>

            {/* Message Input Box */}
            <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-200 bg-white flex items-center gap-2">
              <input
                type="text"
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder={`Message ${selectedContact.full_name}...`}
                className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2.5 text-xs text-slate-800 outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
              />
              <button
                type="submit"
                disabled={!messageText.trim()}
                className="p-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-40 transition flex items-center justify-center shadow-sm"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-slate-400 text-xs">
            <MessageSquare className="w-10 h-10 text-slate-300 mb-2" />
            <span>Select a conversation from the left to start messaging.</span>
          </div>
        )}
      </div>
    </div>
  );
};
