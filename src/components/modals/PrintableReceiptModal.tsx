import React from 'react';
import { X, Printer, CheckCircle2 } from 'lucide-react';
import { FeeTransaction, useSchoolData } from '../../data/schoolContext';
import { OffsleekLogo } from '../OffsleekLogo';

interface PrintableReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: FeeTransaction;
}

export const PrintableReceiptModal: React.FC<PrintableReceiptModalProps> = ({
  isOpen,
  onClose,
  transaction,
}) => {
  const { schoolInfo } = useSchoolData();

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl border border-neutral-200 max-w-lg w-full p-6 md:p-8 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
        
        {/* Actions bar (hidden in print) */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-100 mb-6 print:hidden">
          <div className="flex items-center gap-2 text-emerald-600">
            <CheckCircle2 className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-wider">Payment Recorded</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-900 text-white rounded-lg text-xs font-semibold hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Receipt Body */}
        <div className="p-6 border border-neutral-200 rounded-xl bg-white space-y-5 text-neutral-900 font-sans">
          
          {/* Institution Header */}
          <div className="text-center pb-4 border-b border-neutral-200">
            <div className="flex justify-center mb-2">
              <OffsleekLogo size="sm" />
            </div>
            <h2 className="text-sm font-bold tracking-wider uppercase text-neutral-900">{schoolInfo.name}</h2>
            <p className="text-[10px] text-neutral-500 uppercase tracking-widest">{schoolInfo.motto}</p>
            <p className="text-[10px] text-neutral-400 mt-1">{schoolInfo.address} · {schoolInfo.phone}</p>
          </div>

          {/* Receipt Info */}
          <div className="flex items-center justify-between text-xs pb-3 border-b border-neutral-100">
            <div>
              <span className="text-neutral-500 text-[10px] uppercase block">Receipt Number</span>
              <span className="font-mono font-bold text-neutral-900">{transaction.receiptNo}</span>
            </div>
            <div className="text-right">
              <span className="text-neutral-500 text-[10px] uppercase block">Date Issued</span>
              <span className="font-medium text-neutral-800">{transaction.paymentDate}</span>
            </div>
          </div>

          {/* Student Info */}
          <div className="grid grid-cols-2 gap-3 text-xs p-3 bg-neutral-50 rounded-lg border border-neutral-200/80">
            <div>
              <span className="text-neutral-500 text-[10px] block">Student Name:</span>
              <strong className="text-neutral-900">{transaction.studentName}</strong>
            </div>
            <div>
              <span className="text-neutral-500 text-[10px] block">Class & Section:</span>
              <span className="font-medium text-neutral-800">{transaction.classGrade}</span>
            </div>
            <div>
              <span className="text-neutral-500 text-[10px] block">Fee Head:</span>
              <span className="font-medium text-neutral-800">{transaction.feeType}</span>
            </div>
            <div>
              <span className="text-neutral-500 text-[10px] block">Payment Mode:</span>
              <span className="font-medium text-neutral-800">{transaction.paymentMethod}</span>
            </div>
          </div>

          {/* Amount Paid Box */}
          <div className="p-4 bg-neutral-900 text-white rounded-xl flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider font-semibold">Amount Paid</span>
            <span className="text-2xl font-black tabular-nums">
              {schoolInfo.currencySymbol}{transaction.amount.toLocaleString()}
            </span>
          </div>

          {/* Remarks & Signatures */}
          <div className="pt-2 text-[11px] text-neutral-500 space-y-4">
            {transaction.remarks && <p><strong>Note:</strong> {transaction.remarks}</p>}
            <p className="text-[10px] text-neutral-400 italic">
              This is a computer-generated official receipt from OFFSLEEK School OS. Validated for academic session {schoolInfo.academicYear}.
            </p>
            <div className="flex justify-between items-end pt-6 border-t border-dashed border-neutral-200">
              <div className="text-center">
                <div className="w-24 h-0.5 bg-neutral-300 mx-auto mb-1"></div>
                <span className="text-[10px] text-neutral-400">Student / Guardian</span>
              </div>
              <div className="text-center">
                <div className="w-24 h-0.5 bg-neutral-300 mx-auto mb-1"></div>
                <span className="text-[10px] text-neutral-400 font-semibold">Bursar / Cashier</span>
              </div>
            </div>
          </div>
        </div>

        {/* Close Button */}
        <div className="pt-4 text-center print:hidden">
          <button
            onClick={onClose}
            className="w-full py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
          >
            Done & Close
          </button>
        </div>
      </div>
    </div>
  );
};
