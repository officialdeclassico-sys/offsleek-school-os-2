import React, { useState } from 'react';
import { X, Send, Bell } from 'lucide-react';
import { useSchoolData } from '../../data/schoolContext';
import { OffsleekSelect } from '../OffsleekSelect';

interface SendNotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SendNotificationModal: React.FC<SendNotificationModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { addAnnouncement } = useSchoolData();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [audience, setAudience] = useState<'All School' | 'High School' | 'Primary School' | 'Staff Only' | 'Parents Only'>('All School');
  const [priority, setPriority] = useState<'Normal' | 'Important' | 'Urgent'>('Important');
  const [category, setCategory] = useState<'Holiday' | 'Academic' | 'Meeting' | 'General'>('General');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setError('Please provide both notification title and announcement details.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      addAnnouncement({
        title: title.trim(),
        content: content.trim(),
        audience,
        priority,
        category,
        author: 'School Administration',
      });

      setIsSubmitting(false);
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl border border-neutral-200 max-w-lg w-full p-6 md:p-8 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-100 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-neutral-900 text-white flex items-center justify-center">
              <Send className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-neutral-900">Broadcast Announcement</h3>
              <p className="text-xs text-neutral-500">Send notifications to students, parents, or staff</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Demo Mode Notice */}
        <div className="mb-4 p-3 bg-neutral-50 border border-neutral-200 rounded-xl text-[11px] text-neutral-600">
          <strong>Local Prototype Mode:</strong> External SMS/WhatsApp gateways are disconnected. Notifications are broadcasted internally across the School OS dashboards.
        </div>

        {error && (
          <div className="mb-4 p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">
              Notice Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (error) setError('');
              }}
              placeholder="e.g. Schedule for Science Exhibition 2026"
              className="w-full px-3 py-2 text-xs border border-neutral-200 rounded-lg focus:outline-none focus:border-neutral-900"
              autoFocus
            />
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            <div>
              <label htmlFor="announcement-audience" className="block text-xs font-semibold text-neutral-700 mb-1">Target Audience</label>
              <OffsleekSelect
                id="announcement-audience"
                value={audience}
                onChange={(value) => setAudience(value as typeof audience)}
                options={['All School', 'High School', 'Primary School', 'Staff Only', 'Parents Only']}
                className="w-full"
                size="sm"
              />
            </div>

            <div>
              <label htmlFor="announcement-priority" className="block text-xs font-semibold text-neutral-700 mb-1">Priority</label>
              <OffsleekSelect
                id="announcement-priority"
                value={priority}
                onChange={(value) => setPriority(value as typeof priority)}
                options={['Normal', 'Important', 'Urgent']}
                className="w-full"
                size="sm"
              />
            </div>

            <div>
              <label htmlFor="announcement-category" className="block text-xs font-semibold text-neutral-700 mb-1">Category</label>
              <OffsleekSelect
                id="announcement-category"
                value={category}
                onChange={(value) => setCategory(value as typeof category)}
                options={['General', 'Academic', 'Holiday', 'Meeting']}
                className="w-full"
                size="sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">
              Message Content <span className="text-rose-500">*</span>
            </label>
            <textarea
              value={content}
              onChange={(e) => {
                setContent(e.target.value);
                if (error) setError('');
              }}
              rows={4}
              placeholder="Write the complete announcement details here..."
              className="w-full px-3 py-2 text-xs border border-neutral-200 rounded-lg focus:outline-none focus:border-neutral-900"
            />
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-neutral-600 hover:text-neutral-900 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-black text-white hover:bg-neutral-800 px-5 py-2 rounded-lg text-xs font-semibold transition-colors disabled:opacity-60 cursor-pointer shadow-xs"
            >
              {isSubmitting ? 'Broadcasting...' : 'Publish Notification'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
