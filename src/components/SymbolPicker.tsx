interface SymbolPickerProps {
  symbols: string[];
  mode: 'single' | 'multi';
  selected: string | Set<string> | null;
  onSelect: (emoji: string) => void;
  disabled: boolean;
  correctSet?: Set<string> | null; // for showing correct/incorrect after verify
  verified?: boolean;
}

export function SymbolPicker({
  symbols,
  mode,
  selected,
  onSelect,
  disabled,
  correctSet,
  verified,
}: SymbolPickerProps) {
  const isSelected = (emoji: string): boolean => {
    if (mode === 'single') return selected === emoji;
    return selected instanceof Set && selected.has(emoji);
  };

  const getResultClass = (emoji: string): string => {
    if (!verified || !correctSet) return '';
    const sel = isSelected(emoji);
    const isCorrect = correctSet.has(emoji);

    if (sel && isCorrect) return 'symbol-btn--correct';
    if (sel && !isCorrect) return 'symbol-btn--wrong';
    if (!sel && isCorrect) return 'symbol-btn--missed';
    return '';
  };

  return (
    <div className="symbol-picker">
      {symbols.map(emoji => {
        const sel = isSelected(emoji);
        const resultClass = getResultClass(emoji);
        return (
          <button
            key={emoji}
            type="button"
            className={`symbol-btn ${sel ? 'symbol-btn--selected' : ''} ${resultClass}`}
            onClick={() => onSelect(emoji)}
            disabled={disabled}
            aria-pressed={sel}
          >
            {emoji}
          </button>
        );
      })}
    </div>
  );
}
