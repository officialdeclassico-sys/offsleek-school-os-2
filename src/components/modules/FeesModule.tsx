import React, { useState } from 'react';
import {
  CreditCard,
  Download,
  Filter,
  Plus,
  Printer,
  Search,
  Wallet,
  Clock,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { useSchoolData, FeeTransaction } from '../../data/schoolContext';
import { CollectFeeModal } from '../modals/CollectFeeModal';
import { PrintableReceiptModal } from '../modals/PrintableReceiptModal';
import { OffsleekSelect } from '../OffsleekSelect';
import { getTodayDateIST } from '../../utils/dateTime';

export const FeesModule: React.FC = () => {
  const { students, feeTransactions, schoolInfo, showToast } = useSchoolData();

  const [activeTab, setActiveTab] = useState<'transactions' | 'balances' | 'structures'>('transactions');
  const [searchTerm, setSearchTerm] = useState('');
  const [methodFilter, setMethodFilter] = useState('All');
  const [isCollectModalOpen, setIsCollectModalOpen] = useState(false);
  const [viewingReceipt, setViewingReceipt] = useState<FeeTransaction | null>(null);

  // Fee calculation derived from shared dataset
  const collectedTotal = feeTransactions.reduce((acc, curr) => acc + curr.amount, 1845000);
  const targetTotal = 2365000;
  const pendingTotal = Math.max(0, targetTotal - collectedTotal);
  const overdueAccountsCount = students.filter((s) => s.feesTotal > s.feesPaid).length;

  const filteredTransactions = feeTransactions.filter((tx) => {
    const matchesSearch =
      tx.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.receiptNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.classGrade.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesMethod = methodFilter === 'All' || tx.paymentMethod === methodFilter;
    return matchesSearch && matchesMethod;
  });

  const exportFeesCSV = () => {
    const headers = ['Receipt No', 'Student Name', 'Class', 'Amount', 'Fee Type', 'Payment Method', 'Date', 'Status'];
    const rows = filteredTransactions.map((tx) => [
      tx.receiptNo,
      `"${tx.studentName}"`,
      tx.classGrade,
      tx.amount,
      tx.feeType,
      tx.paymentMethod,
      tx.paymentDate,
      tx.status,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Fee_Transactions_${getTodayDateIST()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Exported fee transaction records to CSV.');
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-neutral-900 tracking-tight">Fees & Payments</h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Student fee accounts, tuition collection, payment receipts, and billing structures
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={exportFeesCSV}
            className="flex items-center gap-1.5 px-3 py-2 border border-neutral-200/90 rounded-xl text-xs font-semibold text-neutral-700 bg-white hover:bg-neutral-50 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Report</span>
          </button>

          <button
            onClick={() => setIsCollectModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-black text-white hover:bg-neutral-800 rounded-xl text-xs font-semibold transition-colors cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Collect Fee</span>
          </button>
        </div>
      </div>

      {/* 4 Financial KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-neutral-200/90 rounded-2xl p-5 shadow-2xs">
          <span className="text-xs text-neutral-500 font-medium">Total Term Target</span>
          <div className="text-2xl font-black text-neutral-900 tracking-tight mt-1 tabular-nums">
            {schoolInfo.currencySymbol}{targetTotal.toLocaleString()}
          </div>
          <span className="text-[11px] text-neutral-400 mt-0.5 block">Approved annual structure</span>
        </div>

        <div className="bg-white border border-neutral-200/90 rounded-2xl p-5 shadow-2xs">
          <span className="text-xs text-neutral-500 font-medium">Fees Collected</span>
          <div className="text-2xl font-black text-emerald-700 tracking-tight mt-1 tabular-nums">
            {schoolInfo.currencySymbol}{collectedTotal.toLocaleString()}
          </div>
          <span className="text-[11px] text-emerald-600 font-semibold mt-0.5 block">
            {Math.round((collectedTotal / targetTotal) * 100)}% of target collected
          </span>
        </div>

        <div className="bg-white border border-neutral-200/90 rounded-2xl p-5 shadow-2xs">
          <span className="text-xs text-neutral-500 font-medium">Pending Dues</span>
          <div className="text-2xl font-black text-amber-700 tracking-tight mt-1 tabular-nums">
            {schoolInfo.currencySymbol}{pendingTotal.toLocaleString()}
          </div>
          <span className="text-[11px] text-neutral-400 mt-0.5 block">Outstanding student accounts</span>
        </div>

        <div className="bg-white border border-neutral-200/90 rounded-2xl p-5 shadow-2xs">
          <span className="text-xs text-neutral-500 font-medium">Accounts with Overdue Dues</span>
          <div className="text-2xl font-black text-neutral-900 tracking-tight mt-1 tabular-nums">
            {overdueAccountsCount}
          </div>
          <span className="text-[11px] text-rose-600 font-semibold mt-0.5 block">Follow-up reminders active</span>
        </div>
      </div>

      {/* Tab Switcher & Filter Bar */}
      <div className="p-4 bg-white border border-neutral-200/90 rounded-2xl shadow-2xs flex flex-col md:flex-row gap-3 items-center justify-between">
        
        {/* Tabs */}
        <div className="inline-flex p-1 bg-neutral-100 rounded-xl border border-neutral-200 text-xs font-semibold w-full md:w-auto">
          <button
            onClick={() => setActiveTab('transactions')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              activeTab === 'transactions' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-600'
            }`}
          >
            Payment Transactions
          </button>
          <button
            onClick={() => setActiveTab('balances')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              activeTab === 'balances' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-600'
            }`}
          >
            Student Fee Balances
          </button>
          <button
            onClick={() => setActiveTab('structures')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              activeTab === 'structures' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-600'
            }`}
          >
            Fee Structures
          </button>
        </div>

        {/* Search & Method */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search receipt, student name..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:border-neutral-900"
            />
          </div>

          {activeTab === 'transactions' && (
            <OffsleekSelect
              value={methodFilter}
              onChange={(val) => setMethodFilter(val)}
              options={[
                { value: 'All', label: 'All Methods' },
                { value: 'Online / UPI', label: 'Online / UPI' },
                { value: 'Bank Transfer', label: 'Bank Transfer' },
                { value: 'Cash', label: 'Cash' },
                { value: 'Cheque', label: 'Cheque' },
              ]}
              size="sm"
              variant="subtle"
              className="w-36"
            />
          )}
        </div>
      </div>

      {/* TAB 1: TRANSACTIONS LIST */}
      {activeTab === 'transactions' && (
        <div className="bg-white border border-neutral-200/90 rounded-2xl shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-neutral-50/70 border-b border-neutral-200 text-neutral-500 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4 whitespace-nowrap">Receipt No</th>
                  <th className="py-3 px-4 whitespace-nowrap">Student</th>
                  <th className="py-3 px-4 whitespace-nowrap">Class</th>
                  <th className="py-3 px-4 whitespace-nowrap">Fee Head</th>
                  <th className="py-3 px-4 whitespace-nowrap">Amount</th>
                  <th className="py-3 px-4 whitespace-nowrap">Mode</th>
                  <th className="py-3 px-4 whitespace-nowrap">Date</th>
                  <th className="py-3 px-4 whitespace-nowrap">Status</th>
                  <th className="py-3 px-4 text-right whitespace-nowrap">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 font-sans">
                {filteredTransactions.length > 0 ? (
                  filteredTransactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-neutral-50/80 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-neutral-800 whitespace-nowrap">{tx.receiptNo}</td>
                      <td className="py-3 px-4 font-bold text-neutral-900 whitespace-nowrap">{tx.studentName}</td>
                      <td className="py-3 px-4 text-neutral-600 whitespace-nowrap">{tx.classGrade}</td>
                      <td className="py-3 px-4 text-neutral-700 whitespace-nowrap">{tx.feeType}</td>
                      <td className="py-3 px-4 font-black tabular-nums text-neutral-900 whitespace-nowrap">
                        {schoolInfo.currencySymbol}{tx.amount.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-neutral-100 text-neutral-700 whitespace-nowrap">
                          {tx.paymentMethod}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-neutral-500 whitespace-nowrap">{tx.paymentDate}</td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 whitespace-nowrap">
                          {tx.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <button
                          onClick={() => setViewingReceipt(tx)}
                          className="px-2.5 py-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer inline-flex items-center gap-1"
                        >
                          <Printer className="w-3 h-3" />
                          <span>Print</span>
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-xs text-neutral-400">
                      No fee transactions found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: STUDENT BALANCES */}
      {activeTab === 'balances' && (
        <div className="bg-white border border-neutral-200/90 rounded-2xl shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-neutral-50/70 border-b border-neutral-200 text-neutral-500 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4 whitespace-nowrap">Student</th>
                  <th className="py-3 px-4 whitespace-nowrap">Class</th>
                  <th className="py-3 px-4 whitespace-nowrap">Guardian Contact</th>
                  <th className="py-3 px-4 whitespace-nowrap">Total Fee</th>
                  <th className="py-3 px-4 whitespace-nowrap">Paid</th>
                  <th className="py-3 px-4 whitespace-nowrap">Outstanding Balance</th>
                  <th className="py-3 px-4 text-right whitespace-nowrap">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {students.map((st) => {
                  const bal = Math.max(0, st.feesTotal - st.feesPaid);
                  return (
                    <tr key={st.id} className="hover:bg-neutral-50/80 transition-colors">
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="font-bold text-neutral-900 block">{st.name}</span>
                        <span className="text-[10px] text-neutral-400 font-mono">{st.admissionNo}</span>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">{st.classGrade}-{st.section}</td>
                      <td className="py-3 px-4 text-neutral-600 whitespace-nowrap">{st.guardianName} ({st.guardianPhone})</td>
                      <td className="py-3 px-4 tabular-nums font-semibold whitespace-nowrap">
                        {schoolInfo.currencySymbol}{st.feesTotal.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 tabular-nums text-emerald-700 font-semibold whitespace-nowrap">
                        {schoolInfo.currencySymbol}{st.feesPaid.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 tabular-nums whitespace-nowrap">
                        {bal === 0 ? (
                          <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded text-[11px] whitespace-nowrap">
                            Cleared
                          </span>
                        ) : (
                          <span className="text-rose-700 font-bold bg-rose-50 px-2 py-0.5 rounded text-[11px] whitespace-nowrap">
                            {schoolInfo.currencySymbol}{bal.toLocaleString()} Due
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <button
                          onClick={() => setIsCollectModalOpen(true)}
                          className="px-2.5 py-1 bg-black text-white hover:bg-neutral-800 rounded-lg text-[11px] font-semibold cursor-pointer whitespace-nowrap"
                        >
                          Collect Fee
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: FEE STRUCTURES */}
      {activeTab === 'structures' && (
        <div className="bg-white border border-neutral-200/90 rounded-2xl p-6 shadow-2xs space-y-4">
          <h3 className="text-sm font-bold text-neutral-900">Standard Grade-wise Annual Fee Schedule (2025-26)</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 border border-neutral-200 rounded-xl space-y-2">
              <h4 className="font-bold text-neutral-900">Primary Wing (Classes 1 - 5)</h4>
              <p className="text-neutral-500 text-[11px]">Tuition: ₹65,000 · Development: ₹10,000</p>
              <div className="text-base font-black text-neutral-900">₹75,000 / year</div>
            </div>
            <div className="p-4 border border-neutral-200 rounded-xl space-y-2">
              <h4 className="font-bold text-neutral-900">Middle Wing (Classes 6 - 8)</h4>
              <p className="text-neutral-500 text-[11px]">Tuition: ₹75,000 · Labs & Activities: ₹10,000</p>
              <div className="text-base font-black text-neutral-900">₹85,000 / year</div>
            </div>
            <div className="p-4 border border-neutral-200 rounded-xl space-y-2">
              <h4 className="font-bold text-neutral-900">High School & Senior (Classes 9 - 12)</h4>
              <p className="text-neutral-500 text-[11px]">Tuition: ₹95,000 · Advanced Labs: ₹15,000</p>
              <div className="text-base font-black text-neutral-900">₹1,10,000 / year</div>
            </div>
          </div>
        </div>
      )}

      {/* Collect Fee Modal */}
      <CollectFeeModal
        isOpen={isCollectModalOpen}
        onClose={() => setIsCollectModalOpen(false)}
      />

      {/* Printable Receipt Modal */}
      {viewingReceipt && (
        <PrintableReceiptModal
          isOpen={true}
          onClose={() => setViewingReceipt(null)}
          transaction={viewingReceipt}
        />
      )}

    </div>
  );
};
