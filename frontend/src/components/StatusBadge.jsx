import React from 'react';
import { Clock, CheckCircle2, AlertCircle } from 'lucide-react';

const StatusBadge = ({ status }) => {
  switch (status) {
    case 'อนุมัติแล้ว':
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <CheckCircle2 className="w-3.5 h-3.5" />
          อนุมัติแล้ว
        </span>
      );
    case 'ส่งกลับเพื่อแก้ไข':
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
          <AlertCircle className="w-3.5 h-3.5" />
          ส่งกลับเพื่อแก้ไข
        </span>
      );
    case 'รอพิจารณา':
    default:
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
          <Clock className="w-3.5 h-3.5" />
          รอพิจารณา
        </span>
      );
  }
};

export default StatusBadge;
