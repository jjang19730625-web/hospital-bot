'use client';

import { AIAnalysis, Urgency } from '@/types';

const URGENCY_CONFIG: Record<Urgency, { label: string; color: string; bg: string; border: string }> = {
  emergency: { label: '응급', color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-300' },
  high:      { label: '당일 진료 필요', color: 'text-orange-700', bg: 'bg-orange-50', border: 'border-orange-300' },
  medium:    { label: '빠른 진료 권장', color: 'text-yellow-700', bg: 'bg-yellow-50', border: 'border-yellow-300' },
  low:       { label: '일반 외래', color: 'text-green-700', bg: 'bg-green-50', border: 'border-green-300' },
};

interface Props {
  analysis: AIAnalysis;
}

export default function AnalysisCard({ analysis }: Props) {
  const urgency = URGENCY_CONFIG[analysis.urgency] ?? URGENCY_CONFIG.low;

  return (
    <div className={`mt-3 rounded-xl border ${urgency.border} ${urgency.bg} p-4 text-sm space-y-3`}>
      {/* 긴급도 */}
      <div className="flex items-center gap-2">
        <span className="text-gray-500 font-medium w-20 shrink-0">긴급도</span>
        <span className={`font-bold ${urgency.color}`}>
          {analysis.urgency === 'emergency' && '🚨 '}
          {analysis.urgency === 'high' && '⚠️ '}
          {analysis.urgency === 'medium' && '📋 '}
          {analysis.urgency === 'low' && '✅ '}
          {urgency.label}
        </span>
      </div>

      {/* 추천 진료과 */}
      {analysis.department && (
        <div className="flex items-start gap-2">
          <span className="text-gray-500 font-medium w-20 shrink-0">추천 진료과</span>
          <span className="font-semibold text-blue-700">🏥 {analysis.department}</span>
        </div>
      )}

      {/* 감지된 증상 */}
      {analysis.symptoms?.length > 0 && (
        <div className="flex items-start gap-2">
          <span className="text-gray-500 font-medium w-20 shrink-0">감지 증상</span>
          <div className="flex flex-wrap gap-1">
            {analysis.symptoms.map((s, i) => (
              <span key={i} className="bg-white border border-gray-200 rounded-full px-2 py-0.5 text-gray-700 text-xs">
                {s}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 의심 질환 */}
      {analysis.suspected_diseases?.length > 0 && (
        <div className="flex items-start gap-2">
          <span className="text-gray-500 font-medium w-20 shrink-0">의심 질환</span>
          <div className="flex flex-wrap gap-1">
            {analysis.suspected_diseases.map((d, i) => (
              <span key={i} className="bg-white border border-blue-200 rounded-full px-2 py-0.5 text-blue-700 text-xs">
                {d}
              </span>
            ))}
          </div>
        </div>
      )}

      <p className="text-xs text-gray-400 pt-1 border-t border-gray-200">
        ※ 이 분석은 참고용이며, 정확한 진단은 의사에게 받으세요.
      </p>
    </div>
  );
}
