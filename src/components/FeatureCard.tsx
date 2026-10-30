import React from 'react';

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

export const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description }) => {
  return (
    <div className="bg-white border border-neutral-200/90 rounded-xl sm:rounded-2xl p-3 sm:p-3.5 lg:p-4 xl:p-4.5 flex items-start gap-3 sm:gap-3.5 shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all hover:border-neutral-300 hover:shadow-xs">
      {/* Light-grey icon container holding a crisp black line icon */}
      <div className="w-9 h-9 sm:w-10 sm:h-10 lg:w-10.5 lg:h-10.5 rounded-xl bg-neutral-100 flex items-center justify-center shrink-0 text-black">
        {icon}
      </div>

      <div className="min-w-0 flex-1 pt-0.5">
        <h3 className="font-bold text-xs sm:text-sm lg:text-[15px] text-neutral-900 leading-snug tracking-tight mb-0.5 sm:mb-1">
          {title}
        </h3>
        <p className="text-[11px] sm:text-xs lg:text-[12.5px] xl:text-[13px] text-neutral-500 leading-relaxed text-wrap">
          {description}
        </p>
      </div>
    </div>
  );
};
