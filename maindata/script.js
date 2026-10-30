const form = document.getElementById('login-form');
const msg = document.getElementById('message');
const loginBox = document.querySelector('.login-container');
const logo = document.querySelector('.logo');
const topBar = document.getElementById('top-bar');
const footer = document.querySelector('footer');
const animatedBg = document.querySelector('.animated-bg');

/* -------- Random Quadrilateral Generator -------- */
function randomQuadrilateral() {
  const p1 = `${Math.floor(Math.random() * 30)}% ${Math.floor(Math.random() * 30)}%`;
  const p2 = `${70 + Math.floor(Math.random() * 30)}% ${Math.floor(Math.random() * 30)}%`;
  const p3 = `${70 + Math.floor(Math.random() * 30)}% ${70 + Math.floor(Math.random() * 30)}%`;
  const p4 = `${Math.floor(Math.random() * 30)}% ${70 + Math.floor(Math.random() * 30)}%`;
  return `polygon(${p1}, ${p2}, ${p3}, ${p4})`;
}

/* -------- Animated Background Shapes -------- */
function initBackgroundShapes() {
  const bg = document.querySelector('.animated-bg');
  const shapeCount = 5;

  for (let i = 0; i < shapeCount; i++) {
    const shape = document.createElement('div');
    shape.className = 'bg-shape';
    shape.style.setProperty('--i', i);
    shape.style.clipPath = randomQuadrilateral();
    bg.appendChild(shape);
    animateShape(shape);
  }
}

function animateShape(shape) {
  let angle = Math.random() * Math.PI * 2;
  let radiusX = 150 + Math.random() * 400;
  let radiusY = 100 + Math.random() * 350;
  let speed = 0.0003 + Math.random() * 0.002;

  if (Math.random() < 0.5) speed *= -1;

  const centerX = window.innerWidth / 2;
  const centerY = window.innerHeight / 2;

  const scale = 0.8 + Math.random() * 0.6;
  let selfRotate = Math.random() * 360;
  const selfRotateSpeed = (Math.random() * 0.06 + 0.02) * (Math.random() < 0.5 ? -1 : 1);

  function update() {
    angle += speed;
    selfRotate += selfRotateSpeed;

    const x = centerX + Math.cos(angle) * radiusX - shape.offsetWidth / 2;
    const y = centerY + Math.sin(angle) * radiusY - shape.offsetHeight / 2;

    shape.style.transform =
      `translate(${x}px, ${y}px) rotate(${selfRotate}deg) scale(${scale})`;

    requestAnimationFrame(update);
  }
  update();
}

/* -------- Message helper -------- */
function showMessage(text, type = 'error', duration = 3000, callback) {
  msg.textContent = text;
  msg.className = `message ${type} show`;

  setTimeout(() => msg.classList.remove('show'), duration);
  setTimeout(() => {
    msg.textContent = '';
    msg.className = 'message';
    if (callback) callback();
  }, duration + 600);
}

/* -------- Login SFX (simple ascending tones) -------- */
function playLoginSFX() {
  try {
    const ac = new (window.AudioContext || window.webkitAudioContext)();
    [440, 587, 880].forEach((freq, i) => {
      const osc = ac.createOscillator();
      const gain = ac.createGain();
      osc.connect(gain);
      gain.connect(ac.destination);
      const t = ac.currentTime + i * 0.13;
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.12, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
      osc.start(t);
      osc.stop(t + 0.25);
    });
  } catch (e) { }
}

/* =============================================
   JSB Module Menu System
   ============================================= */

const MODULES = [
  {
    id: 'status', label: 'OPERATOR STATUS', color: '#00f0ff',
    desc: ['uid: 001 •', 'rank: owner •', 'clearance: apex •'],
  },
  {
    id: 'vpn', label: 'VPN TUNNEL', color: '#00cc77',
    desc: ['aes-256 •', 'no-log •'],
  },
  {
    id: 'crack', label: 'PASS CRACKER', color: '#ff3bc1',
    desc: ['rockyou.txt •', 'gpu-assisted •'],
  },
  {
    id: 'scan', label: 'NET SCANNER', color: '#ffaa00',
    desc: ['stealth mode •', 'syn scan •'],
  },
  {
    id: 'payload', label: 'PAYLOAD FORGE', color: '#9966ff',
    desc: ['metasploit •', 'obfuscated •'],
  },
];

