import { ArrowLeft, FileText } from 'lucide-react';
import { promptTemplates } from '@/data/promptTemplates';

interface PromptRepoModuleProps {
  onBack: () => void;
  onUseTemplate: (prompt: string) => void;
}

export function PromptRepoModule({ onBack, onUseTemplate }: PromptRepoModuleProps) {
  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#F5F6F7]">
      <header className="h-14 flex items-center gap-3 px-5 bg-white border-b border-[#DEE0E3] flex-shrink-0">
        <button
          onClick={onBack}
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F5F6F7] text-[#8F959E] hover:text-[#3370FF] transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-[#3370FF]" />
          <h1 className="text-base font-semibold text-[#1F2329]">提示词仓库</h1>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-6">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {promptTemplates.map(t => (
            <button
              key={t.id}
              onClick={() => onUseTemplate(t.prompt)}
              className="text-left bg-white rounded-xl border border-[#DEE0E3] p-5 hover:border-[#3370FF] hover:shadow-sm transition-all group"
            >
              <div className="text-xs font-medium text-[#3370FF] mb-2">{t.category}</div>
              <h3 className="text-sm font-semibold text-[#1F2329] mb-2 group-hover:text-[#3370FF]">
                {t.title}
              </h3>
              <p className="text-xs text-[#8F959E] line-clamp-2 mb-4">{t.description}</p>
              <p className="text-xs text-[#C9CDD4] line-clamp-2 font-mono bg-[#F5F6F7] rounded p-2">
                {t.prompt}
              </p>
            </button>
          ))}
        </div>
      </main>
    </div>
  );
}
