import React, { useState } from 'react';
import { Check, CheckCircle2, FileCheck, FileText, Plus, Printer, Search, X } from 'lucide-react';
import { useSchoolData, DocumentRequest } from '../../data/schoolContext';
import { OffsleekLogo } from '../OffsleekLogo';
import { OffsleekSelect } from '../OffsleekSelect';
import { getTodayDateIST } from '../../utils/dateTime';

export const DocumentsModule: React.FC = () => {
  const { students, documentRequests, addDocumentRequest, updateDocumentStatus, schoolInfo } = useSchoolData();

  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState(students[0]?.id || '');
  const [docType, setDocType] = useState<DocumentRequest['documentType']>('Bonafide Certificate');
  const [reason, setReason] = useState('Passport / Visa application');

  const [previewDoc, setPreviewDoc] = useState<DocumentRequest | null>(null);

  const handleCreateRequest = (e: React.FormEvent) => {
    e.preventDefault();
    const st = students.find((s) => s.id === selectedStudentId);
    if (!st) return;

    addDocumentRequest({
      studentId: st.id,
      studentName: st.name,
      classGrade: `${st.classGrade}-${st.section}`,
      documentType: docType,
      reason,
    });

    setIsNewModalOpen(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-neutral-900 tracking-tight">Documents & Certificates</h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Process student Bonafide certificates, Transfer Certificates (TC), and official academic credentials
          </p>
        </div>

        <button
          onClick={() => setIsNewModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-black text-white hover:bg-neutral-800 rounded-xl text-xs font-semibold transition-colors cursor-pointer shadow-xs self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Certificate Request</span>
        </button>
      </div>

      {/* Requests Table */}
      <div className="bg-white border border-neutral-200/90 rounded-2xl shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-neutral-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-neutral-900">Certificate Verification Queue</h3>
          <span className="text-xs text-neutral-400">{documentRequests.length} total requests</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-neutral-50 text-neutral-500 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Request No</th>
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-4">Class</th>
                <th className="py-3 px-4">Document Type</th>
                <th className="py-3 px-4">Purpose / Reason</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {documentRequests.map((req) => (
                <tr key={req.id} className="hover:bg-neutral-50/80">
                  <td className="py-3 px-4 font-mono font-bold text-neutral-800">{req.requestNo}</td>
                  <td className="py-3 px-4 font-bold text-neutral-900">{req.studentName}</td>
                  <td className="py-3 px-4 text-neutral-600">{req.classGrade}</td>
                  <td className="py-3 px-4 font-semibold text-neutral-800">{req.documentType}</td>
                  <td className="py-3 px-4 text-neutral-500 max-w-xs truncate">{req.reason}</td>
                  <td className="py-3 px-4 text-neutral-500">{req.requestDate}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        req.status === 'Issued'
                          ? 'bg-neutral-900 text-white'
                          : req.status === 'Approved'
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-amber-50 text-amber-700'
                      }`}
                    >
                      {req.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {req.status === 'Pending' && (
                        <button
                          onClick={() => updateDocumentStatus(req.id, 'Approved')}
                          className="px-2.5 py-1 bg-emerald-600 text-white rounded-lg text-[11px] font-semibold hover:bg-emerald-700 cursor-pointer"
                        >
                          Approve
                        </button>
                      )}

                      {req.status === 'Approved' && (
                        <button
                          onClick={() => {
                            updateDocumentStatus(req.id, 'Issued');
                            setPreviewDoc(req);
                          }}
                          className="px-2.5 py-1 bg-black text-white rounded-lg text-[11px] font-semibold hover:bg-neutral-800 cursor-pointer"
                        >
                          Issue & Print
                        </button>
                      )}

                      {req.status === 'Issued' && (
                        <button
                          onClick={() => setPreviewDoc(req)}
                          className="px-2.5 py-1 bg-neutral-100 text-neutral-800 rounded-lg text-[11px] font-semibold hover:bg-neutral-200 cursor-pointer flex items-center gap-1"
                        >
                          <Printer className="w-3 h-3" />
                          <span>Print</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Certificate Request Modal */}
      {isNewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-neutral-200 max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
              <h3 className="text-base font-bold text-neutral-900">Request Institutional Certificate</h3>
              <button onClick={() => setIsNewModalOpen(false)}>
                <X className="w-5 h-5 text-neutral-400" />
              </button>
            </div>

            <form onSubmit={handleCreateRequest} className="space-y-3 text-xs">
              <div>
                <label className="block text-neutral-700 font-semibold mb-1">Select Student</label>
                <OffsleekSelect
                  value={selectedStudentId}
                  onChange={(val) => setSelectedStudentId(val)}
                  options={students.map((st) => ({
                    value: st.id,
                    label: `${st.name} (${st.classGrade}-${st.section})`,
                  }))}
                  size="sm"
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-neutral-700 font-semibold mb-1">Document Type</label>
                <OffsleekSelect
                  value={docType}
                  onChange={(val) => setDocType(val as any)}
                  options={[
                    { value: 'Bonafide Certificate', label: 'Bonafide Certificate' },
                    { value: 'Study Certificate', label: 'Study Certificate' },
                    { value: 'Transfer Certificate', label: 'Transfer Certificate (TC)' },
                    { value: 'Duplicate ID Card', label: 'Duplicate ID Card' },
                  ]}
                  size="sm"
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-neutral-700 font-semibold mb-1">Reason / Purpose</label>
                <input
                  type="text"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g. Passport renewal / Visa verification"
                  className="w-full p-2 border rounded-lg"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setIsNewModalOpen(false)}
                  className="px-4 py-2 text-neutral-600 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-black text-white rounded-lg font-semibold hover:bg-neutral-800"
                >
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Printable Certificate Modal */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl border border-neutral-200 max-w-xl w-full p-6 md:p-8 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100 mb-4 print:hidden">
              <h3 className="text-sm font-bold text-neutral-900">Certificate Generation Preview</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 bg-neutral-900 text-white rounded-lg text-xs font-semibold hover:bg-neutral-800 cursor-pointer flex items-center gap-1"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Document</span>
                </button>
                <button onClick={() => setPreviewDoc(null)}>
                  <X className="w-5 h-5 text-neutral-400" />
                </button>
              </div>
            </div>

            {/* Certificate Canvas */}
            <div className="p-8 border-4 border-double border-neutral-300 rounded-xl space-y-6 text-center text-xs font-sans bg-white relative">
              <div className="flex justify-center mb-1">
                <OffsleekLogo size="sm" />
              </div>
              <h2 className="text-lg font-black uppercase tracking-wider text-neutral-900">{schoolInfo.name}</h2>
              <p className="text-[10px] text-neutral-500 uppercase tracking-widest">{schoolInfo.motto}</p>
              
              <div className="my-6 py-2 border-y border-neutral-200">
                <h3 className="text-sm font-black uppercase tracking-widest text-neutral-900">
                  {previewDoc.documentType}
                </h3>
              </div>

              <div className="text-left text-neutral-700 leading-relaxed text-xs space-y-4">
                <p>
                  This is to certify that <strong>{previewDoc.studentName}</strong> is a bonafide student of this institution, currently enrolled in <strong>{previewDoc.classGrade}</strong> for the academic year <strong>{schoolInfo.academicYear}</strong>.
                </p>
                <p>
                  To the best of our knowledge, their conduct and moral character have been exemplary. This certificate is issued on request for <em>{previewDoc.reason}</em>.
                </p>
              </div>

              <div className="pt-10 flex justify-between items-end border-t border-dashed border-neutral-200 text-[10px] text-neutral-500">
                <div className="text-left">
                  <span>Issued Date: {previewDoc.issuedDate || getTodayDateIST()}</span><br />
                  <span>Reference: {previewDoc.requestNo}</span>
                </div>
                <div className="text-center">
                  <div className="w-32 h-0.5 bg-neutral-400 mx-auto mb-1"></div>
                  <span className="font-bold text-neutral-800">Head of Institution</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
