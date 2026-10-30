import React, { useState } from 'react';
import {
  Calendar,
  CreditCard,
  GraduationCap,
  MoreVertical,
  Send,
  TrendingUp,
  UserCheck,
  UserPlus,
  Users,
  CalendarCheck,
  Megaphone,
  FileText,
  Users2,
  ChevronDown,
} from 'lucide-react';
import { useSchoolData } from '../../data/schoolContext';
import { AddStudentModal } from '../modals/AddStudentModal';
import { MarkAttendanceModal } from '../modals/MarkAttendanceModal';
import { CollectFeeModal } from '../modals/CollectFeeModal';
import { SendNotificationModal } from '../modals/SendNotificationModal';
import { OffsleekSelect } from '../OffsleekSelect';
import {
  formatRelativeTime,
  getDashboardDateTimeLabelIST,
  getGreetingIST,
  useRelativeTimeNow,
} from '../../utils/dateTime';

interface DashboardHomeProps {
  onNavigate: (module: string) => void;
}

export const DashboardHome: React.FC<DashboardHomeProps> = ({ onNavigate }) => {
  const {
    schoolInfo,
    students,
    staffList,
    feeTransactions,
    recentActivities,
    upcomingEvents,
    announcements,
  } = useSchoolData();

  // Live current date & time in Asia/Kolkata
  const [now, setNow] = useState<Date>(() => new Date());
  const relativeNowMs = useRelativeTimeNow();

  React.useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => window.clearInterval(timer);
  }, []);

  // Quick Action Modal states
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [isMarkAttendanceOpen, setIsMarkAttendanceOpen] = useState(false);
  const [isCollectFeeOpen, setIsCollectFeeOpen] = useState(false);
  const [isSendNotificationOpen, setIsSendNotificationOpen] = useState(false);

  // Timeframe filters for interactive charts
  const [attendancePeriod, setAttendancePeriod] = useState<'This Week' | 'Last Week'>('This Week');
  const [feePeriod, setFeePeriod] = useState<'This Month' | 'This Term'>('This Month');

  // Chart data
  const attendanceBars = attendancePeriod === 'This Week'
    ? [
        { day: 'Mon', percent: 92 },
        { day: 'Tue', percent: 88 },
        { day: 'Wed', percent: 94 },
        { day: 'Thu', percent: 91 },
        { day: 'Fri', percent: 89 },
        { day: 'Sat', percent: 93 },
      ]
    : [
        { day: 'Mon', percent: 90 },
        { day: 'Tue', percent: 91 },
        { day: 'Wed', percent: 89 },
        { day: 'Thu', percent: 93 },
        { day: 'Fri', percent: 87 },
        { day: 'Sat', percent: 92 },
      ];

  // Fee calculation derived from shared dataset
  const collectedAmount = feeTransactions.reduce((acc, curr) => acc + curr.amount, 1845000);
  const totalTarget = 2365000;
  const pendingAmount = Math.max(0, totalTarget - collectedAmount);
  const collectedPercent = Math.min(100, Math.round((collectedAmount / totalTarget) * 100));
  const totalStudents = new Set(
    students.filter((student) => student.status === 'Active').map((student) => student.id)
  ).size;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* 1. Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 tracking-tight flex items-center gap-2">
            <span>{getGreetingIST(now)}, Admin</span>
            <span role="img" aria-label="waving hand">👋</span>
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 mt-0.5">
            Here's what's happening at {schoolInfo.name} today.
          </p>
        </div>

        {/* Date Stamp */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-neutral-200/90 bg-white text-xs font-medium text-neutral-700 shadow-2xs self-start sm:self-auto">
          <Calendar className="w-3.5 h-3.5 text-neutral-500" />
          <span className="tabular-nums">{getDashboardDateTimeLabelIST(now)}</span>
        </div>
      </div>

      {/* 2. Four Main KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5 xl:gap-6">
        
        {/* KPI 1: Total Students */}
        <div className="min-w-0 bg-white border border-neutral-200/90 rounded-2xl p-5 xl:p-6 shadow-2xs hover:shadow-xs transition-shadow">
          <div className="flex items-start justify-between">
            <div className="w-10 h-10 xl:w-11 xl:h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-5 h-5 xl:w-5.5 xl:h-5.5" />
            </div>
            <button
              onClick={() => onNavigate('students')}
              className="text-neutral-400 hover:text-neutral-700 p-1 rounded cursor-pointer"
              aria-label="View students"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>
          <div className="mt-3.5">
            <span className="text-xs xl:text-sm text-neutral-500 font-medium">Total Students</span>
            <div className="text-2xl xl:text-3xl font-black text-neutral-900 tracking-tight mt-0.5 tabular-nums">
              {totalStudents.toLocaleString()}
            </div>
            <div className="flex items-center gap-1 text-[11px] xl:text-xs text-emerald-600 font-semibold mt-1">
              <span className="text-xs">↑</span>
              <span>+12 this month</span>
            </div>
          </div>
        </div>

        {/* KPI 2: Total Staff */}
        <div className="min-w-0 bg-white border border-neutral-200/90 rounded-2xl p-5 xl:p-6 shadow-2xs hover:shadow-xs transition-shadow">
          <div className="flex items-start justify-between">
            <div className="w-10 h-10 xl:w-11 xl:h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Users2 className="w-5 h-5 xl:w-5.5 xl:h-5.5" />
            </div>
            <button
              onClick={() => onNavigate('staff')}
              className="text-neutral-400 hover:text-neutral-700 p-1 rounded cursor-pointer"
              aria-label="View staff"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>
          <div className="mt-3.5">
            <span className="text-xs xl:text-sm text-neutral-500 font-medium">Total Staff</span>
            <div className="text-2xl xl:text-3xl font-black text-neutral-900 tracking-tight mt-0.5 tabular-nums">
              86
            </div>
            <div className="flex items-center gap-1 text-[11px] xl:text-xs text-emerald-600 font-semibold mt-1">
              <span className="text-xs">↑</span>
              <span>+2 this month</span>
            </div>
          </div>
        </div>

        {/* KPI 3: Today's Attendance */}
        <div className="min-w-0 bg-white border border-neutral-200/90 rounded-2xl p-5 xl:p-6 shadow-2xs hover:shadow-xs transition-shadow">
          <div className="flex items-start justify-between">
            <div className="w-10 h-10 xl:w-11 xl:h-11 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <CalendarCheck className="w-5 h-5 xl:w-5.5 xl:h-5.5" />
            </div>
            <button
              onClick={() => onNavigate('attendance')}
              className="text-neutral-400 hover:text-neutral-700 p-1 rounded cursor-pointer"
              aria-label="View attendance"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>
          <div className="mt-3.5">
            <span className="text-xs xl:text-sm text-neutral-500 font-medium">Today's Attendance</span>
            <div className="text-2xl xl:text-3xl font-black text-neutral-900 tracking-tight mt-0.5 tabular-nums">
              92%
            </div>
            <div className="text-[11px] xl:text-xs text-neutral-500 mt-1">
              1,150 / 1,248 present
            </div>
          </div>
        </div>

        {/* KPI 4: Fees Collected */}
        <div className="min-w-0 bg-white border border-neutral-200/90 rounded-2xl p-5 xl:p-6 shadow-2xs hover:shadow-xs transition-shadow">
          <div className="flex items-start justify-between">
            <div className="w-10 h-10 xl:w-11 xl:h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-base xl:text-lg">
              ₹
            </div>
            <button
              onClick={() => onNavigate('fees')}
              className="text-neutral-400 hover:text-neutral-700 p-1 rounded cursor-pointer"
              aria-label="View fees"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>
          <div className="mt-3.5">
            <span className="text-xs xl:text-sm text-neutral-500 font-medium">Fees Collected</span>
            <div className="text-2xl xl:text-3xl font-black text-neutral-900 tracking-tight mt-0.5 tabular-nums">
              ₹{collectedAmount.toLocaleString()}
            </div>
            <div className="flex items-center gap-1 text-[11px] xl:text-xs text-emerald-600 font-semibold mt-1">
              <span className="text-xs">↑</span>
              <span>{collectedPercent}% of this month's target</span>
            </div>
          </div>
        </div>

      </div>

      {/* 3. Middle Row: Attendance Chart, Fee Donut, Quick Actions */}
      <div className="grid min-w-0 grid-cols-1 lg:grid-cols-12 gap-5 xl:gap-6">
        
        {/* Col 1: Attendance Overview Chart (5 cols) */}
        <div className="min-w-0 lg:col-span-5 bg-white border border-neutral-200/90 rounded-2xl p-5 xl:p-6 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
            <h3 className="text-sm xl:text-base font-bold text-neutral-900">Attendance Overview</h3>
            <OffsleekSelect
              value={attendancePeriod}
              onChange={(val) => setAttendancePeriod(val as any)}
              options={['This Week', 'Last Week']}
              size="sm"
              variant="cardHeader"
              className="w-32"
            />
          </div>

          {/* Bar Chart Container */}
          <div className="pt-6 pb-2">
            <div className="flex items-end justify-between h-48 px-2 gap-2">
              
              {/* Y Axis Guide */}
              <div className="flex flex-col justify-between h-full text-[10px] xl:text-[11px] text-neutral-400 pr-2 select-none shrink-0">
                <span>100%</span>
                <span>75%</span>
                <span>50%</span>
                <span>25%</span>
                <span>0%</span>
              </div>

              {/* Day Bars */}
              {attendanceBars.map((item) => (
                <div key={item.day} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group min-w-0">
                  <span className="text-[10px] sm:text-xs font-bold text-neutral-700 opacity-90 group-hover:opacity-100 transition-opacity">
                    {item.percent}%
                  </span>
                  <div className="w-7 sm:w-9 md:w-11 xl:w-14 max-w-[52px] bg-neutral-100 rounded-t-md h-full flex items-end overflow-hidden">
                    <div
                      style={{ height: `${item.percent}%` }}
                      className="w-full bg-neutral-900 rounded-t-md group-hover:bg-black transition-all duration-300"
                    />
                  </div>
                  <span className="text-[11px] sm:text-xs font-medium text-neutral-500 mt-1">
                    {item.day}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Col 2: Fee Collection Donut Chart (4 cols) */}
        <div className="min-w-0 lg:col-span-4 bg-white border border-neutral-200/90 rounded-2xl p-5 xl:p-6 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
            <h3 className="text-sm xl:text-base font-bold text-neutral-900">Fee Collection</h3>
            <OffsleekSelect
              value={feePeriod}
              onChange={(val) => setFeePeriod(val as any)}
              options={['This Month', 'This Term']}
              size="sm"
              variant="cardHeader"
              className="w-32"
            />
          </div>

          <div className="py-4 flex flex-col sm:flex-row items-center justify-around gap-6 xl:gap-8">
            
            {/* SVG Donut Chart with center percentage label */}
            <div className="relative w-36 h-36 xl:w-40 xl:h-40 flex items-center justify-center shrink-0">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                {/* Background Ring */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="transparent"
                  stroke="#E5E7EB"
                  strokeWidth="12"
                />
                {/* Collected Progress Ring */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="transparent"
                  stroke="#171717"
                  strokeWidth="12"
                  strokeDasharray={`${(collectedPercent / 100) * 238.76} 238.76`}
                  strokeLinecap="round"
                  className="transition-all duration-500"
                />
              </svg>

              <div className="absolute inset-0 flex flex-col items-center justify-center select-none">
                <span className="text-2xl xl:text-3xl font-black text-neutral-900 tracking-tight leading-none">
                  {collectedPercent}%
                </span>
                <span className="text-[10px] xl:text-[11px] text-neutral-500 uppercase tracking-wider font-semibold mt-1">
                  Collected
                </span>
              </div>
            </div>

            {/* Legend & Breakdown */}
            <div className="space-y-2.5 text-xs xl:text-sm">
              <div>
                <div className="flex items-center gap-1.5 text-neutral-500">
                  <span className="w-2 h-2 rounded-full bg-neutral-900 shrink-0" />
                  <span>Collected</span>
                </div>
                <div className="font-bold text-neutral-900 tabular-nums pl-3.5 text-sm xl:text-base">
                  ₹{collectedAmount.toLocaleString()}
                </div>
              </div>

              <div>
                <div className="flex items-center gap-1.5 text-neutral-500">
                  <span className="w-2 h-2 rounded-full bg-neutral-400 shrink-0" />
                  <span>Pending</span>
                </div>
                <div className="font-bold text-neutral-900 tabular-nums pl-3.5 text-sm xl:text-base">
                  ₹{pendingAmount.toLocaleString()}
                </div>
              </div>

              <div className="pt-1 border-t border-neutral-100">
                <div className="flex items-center gap-1.5 text-neutral-400">
                  <span className="w-2 h-2 rounded-full border border-neutral-400 shrink-0" />
                  <span>Total Target</span>
                </div>
                <div className="font-bold text-neutral-900 tabular-nums pl-3.5 text-sm xl:text-base">
                  ₹{totalTarget.toLocaleString()}
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Col 3: Quick Actions (3 cols) */}
        <div className="min-w-0 lg:col-span-3 bg-white border border-neutral-200/90 rounded-2xl p-5 xl:p-6 shadow-2xs flex flex-col justify-between">
          <div className="pb-2 border-b border-neutral-100">
            <h3 className="text-sm xl:text-base font-bold text-neutral-900">Quick Actions</h3>
          </div>

          <div className="grid grid-cols-2 gap-3 xl:gap-3.5 py-2">
            
            {/* Add Student */}
            <button
              onClick={() => setIsAddStudentOpen(true)}
              className="p-3.5 xl:p-4 rounded-xl border border-neutral-200/90 bg-neutral-50/50 hover:bg-neutral-100/80 hover:border-neutral-300 flex flex-col items-center justify-center text-center transition-all cursor-pointer group shadow-2xs"
            >
              <div className="w-8 h-8 xl:w-9 xl:h-9 rounded-lg bg-white border border-neutral-200 flex items-center justify-center text-neutral-900 group-hover:scale-105 transition-transform mb-2">
                <UserPlus className="w-4 h-4 xl:w-4.5 xl:h-4.5" />
              </div>
              <span className="text-xs xl:text-[13px] font-semibold text-neutral-800">Add Student</span>
            </button>

            {/* Mark Attendance */}
            <button
              onClick={() => setIsMarkAttendanceOpen(true)}
              className="p-3.5 xl:p-4 rounded-xl border border-neutral-200/90 bg-neutral-50/50 hover:bg-neutral-100/80 hover:border-neutral-300 flex flex-col items-center justify-center text-center transition-all cursor-pointer group shadow-2xs"
            >
              <div className="w-8 h-8 xl:w-9 xl:h-9 rounded-lg bg-white border border-neutral-200 flex items-center justify-center text-neutral-900 group-hover:scale-105 transition-transform mb-2">
                <CalendarCheck className="w-4 h-4 xl:w-4.5 xl:h-4.5" />
              </div>
              <span className="text-xs xl:text-[13px] font-semibold text-neutral-800">Mark Attendance</span>
            </button>

            {/* Collect Fee */}
            <button
              onClick={() => setIsCollectFeeOpen(true)}
              className="p-3.5 xl:p-4 rounded-xl border border-neutral-200/90 bg-neutral-50/50 hover:bg-neutral-100/80 hover:border-neutral-300 flex flex-col items-center justify-center text-center transition-all cursor-pointer group shadow-2xs"
            >
              <div className="w-8 h-8 xl:w-9 xl:h-9 rounded-lg bg-white border border-neutral-200 flex items-center justify-center text-neutral-900 group-hover:scale-105 transition-transform mb-2">
                <CreditCard className="w-4 h-4 xl:w-4.5 xl:h-4.5" />
              </div>
              <span className="text-xs xl:text-[13px] font-semibold text-neutral-800">Collect Fee</span>
            </button>

            {/* Send Notification */}
            <button
              onClick={() => setIsSendNotificationOpen(true)}
              className="p-3.5 xl:p-4 rounded-xl border border-neutral-200/90 bg-neutral-50/50 hover:bg-neutral-100/80 hover:border-neutral-300 flex flex-col items-center justify-center text-center transition-all cursor-pointer group shadow-2xs"
            >
              <div className="w-8 h-8 xl:w-9 xl:h-9 rounded-lg bg-white border border-neutral-200 flex items-center justify-center text-neutral-900 group-hover:scale-105 transition-transform mb-2">
                <Send className="w-4 h-4 xl:w-4.5 xl:h-4.5" />
              </div>
              <span className="text-xs xl:text-[13px] font-semibold text-neutral-800">Send Notification</span>
            </button>

          </div>
        </div>

      </div>

      {/* 4. Bottom Row: Recent Activities, Upcoming Events, Announcements */}
      <div className="grid min-w-0 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 xl:gap-6">
        
        {/* Column 1: Recent Activities */}
        <div className="min-w-0 bg-white border border-neutral-200/90 rounded-2xl p-5 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
            <h3 className="text-sm font-bold text-neutral-900">Recent Activities</h3>
            <button
              onClick={() => onNavigate('students')}
              className="text-xs font-semibold text-neutral-500 hover:text-neutral-900 cursor-pointer"
            >
              View All
            </button>
          </div>

          <div className="divide-y divide-neutral-100 pt-1">
            {recentActivities.slice(0, 4).map((act) => {
              const colorClasses = {
                emerald: 'bg-emerald-50 text-emerald-600',
                purple: 'bg-purple-50 text-purple-600',
                blue: 'bg-blue-50 text-blue-600',
                rose: 'bg-rose-50 text-rose-600',
                amber: 'bg-amber-50 text-amber-600',
              }[act.color || 'blue'];

              return (
                <div key={act.id} className="py-2.5 flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-full ${colorClasses} flex items-center justify-center shrink-0 mt-0.5`}>
                    {act.type === 'admission' && <UserPlus className="w-4 h-4" />}
                    {act.type === 'fee' && <span className="font-bold text-xs">₹</span>}
                    {act.type === 'attendance' && <CalendarCheck className="w-4 h-4" />}
                    {act.type === 'announcement' && <Megaphone className="w-4 h-4" />}
                    {act.type === 'exam' && <GraduationCap className="w-4 h-4" />}
                    {act.type === 'document' && <FileText className="w-4 h-4" />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <h4 className="text-xs font-bold text-neutral-900 truncate">{act.title}</h4>
                      <span className="text-[10px] text-neutral-400 shrink-0">
                        {formatRelativeTime(act.timestamp, relativeNowMs)}
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-500 truncate mt-0.5">{act.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Column 2: Upcoming Events */}
        <div className="min-w-0 bg-white border border-neutral-200/90 rounded-2xl p-5 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
            <h3 className="text-sm font-bold text-neutral-900">Upcoming Events</h3>
            <button
              onClick={() => onNavigate('academics')}
              className="text-xs font-semibold text-neutral-500 hover:text-neutral-900 cursor-pointer"
            >
              View All
            </button>
          </div>

          <div className="divide-y divide-neutral-100 pt-1">
            {upcomingEvents.map((evt) => {
              const dotColor = {
                blue: 'bg-blue-500',
                emerald: 'bg-emerald-500',
                amber: 'bg-amber-500',
                rose: 'bg-rose-500',
              }[evt.color || 'blue'];

              return (
                <div key={evt.id} className="py-2.5 flex items-center gap-3">
                  {/* Date badge */}
                  <div className="w-10 h-10 rounded-xl bg-neutral-100 border border-neutral-200 flex flex-col items-center justify-center shrink-0 select-none">
                    <span className="text-xs font-black text-neutral-900 leading-none">{evt.day}</span>
                    <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider">{evt.month}</span>
                  </div>

                  {/* Event details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${dotColor} shrink-0`} />
                      <h4 className="text-xs font-bold text-neutral-900 truncate">{evt.title}</h4>
                    </div>
                    <p className="text-[11px] text-neutral-500 mt-0.5">{evt.time}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Column 3: Announcements */}
        <div className="min-w-0 bg-white border border-neutral-200/90 rounded-2xl p-5 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
            <h3 className="text-sm font-bold text-neutral-900">Announcements</h3>
            <button
              onClick={() => onNavigate('communication')}
              className="text-xs font-semibold text-neutral-500 hover:text-neutral-900 cursor-pointer"
            >
              View All
            </button>
          </div>

          <div className="divide-y divide-neutral-100 pt-1">
            {announcements.slice(0, 3).map((ann, idx) => {
              const icons = [
                <Megaphone className="w-4 h-4 text-blue-600" />,
                <FileText className="w-4 h-4 text-emerald-600" />,
                <Users2 className="w-4 h-4 text-purple-600" />,
              ];
              const bgColors = ['bg-blue-50', 'bg-emerald-50', 'bg-purple-50'];

              return (
                <div key={ann.id} className="py-2.5 flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-xl ${bgColors[idx % 3]} flex items-center justify-center shrink-0 mt-0.5`}>
                    {icons[idx % 3]}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <h4 className="text-xs font-bold text-neutral-900 truncate">{ann.title}</h4>
                      <span className="text-[10px] text-neutral-400 shrink-0">
                        {formatRelativeTime(ann.publishedAt, relativeNowMs)}
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-500 line-clamp-2 mt-0.5 leading-relaxed">
                      {ann.content}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Quick Action Modals */}
      <AddStudentModal
        isOpen={isAddStudentOpen}
        onClose={() => setIsAddStudentOpen(false)}
      />

      <MarkAttendanceModal
        isOpen={isMarkAttendanceOpen}
        onClose={() => setIsMarkAttendanceOpen(false)}
      />

      <CollectFeeModal
        isOpen={isCollectFeeOpen}
        onClose={() => setIsCollectFeeOpen(false)}
      />

      <SendNotificationModal
        isOpen={isSendNotificationOpen}
        onClose={() => setIsSendNotificationOpen(false)}
      />

    </div>
  );
};
