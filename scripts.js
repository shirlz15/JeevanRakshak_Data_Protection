/* ═══════════════════════════════════════
   JeevanRakshak – scripts.js
   Functional: real voice input, real AI responses, live vitals, ECG, emergency, DB
═══════════════════════════════════════ */

const API_BASE = window.location.origin;

// ── Particles ──────────────────────
(function spawnParticles() {
  const container = document.getElementById('particles');
  if (!container) return;
  for (let i = 0; i < 40; i++) {
    const p = document.createElement('div');
    p.classList.add('particle');
    const size = Math.random() * 3 + 1.5;
    p.style.cssText = `width:${size}px;height:${size}px;left:${Math.random() * 100}%;animation-duration:${Math.random() * 12 + 8}s;animation-delay:${Math.random() * 10}s;`;
    container.appendChild(p);
  }
})();

// ── Navbar scroll shadow ────────────
window.addEventListener('scroll', () => {
  const nav = document.getElementById('navbar');
  if (nav) nav.style.boxShadow = window.scrollY > 30 ? '0 4px 32px rgba(0,0,0,0.7)' : 'none';
});

// ── Hero waveform (idle) ────────────
(function heroWave() {
  const canvas = document.getElementById('heroWaveCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let t = 0;
  function draw() {
    const W = canvas.width, H = canvas.height;
    ctx.clearRect(0, 0, W, H);
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(0,255,170,0.7)';
    ctx.lineWidth = 1.5;
    for (let x = 0; x < W; x++) {
      const y = H / 2 + Math.sin((x / W) * 6 * Math.PI + t) * 8 + Math.sin((x / W) * 14 * Math.PI + t * 1.3) * 3;
      x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();
    t += 0.06;
    requestAnimationFrame(draw);
  }
  draw();
})();

// ══════════════════════════════════════
//  VOICE AI - REAL IMPLEMENTATION
// ══════════════════════════════════════

let micActive = false;
let micAnimId = null;
let wavePhase = 0;
let recognition = null;
let currentLang = 'en-IN';
let isProcessing = false;
let speechSynthUtterance = null;
let currentRiskScore = 20;

// Language configuration
const LANGUAGES = {
  "en-IN": { name: "English", voiceLang: "en-IN", flag: "🇮🇳" },
  "ta-IN": { name: "Tamil", voiceLang: "ta-IN", flag: "🇮🇳" },
  "hi-IN": { name: "Hindi", voiceLang: "hi-IN", flag: "🇮🇳" },
  "te-IN": { name: "Telugu", voiceLang: "te-IN", flag: "🇮🇳" },
  "ml-IN": { name: "Malayalam", voiceLang: "ml-IN", flag: "🇮🇳" },
  "kn-IN": { name: "Kannada", voiceLang: "kn-IN", flag: "🇮🇳" },
  "mr-IN": { name: "Marathi", voiceLang: "mr-IN", flag: "🇮🇳" },
  "gu-IN": { name: "Gujarati", voiceLang: "gu-IN", flag: "🇮🇳" },
  "bn-IN": { name: "Bengali", voiceLang: "bn-IN", flag: "🇮🇳" },
  "or-IN": { name: "Odia", voiceLang: "or-IN", flag: "🇮🇳" },
  "ur-PK": { name: "Urdu", voiceLang: "ur-PK", flag: "🇵🇰" },
  "sa-IN": { name: "Sanskrit", voiceLang: "sa-IN", flag: "🇮🇳" },
  "fr-FR": { name: "French", voiceLang: "fr-FR", flag: "🇫🇷" },
  "es-ES": { name: "Spanish", voiceLang: "es-ES", flag: "🇪🇸" },
  "de-DE": { name: "German", voiceLang: "de-DE", flag: "🇩🇪" }
};

// Check browser support
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const speechSynthesis = window.speechSynthesis;

function drawIdleWave(canvas) {
  const ctx = canvas.getContext('2d');
  function loop() {
    const W = canvas.width, H = canvas.height;
    ctx.clearRect(0, 0, W, H);
    ctx.setLineDash([4, 6]);
    ctx.strokeStyle = 'rgba(255,255,255,0.12)';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0, H / 2); ctx.lineTo(W, H / 2); ctx.stroke();
    ctx.setLineDash([]);
    if (!micActive) micAnimId = requestAnimationFrame(loop);
  }
  micAnimId = requestAnimationFrame(loop);
}

function drawActiveWave(canvas) {
  const ctx = canvas.getContext('2d');
  function loop() {
    if (!micActive) return;
    const W = canvas.width, H = canvas.height;
    ctx.clearRect(0, 0, W, H);
    ctx.shadowColor = '#00ffaa';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(0,255,170,0.9)';
    ctx.lineWidth = 2;
    for (let x = 0; x < W; x++) {
      const amp = 16 + Math.sin(wavePhase * 0.7) * 6;
      const y = H / 2 + Math.sin((x / W) * 8 * Math.PI + wavePhase) * amp + Math.sin((x / W) * 16 * Math.PI + wavePhase * 1.5) * (amp * 0.3);
      x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.shadowBlur = 0;
    wavePhase += 0.08;
    micAnimId = requestAnimationFrame(loop);
  }
  micAnimId = requestAnimationFrame(loop);
}

// ── Add message to chat ──
function addChatMessage(text, type, extra) {
  const chat = document.getElementById('chatArea');
  if (!chat) return;

  const msg = document.createElement('div');
  msg.className = `chat-msg ${type}`;

  if (type === 'user') {
    msg.innerHTML = `
      <div class="chat-bubble">${escapeHTML(text)}</div>
      <span class="chat-avatar usr">👤</span>
    `;
  } else if (type === 'system') {
    let extraHTML = '';
    if (extra && extra.riskScore !== undefined) {
      const riskClass = extra.riskScore > 70 ? 'critical' : extra.riskScore > 40 ? 'moderate' : 'safe';
      extraHTML = `
        <div class="risk-line">
          <span>Health Risk Score</span>
          <span class="risk-val ${riskClass}">${extra.riskScore}%</span>
        </div>
        <div class="risk-bar-wrap">
          <div class="risk-bar" style="width:${extra.riskScore}%;background:${riskClass === 'critical' ? '#ff3b3b' : riskClass === 'moderate' ? '#ffb300' : '#00ffaa'}"></div>
        </div>
      `;
    }
    msg.innerHTML = `
      <span class="chat-avatar sys">🤖</span>
      <div class="chat-bubble ai-response-bubble">
        ${extraHTML}
        <p>${text}</p>
        ${extra && extra.lang ? `<div class="lang-tag">🌐 Responded in: ${LANGUAGES[extra.lang]?.name || extra.lang}</div>` : ''}
      </div>
    `;
  } else if (type === 'typing') {
    msg.id = 'typingIndicator';
    msg.innerHTML = `
      <span class="chat-avatar sys">🤖</span>
      <div class="chat-bubble ai-response-bubble">
        <div class="typing-dots">
          <span></span><span></span><span></span>
        </div>
      </div>
    `;
  }

  // Animate in
  msg.style.opacity = '0';
  msg.style.transform = type === 'user' ? 'translateX(20px)' : 'translateX(-20px)';
  chat.appendChild(msg);

  requestAnimationFrame(() => {
    msg.style.transition = 'all 0.5s ease';
    msg.style.opacity = '1';
    msg.style.transform = 'translateX(0)';
  });

  chat.scrollTop = chat.scrollHeight;
  return msg;
}

function removeTypingIndicator() {
  const el = document.getElementById('typingIndicator');
  if (el) el.remove();
}

function escapeHTML(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// ── Text to Speech ──
function speakText(text, lang) {
  if (!speechSynthesis) return;
  speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = lang || currentLang;
  utter.rate = 0.95;
  utter.pitch = 1;
  
  // Show speaker indicator
  const speakerInd = document.getElementById('speakerInd');
  if (speakerInd) speakerInd.classList.add('active');
  
  utter.onend = () => {
    if (speakerInd) speakerInd.classList.remove('active');
  };
  
  speechSynthesis.speak(utter);
}

// ── Send to Voice API ──
async function sendToVoiceAPI(text) {
  try {
    const response = await fetch(`${API_BASE}/api/voice`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, lang: currentLang })
    });
    const data = await response.json();
    return data.reply;
  } catch (err) {
    console.error('Voice API error:', err);
    return 'Sorry, I could not process your request. Please try again.';
  }
}

