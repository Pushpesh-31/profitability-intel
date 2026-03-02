import { useAppStore } from '../../store/useAppStore';

export function ReferenceSelector() {
  const companies = useAppStore((state) => state.companies);
  const referenceTicker = useAppStore((state) => state.referenceTicker);
  const setReferenceTicker = useAppStore((state) => state.setReferenceTicker);

  return (
    <div className="flex items-center gap-2">
      <span className="text-muted text-sm">Reference:</span>
      <select
        value={referenceTicker}
        onChange={(e) => setReferenceTicker(e.target.value)}
        className="bg-card border border-border rounded-md px-3 py-1.5
                   text-text text-sm font-mono
                   focus:border-accent focus:outline-none"
      >
        {companies.map((c) => (
          <option key={c.data.ticker} value={c.data.ticker}>
            {c.data.ticker}
          </option>
        ))}
      </select>
    </div>
  );
}
