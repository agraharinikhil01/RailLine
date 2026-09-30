import { liveStatusService } from './liveStatusService';
import { trainService } from './trainService';
import { env } from '../config/env';
import { ChatResponse, LiveTrainStatus, JourneyStation } from '@railline/types';

export class RailAIService {
  /**
   * Main entry point for RailAI Chat
   */
  async chat(
    message: string,
    trainNumberParam?: string,
    history?: Array<{ role: 'user' | 'assistant'; content: string }>
  ): Promise<ChatResponse> {
    const cleanMsg = (message || '').trim();

    // 1. Determine train number (from param or extract 5-digit number from message)
    let trainNumber = trainNumberParam;
    if (!trainNumber) {
      const match = cleanMsg.match(/\b([0-9]{5})\b/);
      if (match) {
        trainNumber = match[1];
      }
    }

    // 2. Fetch live telemetry if train number is available
    let liveStatus: LiveTrainStatus | null = null;
    let timeline: JourneyStation[] = [];

    if (trainNumber) {
      try {
        [liveStatus, timeline] = await Promise.all([
          liveStatusService.getLiveStatus(trainNumber),
          liveStatusService.getTimeline(trainNumber),
        ]);
      } catch (err) {
        console.warn(`[RailAI] Could not fetch live status for ${trainNumber}:`, err);
      }
    }

    // 3. Try Gemini LLM if GEMINI_API_KEY is available
    const geminiKey = env.GEMINI_API_KEY || process.env.GEMINI_API_KEY;
    if (geminiKey && geminiKey.trim().length > 0) {
      try {
        const geminiReply = await this.callGeminiAPI(cleanMsg, geminiKey, liveStatus, timeline, history);
        if (geminiReply) {
          return {
            reply: geminiReply,
            trainNumber: trainNumber || undefined,
            trainName: liveStatus?.trainName,
            source: 'gemini',
            suggestedQuestions: this.getSuggestedQuestions(liveStatus),
          };
        }
      } catch (err) {
        console.warn('[RailAI] Gemini API error, falling back to local railway engine:', err);
      }
    }

    // 4. Built-in Intelligent Railway Query Engine (Guaranteed zero-failure instant response)
    const reply = this.generateLocalResponse(cleanMsg, liveStatus, timeline, trainNumber);
    return {
      reply,
      trainNumber: trainNumber || undefined,
      trainName: liveStatus?.trainName,
      source: 'rail-ai-engine',
      suggestedQuestions: this.getSuggestedQuestions(liveStatus),
    };
  }

