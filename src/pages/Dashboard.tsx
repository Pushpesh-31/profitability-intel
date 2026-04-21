import {
  useAppStore,
  useSelectedCompany,
  useReferenceCompany,
} from '../store/useAppStore';
import { PageShell } from '../components/layout/PageShell';
import { Header } from '../components/layout/Header';
import { AssumptionsPanel } from '../components/layout/AssumptionsPanel';
import { GlossaryPanel } from '../components/layout/GlossaryPanel';
import { FilterTabs } from '../components/ui/FilterTabs';
import { ViewTabToggle } from '../components/ui/ViewTabToggle';
import { ReferenceSelector } from '../components/ui/ReferenceSelector';
import { CompanyPillTabs } from '../components/ui/CompanyPillTabs';
import { DeepDiveView } from '../components/views/DeepDiveView';
import { CompareView } from '../components/views/CompareView';

export function Dashboard() {
  const activeViewTab = useAppStore((state) => state.activeViewTab);
  const selectedCompany = useSelectedCompany();
  const referenceCompany = useReferenceCompany();

  return (
    <PageShell>
      <Header />
      <AssumptionsPanel />
      <GlossaryPanel />

      {/* Navigation Row */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
        <FilterTabs />
        <div className="flex items-center gap-4">
          <ViewTabToggle />
          {activeViewTab === 'compare' && <ReferenceSelector />}
        </div>
      </div>

      {/* Company Pills */}
      <CompanyPillTabs />

      {/* Main Content Area */}
      <div className="mt-6">
        {selectedCompany ? (
          activeViewTab === 'deep-dive' ? (
            <DeepDiveView company={selectedCompany} />
          ) : referenceCompany ? (
            selectedCompany.data.ticker === referenceCompany.data.ticker ? (
              <div className="bg-card border border-border rounded-lg p-8 text-center">
                <p className="text-muted">
                  Select a different company to compare with the reference
                </p>
                <p className="text-sm text-muted/70 mt-2">
                  The selected company is the same as the reference company
                </p>
              </div>
            ) : (
              <CompareView selected={selectedCompany} reference={referenceCompany} />
            )
          ) : (
            <div className="bg-card border border-border rounded-lg p-8 text-center">
              <p className="text-muted">Select a reference company to compare</p>
            </div>
          )
        ) : (
          <div className="bg-card border border-border rounded-lg p-8 text-center">
            <p className="text-muted">
              Select a company to view detailed analysis
            </p>
            <p className="text-sm text-muted/70 mt-2">
              Add a company using the ticker input above, or select from the pills
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="mt-12 pt-6 border-t border-border text-center text-muted text-xs">
        <p>Profitability Intelligence Dashboard</p>
        <p className="mt-1">
          DuPont Analysis · ROIC · EVA · Operating & Financial Leverage
        </p>
      </footer>
    </PageShell>
  );
}
