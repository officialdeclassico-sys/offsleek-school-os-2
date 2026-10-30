import React, { useState } from 'react';
import { Search, X, Users, CreditCard, Bell, GraduationCap, ChevronRight } from 'lucide-react';
import { useSchoolData } from '../../data/schoolContext';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (module: string) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  onNavigate,
}) => {
  const { students, staffList, feeTransactions, announcements, schoolInfo } = useSchoolData();
  const [query, setQuery] = useState('');

  if (!isOpen) return null;

  const q = query.trim().toLowerCase();

  // Search matches
  const matchedStudents = q
    ? students.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.admissionNo.toLowerCase().includes(q) ||
          s.classGrade.toLowerCase().includes(q)
      )
    : [];

  const matchedStaff = q
    ? staffList.filter(
        (st) =>
          st.name.toLowerCase().includes(q) ||
          st.employeeId.toLowerCase().includes(q) ||
          st.designation.toLowerCase().includes(q) ||
          st.department.toLowerCase().includes(q)
      )
    : [];

  const matchedFees = q
    ? feeTransactions.filter(
        (f) =>
          f.studentName.toLowerCase().includes(q) ||
          f.receiptNo.toLowerCase().includes(q)
      )
    : [];

  const matchedAnnouncements = q
    ? announcements.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.content.toLowerCase().includes(q)
      )
    : [];

  const totalMatches =
    matchedStudents.length + matchedStaff.length + matchedFees.length + matchedAnnouncements.length;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/40 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-neutral-200 max-w-xl w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-neutral-200 gap-3">
          <Search className="w-5 h-5 text-neutral-400 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search students, staff, receipts, announcements..."
            className="w-full text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none bg-transparent"
            autoFocus
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-neutral-400 hover:text-neutral-600 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="text-xs font-semibold px-2 py-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-600 rounded cursor-pointer"
          >
            ESC
          </button>
        </div>

        {/* Results Container */}
        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-4">
          {!query ? (
            <div className="text-center py-8 text-neutral-400 text-xs">
              Type student name, admission number, faculty member, or receipt number...
            </div>
          ) : totalMatches === 0 ? (
            <div className="text-center py-8 text-neutral-400 text-xs">
              No matching records found for "{query}".
            </div>
          ) : (
            <>
              {/* Students */}
              {matchedStudents.length > 0 && (
                <div>
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-2">
                    Students ({matchedStudents.length})
                  </h4>
                  <div className="space-y-1">
                    {matchedStudents.map((st) => (
                      <button
                        key={st.id}
                        onClick={() => {
                          onNavigate('students');
                          onClose();
                        }}
                        className="w-full text-left p-2.5 rounded-xl hover:bg-neutral-50 flex items-center justify-between text-xs transition-colors cursor-pointer group"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-neutral-100 flex items-center justify-center text-neutral-700">
                            <GraduationCap className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <span className="font-semibold text-neutral-900 block group-hover:text-black">
                              {st.name}
                            </span>
                            <span className="text-[10px] text-neutral-400 font-mono">
                              {st.admissionNo} · {st.classGrade}-{st.section}
                            </span>
                          </div>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 text-neutral-400 group-hover:translate-x-0.5 transition-transform" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Staff */}
              {matchedStaff.length > 0 && (
                <div>
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-2">
                    Staff & Faculty ({matchedStaff.length})
                  </h4>
                  <div className="space-y-1">
                    {matchedStaff.map((st) => (
                      <button
                        key={st.id}
                        onClick={() => {
                          onNavigate('staff');
                          onClose();
                        }}
                        className="w-full text-left p-2.5 rounded-xl hover:bg-neutral-50 flex items-center justify-between text-xs transition-colors cursor-pointer group"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-neutral-100 flex items-center justify-center text-neutral-700">
                            <Users className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <span className="font-semibold text-neutral-900 block group-hover:text-black">
                              {st.name}
                            </span>
                            <span className="text-[10px] text-neutral-400">
                              {st.designation} · {st.department}
                            </span>
                          </div>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 text-neutral-400 group-hover:translate-x-0.5 transition-transform" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Fee Receipts */}
              {matchedFees.length > 0 && (
                <div>
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-2">
                    Fee Receipts ({matchedFees.length})
                  </h4>
                  <div className="space-y-1">
                    {matchedFees.map((f) => (
                      <button
                        key={f.id}
                        onClick={() => {
                          onNavigate('fees');
                          onClose();
                        }}
                        className="w-full text-left p-2.5 rounded-xl hover:bg-neutral-50 flex items-center justify-between text-xs transition-colors cursor-pointer group"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-neutral-100 flex items-center justify-center text-neutral-700">
                            <CreditCard className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <span className="font-semibold text-neutral-900 block group-hover:text-black">
                              {f.receiptNo} — {f.studentName}
                            </span>
                            <span className="text-[10px] text-neutral-400">
                              {schoolInfo.currencySymbol}{f.amount.toLocaleString()} · {f.feeType}
                            </span>
                          </div>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 text-neutral-400 group-hover:translate-x-0.5 transition-transform" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Announcements */}
              {matchedAnnouncements.length > 0 && (
                <div>
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-2">
                    Announcements ({matchedAnnouncements.length})
                  </h4>
                  <div className="space-y-1">
                    {matchedAnnouncements.map((a) => (
                      <button
                        key={a.id}
                        onClick={() => {
                          onNavigate('communication');
                          onClose();
                        }}
                        className="w-full text-left p-2.5 rounded-xl hover:bg-neutral-50 flex items-center justify-between text-xs transition-colors cursor-pointer group"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-neutral-100 flex items-center justify-center text-neutral-700">
                            <Bell className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <span className="font-semibold text-neutral-900 block group-hover:text-black">
                              {a.title}
                            </span>
                            <span className="text-[10px] text-neutral-400 truncate max-w-sm block">
                              {a.content}
                            </span>
                          </div>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 text-neutral-400 group-hover:translate-x-0.5 transition-transform" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
