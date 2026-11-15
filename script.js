const clock = document.getElementById('clock');
const statusTag = document.getElementById('status');
const box = document.querySelector('.signal');

const timeInput = document.getElementById('alarm-time');
const btn = document.getElementById('btn');
const alertPan = document.getElementById('alert');
const offBtn = document.getElementById('off-btn');

let alarmTime = null;
let ringing = false;
let beepLoop = null;
let audio = null;

const glitchChars = ['#', '@', '%', '&', '?', '3', 'X', '*'];

function playBeep() {
    if (!audio) {
        audio = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audio.state === 'suspended') {
        audio.resume();
    }

    const osc = audio.createOscillator();
    const gain = audio.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(520, audio.currentTime);
    osc.frequency.exponentialRampToValueAtTime(180, audio.currentTime + 0.35);

    gain.gain.setValueAtTime(0.15, audio.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audio.currentTime + 0.35);

    osc.connect (gain);
    gain.connect(audio.destination);

    osc.start();
    osc.stop(audio.currentTime + 0.35);
}

function triggerAlarm() {
    ringing = true;
    box.classList.add('signal-strange');
    alertPan.classList.remove('hidden');
    statusTag.textContent = 'STRANGE ACTIVE';
    statusTag.style.color = 'rgb(235, 70, 70)';

    playBeep();
    beepLoop = setInterval(playBeep, 700);
}

function updateClock() {
    const now = new Date();
    const h = String(now.getHours()).padStart(2,'0');
    const m = String(now.getMinutes()).padStart(2,'0');
    const s = String(now.getSeconds()).padStart(2,'0');
    const cleanTime = `${h}:${m}:${s}`;

    if (alarmTime === `${h}:${m}` && s === '00' && !ringing) {
        triggerAlarm();
    }

    const chance = ringing ? 0.6 : 0.1;
    if (Math.random() < chance) {
        const chars = cleanTime.split('');
        const randIdx = Math.floor(Math.random() * chars.length);
        if (chars[randIdx] !== ':') {
            chars[randIdx] = glitchChars[Math.floor(Math.random() * glitchChars.length)];
        }
        const glitched = chars.join(``);
        clock.textContent = glitched;
        clock.dataset.text = glitched;
    } else {
        clock.textContent = cleanTime;
        clock.dataset.text = cleanTime;
    }
}

btn.addEventListener('click', () => {
    if (!timeInput.value) return;

    if (!audio) {
        audio = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audio.state === 'suspended') {
        audio.resume();
    }

    alarmTime = timeInput.value;
    statusTag.textContent = `LOCKED FOR ${alarmTime}`;
    statusTag.style.color = '#00e5ff';
});

offBtn.addEventListener('click', () => {
    ringing = false;
    alarmTime = null;
    clearInterval(beepLoop);
    box.classList.remove('signal-strange');
    alertPan.classList.add('hidden');
    statusTag.textContent = 'SIGNAL STABLE'
    statusTag.style.color = '#5793e6';
});

setInterval(updateClock, 250);
updateClock();