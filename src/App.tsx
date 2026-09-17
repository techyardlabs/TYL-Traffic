import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Sliders, 
  Network, 
  PieChart, 
  Laptop, 
  Globe2, 
  MousePointer, 
  Tags, 
  Save, 
  Download, 
  Plus, 
  Sparkles,
  CheckCircle2,
  Zap,
  Activity,
  Globe,
  Server
} from 'lucide-react';
import { FullCampaignConfig, CampaignStatus } from './types/campaign';
import { INITIAL_CAMPAIGNS } from './data/mockData';
import { Header } from './components/Header';
import { CampaignOverviewBanner } from './components/CampaignOverviewBanner';
import { ModuleAnalytics } from './components/ModuleAnalytics';
import { ModuleVolumeBehavior } from './components/ModuleVolumeBehavior';
import { ModuleUrlRouting } from './components/ModuleUrlRouting';
import { ModuleTrafficSplitting } from './components/ModuleTrafficSplitting';
import { ModuleDeviceTargeting } from './components/ModuleDeviceTargeting';
import { ModuleGeoProxy } from './components/ModuleGeoProxy';
import { ModuleBehavioralSimulation } from './components/ModuleBehavioralSimulation';
import { ModuleTrackingHeaders } from './components/ModuleTrackingHeaders';
import { LiveSimulationModal } from './components/LiveSimulationModal';
import { PrismaSchemaViewer } from './components/PrismaSchemaViewer';
import { PlaywrightWorkerInspector } from './components/PlaywrightWorkerInspector';
import { CampaignPresetsModal } from './components/CampaignPresetsModal';
import { ClusterQueueManagerModal } from './components/ClusterQueueManagerModal';
import { AccountSecurityModal } from './components/AccountSecurityModal';
import { AddWebsiteModal } from './components/AddWebsiteModal';
import { WebsitesManagerModal } from './components/WebsitesManagerModal';
import { SparkProjectsDashboard } from './components/SparkProjectsDashboard';
import { LoginPortal } from './components/LoginPortal';
import { AuthProvider, useAuth } from './context/AuthContext';

