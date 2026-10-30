import React from 'react';
import { BookOpen } from 'lucide-react';

interface SchoolBrandLogoProps {
  schoolLogoUrl?: string;
  schoolName?: string;
}

/**
 * School Sign-in Identity Component
 * Displays a neutral school administrator identity with an open-book academic emblem.
 * Prepared for future multi-tenant dynamic school logo and name loading.
 */
export const SchoolBrandLogo: React.FC<SchoolBrandLogoProps> = ({
  schoolLogoUrl,
  schoolName,
}) => {
  return (
    <div className="flex flex-col items-center text-center">
      {/* Neutral Academic Emblem or Tenant School Logo */}
      <div className="w-12 h-12 sm:w-13 sm:h-13 rounded-2xl bg-neutral-900 flex items-center justify-center text-white shadow-sm mb-2.5 sm:mb-3">
        {schoolLogoUrl ? (
          <img
            src={schoolLogoUrl}
            alt={schoolName || 'School Logo'}
            className="w-7 h-7 sm:w-8 sm:h-8 object-contain"
            referrerPolicy="no-referrer"
          />
        ) : (
          <BookOpen className="w-6 h-6 sm:w-6.5 sm:h-6.5 text-white stroke-[1.9]" aria-hidden="true" />
        )}
      </div>

      {/* Identity Title: School Administrator or custom school name */}
      <h2 className="text-xl sm:text-2xl lg:text-[1.65rem] font-bold text-neutral-900 tracking-tight leading-tight">
        {schoolName || 'School Administrator'}
      </h2>

      {/* Subtitle */}
      <p className="text-xs sm:text-sm text-neutral-500 mt-1 sm:mt-1.5">
        Sign in to your school dashboard
      </p>
    </div>
  );
};
