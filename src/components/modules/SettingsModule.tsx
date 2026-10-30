import React, { useState } from 'react';
import { Building, Save, ShieldCheck } from 'lucide-react';
import { useSchoolData } from '../../data/schoolContext';
import { OffsleekSelect } from '../OffsleekSelect';

export const SettingsModule: React.FC = () => {
  const { schoolInfo, updateSchoolInfo } = useSchoolData();

  const [name, setName] = useState(schoolInfo.name);
  const [motto, setMotto] = useState(schoolInfo.motto);
  const [code, setCode] = useState(schoolInfo.code);
  const [currencySymbol, setCurrencySymbol] = useState(schoolInfo.currencySymbol);
  const [address, setAddress] = useState(schoolInfo.address);
  const [phone, setPhone] = useState(schoolInfo.phone);
  const [email, setEmail] = useState(schoolInfo.email);
  const [principalName, setPrincipalName] = useState(schoolInfo.principalName);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSchoolInfo({
      name: name.trim(),
      motto: motto.trim(),
      code: code.trim(),
      currencySymbol,
      address: address.trim(),
      phone: phone.trim(),
      email: email.trim(),
      principalName: principalName.trim(),
    });
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-neutral-900 tracking-tight">School Configuration & Settings</h1>
        <p className="text-xs text-neutral-500 mt-0.5">
          Institution profile, multi-tenant academic rules, currencies, and administrative preferences
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Form (2 cols) */}
        <div className="lg:col-span-2 bg-white border border-neutral-200/90 rounded-2xl p-6 shadow-2xs">
          <form onSubmit={handleSave} className="space-y-4 text-xs">
            <h3 className="text-sm font-bold text-neutral-900 pb-2 border-b border-neutral-100">
              Institution Identity
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-neutral-700 font-semibold mb-1">School Legal Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl focus:outline-none focus:border-neutral-900 font-bold"
                  required
                />
              </div>

              <div>
                <label className="block text-neutral-700 font-semibold mb-1">School Code / Affiliation</label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl focus:outline-none focus:border-neutral-900 font-mono"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-neutral-700 font-semibold mb-1">School Motto / Vision</label>
              <input
                type="text"
                value={motto}
                onChange={(e) => setMotto(e.target.value)}
                className="w-full px-3 py-2 border rounded-xl focus:outline-none focus:border-neutral-900"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-neutral-700 font-semibold mb-1">Principal / Head of School</label>
                <input
                  type="text"
                  value={principalName}
                  onChange={(e) => setPrincipalName(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl focus:outline-none focus:border-neutral-900"
                />
              </div>

              <div>
                <label htmlFor="settings-currency" className="block text-neutral-700 font-semibold mb-1">Billing Currency</label>
                <OffsleekSelect
                  id="settings-currency"
                  value={currencySymbol}
                  onChange={setCurrencySymbol}
                  options={[
                    { value: '₹', label: 'Indian Rupee (₹)' },
                    { value: '$', label: 'US Dollar ($)' },
                    { value: '£', label: 'British Pound (£)' },
                    { value: '€', label: 'Euro (€)' },
                    { value: 'AED ', label: 'UAE Dirham (AED)' },
                  ]}
                  className="w-full"
                />
              </div>
            </div>

            <h3 className="text-sm font-bold text-neutral-900 pt-3 pb-2 border-b border-neutral-100">
              Campus Contact Details
            </h3>

            <div>
              <label className="block text-neutral-700 font-semibold mb-1">Campus Physical Address</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3 py-2 border rounded-xl focus:outline-none focus:border-neutral-900"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-neutral-700 font-semibold mb-1">Official Inquiry Phone</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl focus:outline-none focus:border-neutral-900"
                />
              </div>
              <div>
                <label className="block text-neutral-700 font-semibold mb-1">Official Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl focus:outline-none focus:border-neutral-900"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-neutral-100 flex justify-end">
              <button
                type="submit"
                className="px-5 py-2.5 bg-black text-white hover:bg-neutral-800 rounded-xl font-semibold flex items-center gap-2 cursor-pointer shadow-xs transition-colors"
              >
                <Save className="w-4 h-4" />
                <span>Save School Configuration</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right Info Card (1 col) */}
        <div className="space-y-4">
          <div className="bg-white border border-neutral-200/90 rounded-2xl p-5 shadow-2xs space-y-3">
            <div className="flex items-center gap-2 text-neutral-900 font-bold text-sm">
              <Building className="w-4 h-4" />
              <span>Multi-Tenant Architecture</span>
            </div>
            <p className="text-xs text-neutral-600 leading-relaxed">
              OFFSLEEK School OS supports multi-institution isolation. All records, fee transactions, and user sessions are mapped dynamically to the active school tenant.
            </p>
            <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 text-[11px] text-neutral-500 space-y-1">
              <div><strong>Tenant ID:</strong> TENANT-RIVERDALE-01</div>
              <div><strong>Region:</strong> Asia-South (Mumbai)</div>
              <div><strong>Data Isolation:</strong> Tenant Row-Level Enforcement</div>
            </div>
          </div>

          <div className="p-4 bg-neutral-100 rounded-2xl border border-neutral-200 text-xs text-neutral-600 space-y-1">
            <span className="font-bold text-neutral-900 block">Grading Rules Configuration</span>
            <p className="text-[11px] text-neutral-500">
              Standard 5-tier academic grading is enabled. Custom rubrics or percentage thresholds can be modified by the academic council.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};