let hoveredIndex = -1;
let selectedId = null;
let shellRendered = false;
let menuItems = [];

/* ---- Build menu ---- */
function buildMenu(username) {
  const menu = document.getElementById('dash-menu');
  menu.innerHTML = '';
  menuItems = [];

  MODULES.forEach((mod, i) => {
    const item = document.createElement('div');
    item.className = 'menu-item';
    item.dataset.index = i;
    item.innerHTML = `
      <div class="menu-bg"></div>
      <div class="menu-fill"  style="background:${mod.color}"></div>
      <div class="menu-accent" style="background:${mod.color}"></div>
      <div class="menu-desc">${mod.desc.map(d => `<span>${d}</span>`).join('')}</div>
      <span class="menu-slash">/</span>
      <span class="menu-label">${mod.label}</span>
    `;
    item.addEventListener('mouseenter', () => setHovered(i));
    item.addEventListener('mouseleave', () => setHovered(-1));
    item.addEventListener('click', () => selectModule(mod.id, username));
    menu.appendChild(item);
    menuItems.push(item);
  });
}

function setHovered(index) {
  menuItems.forEach((el, i) => el.classList.toggle('hovered', i === index));
  hoveredIndex = index;
}

function selectModule(id, username) {
  if (selectedId === id) return;
  selectedId = id;

  const content = document.getElementById('dash-content');
  const empty = document.getElementById('content-empty');
  if (empty) empty.style.display = 'none';

  // Remove old panel
  const old = content.querySelector('.content-panel');
  if (old) old.remove();

  const panel = document.createElement('div');
  panel.className = 'content-panel';

  switch (id) {
    case 'status': renderStatus(panel, username); break;
    case 'vpn': renderVPN(panel); break;
    case 'crack': renderCrack(panel); break;
    case 'scan': renderScan(panel); break;
    case 'payload': renderPayload(panel); break;
  }

  content.appendChild(panel);
  requestAnimationFrame(() => panel.classList.add('show'));
}