function CampaignPortalDashboard() {
  const { isAuthenticated, isLoading } = useAuth();
  
  // Primary view: 'projects' (SparkTraffic project dashboard) vs 'configure' (Full campaign modules)
  const [mainView, setMainView] = useState<'projects' | 'configure'>('projects');

  const [campaigns, setCampaigns] = useState<FullCampaignConfig[]>(() => {
    try {
      const saved = localStorage.getItem('tyl_campaigns_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Could not read saved campaigns', e);
    }
    return INITIAL_CAMPAIGNS;
  });

  const [activeCampaignId, setActiveCampaignId] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('tyl_campaigns_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed[0].id;
        }
      }
    } catch (e) {
      // fallback
    }
    return INITIAL_CAMPAIGNS[0].id;
  });
  
  // Modals state
  const [isSimulationOpen, setIsSimulationOpen] = useState(false);
  const [isPrismaOpen, setIsPrismaOpen] = useState(false);
  const [isWorkerInspectorOpen, setIsWorkerInspectorOpen] = useState(false);
  const [isPresetsOpen, setIsPresetsOpen] = useState(false);
  const [isClusterQueueOpen, setIsClusterQueueOpen] = useState(false);
  const [isAccountSecurityOpen, setIsAccountSecurityOpen] = useState(false);
  const [isAddWebsiteOpen, setIsAddWebsiteOpen] = useState(false);
  const [isWebsitesManagerOpen, setIsWebsitesManagerOpen] = useState(false);

  // Active module navigation anchor
  const [activeSection, setActiveSection] = useState<string>('analytics');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync with backend on mount
  useEffect(() => {
    fetch('/api/campaigns')
      .then(res => res.json())
      .then(data => {
        if (data?.success && Array.isArray(data.campaigns) && data.campaigns.length > 0) {
          setCampaigns(data.campaigns);
          if (!data.campaigns.some((c: any) => c.id === activeCampaignId)) {
            setActiveCampaignId(data.campaigns[0].id);
          }
          localStorage.setItem('tyl_campaigns_v1', JSON.stringify(data.campaigns));
        }
      })
      .catch(() => {
        // Run with local storage if backend is unavailable
      });
  }, []);

  const currentCampaign = campaigns.find(c => c.id === activeCampaignId) || campaigns[0] || INITIAL_CAMPAIGNS[0];

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Update current campaign
  const updateCurrentCampaign = (updates: Partial<FullCampaignConfig>) => {
    setCampaigns(prev => {
      const updatedList = prev.map(c => {
        if (c.id === currentCampaign.id) {
          const updated = {
            ...c,
            ...updates,
            updatedAt: new Date().toISOString()
          };
          fetch('/api/campaigns/save', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ campaign: updated })
          }).catch(() => {});
          return updated;
        }
        return c;
      });
      localStorage.setItem('tyl_campaigns_v1', JSON.stringify(updatedList));
      return updatedList;
    });
  };

  // Status toggle
  const handleToggleStatus = (newStatus: CampaignStatus) => {
    updateCurrentCampaign({ status: newStatus });
    showToast(`Traffic status for ${currentCampaign.targetDomain} updated to ${newStatus}`);
  };

  // Toggle status for any specific campaign
  const handleToggleCampaignStatus = (campaignId: string, newStatus: CampaignStatus) => {
    setCampaigns(prev => {
      const updatedList = prev.map(c => {
        if (c.id === campaignId) {
          const updated = { ...c, status: newStatus, updatedAt: new Date().toISOString() };
          fetch('/api/campaigns/save', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ campaign: updated })
          }).catch(() => {});
          return updated;
        }
        return c;
      });
      localStorage.setItem('tyl_campaigns_v1', JSON.stringify(updatedList));
      return updatedList;
    });
    showToast(`Traffic status updated to ${newStatus}`);
  };

  // Add a new Website with separate traffic rules
  const handleAddWebsite = (newCampaign: FullCampaignConfig, startImmediately: boolean) => {
    const finalCampaign: FullCampaignConfig = {
      ...newCampaign,
      status: (startImmediately ? 'RUNNING' : 'DRAFT') as CampaignStatus
    };
    const updated = [finalCampaign, ...campaigns];
    setCampaigns(updated);
    setActiveCampaignId(finalCampaign.id);
    localStorage.setItem('tyl_campaigns_v1', JSON.stringify(updated));
    showToast(`Added website "${finalCampaign.targetDomain}" with separate traffic rules!`);

    fetch('/api/campaigns/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ campaign: finalCampaign })
    }).catch(err => console.warn('Failed to persist campaign:', err));
  };

  // Duplicate a website's traffic rules to a new site
  const handleDuplicateWebsite = (sourceId: string) => {
    const source = campaigns.find(c => c.id === sourceId);
    if (!source) return;

    const newId = `site_${Math.random().toString(36).substring(2, 9)}`;
    const duplicated: FullCampaignConfig = {
      ...JSON.parse(JSON.stringify(source)),
      id: newId,
      name: `${source.name} (Copy)`,
      status: 'DRAFT',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      totalViewsDelivered: 0,
      totalVisitsDelivered: 0
    };

    const updated = [duplicated, ...campaigns];
    setCampaigns(updated);
    setActiveCampaignId(newId);
    localStorage.setItem('tyl_campaigns_v1', JSON.stringify(updated));
    showToast(`Duplicated website rules to "${duplicated.name}"!`);

    fetch('/api/campaigns/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ campaign: duplicated })
    }).catch(() => {});
  };

  // Delete a website
  const handleDeleteWebsite = (idToDelete: string) => {
    if (campaigns.length <= 1) {
      showToast('Cannot delete the only remaining website.');
      return;
    }
    const updated = campaigns.filter(c => c.id !== idToDelete);
    setCampaigns(updated);
    if (activeCampaignId === idToDelete) {
      setActiveCampaignId(updated[0].id);
    }
    localStorage.setItem('tyl_campaigns_v1', JSON.stringify(updated));
    showToast('Website removed from dashboard.');

    fetch(`/api/campaigns/${idToDelete}`, { method: 'DELETE' }).catch(() => {});
  };

  // Export campaign JSON config
  const handleExportJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(currentCampaign, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `campaign_${currentCampaign.id}_config.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('Configuration exported as JSON');
  };

  // Preset apply handler
  const handleApplyPreset = (presetUpdates: Partial<FullCampaignConfig>) => {
    updateCurrentCampaign(presetUpdates);
    showToast('Preset parameters applied to campaign!');
  };

  // Successful test simulation callback
  const handleSimulateSuccess = () => {
    updateCurrentCampaign({
      totalViewsDelivered: currentCampaign.totalViewsDelivered + currentCampaign.urlRouting.innerPagesPerVisit,
      totalVisitsDelivered: currentCampaign.totalVisitsDelivered + 1,
      creditsBalance: Math.max(0, currentCampaign.creditsBalance - 5)
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400 gap-3 font-sans">
        <div className="h-9 w-9 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-mono text-slate-400">Verifying authorized cluster session...</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPortal />;
  }

  const navItems = [
    { id: 'analytics', label: 'Analytics & Delivery', icon: BarChart3 },
    { id: 'volume', label: 'Volume & Pacing', icon: Sliders },
    { id: 'routing', label: 'URL Flow & Routing', icon: Network },
    { id: 'traffic', label: 'Traffic Splitting', icon: PieChart },
    { id: 'device', label: 'Device & OS Target', icon: Laptop },
    { id: 'geo', label: 'Geo & Residential Proxy', icon: Globe2 },
    { id: 'behavior', label: 'Behavioral Simulation', icon: MousePointer },
    { id: 'tracking', label: 'UTM & Custom Headers', icon: Tags },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col selection:bg-indigo-500 selection:text-white">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-white font-medium text-xs shadow-2xl animate-in slide-in-from-bottom-5 duration-200 border border-indigo-400/40">
          <CheckCircle2 className="h-4 w-4 text-emerald-300" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Global Header */}
      <Header 
        campaigns={campaigns}
        currentCampaign={currentCampaign}
        onSelectCampaign={(id) => setActiveCampaignId(id)}
        onToggleStatus={handleToggleStatus}
        onOpenSimulation={() => setIsSimulationOpen(true)}
        onOpenPrismaSchema={() => setIsPrismaOpen(true)}
        onOpenWorkerInspector={() => setIsWorkerInspectorOpen(true)}
        onOpenPresets={() => setIsPresetsOpen(true)}
        onOpenClusterQueue={() => setIsClusterQueueOpen(true)}
        onOpenAccountSecurity={() => setIsAccountSecurityOpen(true)}
        onOpenAddWebsite={() => setIsAddWebsiteOpen(true)}
        onOpenWebsitesManager={() => setIsWebsitesManagerOpen(true)}
        activeWorkersCount={4}
      />

      {/* Top View Selector Bar: 'My projects' vs 'Configure Rules' */}
      <div className="bg-slate-900/70 border-b border-slate-800/80 px-4 lg:px-8 py-2.5">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800">
            <button
              type="button"
              id="view-toggle-projects"
              onClick={() => setMainView('projects')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                mainView === 'projects'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Globe className="h-3.5 w-3.5" />
              <span>My projects</span>
              <span className="px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 font-mono text-[10px]">
                {campaigns.length}
              </span>
            </button>

            <button
              type="button"
              id="view-toggle-configure"
              onClick={() => setMainView('configure')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                mainView === 'configure'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sliders className="h-3.5 w-3.5" />
              <span>Configure Traffic Rules: {currentCampaign.targetDomain}</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              id="btn-add-website-top-bar"
              onClick={() => setIsAddWebsiteOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Site</span>
            </button>

            <button
              type="button"
              id="btn-all-sites-manager-top-bar"
              onClick={() => setIsWebsitesManagerOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium border border-slate-700 transition-all cursor-pointer"
            >
              <span>Manage Websites</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-6">
        
        {/* VIEW 1: My projects Dashboard (Matching image.png) */}
        {mainView === 'projects' ? (
          <SparkProjectsDashboard
            campaigns={campaigns}
            activeCampaignId={activeCampaignId}
            onSelectCampaign={(id) => {
              setActiveCampaignId(id);
              setMainView('configure');
            }}
            onOpenAddWebsite={() => setIsAddWebsiteOpen(true)}
            onOpenConfigureSite={(id) => {
              setActiveCampaignId(id);
              setMainView('configure');
            }}
            onToggleStatus={handleToggleCampaignStatus}
          />
        ) : (
          /* VIEW 2: Deep Traffic Rules Configuration for Active Website (Matching screencapture.jpg) */
          <>
            {/* Navigation Breadcrumb */}
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800/60">
              <button
                type="button"
                id="btn-back-to-projects"
                onClick={() => setMainView('projects')}
                className="flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 font-bold transition-colors cursor-pointer"
              >
                <span>← Back to My projects</span>
              </button>

              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-400">Configuring traffic rules for:</span>
                <span className="font-mono text-white font-bold bg-slate-900 px-2.5 py-1 rounded-lg border border-indigo-500/30 text-xs">
                  {currentCampaign.targetDomain}
                </span>
                {currentCampaign.advancedTracking.gaMeasurementId && (
                  <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                    GA4: {currentCampaign.advancedTracking.gaMeasurementId}
                  </span>
                )}
              </div>
            </div>

            {/* Module A: Project Overview Banner */}
            <CampaignOverviewBanner 
              campaign={currentCampaign}
              onUpdateCampaign={updateCurrentCampaign}
              onOpenAddWebsite={() => setIsAddWebsiteOpen(true)}
              onOpenWebsitesManager={() => setIsWebsitesManagerOpen(true)}
              totalWebsitesCount={campaigns.length}
            />

            {/* Sticky Secondary Module Navigation Bar */}
            <div className="sticky top-[61px] z-30 mb-6 bg-slate-900/90 backdrop-blur-md rounded-xl border border-slate-800/80 p-1.5 flex items-center justify-between gap-2 overflow-x-auto shadow-md">
          
          <div className="flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  id={`nav-tab-${item.id}`}
                  onClick={() => {
                    setActiveSection(item.id);
                    const el = document.getElementById(`section-${item.id}`);
                    if (el) {
                      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                    activeSection === item.id
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-1.5 pl-2 border-l border-slate-800 shrink-0">
            <button
              id="btn-create-campaign"
              onClick={() => setIsAddWebsiteOpen(true)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-xs font-bold text-white shadow-sm cursor-pointer"
              title="Add New Website with Custom Rules"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Site</span>
            </button>

            <button
              id="btn-all-sites-nav"
              onClick={() => setIsWebsitesManagerOpen(true)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 cursor-pointer"
              title="View All Added Websites"
            >
              <Globe className="h-3.5 w-3.5 text-indigo-400" />
              <span className="hidden sm:inline">Sites ({campaigns.length})</span>
            </button>

            <button
              id="btn-export-json"
              onClick={handleExportJson}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 cursor-pointer"
              title="Export JSON Configuration"
            >
              <Download className="h-3.5 w-3.5 text-emerald-400" />
              <span className="hidden md:inline">Export</span>
            </button>
          </div>

        </div>

        {/* Configuration Modules List */}
        
        {/* Module A: Analytics & Real-Time Delivery */}
        <section id="section-analytics">
          <ModuleAnalytics campaign={currentCampaign} />
        </section>

        {/* Module B: Volume & Behavior Sliders */}
        <section id="section-volume">
          <ModuleVolumeBehavior 
            config={currentCampaign.volumeBehavior}
            innerPagesCount={currentCampaign.urlRouting.innerPagesPerVisit}
            onUpdate={(updates) => updateCurrentCampaign({
              volumeBehavior: { ...currentCampaign.volumeBehavior, ...updates }
            })}
          />
        </section>

        {/* Module C: URL Routing & Flow Architecture */}
        <section id="section-routing">
          <ModuleUrlRouting 
            config={currentCampaign.urlRouting}
            targetDomain={currentCampaign.targetDomain}
            onUpdate={(updates) => updateCurrentCampaign({
              urlRouting: { ...currentCampaign.urlRouting, ...updates }
            })}
          />
        </section>

        {/* Module D: Source & Traffic Splitting */}
        <section id="section-traffic">
          <ModuleTrafficSplitting 
            config={currentCampaign.trafficSplitting}
            onUpdate={(updates) => updateCurrentCampaign({
              trafficSplitting: { ...currentCampaign.trafficSplitting, ...updates }
            })}
          />
        </section>

        {/* Module E: Device & OS Targeting */}
        <section id="section-device">
          <ModuleDeviceTargeting 
            config={currentCampaign.deviceTargeting}
            onUpdate={(updates) => updateCurrentCampaign({
              deviceTargeting: { ...currentCampaign.deviceTargeting, ...updates }
            })}
          />
        </section>

        {/* Module F: Residential Proxy & Geo-Targeting */}
        <section id="section-geo">
          <ModuleGeoProxy 
            config={currentCampaign.geoProxy}
            onUpdate={(updates) => updateCurrentCampaign({
              geoProxy: { ...currentCampaign.geoProxy, ...updates }
            })}
          />
        </section>

        {/* Module G: In-Page Event & Behavioral Simulation */}
        <section id="section-behavior">
          <ModuleBehavioralSimulation 
            config={currentCampaign.behavioralSimulation}
            onUpdate={(updates) => updateCurrentCampaign({
              behavioralSimulation: { ...currentCampaign.behavioralSimulation, ...updates }
            })}
          />
        </section>

        {/* Module H: Advanced Tracking & Headers */}
        <section id="section-tracking">
          <ModuleTrackingHeaders 
            config={currentCampaign.advancedTracking}
            targetDomain={currentCampaign.targetDomain}
            onUpdate={(updates) => updateCurrentCampaign({
              advancedTracking: { ...currentCampaign.advancedTracking, ...updates }
            })}
          />
        </section>

        {/* Bottom Save / Deploy Action Bar */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xl backdrop-blur-md mb-8">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
              <Zap className="h-5 w-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-white">
                {currentCampaign.targetDomain} — Traffic Rules Synced
              </div>
              <div className="text-xs text-slate-400">
                All rules for this site are active and isolated. Changes immediately propagate to workers.
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="btn-add-another-bottom"
              onClick={() => setIsAddWebsiteOpen(true)}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Add Another Site</span>
            </button>
            <button
              id="btn-test-simulation-bottom"
              onClick={() => setIsSimulationOpen(true)}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer"
            >
              <Activity className="h-4 w-4 text-indigo-400" />
              <span>Virtual Simulator</span>
            </button>
            <button
              id="btn-open-cluster-queue-bottom"
              onClick={() => setIsClusterQueueOpen(true)}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/25 flex items-center gap-2 transition-all cursor-pointer"
            >
              <Save className="h-4 w-4" />
              <span>Dispatch Real Traffic &amp; PostgreSQL</span>
            </button>
          </div>
        </div>
      </>
    )}

      </main>

      {/* Modals */}
      <AddWebsiteModal
        isOpen={isAddWebsiteOpen}
        onClose={() => setIsAddWebsiteOpen(false)}
        onAddWebsite={handleAddWebsite}
      />

      <WebsitesManagerModal
        isOpen={isWebsitesManagerOpen}
        onClose={() => setIsWebsitesManagerOpen(false)}
        campaigns={campaigns}
        currentCampaignId={activeCampaignId}
        onSelectCampaign={(id) => setActiveCampaignId(id)}
        onOpenAddWebsite={() => setIsAddWebsiteOpen(true)}
        onToggleStatus={handleToggleCampaignStatus}
        onDuplicateWebsite={handleDuplicateWebsite}
        onDeleteWebsite={handleDeleteWebsite}
      />

      <ClusterQueueManagerModal 
        isOpen={isClusterQueueOpen}
        onClose={() => setIsClusterQueueOpen(false)}
        campaign={currentCampaign}
        onJobDispatched={() => {
          showToast('Traffic task dispatched to cluster queue!');
          handleSimulateSuccess();
        }}
      />

      <LiveSimulationModal 
        isOpen={isSimulationOpen}
        onClose={() => setIsSimulationOpen(false)}
        campaign={currentCampaign}
        onSimulateSuccess={handleSimulateSuccess}
      />

      <PrismaSchemaViewer 
        isOpen={isPrismaOpen}
        onClose={() => setIsPrismaOpen(false)}
      />

      <PlaywrightWorkerInspector 
        isOpen={isWorkerInspectorOpen}
        onClose={() => setIsWorkerInspectorOpen(false)}
      />

      <CampaignPresetsModal 
        isOpen={isPresetsOpen}
        onClose={() => setIsPresetsOpen(false)}
        onApplyPreset={handleApplyPreset}
      />

      <AccountSecurityModal
        isOpen={isAccountSecurityOpen}
        onClose={() => setIsAccountSecurityOpen(false)}
      />

    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CampaignPortalDashboard />
    </AuthProvider>
  );
}
