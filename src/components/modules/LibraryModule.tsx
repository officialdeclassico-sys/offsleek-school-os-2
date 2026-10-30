import React, { useState } from 'react';
import { BookMarked, BookOpen, CheckCircle, Clock, Plus, Search, X } from 'lucide-react';
import { useSchoolData } from '../../data/schoolContext';
import { OffsleekSelect } from '../OffsleekSelect';
import { getFutureDateIST } from '../../utils/dateTime';

export const LibraryModule: React.FC = () => {
  const { libraryBooks, borrowRecords, students, addLibraryBook, borrowBook, returnBook } = useSchoolData();

  const [activeTab, setActiveTab] = useState<'catalog' | 'borrows'>('catalog');
  const [searchTerm, setSearchTerm] = useState('');

  // Modals
  const [isAddBookOpen, setIsAddBookOpen] = useState(false);
  const [isBorrowOpen, setIsBorrowOpen] = useState(false);

  // New Book State
  const [newTitle, setNewTitle] = useState('');
  const [newAuthor, setNewAuthor] = useState('');
  const [newIsbn, setNewIsbn] = useState('');
  const [newCategory, setNewCategory] = useState('Science / Reference');
  const [newCopies, setNewCopies] = useState(5);

  // Issue Book State
  const [selectedBookId, setSelectedBookId] = useState(libraryBooks[0]?.id || '');
  const [selectedStudentId, setSelectedStudentId] = useState(students[0]?.id || '');
  const [dueDate, setDueDate] = useState(() => getFutureDateIST(14));

  const filteredBooks = libraryBooks.filter((b) =>
    b.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.isbn.includes(searchTerm)
  );

  const handleAddBook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    addLibraryBook({
      accessionNo: `LIB-${Math.floor(1000 + Math.random() * 9000)}`,
      title: newTitle.trim(),
      author: newAuthor.trim() || 'Academic Press',
      isbn: newIsbn.trim() || '978-0199535569',
      category: newCategory,
      totalCopies: Number(newCopies) || 5,
    });

    setIsAddBookOpen(false);
    setNewTitle('');
    setNewAuthor('');
  };

  const handleIssueSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBookId || !selectedStudentId) return;

    borrowBook(selectedBookId, selectedStudentId, dueDate);
    setIsBorrowOpen(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-neutral-900 tracking-tight">Library Resource Centre</h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Book catalog, student borrowing records, returns, and digital inventory
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsBorrowOpen(true)}
            className="px-3.5 py-2 border border-neutral-200 bg-white hover:bg-neutral-50 rounded-xl text-xs font-semibold cursor-pointer"
          >
            Issue Book to Student
          </button>
          <button
            onClick={() => setIsAddBookOpen(true)}
            className="px-4 py-2 bg-black text-white hover:bg-neutral-800 rounded-xl text-xs font-semibold cursor-pointer shadow-xs"
          >
            Add Book Title
          </button>
        </div>
      </div>

      {/* Tabs and Search */}
      <div className="p-4 bg-white border border-neutral-200/90 rounded-2xl shadow-2xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="inline-flex p-1 bg-neutral-100 rounded-xl border border-neutral-200 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('catalog')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              activeTab === 'catalog' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-600'
            }`}
          >
            Book Catalogue ({libraryBooks.length})
          </button>
          <button
            onClick={() => setActiveTab('borrows')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              activeTab === 'borrows' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-600'
            }`}
          >
            Borrowing Records ({borrowRecords.length})
          </button>
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search book title, author, ISBN..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none"
          />
        </div>
      </div>

      {/* TAB 1: CATALOGUE */}
      {activeTab === 'catalog' && (
        <div className="bg-white border border-neutral-200/90 rounded-2xl shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-neutral-50 text-neutral-500 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Accession No</th>
                  <th className="py-3 px-4">Title</th>
                  <th className="py-3 px-4">Author</th>
                  <th className="py-3 px-4">ISBN</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Available Copies</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 font-sans">
                {filteredBooks.map((bk) => (
                  <tr key={bk.id} className="hover:bg-neutral-50/80">
                    <td className="py-3 px-4 font-mono font-bold text-neutral-700">{bk.accessionNo}</td>
                    <td className="py-3 px-4 font-bold text-neutral-900">{bk.title}</td>
                    <td className="py-3 px-4 text-neutral-600">{bk.author}</td>
                    <td className="py-3 px-4 font-mono text-neutral-500">{bk.isbn}</td>
                    <td className="py-3 px-4 text-neutral-600">{bk.category}</td>
                    <td className="py-3 px-4 font-bold tabular-nums">
                      <span className={bk.availableCopies > 0 ? 'text-emerald-700' : 'text-rose-600'}>
                        {bk.availableCopies} of {bk.totalCopies} copies
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => {
                          setSelectedBookId(bk.id);
                          setIsBorrowOpen(true);
                        }}
                        disabled={bk.availableCopies <= 0}
                        className="px-2.5 py-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 disabled:opacity-40 text-[11px] font-semibold rounded-lg transition-colors cursor-pointer"
                      >
                        Issue
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: BORROWING RECORDS */}
      {activeTab === 'borrows' && (
        <div className="bg-white border border-neutral-200/90 rounded-2xl shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-neutral-50 text-neutral-500 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Book Title</th>
                  <th className="py-3 px-4">Borrowed By</th>
                  <th className="py-3 px-4">Class</th>
                  <th className="py-3 px-4">Issue Date</th>
                  <th className="py-3 px-4">Due Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {borrowRecords.map((rec) => (
                  <tr key={rec.id} className="hover:bg-neutral-50/80">
                    <td className="py-3 px-4 font-bold text-neutral-900">{rec.bookTitle}</td>
                    <td className="py-3 px-4 font-semibold text-neutral-800">{rec.studentName}</td>
                    <td className="py-3 px-4 text-neutral-500">{rec.classGrade}</td>
                    <td className="py-3 px-4 text-neutral-500">{rec.borrowDate}</td>
                    <td className="py-3 px-4 font-medium text-amber-800">{rec.dueDate}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          rec.status === 'Returned'
                            ? 'bg-neutral-100 text-neutral-700'
                            : 'bg-emerald-50 text-emerald-700'
                        }`}
                      >
                        {rec.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {rec.status === 'Borrowed' && (
                        <button
                          onClick={() => returnBook(rec.id)}
                          className="px-2.5 py-1 bg-black text-white rounded-lg text-[11px] font-semibold hover:bg-neutral-800 cursor-pointer"
                        >
                          Mark Returned
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Book Modal */}
      {isAddBookOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-neutral-200 max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
              <h3 className="text-base font-bold text-neutral-900">Add Book Title</h3>
              <button onClick={() => setIsAddBookOpen(false)}>
                <X className="w-5 h-5 text-neutral-400" />
              </button>
            </div>

            <form onSubmit={handleAddBook} className="space-y-3 text-xs">
              <div>
                <label className="block text-neutral-600 font-semibold mb-1">Book Title *</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Sapiens: A Brief History of Humankind"
                  className="w-full p-2 border rounded-lg"
                  required
                />
              </div>

              <div>
                <label className="block text-neutral-600 font-semibold mb-1">Author *</label>
                <input
                  type="text"
                  value={newAuthor}
                  onChange={(e) => setNewAuthor(e.target.value)}
                  placeholder="e.g. Yuval Noah Harari"
                  className="w-full p-2 border rounded-lg"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-neutral-600 font-semibold mb-1">ISBN</label>
                  <input
                    type="text"
                    value={newIsbn}
                    onChange={(e) => setNewIsbn(e.target.value)}
                    placeholder="978-0062316097"
                    className="w-full p-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-neutral-600 font-semibold mb-1">Total Copies</label>
                  <input
                    type="number"
                    value={newCopies}
                    onChange={(e) => setNewCopies(Number(e.target.value))}
                    className="w-full p-2 border rounded-lg"
                    min="1"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setIsAddBookOpen(false)}
                  className="px-4 py-2 text-neutral-600 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-black text-white rounded-lg font-semibold hover:bg-neutral-800"
                >
                  Save to Catalog
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Issue Book Modal */}
      {isBorrowOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-neutral-200 max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
              <h3 className="text-base font-bold text-neutral-900">Issue Book to Student</h3>
              <button onClick={() => setIsBorrowOpen(false)}>
                <X className="w-5 h-5 text-neutral-400" />
              </button>
            </div>

            <form onSubmit={handleIssueSubmit} className="space-y-3 text-xs">
              <div>
                <label htmlFor="library-book" className="block text-neutral-600 font-semibold mb-1">Select Book</label>
                <OffsleekSelect
                  id="library-book"
                  value={selectedBookId}
                  onChange={setSelectedBookId}
                  options={libraryBooks.map((b) => ({
                    value: b.id,
                    label: `${b.title} (${b.availableCopies} available)`,
                    disabled: b.availableCopies <= 0,
                  }))}
                  className="w-full"
                />
              </div>

              <div>
                <label htmlFor="library-student" className="block text-neutral-600 font-semibold mb-1">Select Student</label>
                <OffsleekSelect
                  id="library-student"
                  value={selectedStudentId}
                  onChange={setSelectedStudentId}
                  options={students.map((st) => ({
                    value: st.id,
                    label: `${st.name} (${st.classGrade}-${st.section})`,
                  }))}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-neutral-600 font-semibold mb-1">Return Due Date</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full p-2 border rounded-lg"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setIsBorrowOpen(false)}
                  className="px-4 py-2 text-neutral-600 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-black text-white rounded-lg font-semibold hover:bg-neutral-800"
                >
                  Confirm Issue
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
