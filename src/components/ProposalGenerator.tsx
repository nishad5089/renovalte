import { useState } from 'react';
import * as Icons from 'lucide-react';
import type { Project, PackageTier, ProposalOption } from '../types';
import { generateProposalOptions, estimateDisclaimer } from '../data/proposals';
import { formatEuro } from '../data/projects';
import { Card, Badge } from './ui';

interface Props {
  project: Project;
  options: ProposalOption[] | null;
  optionsGeneratedAt: number | null;
  onGenerate: (options: ProposalOption[]) => void;
  onSelect: (option: ProposalOption) => void;
  selectedTier: PackageTier | null;
}

const TIER_META: Record<PackageTier, { icon: string; accent: string; badge: string; border: string; gradient: string }> = {
  basic: { icon: 'Box', accent: 'text-navy-700', badge: 'bg-navy-100 text-navy-700', border: 'border-navy-200', gradient: 'from-navy-50 to-white' },
  standard: { icon: 'Star', accent: 'text-brand-700', badge: 'bg-brand-50 text-brand-700', border: 'border-brand-300', gradient: 'from-brand-50/60 to-white' },
  premium: { icon: 'Crown', accent: 'text-accent-700', badge: 'bg-accent-100 text-accent-700', border: 'border-accent-300', gradient: 'from-accent-50/60 to-white' },
};

