import React, { useState } from 'react';
import { Bell, FileText, Megaphone, Plus, Search, Users2 } from 'lucide-react';
import { useSchoolData } from '../../data/schoolContext';
import { SendNotificationModal } from '../modals/SendNotificationModal';
import { OffsleekSelect } from '../OffsleekSelect';
import { formatRelativeTime, useRelativeTimeNow } from '../../utils/dateTime';

export const CommunicationModule: React.FC = () => {
  const { announcements, archiveAnnouncement } = useSchoolData();
  const [searchTerm, setSearchTerm] = useState('');
  const [audienceFilter, setAudienceFilter] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const relativeNowMs = useRelativeTimeNow();

  const filtered = announcements.filter((a) => {
    const matchesSearch =
      a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAudience = audienceFilter === 'All' || a.audience === audienceFilter;
    return matchesSearch && matchesAudience;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-neutral-900 tracking-tight">Communication & Announcements</h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Broadcast official circulars, event alerts, holiday announcements, and parent notifications
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-black text-white hover:bg-neutral-800 rounded-xl text-xs font-semibold transition-colors cursor-pointer shadow-xs self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Announcement</span>
        </button>
      </div>

      {/* Filter and Search */}
      <div className="p-4 bg-white border border-neutral-200/90 rounded-2xl shadow-2xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search circular title or notice content..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:border-neutral-900"
          />
        </div>

        <div className="flex items-center gap-3">
          <OffsleekSelect
            value={audienceFilter}
            onChange={(val) => setAudienceFilter(val)}
            options={[
              { value: 'All', label: 'All Audiences' },
              { value: 'All School', label: 'All School' },
              { value: 'High School', label: 'High School' },
              { value: 'Parents Only', label: 'Parents Only' },
              { value: 'Staff Only', label: 'Staff Only' },
            ]}
            size="sm"
            variant="subtle"
            className="w-36"
          />

          <span className="text-xs text-neutral-400 font-medium">
            {filtered.length} notices published
          </span>
        </div>
      </div>

      {/* Announcements List */}
      <div className="space-y-3.5">
        {filtered.map((ann) => (
          <div
            key={ann.id}
            className="bg-white border border-neutral-200/90 rounded-2xl p-5 shadow-2xs hover:border-neutral-300 transition-all flex flex-col sm:flex-row items-start justify-between gap-4"
          >
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-neutral-100 flex items-center justify-center text-neutral-800 shrink-0 mt-0.5">
                <Megaphone className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-sm font-bold text-neutral-900">{ann.title}</h3>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-neutral-900 text-white">
                    {ann.audience}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      ann.priority === 'Urgent'
                        ? 'bg-rose-50 text-rose-700'
                        : ann.priority === 'Important'
                        ? 'bg-amber-50 text-amber-700'
                        : 'bg-neutral-100 text-neutral-700'
                    }`}
                  >
                    {ann.priority}
                  </span>
                </div>
                <p className="text-xs text-neutral-600 leading-relaxed max-w-2xl">{ann.content}</p>
                <div className="text-[11px] text-neutral-400 pt-1 flex items-center gap-3">
                  <span>Issued by {ann.author}</span>
                  <span>·</span>
                  <span>{formatRelativeTime(ann.publishedAt, relativeNowMs)}</span>
                  <span>·</span>
                  <span className="text-emerald-600 font-semibold">{ann.status}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => archiveAnnouncement(ann.id)}
              className="text-xs text-neutral-400 hover:text-neutral-700 underline cursor-pointer shrink-0"
            >
              Archive
            </button>
          </div>
        ))}
      </div>

      <SendNotificationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};