  /**
   * Call Google Gemini API (gemini-2.0-flash / gemini-1.5-flash) with injected real-time telemetry
   */
  private async callGeminiAPI(
    userMessage: string,
    apiKey: string,
    liveStatus: LiveTrainStatus | null,
    timeline: JourneyStation[],
    history?: Array<{ role: 'user' | 'assistant'; content: string }>
  ): Promise<string | null> {
    const contextLines: string[] = [];

    if (liveStatus) {
      contextLines.push(`Train: ${liveStatus.trainName} (${liveStatus.trainNumber})`);
      contextLines.push(`Running Status: ${liveStatus.status}`);
      contextLines.push(`Current Station: ${liveStatus.currentStation?.name || 'In Transit'} (${liveStatus.currentStation?.code || 'N/A'}), Platform: ${liveStatus.currentStation?.platform || 'TBD'}`);
      contextLines.push(`Delay: ${liveStatus.delayMinutes > 0 ? `+${liveStatus.delayMinutes} mins delay` : 'On Time'}`);
      contextLines.push(`Current Speed: ${liveStatus.location?.speedKmph ?? 0} km/h`);
      contextLines.push(`Next Halt: ${liveStatus.nextStation?.name || 'Destination'} (${liveStatus.nextStation?.code || 'N/A'}), Expected: ${liveStatus.etaNextStation || liveStatus.nextStation?.scheduledArrival || 'N/A'}`);
      contextLines.push(`Distance Covered: ${liveStatus.distanceCoveredKm || 0} km / Total: ${(liveStatus.distanceCoveredKm || 0) + (liveStatus.distanceRemainingKm || 0)} km (${liveStatus.progressPercentage || 0}%)`);

      if (timeline.length > 0) {
        const halts = timeline.slice(0, 15).map(s => `${s.station?.name || ''} (${s.distanceFromSourceKm}km - ${s.status})`).join(' -> ');
        contextLines.push(`Route Summary: ${halts}`);
      }
    } else {
      contextLines.push('No specific train currently active. If user asks about a train, answer generally or request train number.');
    }

    const systemInstruction = `You are "RailAi", the official dedicated AI Travel Assistant for Indian Railways on the RailLine platform.
You have access to live Indian Railways telemetry.
Real-Time Telemetry Context:
${contextLines.join('\n')}

Guidelines:
1. Always be polite, helpful, and concise.
2. Answer in the same language the user asks (Hindi, English, or conversational Hinglish).
3. If user asks where the train is, delay, next station, or platform, use the exact real-time telemetry above.
4. Format using clean Markdown, bold text for station names/times, bullet points, and helpful railway emojis (🚆, 📍, ⏱️, 🚉).
5. Never invent false timings or fake platforms.`;

    const contents: any[] = [];

    // Prior chat history
    if (history && history.length > 0) {
      for (const h of history.slice(-6)) {
        contents.push({
          role: h.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: h.content }],
        });
      }
    }

    contents.push({
      role: 'user',
      parts: [{ text: userMessage }],
    });

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: {
          parts: [{ text: systemInstruction }],
        },
        contents,
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 600,
        },
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.warn(`[RailAI] Gemini API returned status ${res.status}: ${errText}`);
      return null;
    }

    const data = await res.json() as any;
    const candidate = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    return candidate || null;
  }

  /**
   * High-accuracy built-in intelligent railway context generator
   */
  private generateLocalResponse(
    message: string,
    live: LiveTrainStatus | null,
    timeline: JourneyStation[],
    trainNumber?: string
  ): string {
    const q = message.toLowerCase();

    // If no train context available
    if (!live || !trainNumber) {
      if (q.includes('hi') || q.includes('hello') || q.includes('namaste') || q.includes('kaise')) {
        return `Namaste! 🙏 Main **RailAi** hoon, aapka personal Indian Railways AI assistant.\n\nAap mujhse kisi bhi train ka live status, platform number, delay, ya passing stations puch sakte hain. Kripya apna **5-digit Train Number** (jaise 12556, 12951) batayein!`;
      }
      return `Main **RailAi** hoon! Kisi bhi train ki live jaankari ke liye kripya train number (jaise **12556 Gorakhdham Express**) search karein ya yahan 5-digit number type karein. Main aapko live location, platform, delay aur passing stations ki accurate jaankari dunga!`;
    }

    const name = live.trainName || `Train ${live.trainNumber}`;
    const curStn = live.currentStation?.name || 'In Transit';
    const curCode = live.currentStation?.code || '';
    const curPf = live.currentStation?.platform || 'TBD';
    const nextStn = live.nextStation?.name || 'Destination';
    const nextCode = live.nextStation?.code || '';
    const nextEta = live.etaNextStation || live.nextStation?.actualArrival || live.nextStation?.scheduledArrival || 'Shortly';
    const delay = live.delayMinutes ?? 0;
    const speed = live.location?.speedKmph ?? 0;
    const distCov = live.distanceCoveredKm ?? 0;
    const distRem = live.distanceRemainingKm ?? 0;
    const totalDist = distCov + distRem;
    const progress = live.progressPercentage ?? 0;

    // 1. LIVE LOCATION & CURRENT POSITION
    if (
      q.includes('kahan') ||
      q.includes('where') ||
      q.includes('location') ||
      q.includes('position') ||
      q.includes('status') ||
      q.includes('pahunchi') ||
      q.includes('pahuchi')
    ) {
      const movingStatus = speed > 0
        ? `🚆 **${speed} km/h** ki speed se aage badh rahi hai.`
        : `🛑 Abhi station par ruki hui hai.`;

      return `📍 **${name} (${live.trainNumber})** ka Live Status:\n\n` +
        `• **Current Station:** ${curStn} (${curCode})\n` +
        `• **Platform:** ${curPf !== 'TBD' ? `Platform ${curPf}` : 'Platform announcement pending'}\n` +
        `• **Speed & Movement:** ${movingStatus}\n` +
        `• **Next Station:** ${nextStn} (${nextCode}) — Expected at **${nextEta}**\n` +
        `• **Delay Status:** ${delay > 0 ? `⚠️ **+${delay} min** late chal rahi hai.` : '✅ Train bilkul **On Time** chal rahi hai.'}\n` +
        `• **Distance:** ${distCov} km complete / ${distRem} km bacha hai (${progress}% safar pura).`;
    }

    // 2. DELAY & TIME
    if (q.includes('late') || q.includes('delay') || q.includes('der') || q.includes('time') || q.includes('samay') || q.includes('on time')) {
      if (delay > 0) {
        const hours = Math.floor(delay / 60);
        const mins = delay % 60;
        const delayStr = hours > 0 ? `${hours} ghante ${mins} minute` : `${mins} minute`;
        return `⏱️ **${name}** abhi lagbhag **${delayStr} (+${delay}m) late** chal rahi hai.\n\n` +
          `• **Current Location:** ${curStn} (${curCode})\n` +
          `• **Agla Station:** ${nextStn} lagbhag **${nextEta}** baje pahuchegi.\n` +
          `• **Speed:** ${speed} km/h\n\n` +
          `💡 *Tip: Delay live track update par har 30 second me refresh hota hai.*`;
      } else {
        return `✅ **Good news!** **${name} (${live.trainNumber})** bilkul **On Time** chal rahi hai aur koi delay report nahi hai.\n\n` +
          `• **Next Stop:** ${nextStn} (${nextCode}) at **${nextEta}**\n` +
          `• **Current Speed:** ${speed} km/h`;
      }
    }

    // 3. NEXT STATION & ETA
    if (q.includes('next') || q.includes('agla') || q.includes('kab') || q.includes('when') || q.includes('reach') || q.includes('arrival')) {
      return `🚉 **Next Station Details for ${name}:**\n\n` +
        `• **Station:** **${nextStn}** (${nextCode})\n` +
        `• **Expected Arrival Time:** **${nextEta}**\n` +
        `• **Current Distance to Station:** Train abhi **${curStn}** ke aage hai aur **${speed} km/h** ki speed se travel kar rahi hai.\n` +
        `• **Current Delay:** ${delay > 0 ? `+${delay} min late` : 'Right time'}`;
    }

    // 4. PLATFORM NUMBER
    if (q.includes('platform') || q.includes('pf') || q.includes('patari') || q.includes('track')) {
      return `🚉 **Platform Information:**\n\n` +
        `• **Current Station (${curStn}):** Platform **${curPf}**\n` +
        `• **Next Station (${nextStn}):** Expected Platform **${curPf !== 'TBD' ? curPf : 'Platform 1-4 (Live display screen check karein)'}**\n\n` +
        `ℹ️ *Platform number railway station master control ke aadhar par aakhiri samay par badal bhi sakta hai. Station ke display board se re-check karein.*`;
    }

    // 5. PASSING / NON-STOP STATIONS
    if (q.includes('passing') || q.includes('non stop') || q.includes('non-stop') || q.includes('beech') || q.includes('intermediate') || q.includes('halt') || q.includes('chhote')) {
      // Find passing stations under current halt
      const curTimelineHalt = timeline.find(t => (t.station?.code || (t as any).stationCode) === curCode);
      const intermediate = curTimelineHalt?.intermediateStations || [];

      if (intermediate.length > 0) {
        const list = intermediate.slice(0, 8).map(s => `• **${s.name}** (${s.code}) — ${s.distanceKm} km`).join('\n');
        return `⏩ **${curStn}** se **${nextStn}** ke beech aane wale Non-Stop passing stations:\n\n${list}\n\n💡 *Yeh chote stations hain jahan train rukti nahi hai balki high speed se pass hoti hai.*`;
      } else {
        return `⏩ **${curStn}** se **${nextStn}** ke beech train fast track par sidhe next major halt ki taraf jaa rahi hai. Aap route timeline me station par click karke sabhi passing stations dekh sakte hain!`;
      }
    }

    // 6. SPEED & DISTANCE
    if (q.includes('speed') || q.includes('raftar') || q.includes('teez') || q.includes('distance') || q.includes('km') || q.includes('kitna bacha')) {
      return `⚡ **Speed & Distance Telemetry for ${name}:**\n\n` +
        `• **Current Speed:** **${speed} km/h**\n` +
        `• **Distance Covered:** **${distCov} km**\n` +
        `• **Distance Remaining:** **${distRem} km**\n` +
        `• **Total Journey:** **${totalDist} km** (${progress}% complete)\n` +
        `• **Locomotive State:** ${speed > 0 ? '🟢 Moving smoothly on track' : '🟡 Halted at station'}`;
    }

    // 7. FOOD, PANTRY, CATERING
    if (q.includes('food') || q.includes('khana') || q.includes('pantry') || q.includes('meal') || q.includes('chai') || q.includes('lunch') || q.includes('dinner')) {
      return `🍽️ **Food & Pantry Guidance for ${name}:**\n\n` +
        `• **Pantry Car:** Is train me pantry car / catering services available hain.\n` +
        `• **IRCTC e-Catering:** Aap aage aane wale bade stations (jaise ${nextStn}) par fresh khana order kar sakte hain.\n` +
        `• **Order Method:** Call **1323** ya IRCTC 'Food on Track' app me apna 10-digit PNR enter karein.\n` +
        `• **Safe Water:** Hamesha Rail Neer sealed packaged drinking water hi purchase karein (Fixed Price: ₹15).`;
    }

    // 8. DEFAULT FRIENDLY RESPONSE
    return `🚆 **${name} (${live.trainNumber}) Overview:**\n\n` +
      `Train abhi **${curStn} (${curCode})** ${curPf !== 'TBD' ? `Platform ${curPf}` : ''} par hai aur agla halt **${nextStn}** (${nextEta}) hai.\n\n` +
      `• **Speed:** ${speed} km/h\n` +
      `• **Delay:** ${delay > 0 ? `+${delay} min` : 'Right Time'}\n` +
      `• **Progress:** ${progress}% (${distCov} / ${totalDist} km)\n\n` +
      `Aap mujhse puch sakte hain: *"Platform number kya hai?"*, *"Kitni der late hai?"*, ya *"Beech me kaunse station aayenge?"*`;
  }

  /**
   * Contextual 1-click suggested prompts
   */
  private getSuggestedQuestions(live: LiveTrainStatus | null): string[] {
    if (!live) {
      return [
        '12556 Gorakhdham Express ka status',
        '12951 Mumbai Rajdhani ki timing',
        'IRCTC PNR status kaise check karein?',
      ];
    }
    return [
      `Train abhi kahan hai?`,
      `Kitna late chal rahi hai?`,
      `Agla station (${live.nextStation?.name || 'Next'}) kab aayega?`,
      `Platform number kya hai?`,
      `Beech ke passing stations kaunse hain?`,
    ];
  }
}

export const railAIService = new RailAIService();