// ── Post health data to API ──
async function postHealthData(heartRate, temperature) {
  try {
    const response = await fetch(`${API_BASE}/api/data`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ heartRate, temperature })
    });
    return await response.json();
  } catch (err) {
    console.error('Data API error:', err);
    return null;
  }
}

// ── Fetch latest health data ──
async function fetchLatestData() {
  try {
    const response = await fetch(`${API_BASE}/api/data`);
    return await response.json();
  } catch (err) {
    console.error('Fetch data error:', err);
    return null;
  }
}

// ── Main toggle mic function ──
function toggleMic() {
  if (isProcessing) return;
  
  const btn = document.getElementById('micBtn');
  const canvas = document.getElementById('waveCanvas');
  const label = document.getElementById('waveLabel');

  if (!micActive) {
    // Start listening
    if (!SpeechRecognition) {
      addChatMessage('⚠️ Your browser does not support voice input. Please use Chrome or Edge.', 'system', {});
      return;
    }
    
    micActive = true;
    btn.classList.add('active');
    if (label) {
      label.textContent = '🔴 Listening...';
      label.classList.add('listening');
    }
    cancelAnimationFrame(micAnimId);
    drawActiveWave(canvas);

    // Initialize speech recognition
    recognition = new SpeechRecognition();
    recognition.lang = currentLang;
    recognition.interimResults = true;
    recognition.continuous = false;
    recognition.maxAlternatives = 1;

    let finalTranscript = '';
    let interimTranscript = '';

    recognition.onresult = (event) => {
      interimTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }
      // Show interim text in waveLabel
      if (label && (interimTranscript || finalTranscript)) {
        label.textContent = finalTranscript || interimTranscript;
        label.classList.add('listening');
        label.style.display = 'block';
      }
    };

    recognition.onend = async () => {
      micActive = false;
      btn.classList.remove('active');
      cancelAnimationFrame(micAnimId);
      drawIdleWave(canvas);

      const text = finalTranscript.trim();
      
      if (text) {
        if (label) {
          label.textContent = 'Processing...';
        }
        isProcessing = true;
        btn.classList.add('processing');

        // Add user message
        addChatMessage(text, 'user');

        // Show typing indicator
        addChatMessage('', 'typing');

        // Also post the current vitals to the backend
        const hr = parseInt(document.getElementById('lmHR')?.textContent) || 72;
        const temp = parseFloat(document.getElementById('lmTemp')?.textContent) || 36.7;
        postHealthData(hr, temp);

        // Send to AI
        const aiReply = await sendToVoiceAPI(text);

        // Remove typing indicator
        removeTypingIndicator();

        // Calculate a risk score from current vitals
        const riskScore = currentRiskScore;

        // Add AI response
        addChatMessage(aiReply, 'system', { riskScore, lang: currentLang });

        // Speak the response
        speakText(aiReply, currentLang);

        isProcessing = false;
        btn.classList.remove('processing');
        if (label) {
          label.textContent = 'Tap to Speak';
          label.classList.remove('listening');
        }
      } else {
        if (label) {
          label.textContent = 'Tap to Speak';
          label.classList.remove('listening');
        }
      }
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      micActive = false;
      btn.classList.remove('active');
      cancelAnimationFrame(micAnimId);
      drawIdleWave(canvas);
      if (label) {
        label.textContent = 'Tap to Speak';
        label.classList.remove('listening');
      }
      if (event.error === 'no-speech') {
        addChatMessage('No speech detected. Please try again and speak clearly.', 'system', {});
      } else if (event.error === 'not-allowed') {
        addChatMessage('⚠️ Microphone access denied. Please allow microphone access in your browser settings.', 'system', {});
      }
    };

    recognition.start();

  } else {
    // Stop listening manually
    micActive = false;
    btn.classList.remove('active');
    if (label) {
      label.textContent = 'Processing...';
    }
    cancelAnimationFrame(micAnimId);
    drawIdleWave(canvas);
    if (recognition) {
      recognition.stop();
    }
  }
}