/* ---- Keyboard nav ---- */
function initKeyNav(username) {
  document.addEventListener('keydown', (e) => {
    if (!document.getElementById('dashboard').classList.contains('show')) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHovered(Math.min(hoveredIndex + 1, MODULES.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHovered(Math.max(hoveredIndex - 1, 0));
    } else if (e.key === 'Enter' && hoveredIndex >= 0) {
      selectModule(MODULES[hoveredIndex].id, username);
    }
  });
}

/* ---- Counter util ---- */
function animateCounter(el, target, duration = 1200) {
  const start = performance.now();
  const tick = (now) => {
    const p = Math.min((now - start) / duration, 1);
    el.textContent = Math.floor(p * target);
    if (p < 1) requestAnimationFrame(tick);
    else el.textContent = target;
  };
  requestAnimationFrame(tick);
}

/* ---- Module renderers ---- */

function renderStatus(panel, username) {
  panel.innerHTML = `
    <p class="panel-heading">// Operator Status</p>
    <div class="status-profile">
      <img src="profile.jpg" class="status-pic" alt="Profile">
      <div class="status-info">
        <h2>${username}</h2>
        <p>User ID &nbsp;: 001</p>
        <p>Position : Owner</p>
        <p>Clearance: APEX</p>
      </div>
    </div>
    <div class="status-stats">
      <div class="status-stat"><span class="status-stat-val" id="s-ops">0</span><span class="status-stat-lbl">Operations</span></div>
      <div class="status-stat pk"><span class="status-stat-val" id="s-threat">--</span><span class="status-stat-lbl">Threat Index</span></div>
      <div class="status-stat"><span class="status-stat-val" id="s-nodes">0</span><span class="status-stat-lbl">Nodes Online</span></div>
    </div>`;
  setTimeout(() => {
    animateCounter(document.getElementById('s-ops'), 47);
    animateCounter(document.getElementById('s-nodes'), 12);
    document.getElementById('s-threat').textContent = 'HIGH';
  }, 300);
}

/* ---- VPN ---- */
let vpnConnected = false;
let vpnConnecting = false;
let vpnInterval = null;
const VPN_SERVERS = [
  { loc: 'NL — Amsterdam', ip: '185.220.101.47', ping: 24 },
  { loc: 'DE — Frankfurt', ip: '194.165.16.83', ping: 31 },
  { loc: 'CH — Zurich', ip: '45.142.212.100', ping: 38 },
  { loc: 'SG — Singapore', ip: '103.21.244.55', ping: 88 },
];
let vpnServer = VPN_SERVERS[0];
let vpnBytes = { up: 0, dn: 0 };

function scrambleFromTo(el, startText, targetText, duration = 1500, charSet = null) {
  const chars = charSet || 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const start = performance.now();
  const maxLen = Math.max(startText.length, targetText.length);
  
  return new Promise(resolve => {
    let lastTick = 0;
    const tick = (now) => {
      if (!document.contains(el)) return resolve();
      
      // Control framerate to ~30fps for a chunky terminal effect
      if (now - lastTick < 30) {
        requestAnimationFrame(tick);
        return;
      }
      lastTick = now;

      const p = Math.min((now - start) / duration, 1);
      if (p < 1) {
        let current = '';
        for (let i = 0; i < maxLen; i++) {
          const targetChar = targetText[i] || ' ';
          const startChar = startText[i] || ' ';
          
          if (Math.random() < (p * 1.2)) {
            current += targetChar;
          } else {
            if (Math.random() > 0.4) {
              current += startChar;
            } else {
              current += chars[Math.floor(Math.random() * chars.length)];
            }
          }
        }
        el.textContent = current.trim();
        requestAnimationFrame(tick);
      } else {
        el.textContent = targetText;
        resolve();
      }
    };
    requestAnimationFrame(tick);
  });
}

function renderVPN(panel) {
  panel.innerHTML = `
    <p class="panel-heading">// VPN Tunnel — AES-256-GCM</p>
    <div class="vpn-card">
      <div class="vpn-status-row">
        <span class="vpn-dot${vpnConnected ? ' on' : ''}" id="vpn-dot"></span>
        <span class="vpn-status-txt" id="vpn-status-txt">${vpnConnected ? 'CONNECTED' : (vpnConnecting ? 'CONNECTING...' : 'DISCONNECTED')}</span>
        <button class="vpn-btn" id="vpn-btn">${vpnConnected ? 'DISCONNECT' : (vpnConnecting ? 'CANCEL' : 'CONNECT')}</button>
      </div>
      <div class="vpn-info-grid">
        <div class="vpn-info-item"><span class="vpn-lbl">SERVER</span><span class="vpn-val" id="vpn-srv">${vpnConnected ? vpnServer.loc : 'ID — Indonesia'}</span></div>
        <div class="vpn-info-item"><span class="vpn-lbl" id="vpn-ip-lbl">${vpnConnected ? 'MASKED IP' : 'IP ADDRESS'}</span><span class="vpn-val" id="vpn-ip">${vpnConnected ? vpnServer.ip : '114.122.13.4'}</span></div>
        <div class="vpn-info-item"><span class="vpn-lbl">PING</span><span class="vpn-val" id="vpn-ping">${vpnConnected ? vpnServer.ping + ' ms' : '—'}</span></div>
        <div class="vpn-info-item"><span class="vpn-lbl">PROTOCOL</span><span class="vpn-val">WireGuard</span></div>
        <div class="vpn-info-item"><span class="vpn-lbl">↑ UPLOAD</span><span class="vpn-val" id="vpn-up">0 KB</span></div>
        <div class="vpn-info-item"><span class="vpn-lbl">↓ DOWNLOAD</span><span class="vpn-val" id="vpn-dn">0 KB</span></div>
      </div>
      <div class="vpn-server-list">
        ${VPN_SERVERS.map((s, i) => `<div class="vpn-server-row ${s === vpnServer ? 'active' : ''}" data-i="${i}">${s.loc} <span>${s.ping}ms</span></div>`).join('')}
      </div>
    </div>`;

  panel.querySelectorAll('.vpn-server-row').forEach(row => {
    row.addEventListener('click', () => {
      if (vpnConnected || vpnConnecting) return; // Prevent changing location
      panel.querySelectorAll('.vpn-server-row').forEach(r => r.classList.remove('active'));
      row.classList.add('active');
      vpnServer = VPN_SERVERS[+row.dataset.i];
      // Display doesn't change until we connect!
    });
  });

  panel.querySelector('#vpn-btn').addEventListener('click', async () => {
    const dot = panel.querySelector('#vpn-dot');
    const txt = panel.querySelector('#vpn-status-txt');
    const btn = panel.querySelector('#vpn-btn');
    const srvEl = panel.querySelector('#vpn-srv');
    const ipEl = panel.querySelector('#vpn-ip');
    const ipLbl = panel.querySelector('#vpn-ip-lbl');
    const pingEl = panel.querySelector('#vpn-ping');

    if (vpnConnecting) {
      // Cancel connection or disconnection
      vpnConnecting = false;
      vpnConnected = false;
      dot.classList.remove('on'); txt.textContent = 'DISCONNECTED'; btn.textContent = 'CONNECT';
      srvEl.textContent = 'ID — Indonesia';
      ipEl.textContent = '114.122.13.4';
      ipLbl.textContent = 'IP ADDRESS';
      return;
    }

    if (!vpnConnected) {
      // Connecting
      vpnConnecting = true;
      dot.classList.remove('on'); 
      txt.textContent = 'INITIALIZING ROUTE...'; 
      btn.textContent = 'CANCEL';
      
      await Promise.all([
        scrambleFromTo(srvEl, 'ID — Indonesia', vpnServer.loc, 1800),
        scrambleFromTo(ipEl, '114.122.13.4', vpnServer.ip, 1800, '0123456789.')
      ]);
      
      if (!vpnConnecting || !document.contains(panel)) return; // Cancelled
      
      vpnConnecting = false;
      vpnConnected = true;
      
      dot.classList.add('on'); txt.textContent = 'CONNECTED'; btn.textContent = 'DISCONNECT';
      ipLbl.textContent = 'MASKED IP';
      pingEl.textContent = vpnServer.ping + ' ms';
      
      vpnBytes = { up: 0, dn: 0 };
      clearInterval(vpnInterval);
      vpnInterval = setInterval(() => {
        if (!document.contains(panel)) return;
        vpnBytes.up += Math.random() * 80 + 10;
        vpnBytes.dn += Math.random() * 200 + 40;
        const fmt = b => b > 1024 ? (b / 1024).toFixed(1) + ' MB' : Math.floor(b) + ' KB';
        
        const up = panel.querySelector('#vpn-up');
        const dn = panel.querySelector('#vpn-dn');
        if (up) up.textContent = fmt(vpnBytes.up);
        if (dn) dn.textContent = fmt(vpnBytes.dn);
        
        let p = vpnServer.ping + Math.floor(Math.random() * 16 - 4);
        if (Math.random() < 0.08) { // 8% chance to spike
          p = Math.floor(Math.random() * 201 + 100);
        }
        const pingDom = panel.querySelector('#vpn-ping');
        if (pingDom) pingDom.textContent = p + ' ms';
      }, 800);
    } else {
      // Disconnecting
      vpnConnecting = true;
      dot.classList.remove('on'); 
      txt.textContent = 'SEVERING CONNECTION...'; 
      btn.textContent = 'CANCEL';
      
      pingEl.textContent = '—';
      panel.querySelector('#vpn-up').textContent = '0 KB';
      panel.querySelector('#vpn-dn').textContent = '0 KB';
      clearInterval(vpnInterval);
      
      await Promise.all([
        scrambleFromTo(srvEl, vpnServer.loc, 'ID — Indonesia', 1800),
        scrambleFromTo(ipEl, vpnServer.ip, '114.122.13.4', 1800, '0123456789.')
      ]);
      
      if (!vpnConnecting || !document.contains(panel)) return; // Cancelled
      
      vpnConnected = false;
      vpnConnecting = false;
      txt.textContent = 'DISCONNECTED'; 
      btn.textContent = 'CONNECT';
      ipLbl.textContent = 'IP ADDRESS';
    }
  });
}

/* ---- Pass Cracker ---- */
let crackInterval = null;
let crackWordInterval = null;
let crackTimeout = null;
function renderCrack(panel) {
  // Generate random SHA-512 style hash
  const hexChars = '0123456789abcdef';
  let hash = '';
  for (let i = 0; i < 128; i++) hash += hexChars[Math.floor(Math.random() * 16)];

  const lists = ['rockyou.txt (14M)', 'crackstation.txt (1.4B)', 'seclists_top1M.txt (1M)', 'pwned_passwords.txt (613M)', 'kaonashi.txt (100M)'];
  const gpus = [
    { name: 'RTX 4090', speed: 1.2, baseSpd: 38000 },
    { name: 'RTX 3090 Ti', speed: 0.9, baseSpd: 29000 },
    { name: 'RX 7900 XTX', speed: 0.8, baseSpd: 26000 },
    { name: 'Tesla V100', speed: 1.0, baseSpd: 32000 },
    { name: 'A100 Tensor', speed: 1.5, baseSpd: 48000 }
  ];
  const quants = [
    { label: '×1', mult: 1 },
    { label: '×2', mult: 2 },
    { label: '×4', mult: 4 },
    { label: '×8', mult: 8 }
  ];

  const rList = lists[Math.floor(Math.random() * lists.length)];
  const rGpuObj = gpus[Math.floor(Math.random() * gpus.length)];
  const rQuantObj = quants[Math.floor(Math.random() * quants.length)];
  
  const rGpu = rGpuObj.name + ' ' + rQuantObj.label;
  const speedMult = rGpuObj.speed * rQuantObj.mult;
  const baseSpeed = rGpuObj.baseSpd * rQuantObj.mult;

  panel.innerHTML = `
    <p class="panel-heading">// Password Cracker — Dictionary Attack</p>
    <div class="crack-hash"><span class="crack-lbl">TARGET HASH (SHA-512)</span><code class="crack-code" id="cr-hash-code">${hash.substring(0, 64)}…</code></div>
    <div class="crack-stats-row">
      <div class="crack-stat"><span class="crack-lbl">ATTEMPTS/SEC</span><span class="crack-big" id="cr-speed">0</span></div>
      <div class="crack-stat"><span class="crack-lbl">ELAPSED</span><span class="crack-big" id="cr-time">00:00</span></div>
      <div class="crack-stat"><span class="crack-lbl">PROGRESS</span><span class="crack-big" id="cr-pct">0%</span></div>
    </div>
    <div class="crack-bar-wrap"><div class="crack-bar" id="cr-bar"></div></div>
    <div class="crack-current"><span class="crack-lbl">CURRENT ATTEMPT</span><code id="cr-word">INITIALIZING...</code></div>
    <div class="crack-info-row">
      <span class="crack-chip">WORDLIST: ${rList}</span>
      <span class="crack-chip">ALGO: SHA-512</span>
      <span class="crack-chip">GPU: ${rGpu}</span>
    </div>`;

  const words = [
    'password', 'password123', '123456', '123456789', '12345678', 'qwerty', 'qwerty123', 'abc123', 
    'letmein', 'welcome', 'admin', 'login', 'guest', 'root', 'passw0rd', 'iloveyou', 'trustno1', 
    'sunshine', 'dragon', 'monkey', 'football', 'baseball', 'starwars', 'whatever', 'freedom', 
    'hello123', 'welcome123', 'admin123', 'user123', 'asdfgh', 'zxcvbn', '1q2w3e4r', 'qazwsx', 
    '123qwe', 'jason123', 'michael1', 'daniel99', 'andrew123', 'jessica1', 'ashley123', 'chris2024', 
    '2000', '2004', '2005', '2020', '2023', '2024', 'P@ssw0rd', 'Password1', 'Admin@123', 'Welcome1',
    '12345', '111111', '1234567', '1234', '1234567890', 'princess', 'adobe123[a]', '123123', 'solo',
    'master', '666666', 'photoshop[a]', '1qaz2wsx', 'qwertyuiop', 'ashley', 'mustang', '121212', 
    '654321', 'bailey', 'access', 'flower', '555555', 'shadow', 'lovely', '7777777', 'michael', 
    '!@#$%^&*', 'jesus', 'superman', 'hello', 'charlie', '888888', '696969', 'hottie', 'aa123456', 
    'ninja', 'azerty', 'loveme', 'donald', 'batman', 'zaq1zaq1', 'Football', '000000'
  ];
  
  let elapsed = 0, pct = 0;
  clearInterval(crackInterval);
  clearInterval(crackWordInterval);
  clearTimeout(crackTimeout);
  
  // Update stats every 1 second
  crackInterval = setInterval(() => {
    elapsed++;
    pct += (Math.random() * 1.5 + 0.5) * speedMult; // Hardware-dependent speed
    
    const sp = document.getElementById('cr-speed');
    const ti = document.getElementById('cr-time');
    const pc = document.getElementById('cr-pct');
    const ba = document.getElementById('cr-bar');
    const hashEl = document.getElementById('cr-hash-code');
    const wo = document.getElementById('cr-word');
    
    if (!sp) { 
      clearInterval(crackInterval); 
      clearInterval(crackWordInterval); 
      return; 
    }
    
    if (pct >= 99.9) {
      clearInterval(crackInterval);
      clearInterval(crackWordInterval);
      
      sp.textContent = '0';
      pc.textContent = 'ERR';
      pc.style.color = '#ff3bc1';
      ba.style.width = '0%';
      wo.textContent = '—';
      hashEl.textContent = '[ERROR 0xNET01: Network request failed.]';
      hashEl.style.color = '#ff3bc1';
      return;
    }

    const speed = Math.floor(baseSpeed + Math.random() * (baseSpeed * 0.15));
    const m = String(Math.floor(elapsed / 60)).padStart(2, '0');
    const s = String(elapsed % 60).padStart(2, '0');
    
    sp.textContent = speed.toLocaleString();
    ti.textContent = `${m}:${s}`;
    pc.textContent = pct.toFixed(1) + '%';
    ba.style.width = pct + '%';
  }, 1000);

  // Wait 1 second, then start flashing passwords 20 times a second
  crackTimeout = setTimeout(() => {
    crackWordInterval = setInterval(() => {
      const wo = document.getElementById('cr-word');
      if (!wo) {
        clearInterval(crackWordInterval);
        return;
      }
      
      if (Math.random() > 0.3) {
        let word = words[Math.floor(Math.random() * words.length)];
        if (Math.random() > 0.8) word += Math.floor(Math.random() * 999);
        wo.textContent = word;
      } else {
        wo.textContent = Math.random().toString(36).slice(2, 10);
      }
    }, 50);
  }, 1000);
}

/* ---- Net Scanner ---- */
function renderScan(panel) {
  panel.innerHTML = `
    <p class="panel-heading">// Network Scanner — Nmap SYN Stealth</p>
    <div class="terminal-box" id="scan-out" style="min-height:340px;font-size:0.8rem;"></div>`;
  const lines = [
    { t: 0, cls: 'cmd', txt: 'Starting Nmap 7.94 ( https://nmap.org )' },
    { t: 400, cls: '', txt: 'Initiating SYN Stealth Scan at 08:14' },
    { t: 900, cls: 'ok', txt: 'Scanning 10.0.0.0/24 [65535 ports]' },
    { t: 1600, cls: 'warn', txt: 'Host: 10.0.0.1  [gateway]   Ports: 80/open/tcp, 443/open/tcp, 22/open/tcp' },
    { t: 2200, cls: '', txt: 'Host: 10.0.0.4  [workstation]   Ports: 135/open/tcp, 3389/open/tcp' },
    { t: 2900, cls: 'warn', txt: 'Host: 10.0.0.7  [server]   Ports: 22/open/tcp, 8080/open/tcp, 3306/open/tcp' },
    { t: 3600, cls: '', txt: 'Host: 10.0.0.12 [NAS]   Ports: 445/open/tcp, 139/open/tcp, 21/open/tcp' },
    { t: 4400, cls: 'warn', txt: 'Host: 10.0.0.23 [unknown]   Ports: 4444/open/tcp  ← suspicious' },
    { t: 5100, cls: 'ok', txt: 'Nmap done: 256 IP addresses (5 hosts up) scanned in 12.47s' },
  ];
  lines.forEach(({ t, cls, txt }) => {
    setTimeout(() => {
      const box = document.getElementById('scan-out');
      if (!box) return;
      const span = document.createElement('span');
      span.className = `terminal-line ${cls}`;
      span.textContent = txt;
      box.appendChild(span);
    }, t);
  });
}

/* ---- Payload Forge ---- */
function renderPayload(panel) {
  panel.innerHTML = `
    <p class="panel-heading">// Payload Forge — Metasploit Framework</p>
    <div class="pf-form">
      <div class="pf-row"><label class="pf-lbl">PAYLOAD</label>
        <select class="pf-select" id="pf-type">
          <option>windows/meterpreter/reverse_tcp</option>
          <option>linux/x64/meterpreter/reverse_tcp</option>
          <option>windows/x64/shell_reverse_tcp</option>
          <option>python/meterpreter/reverse_https</option>
        </select></div>
      <div class="pf-row"><label class="pf-lbl">LHOST</label><input class="pf-input" id="pf-lhost" value="185.220.101.47" /></div>
      <div class="pf-row"><label class="pf-lbl">LPORT</label><input class="pf-input" id="pf-lport" value="4444" /></div>
      <div class="pf-row"><label class="pf-lbl">ENCODER</label>
        <select class="pf-select" id="pf-enc">
          <option>x86/shikata_ga_nai</option>
          <option>x64/zutto_dekiru</option>
          <option>cmd/powershell_base64</option>
        </select></div>
      <div class="pf-row"><label class="pf-lbl">FORMAT</label>
        <select class="pf-select" id="pf-fmt">
          <option>exe</option><option>elf</option><option>raw</option><option>python</option>
        </select></div>
      <button class="pf-btn" id="pf-gen">GENERATE PAYLOAD</button>
    </div>
    <div class="pf-output hidden" id="pf-output">
      <span class="crack-lbl">OUTPUT (TRUNCATED)</span>
      <code class="pf-code" id="pf-code"></code>
    </div>`;

  let isGenerating = false;
  let pfInterval = null;

  panel.querySelector('#pf-gen').addEventListener('click', () => {
    if (isGenerating) return;
    
    const btn = panel.querySelector('#pf-gen');
    const out = panel.querySelector('#pf-output');
    const code = panel.querySelector('#pf-code');
    
    isGenerating = true;
    btn.textContent = 'GENERATING...';
    btn.style.opacity = '0.5';
    btn.style.pointerEvents = 'none';
    
    out.classList.remove('hidden');
    const fake = btoa(`msfvenom -p ${panel.querySelector('#pf-type').value} LHOST=${panel.querySelector('#pf-lhost').value} LPORT=${panel.querySelector('#pf-lport').value} -e ${panel.querySelector('#pf-enc').value} -f ${panel.querySelector('#pf-fmt').value}`)
      .repeat(4).substring(0, 320) + '…';
    code.textContent = '';
    
    let i = 0;
    clearInterval(pfInterval);
    pfInterval = setInterval(() => { 
      if (!document.contains(panel)) {
        clearInterval(pfInterval);
        return;
      }
      code.textContent += fake[i++]; 
      if (i >= fake.length) {
        clearInterval(pfInterval);
        isGenerating = false;
        btn.textContent = 'GENERATE PAYLOAD';
        btn.style.opacity = '1';
        btn.style.pointerEvents = 'auto';
      }
    }, 8);
  });
}

/* ---- Show Dashboard ---- */
function showDashboard(username) {
  const dash = document.getElementById('dashboard');
  dash.classList.remove('hidden');
  setTimeout(() => dash.classList.add('show'), 100);
  buildMenu(username);
  initKeyNav(username);
}

/* -------- Login logic -------- */
let isLoggingIn = false;

form.addEventListener('submit', (e) => {
  e.preventDefault();
  if (isLoggingIn) return;

  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value;

  if (username !== 'bigboss_jas') {
    showMessage('User not found', 'error');
    return;
  }
  if (password !== 'jasonganteng123') {
    showMessage('Incorrect password', 'error');
    return;
  }

  // ✅ Successful login
  isLoggingIn = true;
  showMessage('Access Granted', 'success', 1500, () => {
    // 🔒 Lock inputs and button immediately
    document.getElementById('username').setAttribute('readonly', true);
    document.getElementById('password').setAttribute('readonly', true);
    const loginBtn = document.querySelector('button[type="submit"]');
    loginBtn.disabled = true;

    playLoginSFX();

    form.style.opacity = '0';
    logo.style.opacity = '0';

    setTimeout(() => {
      form.style.display = 'none';
      logo.style.display = 'none';

      const info = document.createElement('div');
      info.className = 'user-info';
      info.innerHTML = `
        <img src="profile.jpg" alt="${username} Profile">
        <h2>Welcome, ${username}</h2> <br>
        <p>User ID: 001</p>
        <p>Position : Owner</p>
      `;
      loginBox.appendChild(info);

      // morph box size
      const temp = info.cloneNode(true);
      temp.style.cssText = 'visibility:hidden;position:absolute;';
      document.body.appendChild(temp);
      const targetW = temp.offsetWidth + 60;
      const targetH = temp.offsetHeight + 60;
      document.body.removeChild(temp);

      loginBox.style.width = loginBox.offsetWidth + 'px';
      loginBox.style.height = loginBox.offsetHeight + 'px';

      requestAnimationFrame(() => {
        loginBox.style.transition = 'width 0.8s ease, height 0.8s ease';
        loginBox.style.width = targetW + 'px';
        loginBox.style.height = targetH + 'px';
      });

      // show info & spinner
      setTimeout(() => {
        info.classList.add('show');

        const loader = document.createElement('div');
        loader.className = 'loading-spinner';
        document.body.appendChild(loader);

        function positionSpinner() {
          const boxRect = loginBox.getBoundingClientRect();
          loader.style.position = 'absolute';
          loader.style.top = window.scrollY + boxRect.bottom + 60 + 'px';
          loader.style.left = window.scrollX + boxRect.left + boxRect.width / 2 - 20 + 'px';
        }
        positionSpinner();
        requestAnimationFrame(() => loader.classList.add('show'));

        const randomDelay = (Math.random() * 7 + 3) * 1000;

        setTimeout(() => {
          info.style.opacity = '0';
          loader.classList.remove('show');
          footer.classList.add('fade-out');

          setTimeout(() => {
            loader.remove();
            info.remove();
            footer.style.display = 'none';

            loginBox.classList.add('expand-out');

            setTimeout(() => {
              loginBox.style.display = 'none';

              // 🌟 Show animated background
              animatedBg.classList.remove('hidden');
              animatedBg.classList.add('show');
              initBackgroundShapes();

              // top bar
              document.getElementById('user-top-name').textContent = username;
              topBar.classList.remove('hidden');
              requestAnimationFrame(() => topBar.classList.add('show'));

              // dashboard
              showDashboard(username);
            }, 1200);
          }, 600);
        }, randomDelay);
      }, 800);
    }, 600);
  });
});