export function ProposalGenerator({ project, options, optionsGeneratedAt, onGenerate, onSelect, selectedTier }: Props) {
  const [generating, setGenerating] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  function handleGenerate() {
    setGenerating(true);
    setTimeout(() => {
      const opts = generateProposalOptions(project);
      onGenerate(opts);
      setGenerating(false);
    }, 1400);
  }

  return (
    <Card className="overflow-hidden p-0">
      {/* Header */}
      <button
        type="button"
        onClick={() => setCollapsed(c => !c)}
        className="w-full px-5 py-4 border-b border-navy-100 flex items-center justify-between bg-gradient-to-r from-navy-900 to-navy-800 text-white"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center shrink-0">
            <Icons.FileText className="w-4 h-4" />
          </div>
          <div className="leading-none text-left">
            <p className="font-display font-700 text-sm">AI Proposal Generator</p>
            <p className="text-[10px] text-navy-300 mt-1">Three package options · simulated AI</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {options && <Badge color="bg-success-100 text-success-700"><Icons.CheckCircle2 className="w-3.5 h-3.5" /> {options.length} options</Badge>}
          <Icons.ChevronDown className={`w-4 h-4 text-white/80 transition-transform ${collapsed ? '' : 'rotate-180'}`} />
        </div>
      </button>

      {!collapsed && (
      <div className="p-5 space-y-5">
        {/* Disclaimer banner */}
        <div className="flex items-start gap-2 p-3 rounded-xl bg-warning-50 border border-warning-100">
          <Icons.AlertCircle className="w-4 h-4 text-warning-600 shrink-0 mt-0.5" />
          <p className="text-xs text-warning-700">{estimateDisclaimer()}</p>
        </div>

        {!options && !generating && (
          <div className="text-center py-10">
            <div className="w-14 h-14 rounded-2xl bg-brand-50 flex items-center justify-center mx-auto mb-3">
              <Icons.Sparkles className="w-7 h-7 text-brand-500" />
            </div>
            <p className="text-sm font-600 text-navy-700">No proposal options yet</p>
            <p className="text-xs text-navy-400 mt-1 max-w-sm mx-auto mb-4">
              Generate three renovation packages — Basic, Standard, and Premium — with scope, materials, price range, duration, assumptions, and exclusions.
            </p>
            <button onClick={handleGenerate} className="btn-primary">
              <Icons.Sparkles className="w-4 h-4" /> Generate proposal options
            </button>
          </div>
        )}

        {generating && (
          <div className="text-center py-10">
            <Icons.Loader2 className="w-8 h-8 text-brand-500 animate-spin mx-auto mb-3" />
            <p className="text-sm font-600 text-navy-700">Generating proposal options…</p>
            <div className="mt-4 max-w-md mx-auto space-y-3">
              {[0, 1, 2].map(i => (
                <div key={i} className="flex gap-3 items-start">
                  <div className="skeleton w-8 h-8 rounded-lg shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <div className="skeleton h-4 w-1/3" />
                    <div className="skeleton h-3 w-full" />
                    <div className="skeleton h-3 w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {options && !generating && (
          <>
            {/* Regenerate + meta */}
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs text-navy-400">{optionsGeneratedAt ? new Date(optionsGeneratedAt).toLocaleString('en-GB') : ''}</span>
              <button onClick={handleGenerate} className="btn-secondary text-xs">
                <Icons.RefreshCw className="w-3.5 h-3.5" /> Regenerate options
              </button>
            </div>

            {/* Side-by-side comparison */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {options.map(opt => (
                <OptionCard key={opt.tier} option={opt} selected={selectedTier === opt.tier} onSelect={() => onSelect(opt)} />
              ))}
            </div>
          </>
        )}
      </div>
      )}
    </Card>
  );
}

function OptionCard({ option, selected, onSelect }: { option: ProposalOption; selected: boolean; onSelect: () => void }) {
  const meta = TIER_META[option.tier];
  const Icon = (Icons as any)[meta.icon] as React.ComponentType<{ className?: string }>;
  const isStandard = option.tier === 'standard';

  return (
    <div className={`relative rounded-2xl border-2 ${selected ? meta.border + ' ring-2 ring-offset-1' : 'border-navy-100'} bg-gradient-to-b ${meta.gradient} overflow-hidden transition-all duration-200 hover:shadow-soft ${isStandard ? 'lg:scale-[1.02]' : ''}`}>
      {isStandard && (
        <div className="absolute top-0 right-0 bg-brand-600 text-white text-[10px] font-700 px-3 py-1 rounded-bl-lg uppercase tracking-wide">Recommended</div>
      )}
      <div className="p-4 space-y-4">
        {/* Tier header */}
        <div className="flex items-center gap-2">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${meta.badge}`}>
            {Icon && <Icon className="w-5 h-5" />}
          </div>
          <div>
            <p className={`font-display font-800 text-lg ${meta.accent}`}>{option.label}</p>
            <p className="text-[11px] text-navy-500 leading-tight">{option.tagline}</p>
          </div>
        </div>

        {/* Price range */}
        <div className="text-center py-2 rounded-xl bg-white/60">
          <p className="text-[10px] uppercase tracking-wide text-navy-400 font-500">Price range</p>
          <p className="font-display font-800 text-xl text-navy-900">
            {formatEuro(option.priceMin)} – {formatEuro(option.priceMax)}
          </p>
          <p className="text-[10px] text-warning-600 mt-0.5">Unverified estimate</p>
        </div>

        {/* Duration */}
        <div className="flex items-center gap-2 text-xs text-navy-600">
          <Icons.Clock className="w-3.5 h-3.5 text-navy-400" />
          <span className="font-500">Duration:</span>
          <span>{option.durationWeeks}</span>
        </div>

        {/* Quality level */}
        <div className="flex items-start gap-2 text-xs text-navy-600">
          <Icons.Gem className="w-3.5 h-3.5 text-navy-400 mt-0.5 shrink-0" />
          <span>{option.qualityLevel}</span>
        </div>

        {/* Work scope */}
        <div>
          <p className="text-[10px] uppercase tracking-wide text-navy-400 font-600 mb-1.5">Work scope</p>
          <ul className="space-y-1">
            {option.workScope.map((s, i) => (
              <li key={i} className="flex items-start gap-1.5 text-xs text-navy-700">
                <Icons.Check className="w-3 h-3 text-success-500 shrink-0 mt-0.5" />
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Materials */}
        <div>
          <p className="text-[10px] uppercase tracking-wide text-navy-400 font-600 mb-1.5">Materials</p>
          <ul className="space-y-1">
            {option.materials.map((m, i) => (
              <li key={i} className="flex items-start gap-1.5 text-xs text-navy-700">
                <Icons.Box className="w-3 h-3 text-accent-500 shrink-0 mt-0.5" />
                <span>{m}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Assumptions */}
        <div>
          <p className="text-[10px] uppercase tracking-wide text-navy-400 font-600 mb-1.5">Assumptions</p>
          <ul className="space-y-1">
            {option.assumptions.map((a, i) => (
              <li key={i} className="flex items-start gap-1.5 text-xs text-navy-600">
                <Icons.HelpCircle className="w-3 h-3 text-accent-400 shrink-0 mt-0.5" />
                <span>{a}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Exclusions */}
        <div>
          <p className="text-[10px] uppercase tracking-wide text-navy-400 font-600 mb-1.5">Exclusions</p>
          <ul className="space-y-1">
            {option.exclusions.map((e, i) => (
              <li key={i} className="flex items-start gap-1.5 text-xs text-navy-500">
                <Icons.X className="w-3 h-3 text-danger-400 shrink-0 mt-0.5" />
                <span>{e}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Select button */}
        <button
          onClick={onSelect}
          className={`w-full ${selected ? 'btn-primary' : 'btn-secondary'} text-sm`}
        >
          {selected ? (
            <><Icons.CheckCircle2 className="w-4 h-4" /> Selected</>
          ) : (
            <><Icons.MousePointerClick className="w-4 h-4" /> Select package</>
          )}
        </button>
      </div>
    </div>
  );
}