// ── Text input send (keyboard alternative) ──
async function sendTextInput() {
  const input = document.getElementById('textInput');
  if (!input || !input.value.trim() || isProcessing) return;

  const text = input.value.trim();
  input.value = '';
  isProcessing = true;

  const btn = document.getElementById('micBtn');
  if (btn) btn.classList.add('processing');

  addChatMessage(text, 'user');
  addChatMessage('', 'typing');

  // Post current vitals
  const hr = parseInt(document.getElementById('lmHR')?.textContent) || 72;
  const temp = parseFloat(document.getElementById('lmTemp')?.textContent) || 36.7;
  postHealthData(hr, temp);

  // Send to AI
  const aiReply = await sendToVoiceAPI(text);
  removeTypingIndicator();

  const riskScore = currentRiskScore;
  addChatMessage(aiReply, 'system', { riskScore, lang: currentLang });
  speakText(aiReply, currentLang);

  isProcessing = false;
  if (btn) btn.classList.remove('processing');
}

// ── Language selector ──
function setLanguage(langCode) {
  currentLang = langCode;
  const langName = LANGUAGES[langCode]?.name || 'English';
  
  // Update UI
  const selectedEl = document.getElementById('selectedLang');
  if (selectedEl) selectedEl.textContent = `${LANGUAGES[langCode]?.flag || '🌐'} ${langName}`;
  
  // Close dropdown
  const dropdown = document.getElementById('langDropdown');
  if (dropdown) dropdown.classList.remove('open');

  // Notify in chat
  addChatMessage(`Language switched to ${langName}. You can now speak in ${langName}.`, 'system', {});
}

