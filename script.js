let ms = 0;
let sec = 0;
let min = 0;
let hr = 0;

let timer = null;

let lapTimes = [];

const display = document.getElementById("display");
const lapList = document.getElementById("lapList");
const statusBadge = document.getElementById("statusBadge");
const lastTimeEl = document.getElementById('lastTime');
const handHour = document.getElementById('handHour');
const handMinute = document.getElementById('handMinute');
const handSecond = document.getElementById('handSecond');
const totalLapsEl = document.getElementById('totalLaps');
const fastestEl = document.getElementById('fastest');
const slowestEl = document.getElementById('slowest');
const averageEl = document.getElementById('average');
const previousRunsList = document.getElementById('previousRunsList');
const noPreviousRuns = document.getElementById('noPreviousRuns');
let previousRuns = [];

function timeStrToMs(str){
    const parts = (str||'00:00:00:000').split(':');
    if(parts.length !== 4) return 0;
    const h = parseInt(parts[0],10)||0;
    const m = parseInt(parts[1],10)||0;
    const s = parseInt(parts[2],10)||0;
    const ms = parseInt(parts[3],10)||0;
    return ((h*60 + m)*60 + s)*1000 + ms;
}

function msToTimeStr(totalMs){
    const h = Math.floor(totalMs / 3600000);
    const m = Math.floor((totalMs % 3600000) / 60000);
    const s = Math.floor((totalMs % 60000) / 1000);
    const ms = totalMs % 1000;
    return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}:${String(ms).padStart(3,'0')}`;
}

function renderPreviousRuns(){
    if(!previousRunsList || !noPreviousRuns) return;
    previousRunsList.innerHTML = '';
    if(previousRuns.length === 0){
        noPreviousRuns.style.display = 'block';
        return;
    }
    noPreviousRuns.style.display = 'none';
    previousRuns.forEach(run => {
        const li = document.createElement('li');
        li.innerHTML = `<strong>${run.timestamp}</strong><br>Ended at <strong>${run.lastTime}</strong> • Laps: ${run.lapCount} • Avg: ${run.average}`;
        previousRunsList.appendChild(li);
    });
}

function updateStats(){
    if(!totalLapsEl || !fastestEl || !slowestEl || !averageEl) return;
    if(lapTimes.length === 0){
        totalLapsEl.innerText = '0';
        fastestEl.innerText = '--';
        slowestEl.innerText = '--';
        averageEl.innerText = '--';
        return;
    }

    const msArr = lapTimes.map(t => timeStrToMs(t));
    const sum = msArr.reduce((a,b)=>a+b,0);
    const avg = Math.round(sum / msArr.length);
    const min = Math.min(...msArr);
    const max = Math.max(...msArr);

    totalLapsEl.innerText = String(lapTimes.length);
    fastestEl.innerText = msToTimeStr(min);
    slowestEl.innerText = msToTimeStr(max);
    averageEl.innerText = msToTimeStr(avg);
}

function updateDisplay(){

let h = String(hr).padStart(2,'0');
let m = String(min).padStart(2,'0');
let s = String(sec).padStart(2,'0');
let milli = String(ms).padStart(3,'0');

display.innerText = `${h}:${m}:${s}:${milli}`;

	// update analog hands based on current stopwatch time
	// compute fractional values
	const totalSeconds = hr * 3600 + min * 60 + sec + ms / 1000;
	const secondsFraction = (sec + ms / 1000) / 60; // 0-1 within minute
	const minutesFraction = (min + sec / 60) / 60; // 0-1 within hour
	const hoursFraction = ((hr % 12) + min / 60) / 12; // 0-1 within 12h

	if(handSecond) handSecond.style.transform = `translateX(-50%) rotate(${secondsFraction * 360}deg)`;
	if(handMinute) handMinute.style.transform = `translateX(-50%) rotate(${minutesFraction * 360}deg)`;
	if(handHour) handHour.style.transform = `translateX(-50%) rotate(${hoursFraction * 360}deg)`;
}

function runTimer(){

ms += 10;

if(ms >= 1000){
ms = 0;
sec++;
}

if(sec >= 60){
sec = 0;
min++;
}

if(min >= 60){
min = 0;
hr++;
}

updateDisplay();
}

document.getElementById("start").onclick = ()=>{

if(timer !== null) return;

timer = setInterval(runTimer,10);

statusBadge.innerText = "Running";
statusBadge.style.background="#22c55e";

// clear last time when starting a new run
if(lastTimeEl) lastTimeEl.innerText = 'Last: --';
// refresh stats (keeps previous laps visible but recalculates)
updateStats();

};

document.getElementById("pause").onclick = ()=>{

clearInterval(timer);
timer = null;

statusBadge.innerText = "Paused";
statusBadge.style.background="#f59e0b";

};

document.getElementById("reset").onclick = ()=>{

clearInterval(timer);
timer = null;

const curDisplay = display.innerText || '00:00:00:000';
const hasRun = curDisplay !== '00:00:00:000' || lapTimes.length > 0;
if(hasRun){
    const summary = {
        timestamp: new Date().toLocaleString(),
        lastTime: curDisplay,
        lapCount: lapTimes.length,
        average: averageEl ? averageEl.innerText : '--'
    };
    previousRuns.unshift(summary);
    if(previousRuns.length > 10) previousRuns.pop();
    renderPreviousRuns();
}

// store the current displayed time as the "last" time before clearing
if(lastTimeEl){
	const cur = curDisplay;
	if(cur !== '00:00:00:000') lastTimeEl.innerText = `Last: ${cur}`;
	else lastTimeEl.innerText = 'Last: --';
}

// reset the stopwatch counters and lap data
ms = sec = min = hr = 0;
lapTimes = [];
lapList.innerHTML = "";
updateStats();

statusBadge.innerText = "Ready";
statusBadge.style.background = "#22c55e";

updateDisplay();

	// reset analog hands
	if(handSecond) handSecond.style.transform = 'translateX(-50%) rotate(0deg)';
	if(handMinute) handMinute.style.transform = 'translateX(-50%) rotate(0deg)';
	if(handHour) handHour.style.transform = 'translateX(-50%) rotate(0deg)';

};

document.getElementById("lap").onclick = ()=>{

let current = display.innerText;

lapTimes.push(current);

let li = document.createElement("li");
li.innerText = `Lap ${lapTimes.length} - ${current}`;
lapList.prepend(li);

// recalculate stats after adding a lap
updateStats();

};

updateDisplay();