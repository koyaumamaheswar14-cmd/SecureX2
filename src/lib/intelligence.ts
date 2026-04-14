import { GoogleGenAI } from "@google/genai";

let aiInstance: GoogleGenAI | null = null;

// ✅ FIXED: Vite environment variable
function getAI() {
  if (!aiInstance) {
    const apiKey = "AIzaSyB1l2QQWPNWScvsPOpznJa8xtJnp_Tvi5o
      ";

    if (!apiKey) {
      throw new Error(
        "VITE_GEMINI_API_KEY is missing. Add it in your .env file"
      );
    }

    aiInstance = new GoogleGenAI({ apiKey });
  }
  return aiInstance;
}

// ================= TYPES =================

export interface ThreatEvent {
  id: string;
  title: string;
  severity: "critical" | "high" | "medium" | "low";
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

// ================= MOCK THREATS =================

export const getLiveThreats = (): ThreatEvent[] => {
  return [
    {
      id: "1",
      title: "New Zero-Day in Popular Web Framework",
      severity: "critical",
      type: "Vulnerability",
      description:
        "A remote code execution vulnerability has been discovered. Patch immediately.",
      timestamp: Date.now() - 1000 * 60 * 15,
      source: "NVD",
    },
    {
      id: "2",
      title: "Massive Phishing Campaign",
      severity: "high",
      type: "Phishing",
      description:
        "Attackers are using deepfake audio for financial fraud.",
      timestamp: Date.now() - 1000 * 60 * 45,
      source: "ThreatIntel",
    },
    {
      id: "3",
      title: "Botnet Activity Spike",
      severity: "medium",
      type: "Botnet",
      description:
        "Increased DDoS activity from compromised IoT devices.",
      timestamp: Date.now() - 1000 * 60 * 120,
      source: "GlobalNet",
    },
  ];
};

// ================= MOCK NEWS =================

export const getCyberNews = (): CyberNews[] => {
  return [
    {
      id: "n1",
      title: "Major Data Breach Reported",
      summary: "Millions of user records exposed.",
      url: "https://krebsonsecurity.com",
      timestamp: Date.now() - 1000 * 60 * 60 * 2,
      source: "CyberDaily",
    },
    {
      id: "n2",
      title: "New Ransomware Variant",
      summary: "DarkByte ransomware is spreading rapidly.",
      url: "https://www.bleepingcomputer.com",
      timestamp: Date.now() - 1000 * 60 * 60 * 5,
      source: "SecurityWeek",
    },
    {
      id: "n3",
      title: "Botnet Takedown",
      summary: "Authorities dismantled a global botnet.",
      url: "https://www.thehackernews.com",
      timestamp: Date.now() - 1000 * 60 * 60 * 8,
      source: "TechNews",
    },
  ];
};

// ================= MAIN OSINT FUNCTION =================

export const runOsintSearch = async (
  query: string,
  tool: string
): Promise<string> => {
  const prompt = `
Simulate a professional OSINT (Open Source Intelligence) scan.

Tool Used: ${tool}
Target: ${query}

Include:
- Target Information
- Tool-specific findings
- URLs if relevant
- Risk Assessment

Make it realistic but clearly mention it's a simulation.

Format like CLI output:
[INFO], [WARN], [CRITICAL]

Keep it clean and professional.
`;

  try {
    const ai = getAI();

    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: prompt,
    });

    return (
      response.text ||
      "[INFO] No results returned from intelligence engine."
    );
  } catch (error) {
    console.error("OSINT ERROR:", error);

    return `
[CRITICAL] Intelligence Engine Failure

Reason:
- API Key missing OR invalid
- Network issue
- Gemini API error

Fix:
1. Check .env file
2. Restart server
3. Verify API key

`;
  }
};
