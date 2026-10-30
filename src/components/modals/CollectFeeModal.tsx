import React, { useState } from 'react';
import { X, CreditCard, Printer, CheckCircle } from 'lucide-react';
import { useSchoolData, FeeTransaction } from '../../data/schoolContext';
import { PrintableReceiptModal } from './PrintableReceiptModal';
import { OffsleekSelect } from '../OffsleekSelect';

interface CollectFeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultStudentId?: string;
}

export const CollectFeeModal: React.FC<CollectFeeModalProps> = ({
  isOpen,
  onClose,
  defaultStudentId,
}) => {
  const { students, recordFeePayment, schoolInfo } = useSchoolData();

  const [selectedStudentId, setSelectedStudentId] = useState(defaultStudentId || students[0]?.id || '');
  const [amount, setAmount] = useState('15000');
  const [feeType, setFeeType] = useState<FeeTransaction['feeType']>('Tuition Fee');
  const [paymentMethod, setPaymentMethod] = useState<FeeTransaction['paymentMethod']>('Online / UPI');
  const [remarks, setRemarks] = useState('Installment fee receipt');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Receipt display after collection
  const [generatedReceipt, setGeneratedReceipt] = useState<FeeTransaction | null>(null);

  if (!isOpen) return null;

  const selectedStudent = students.find((s) => s.id === selectedStudentId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent || !amount || Number(amount) <= 0) return;

    setIsSubmitting(true);
    setTimeout(() => {
      const tx = recordFeePayment({
        studentId: selectedStudent.id,
        studentName: selectedStudent.name,
        classGrade: `${selectedStudent.classGrade}-${selectedStudent.section}`,
        amount: Number(amount),
        feeType,
        paymentMethod,
        remarks,
      });

      setIsSubmitting(false);
      setGeneratedReceipt(tx);
    }, 400);
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs overflow-y-auto">
        <div className="bg-white rounded-2xl border border-neutral-200 max-w-lg w-full p-6 md:p-8 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
          
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-neutral-100 mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-neutral-900 text-white flex items-center justify-center">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-neutral-900">Collect Student Fee</h3>
                <p className="text-xs text-neutral-500">Record payment and issue fee voucher</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Student Selector */}
            <div>
              <label htmlFor="collect-fee-student" className="block text-xs font-semibold text-neutral-700 mb-1">
                Select Student
              </label>
              <OffsleekSelect
                id="collect-fee-student"
                value={selectedStudentId}
                onChange={setSelectedStudentId}
                options={students.map((st) => ({
                  value: st.id,
                  label: `${st.name} — ${st.admissionNo} (${st.classGrade}-${st.section})`,
                }))}
                className="w-full"
              />
            </div>

            {/* Current Balance Overview */}
            {selectedStudent && (
              <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-xl flex items-center justify-between text-xs">
                <div>
                  <span className="text-neutral-500 block">Total Assigned:</span>
                  <span className="font-semibold text-neutral-900">
                    {schoolInfo.currencySymbol}{selectedStudent.feesTotal.toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-neutral-500 block">Already Paid:</span>
                  <span className="font-semibold text-emerald-700">
                    {schoolInfo.currencySymbol}{selectedStudent.feesPaid.toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-neutral-500 block">Current Balance:</span>
                  <span className="font-bold text-amber-700">
                    {schoolInfo.currencySymbol}{Math.max(0, selectedStudent.feesTotal - selectedStudent.feesPaid).toLocaleString()}
                  </span>
                </div>
              </div>
            )}

            {/* Amount */}
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Payment Amount ({schoolInfo.currencySymbol})
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="e.g. 15000"
                min="1"
                className="w-full px-3 py-2 text-sm font-bold border border-neutral-200 rounded-lg focus:outline-none focus:border-neutral-900"
                required
              />
            </div>

            {/* Fee Type & Payment Mode */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="collect-fee-type" className="block text-xs font-semibold text-neutral-700 mb-1">Fee Type</label>
                <OffsleekSelect
                  id="collect-fee-type"
                  value={feeType}
                  onChange={(value) => setFeeType(value as FeeTransaction['feeType'])}
                  options={['Tuition Fee', 'Transport Fee', 'Examination Fee', 'Annual Development', 'Library Fee']}
                  className="w-full"
                />
              </div>

              <div>
                <label htmlFor="collect-fee-method" className="block text-xs font-semibold text-neutral-700 mb-1">Payment Method</label>
                <OffsleekSelect
                  id="collect-fee-method"
                  value={paymentMethod}
                  onChange={(value) => setPaymentMethod(value as FeeTransaction['paymentMethod'])}
                  options={['Online / UPI', 'Bank Transfer', 'Cash', 'Cheque']}
                  className="w-full"
                />
              </div>
            </div>

            {/* Remarks */}
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">Notes / Remarks</label>
              <input
                type="text"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Optional payment reference / transaction ID"
                className="w-full px-3 py-2 text-xs border border-neutral-200 rounded-lg focus:outline-none focus:border-neutral-900"
              />
            </div>

            {/* Buttons */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-100">
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
                {isSubmitting ? 'Processing Payment...' : 'Record Payment & Generate Receipt'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Printable Receipt Preview Modal */}
      {generatedReceipt && (
        <PrintableReceiptModal
          isOpen={true}
          onClose={() => {
            setGeneratedReceipt(null);
            onClose();
          }}
          transaction={generatedReceipt}
        />
      )}
    </>
  );
};
