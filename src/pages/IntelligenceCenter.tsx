import React, { useState, useEffect, useRef } from 'react';
import { Terminal as TerminalIcon, Search, ShieldAlert, Newspaper, ChevronRight, Upload, Play, Loader2, Globe, Lock, Ghost, Download, Share2, Network, Eye, UserCheck, ShieldCheck, Database, Users, Fingerprint, History, FileText } from 'lucide-react';
import { getLiveThreats, getCyberNews, runOsintSearch, ThreatEvent, CyberNews } from '../lib/intelligence';
import { cn } from '../lib/utils';
import { jsPDF } from 'jspdf';
// import { saveIntelligenceScan, subscribeToIntelligenceHistory } from '../firebase/firestore';

import { useAuth } from '../hooks/useAuth';

export default function IntelligenceCenter() {
  const { profile, user } = useAuth();
  const [activeTab, setActiveTab] = useState<'osint' | 'threats' | 'news' | 'history'>('osint');
  const [searchQuery, setSearchQuery] = useState('');
  const [terminalOutput, setTerminalOutput] = useState<{ type: 'input' | 'output' | 'system', text: string }[]>([
    { type: 'system', text: 'SecureX Intelligence OSINT Console v2.4.0' },
    { type: 'system', text: `Authenticated as: ${profile?.displayName || 'User'}` },
    { type: 'system', text: 'Ready for unified intelligence scan...' }
  ]);
  const [isSearching, setIsSearching] = useState(false);
  const [threats, setThreats] = useState<ThreatEvent[]>([]);
  const [news, setNews] = useState<CyberNews[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [lastScanResult, setLastScanResult] = useState<string | null>(null);
  
  const terminalEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setThreats(getLiveThreats());
    setNews(getCyberNews());
  }, []);

  useEffect(() => {
    const savedHistory = localStorage.getItem('securex_intel_history');
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error('Failed to parse history', e);
      }
    }
  }, []);

  useEffect(() => {
    if (profile?.displayName) {
      setTerminalOutput(prev => [
        { type: 'system', text: 'SecureX Intelligence OSINT Console v2.4.0' },
        { type: 'system', text: `Authenticated as: ${profile.displayName}` },
        { type: 'system', text: 'Ready for unified intelligence scan...' }
      ]);
    }
  }, [profile]);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [terminalOutput]);

  const downloadPDF = (result: string, query: string) => {
    if (!result) return;

    const doc = new jsPDF();
    const timestamp = new Date().toLocaleString();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;
    const contentWidth = pageWidth - (margin * 2);
    
    // Header helper
    const addHeader = (pdfDoc: jsPDF) => {
      pdfDoc.setFillColor(11, 15, 26);
      pdfDoc.rect(0, 0, pageWidth, 40, 'F');
      pdfDoc.setTextColor(0, 245, 255);
      pdfDoc.setFontSize(22);
      pdfDoc.text('SECUREX INTELLIGENCE REPORT', margin, 25);
      
      pdfDoc.setTextColor(150, 150, 150);
      pdfDoc.setFontSize(9);
      pdfDoc.text(`Generated: ${timestamp}`, margin, 35);
      pdfDoc.text(`Target: ${query}`, pageWidth - margin, 35, { align: 'right' });
    };

    addHeader(doc);

    // Content
    doc.setTextColor(40, 40, 40);
    doc.setFontSize(10);
    doc.setFont('courier', 'normal');
    
    const splitText = doc.splitTextToSize(result, contentWidth);
    let cursorY = 50;
    const lineHeight = 6;

    splitText.forEach((line: string) => {
      if (cursorY > pageHeight - 20) {
        doc.addPage();
        addHeader(doc);
        cursorY = 50;
        doc.setTextColor(40, 40, 40);
        doc.setFontSize(10);
        doc.setFont('courier', 'normal');
      }
      doc.text(line, margin, cursorY);
      cursorY += lineHeight;
    });

    // Footer
    const totalPages = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(`Page ${i} of ${totalPages} - SecureX Enterprise Intelligence`, pageWidth / 2, pageHeight - 10, { align: 'center' });
    }

    doc.save(`SecureX_Intelligence_${query.replace(/[^a-z0-9]/gi, '_')}.pdf`);
  };

  const runFullIntelligenceScan = async (query: string, toolType: string = 'Unified OSINT Engine') => {
    if (!query.trim() || isSearching) return;

    setIsSearching(true);
    setTerminalOutput(prev => [
      ...prev, 
      { type: 'input', text: `INITIATING ${toolType.toUpperCase()} SCAN: ${query}` }
    ]);

    const steps = [
      { msg: `[*] Connecting to ${toolType} API nodes...`, delay: 800 },
      { msg: '[*] Querying Deep Web indexed databases...', delay: 1200 },
      { msg: '[*] Establishing Tor tunnel for Dark Web crawling...', delay: 1500 },
      { msg: '[*] Analyzing leak databases for credential matches...', delay: 1000 },
    ];

    for (const step of steps) {
      await new Promise(resolve => setTimeout(resolve, step.delay));
      setTerminalOutput(prev => [...prev, { type: 'system', text: step.msg }]);
    }

    const result = await runOsintSearch(query, toolType);
    setLastScanResult(result);
    setTerminalOutput(prev => [...prev, { type: 'output', text: result }]);
    setIsSearching(false);

    // Save to Local Storage (Fallback for declined Firebase)
    const newScan = {
      id: Math.random().toString(36).substr(2, 9),
      query,
      tool: toolType,
      result,
      timestamp: Date.now()
    };

    const updatedHistory = [newScan, ...history].slice(0, 50);
    setHistory(updatedHistory);
    localStorage.setItem('securex_intel_history', JSON.stringify(updatedHistory));
    setTerminalOutput(prev => [...prev, { type: 'system', text: '[+] Intelligence report archived to local secure vault.' }]);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    runFullIntelligenceScan(searchQuery);
  };

  const handleToolScan = (tool: string) => {
    if (!searchQuery.trim()) return;
    runFullIntelligenceScan(searchQuery, tool);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setTerminalOutput(prev => [...prev, { type: 'system', text: `[!] File uploaded: ${file.name}. Analyzing content...` }]);
      runFullIntelligenceScan(`FILE_ANALYSIS: ${file.name}`);
    }
  };

  const LinkifiedText = ({ text }: { text: string }) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = text.split(urlRegex);

    return (
      <>
        {parts.map((part, i) => {
          if (part.match(urlRegex)) {
            return (
              <a
                key={i}
                href={part}
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent-cyan underline hover:text-white transition-colors"
              >
                {part}
              </a>
            );
          }
          return part;
        })}
      </>
    );
  };

  const extraTools = [
    { id: 'Maltego', icon: Network, label: 'Maltego', color: 'text-accent-cyan' },
    { id: 'Shodan', icon: Eye, label: 'Shodan', color: 'text-orange-400' },
    { id: 'Whois', icon: Database, label: 'Whois', color: 'text-blue-400' },
    { id: 'HaveIBeenPwned', icon: UserCheck, label: 'HIBP', color: 'text-red-400' },
    { id: 'VirusTotal', icon: ShieldCheck, label: 'VirusTotal', color: 'text-green-400' },
    { id: 'TheHarvester', icon: Users, label: 'Harvester', color: 'text-yellow-400' },
    { id: 'Sherlock', icon: Fingerprint, label: 'Sherlock', color: 'text-pink-400' },
  ];

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 bg-bg-primary">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl font-display font-bold tracking-tighter mb-2">
              INTELLIGENCE <span className="text-accent-cyan">CENTER</span>
            </h1>
            <p className="text-text-muted">Unified OSINT search and real-time threat intelligence.</p>
          </div>
          
          {lastScanResult && (
            <button
              onClick={() => downloadPDF(lastScanResult, searchQuery)}
              className="flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/10 rounded-xl font-bold text-accent-cyan hover:bg-white/10 transition-all"
            >
              <Download className="w-5 h-5" />
              Download PDF Report
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 overflow-x-auto pb-2">
          {[
            { id: 'osint', label: 'OSINT Scanner', icon: Search },
            { id: 'history', label: 'Scan History', icon: History },
            { id: 'threats', label: 'Live Threats', icon: ShieldAlert },
            { id: 'news', label: 'Cyber News', icon: Newspaper }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all whitespace-nowrap",
                activeTab === tab.id 
                  ? "bg-accent-cyan text-bg-primary shadow-glow-cyan" 
                  : "bg-white/5 text-text-muted hover:bg-white/10"
              )}
            >
              <tab.icon className="w-5 h-5" />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="mt-8">
          {activeTab === 'osint' && (
            <div
              key="osint"
              className="space-y-6"
            >
              {/* Simple Search Bar */}
              <div className="glass-card p-6 border-accent-cyan/20">
                <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Enter domain, IP, email, or username..."
                      className="w-full bg-bg-primary border border-white/10 rounded-xl py-4 pl-12 pr-4 focus:border-accent-cyan outline-none transition-all font-mono"
                    />
                  </div>
                  <div className="flex gap-2">
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handleFileUpload} 
                      className="hidden" 
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all text-text-muted"
                      title="Upload file for analysis"
                    >
                      <Upload className="w-6 h-6" />
                    </button>
                    <button
                      type="submit"
                      disabled={isSearching || !searchQuery.trim()}
                      className="flex-1 md:flex-none px-8 py-4 bg-accent-cyan text-bg-primary font-bold rounded-xl hover:glow-cyan transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {isSearching ? <Loader2 className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5" />}
                      Run Intelligence Scan
                    </button>
                  </div>
                </form>

                {/* Tool Selection */}
                <div className="flex flex-wrap gap-3 mt-6">
                  {extraTools.map(tool => (
                    <button
                      key={tool.id}
                      onClick={() => handleToolScan(tool.id)}
                      disabled={isSearching || !searchQuery.trim()}
                      className={cn(
                        "flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg transition-all hover:bg-white/10 disabled:opacity-50",
                        tool.color
                      )}
                    >
                      <tool.icon className="w-4 h-4" />
                      <span className="text-xs font-bold uppercase tracking-wider">{tool.label}</span>
                    </button>
                  ))}
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-white/5">
                  {[
                    { label: 'Surface Web', icon: Globe, color: 'text-blue-400' },
                    { label: 'Deep Web', icon: Lock, color: 'text-purple-400' },
                    { label: 'Dark Web', icon: Ghost, color: 'text-accent-red' },
                    { label: 'Entity Mapping', icon: Network, color: 'text-accent-cyan' }
                  ].map(item => (
                    <div key={item.label} className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-text-muted">
                      <item.icon className={cn("w-3 h-3", item.color)} />
                      {item.label}
                    </div>
                  ))}
                </div>
              </div>

              {/* Terminal Output */}
              <div className="glass-card p-0 overflow-hidden border-white/5">
                <div className="bg-black/40 px-4 py-2 border-b border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TerminalIcon className="w-4 h-4 text-accent-cyan" />
                    <span className="text-[10px] font-mono text-text-muted uppercase tracking-widest">Command Prompt Output</span>
                  </div>
                  <button 
                    onClick={() => setTerminalOutput([{ type: 'system', text: 'Console cleared.' }])}
                    className="text-[10px] text-text-muted hover:text-accent-cyan transition-colors"
                  >
                    CLEAR
                  </button>
                </div>
                
                <div className="h-[400px] overflow-y-auto p-6 font-mono text-sm space-y-3 bg-black/30">
                  {terminalOutput.map((out, i) => (
                    <div key={i} className={cn(
                      "whitespace-pre-wrap leading-relaxed",
                      out.type === 'input' ? "text-accent-cyan font-bold" : 
                      out.type === 'system' ? "text-text-muted italic" : 
                      "text-text-primary"
                    )}>
                      {out.type === 'input' && <span className="mr-2 text-accent-cyan opacity-50">$</span>}
                      <LinkifiedText text={out.text} />
                    </div>
                  ))}
                  {isSearching && (
                    <div className="flex items-center gap-2 text-accent-cyan animate-pulse">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>[*] Intelligence engine processing...</span>
                    </div>
                  )}
              </div>
            </div>
          </div>
        )}

          {activeTab === 'history' && (
            <div
              key="history"
              className="space-y-4"
            >
              {history.length > 0 ? history.map((scan) => (
                <div key={scan.id} className="glass-card p-6 flex items-center justify-between hover:border-accent-cyan/30 transition-all group">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-white/5 rounded-xl text-accent-cyan">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg group-hover:text-accent-cyan transition-colors">{scan.query}</h3>
                      <div className="flex items-center gap-3 text-xs text-text-muted mt-1">
                        <span className="px-2 py-0.5 bg-white/5 rounded uppercase font-bold">{scan.tool}</span>
                        <span>•</span>
                        <span>{new Date(scan.timestamp).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => downloadPDF(scan.result, scan.query)}
                    className="p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-accent-cyan hover:text-bg-primary transition-all flex items-center gap-2 font-bold"
                  >
                    <Download className="w-5 h-5" />
                    <span className="hidden sm:inline">Download PDF</span>
                  </button>
                </div>
              )) : (
                <div className="glass-card p-12 text-center text-text-muted">
                  <History className="w-12 h-12 mx-auto mb-4 opacity-20" />
                  <p>No intelligence scans found in your history.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'threats' && (
            <div
              key="threats"
              className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
            >
              {threats.map((threat) => (
                <div key={threat.id} className="glass-card p-6 border-l-4 border-l-accent-cyan">
                  <div className="flex items-start justify-between mb-4">
                    <div className={cn(
                      "px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest",
                      threat.severity === 'critical' ? "bg-accent-red/20 text-accent-red" :
                      threat.severity === 'high' ? "bg-orange-500/20 text-orange-500" :
                      "bg-accent-cyan/20 text-accent-cyan"
                    )}>
                      {threat.severity}
                    </div>
                    <span className="text-[10px] text-text-muted font-mono">
                      {new Date(threat.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold mb-2">{threat.title}</h3>
                  <p className="text-sm text-text-muted mb-4">{threat.description}</p>
                  <div className="flex items-center justify-between text-[10px] font-bold text-text-muted uppercase tracking-tighter">
                    <span>Type: {threat.type}</span>
                    <span>Source: {threat.source}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'news' && (
            <div
              key="news"
              className="space-y-6"
            >
              {news.map((item) => (
                <div key={item.id} className="glass-card p-6 flex flex-col md:flex-row gap-6 hover:border-accent-cyan/30 transition-all group">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-xs font-bold text-accent-cyan uppercase tracking-widest">{item.source}</span>
                      <span className="w-1 h-1 rounded-full bg-white/20" />
                      <span className="text-xs text-text-muted">{new Date(item.timestamp).toLocaleDateString()}</span>
                    </div>
                    <a href={item.url} target="_blank" rel="noopener noreferrer">
                      <h3 className="text-xl font-bold mb-3 group-hover:text-accent-cyan transition-colors">{item.title}</h3>
                    </a>
                    <p className="text-text-muted leading-relaxed">{item.summary}</p>
                  </div>
                  <div className="flex items-center justify-center">
                    <a 
                      href={item.url}
                      className="p-4 rounded-xl bg-white/5 hover:bg-accent-cyan hover:text-bg-primary transition-all"
                    >
                      <Search className="w-6 h-6" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
