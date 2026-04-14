import { GoogleGenAI } from "@google/genai";

let aiInstance: GoogleGenAI | null = null;

function getAI() {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not configured. Please add it to your environment variables.');
    }
    aiInstance = new GoogleGenAI({ apiKey });
  }
  return aiInstance;
}

export interface ThreatEvent {
  id: string;
  title: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  type: string;
  description: string;
  timestamp: number;
  source: string;
}

export interface CyberNews {
  id: string;
  title: string;
  summary: string;
  url: string;
  timestamp: number;
  source: string;
}

export const getLiveThreats = (): ThreatEvent[] => {
  return [
    {
      id: '1',
      title: 'New Zero-Day in Popular Web Framework',
      severity: 'critical',
      type: 'Vulnerability',
      description: 'A remote code execution vulnerability has been discovered in a widely used web framework. Patch immediately.',
      timestamp: Date.now() - 1000 * 60 * 15,
      source: 'NVD'
    },
    {
      id: '2',
      title: 'Massive Phishing Campaign Targeting Financial Sector',
      severity: 'high',
      type: 'Phishing',
      description: 'Attackers are using sophisticated deepfake audio to impersonate executives in wire transfer scams.',
      timestamp: Date.now() - 1000 * 60 * 45,
      source: 'ThreatIntel'
    },
    {
      id: '3',
      title: 'Botnet Activity Spike in Southeast Asia',
      severity: 'medium',
      type: 'Botnet',
      description: 'Increased DDoS activity observed originating from compromised IoT devices in the region.',
      timestamp: Date.now() - 1000 * 60 * 120,
      source: 'GlobalNet'
    }
  ];
};

export const getCyberNews = (): CyberNews[] => {
  return [
    {
      id: 'n1',
      title: 'Major Tech Company Suffers Data Breach',
      summary: 'Millions of user records exposed in a recent cyber attack. The company is investigating the source of the leak.',
      url: 'https://krebsonsecurity.com',
      timestamp: Date.now() - 1000 * 60 * 60 * 2,
      source: 'CyberDaily'
    },
    {
      id: 'n2',
      title: 'New Ransomware Variant "DarkByte" Emerging',
      summary: 'Security researchers warn of a new ransomware strain that uses advanced encryption techniques to evade detection.',
      url: 'https://www.bleepingcomputer.com',
      timestamp: Date.now() - 1000 * 60 * 60 * 5,
      source: 'SecurityWeek'
    },
    {
      id: 'n3',
      title: 'Governments Collaborate to Takedown Botnet',
      summary: 'International law enforcement agencies successfully dismantled a large-scale botnet used for financial fraud.',
      url: 'https://www.thehackernews.com',
      timestamp: Date.now() - 1000 * 60 * 60 * 8,
      source: 'TechNews'
    }
  ];
};

export const runOsintSearch = async (query: string, tool: string): Promise<string> => {
  const prompt = `
    Simulate the output of an OSINT (Open Source Intelligence) tool named "${tool}".
    
    Specific Tool Behaviors:
    - If "Maltego": Simulate graph-based entity relationship analysis (IP -> Domain -> Owner).
    - If "Shodan": Simulate IoT device discovery, open ports, and service banners.
    - If "Whois": Simulate domain registration data, registrar info, and expiry dates.
    - If "HaveIBeenPwned": Simulate data breach checks for emails/usernames.
    - If "VirusTotal": Simulate file/URL reputation and sandbox analysis.
    - If "TheHarvester": Simulate email, subdomain, and names harvesting from public sources.
    - If "Sherlock": Simulate social media account hunting across 300+ platforms.
    - If "Unified OSINT Engine": Perform a comprehensive scan across all layers.

    The user is searching for: "${query}".
    
    The output should look like a professional command-line interface (CLI) result.
    Include sections like:
    - Target Information
    - Tool-Specific Findings (Include relevant URLs, social media links, or source links where applicable)
    - Risk Assessment
    
    Make the data look realistic but clearly state it is a simulation for educational/security purposes.
    Ensure any URLs included are formatted correctly (e.g., https://example.com/path).
    Use ANSI-like formatting (e.g., [INFO], [WARN], [CRITICAL]) in text.
    Keep it concise but detailed.
  `;

  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
    });
    return response.text || 'No results found.';
  } catch (error) {
    console.error('OSINT Search Error:', error);
    return 'Error: Failed to connect to intelligence engine.';
  }
};