function toggleLangDropdown() {
  const dropdown = document.getElementById('langDropdown');
  if (dropdown) dropdown.classList.toggle('open');
}

function startVoiceDemo() {
  document.getElementById('demo').scrollIntoView({ behavior: 'smooth' });
  setTimeout(() => toggleMic(), 600);
}

window.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('waveCanvas');
  if (canvas) drawIdleWave(canvas);
});

// ── ECG Canvas ──────────────────────
(function ecgDraw() {
  const canvas = document.getElementById('ecgCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let offset = 0;
  function ecgPoint(x) {
    const phase = (x + offset) % 120;
    if (phase < 10) return 0;
    if (phase < 15) return -4;
    if (phase < 20) return -8;
    if (phase < 22) return -4;
    if (phase < 25) return 30;
    if (phase < 28) return -20;
    if (phase < 33) return -4;
    if (phase < 38) return 8;
    if (phase < 50) return 5;
    return 0;
  }
  function draw() {
    const W = canvas.width, H = canvas.height;
    ctx.clearRect(0, 0, W, H);
    ctx.strokeStyle = 'rgba(0,255,170,0.06)';
    ctx.lineWidth = 1;
    for (let x = 0; x < W; x += 20) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
    for (let y = 0; y < H; y += 20) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
    ctx.beginPath();
    ctx.strokeStyle = '#00ffaa';
    ctx.lineWidth = 2;
    ctx.shadowColor = '#00ffaa';
    ctx.shadowBlur = 6;
    for (let x = 0; x < W; x++) {
      const y = H / 2 - ecgPoint(x);
      x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.shadowBlur = 0;
    offset += 2.5;
    requestAnimationFrame(draw);
  }
  draw();
})();

// ── Vital Sparklines ────────────────
function drawSparkline(canvasId, data, color) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  const min = Math.min(...data), max = Math.max(...data);
  const range = max - min || 1;
  ctx.clearRect(0, 0, W, H);
  ctx.beginPath();
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.5;
  ctx.shadowColor = color;
  ctx.shadowBlur = 4;
  data.forEach((v, i) => {
    const x = (i / (data.length - 1)) * W;
    const y = H - ((v - min) / range) * (H - 8) - 4;
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  });
  ctx.stroke();
  ctx.shadowBlur = 0;
}

// ── Live vitals simulation ──────────
// Cycle: 4 s stable (normal) → 3 s critical → repeat
const STABLE_MS = 4000;
const CRITICAL_MS = 3000;
const CYCLE_MS = STABLE_MS + CRITICAL_MS;   // 7 000 ms
const UPDATE_MS = 1000;                        // refresh every 1 s

const hrHistory = [72, 73, 72, 71, 73, 72, 72, 71, 73, 72];
const tempHistory = [36.6, 36.7, 36.8, 36.7, 36.8, 36.7, 36.8, 36.7, 36.6, 36.7];
const spo2History = [98, 99, 98, 99, 98, 98, 99, 98, 99, 98];

function clamp(val, min, max) { return Math.max(min, Math.min(max, val)); }

// Returns true when we are inside the critical phase of the current cycle
function isCriticalPhase() {
  return (Date.now() % CYCLE_MS) >= STABLE_MS;
}

function updateVitals() {
  const critical = isCriticalPhase();

  // ── Heart Rate ──
  const hrTarget = critical ? 132 : 72;
  const hrJitter = critical ? 5 : 2;
  const hr = clamp(Math.round(hrTarget + (Math.random() - 0.5) * hrJitter), 40, 200);
  hrHistory.push(hr); if (hrHistory.length > 14) hrHistory.shift();
  const hrStatus = hr < 85 ? 'safe' : hr < 110 ? 'moderate' : 'critical';
  setVal('lmHR', hr);
  updateBar('lmHRBar', hr / 200 * 100, hrStatus === 'safe');
  updateStatusBadge('lmHRStatus', hrStatus);

  // ── Temperature ──
  const tempTarget = critical ? 39.6 : 36.7;
  const tempJitter = critical ? 0.3 : 0.1;
  const temp = clamp(+(tempTarget + (Math.random() - 0.5) * tempJitter).toFixed(1), 35.0, 42.0);
  tempHistory.push(temp); if (tempHistory.length > 14) tempHistory.shift();
  const tempStatus = temp < 37.5 ? 'safe' : temp < 38.5 ? 'moderate' : 'critical';
  setVal('lmTemp', temp.toFixed(1));
  updateBar('lmTempBar', (temp - 35) / 7 * 100, tempStatus === 'safe');
  updateStatusBadge('lmTempStatus', tempStatus);

  // ── SpO2 ──
  const spo2Target = critical ? 84 : 98;
  const spo2Jitter = critical ? 3 : 1;
  const spo2 = clamp(Math.round(spo2Target + (Math.random() - 0.5) * spo2Jitter), 60, 100);
  spo2History.push(spo2); if (spo2History.length > 14) spo2History.shift();
  const spo2Status = spo2 >= 95 ? 'safe' : spo2 >= 90 ? 'moderate' : 'critical';
  setVal('lmSpo2', spo2);
  updateBar('lmSpo2Bar', spo2, spo2Status === 'safe');
  updateStatusBadge('lmSpo2Status', spo2Status);

  // ── Risk ──
  const risk = clamp(Math.round((hr / 200 * 40) + ((temp - 35) / 7 * 30) + ((100 - spo2) / 40 * 30)), 0, 100);
  currentRiskScore = risk;
  const riskLevel = risk < 40 ? 'Normal' : risk < 70 ? 'Moderate' : 'Critical';
  const riskStatus = risk < 40 ? 'safe' : risk < 70 ? 'moderate' : 'critical';
  const lmRisk = document.getElementById('lmRisk');
  if (lmRisk) { lmRisk.textContent = riskLevel; lmRisk.style.color = riskStatus === 'safe' ? 'var(--safe)' : riskStatus === 'moderate' ? 'var(--warn)' : 'var(--danger)'; }
  updateStatusBadge('lmRiskStatus', riskStatus, riskLevel);
  drawRiskGaugeMini(risk, riskStatus);

  // ── Hero mini ──
  setVal('heroHR', hr);
  setVal('heroTemp', temp.toFixed(1));
  setVal('heroSpo2', spo2);
  setVal('heroRisk', riskLevel);

  flashUpdate('lm-hr'); flashUpdate('lm-temp'); flashUpdate('lm-spo2'); flashUpdate('lm-risk');
}

// Update every 1 s so phase transitions are near-instant
setInterval(updateVitals, UPDATE_MS);

function setVal(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}

function updateBar(id, pct, isSafe) {
  const bar = document.getElementById(id);
  if (bar) {
    bar.style.width = `${pct}%`;
    bar.className = `lm-pulse-fill${isSafe ? ' safe' : ''}`;
  }
}

function updateStatusBadge(id, status, label) {
  const el = document.getElementById(id);
  if (!el) return;
  const icons = { safe: '✅', moderate: '⚠️', critical: '🚨' };
  const labels = { safe: 'Normal', moderate: 'Moderate', critical: 'Critical!' };
  el.className = `lm-status ${status}`;
  el.textContent = `${icons[status]} ${label || labels[status]}`;
}

function flashUpdate(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.style.transition = 'box-shadow 0.2s';
  el.style.boxShadow = '0 0 18px rgba(0,255,170,0.5)';
  setTimeout(() => { el.style.boxShadow = ''; }, 400);
}

// ── Risk Gauge (mini – Live Data panel) ──
function drawRiskGaugeMini(pct, status) {
  const canvas = document.getElementById('lmRiskGauge');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  const cx = W / 2, cy = H - 6, r = Math.min(W, H * 1.8) / 2.2;
  ctx.clearRect(0, 0, W, H);
  ctx.beginPath(); ctx.arc(cx, cy, r, Math.PI, 0); ctx.strokeStyle = 'rgba(255,255,255,0.08)'; ctx.lineWidth = 8; ctx.lineCap = 'round'; ctx.stroke();
  const angle = Math.PI + (pct / 100) * Math.PI;
  const grad = ctx.createLinearGradient(cx - r, 0, cx + r, 0);
  grad.addColorStop(0, '#00ffaa'); grad.addColorStop(0.5, '#ffb300'); grad.addColorStop(1, '#ff3b3b');

  ctx.beginPath(); ctx.arc(cx, cy, r, Math.PI, angle);
  ctx.strokeStyle = grad; ctx.lineWidth = 8; ctx.lineCap = 'round';
  ctx.shadowColor = status === 'safe' ? '#00ffaa' : status === 'moderate' ? '#ffb300' : '#ff3b3b';
  ctx.shadowBlur = 10; ctx.stroke(); ctx.shadowBlur = 0;
  ctx.fillStyle = '#fff'; ctx.font = `bold 14px Orbitron, monospace`; ctx.textAlign = 'center';
  ctx.fillText(`${pct}%`, cx, cy - 6);
}

window.addEventListener('DOMContentLoaded', () => {
  updateVitals();
  drawRiskGaugeMini(20, 'safe');
});

// ── Emergency Alert Simulation ──────
let alertTriggered = false;
function triggerAlert() {
  if (alertTriggered) return;
  alertTriggered = true;
  const btn = document.getElementById('emergencyBtn');
  if (btn) { btn.textContent = '🚨 Alert Sent!'; btn.style.opacity = '0.7'; btn.style.cursor = 'default'; }

  // Show status row
  const statusRow = document.getElementById('alertStatusRow');
  if (statusRow) {
    statusRow.style.display = 'flex';
    const items = statusRow.querySelectorAll('.alert-status-item');
    items.forEach((item, i) => { item.style.animationDelay = `${i * 0.2}s`; });
  }

  // Send sensor alert to cloud
  const temp = document.getElementById('lmTemp')?.textContent || '39';
  const spo2 = document.getElementById('lmSpo2')?.textContent || '85';
  fetch(`${API_BASE}/api/sensor?temp=${temp}&oxy=${spo2}`)
    .then(r => r.text())
    .then(data => console.log('Cloud alert response:', data))
    .catch(err => console.error('Cloud alert failed:', err));

  // Show alert cards
  setTimeout(() => {
    const cards = document.getElementById('alertCards');
    if (cards) cards.classList.add('visible');
    setTimeout(() => {
      const amb = document.getElementById('ambIcon');
      if (amb) amb.classList.add('moving');
    }, 800);
  }, 600);
}

// ── Scroll-reveal animation ─────────
const revealEls = document.querySelectorAll(
  '.feature-card, .flow-step, .vital-card, .side-card, .user-card, .uvp-card, .alert-card, .setup-box, .live-metric-card'
);
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0) scale(1)';
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

revealEls.forEach((el) => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(30px) scale(0.97)';
  observer.observe(el);
});

// ── Flow step stagger ──────────────
document.querySelectorAll('.flow-step').forEach((el, i) => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(20px)';
  el.style.transition = `opacity 0.5s ease ${i * 0.12}s, transform 0.5s ease ${i * 0.12}s`;
});
const flowObs = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      document.querySelectorAll('.flow-step').forEach(el => { el.style.opacity = '1'; el.style.transform = 'translateY(0)'; });
      flowObs.disconnect();
    }
  });
}, { threshold: 0.15 });
const flowWrap = document.querySelector('.flow-wrap');
if (flowWrap) flowObs.observe(flowWrap);

// ── Close dropdowns on outside click ──
document.addEventListener('click', (e) => {
  if (!e.target.closest('.lang-selector')) {
    const dropdown = document.getElementById('langDropdown');
    if (dropdown) dropdown.classList.remove('open');
  }
});
