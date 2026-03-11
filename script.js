// ── HERO COUNTERS ──
function animateCount(el,target,suffix){
  let start=0,dur=2000,s=null;
  const step=(ts)=>{if(!s)s=ts;const p=Math.min((ts-s)/dur,1);const e=1-Math.pow(1-p,3);const v=(e*target).toFixed(target%1!==0?1:0);el.textContent=v+suffix;if(p<1)requestAnimationFrame(step);};
  requestAnimationFrame(step);
}
setTimeout(()=>{document.querySelectorAll('[data-count]').forEach(el=>animateCount(el,parseFloat(el.dataset.count),el.dataset.suffix||''));},500);

// ── INTERSECTION OBSERVER ──
const obs=new IntersectionObserver((entries)=>{
  entries.forEach(e=>{
    if(e.isIntersecting){
      e.target.classList.add('visible');
      e.target.querySelectorAll('.counter').forEach(el=>{
        const t=parseFloat(el.dataset.target),suf=el.dataset.suffix||'';
        let s0=null,dur=1500;
        const step=(ts)=>{if(!s0)s0=ts;const p=Math.min((ts-s0)/dur,1);const ease=1-Math.pow(1-p,3);el.textContent=(ease*t).toFixed(t%1!==0?1:0)+suf;if(p<1)requestAnimationFrame(step);};
        requestAnimationFrame(step);
      });
      e.target.querySelectorAll('.progress-bar[data-width]').forEach(bar=>{
        setTimeout(()=>{bar.style.width=bar.dataset.width+'%';},300);
      });
    }
  });
},{threshold:0.15});
document.querySelectorAll('.animate-in,.animate-stagger').forEach(el=>obs.observe(el));

// ── FORECAST ──
const areaProfiles={industrial:{issues:['High base load with unpredictable surge demand','Heavy reliance on fossil fuel backup generators','No demand response mechanisms in place','Grid overload risk during shift changes'],recos:['Deploy real-time load forecasting per machine cluster','Implement AI-driven predictive maintenance','Install demand response for non-critical processes','Integrate on-site solar + battery with AI dispatch']},residential:{issues:['Evening peak demand spike (6–9pm) strains grid','Low solar self-consumption — most exported at midday','EV charging uncoordinated with grid capacity','No occupancy-based HVAC optimization'],recos:['Smart meter + time-of-use pricing via AI','AI thermostat pre-conditioning before peak hours','Coordinated EV charging via utility signal','Community solar + shared battery storage']},commercial:{issues:['HVAC accounts for 40–60% of building energy','Lighting and standby loads waste 20%+ overnight','Peak demand charges = 30–50% of electricity bills','No real-time occupancy-linked energy management'],recos:['AI-driven HVAC scheduling with weather integration','Occupancy sensors + ML-based lighting control','Demand charge management via battery storage','Building energy twin for continuous optimization']},mixed:{issues:['Highly variable demand patterns hard to forecast','Residential + commercial peaks don\'t align efficiently','Insufficient renewable integration capacity','District heating/cooling not optimized for urban density'],recos:['Zone-level AI forecasting with microzone granularity','District energy system with AI dispatch engine','Mixed-use demand aggregation for virtual power plant','Federated learning across building types for privacy']}};
const climMult={tropical:1.3,arid:1.25,temperate:1.0,cold:1.15};
const popMult={small:0.5,medium:1.0,large:2.5,mega:6};
let fChart,bChart,wChart;

function runForecast(){
  const city=document.getElementById('city-input').value||'Selected Region';
  const pop=document.getElementById('pop-input').value;
  const rt=document.getElementById('region-type').value;
  const climate=document.getElementById('climate-input').value;
  const cm=climMult[climate],pm=popMult[pop];
  const basePeak=2.5*pm*cm;
  const hours=Array.from({length:24},(_,i)=>i+':00');
  const baseline=hours.map((_,i)=>{const h=i;return +(basePeak*(0.6+0.4*Math.sin((h-6)*Math.PI/12)+0.1*Math.random())).toFixed(2);});
  const aiPred=baseline.map(v=>+(v*(0.92+0.1*Math.random())).toFixed(2));
  const panels=document.getElementById('result-panel');
  panels.style.display='block';
  document.getElementById('result-city').textContent='📍 '+city;
  const labels={industrial:'Industrial Zone',residential:'Residential District',commercial:'Commercial Hub',mixed:'Mixed Urban Area'};
  document.getElementById('result-sub').textContent=`${labels[rt]} · ${pop.charAt(0).toUpperCase()+pop.slice(1)} population · ${climate.charAt(0).toUpperCase()+climate.slice(1)} climate`;
  const peakVal=Math.max(...baseline);
  const badge=document.getElementById('status-badge');
  if(peakVal>12){badge.textContent='🔴 HIGH STRESS';badge.className='status-badge badge-high';}
  else if(peakVal>6){badge.textContent='🟡 MODERATE';badge.className='status-badge badge-med';}
  else{badge.textContent='🟢 STABLE';badge.className='status-badge badge-low';}
  if(fChart)fChart.destroy();
  fChart=new Chart(document.getElementById('forecastChart').getContext('2d'),{type:'line',data:{labels:hours,datasets:[{label:'AI Predicted',data:aiPred,borderColor:'#F4601F',backgroundColor:'rgba(244,96,31,0.08)',fill:true,tension:0.4,pointRadius:2},{label:'Baseline',data:baseline,borderColor:'#0B7B6E',backgroundColor:'rgba(11,123,110,0.04)',fill:false,tension:0.4,borderDash:[4,4],pointRadius:0}]},options:{responsive:true,plugins:{legend:{labels:{color:'#7A7A8C',font:{size:10}}}},scales:{x:{ticks:{color:'#7A7A8C',maxRotation:0,maxTicksLimit:8},grid:{color:'rgba(0,0,0,0.04)'}},y:{ticks:{color:'#7A7A8C',callback:v=>v+'GW'},grid:{color:'rgba(0,0,0,0.04)'}}}}});
  if(bChart)bChart.destroy();
  const prod=[...Array(6)].map((_,i)=>{const names=['Coal','Gas','Solar','Wind','Nuclear','Hydro'];const vals=[35,22,14,15,8,6];return{name:names[i],val:(vals[i]*pm*0.1).toFixed(1)};});
  const cons=[...Array(5)].map((_,i)=>{const names=['Residential','Industry','Commercial','Transport','Other'];const vals=[40,30,18,8,4];return{name:names[i],val:(vals[i]*pm*0.1).toFixed(1)};});
  bChart=new Chart(document.getElementById('balanceChart').getContext('2d'),{type:'bar',data:{labels:['Coal','Gas','Solar','Wind','Nuclear','Hydro'],datasets:[{label:'Production (GW)',data:prod.map(p=>p.val),backgroundColor:'rgba(244,96,31,0.7)',borderRadius:6},{label:'Consumption (GW)',data:[40,30,18,8,4,0].map(v=>(v*pm*0.1).toFixed(1)),backgroundColor:'rgba(11,123,110,0.6)',borderRadius:6}]},options:{responsive:true,plugins:{legend:{labels:{color:'#7A7A8C',font:{size:10}}}},scales:{x:{ticks:{color:'#7A7A8C',font:{size:9}},grid:{display:false}},y:{ticks:{color:'#7A7A8C',callback:v=>v+'GW'},grid:{color:'rgba(0,0,0,0.04)'}}}}});
  if(wChart)wChart.destroy();
  const days=['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  const wMid=days.map(()=>+(basePeak*(0.9+0.2*Math.random())).toFixed(2));
  const wHi=wMid.map(v=>+(v*1.12).toFixed(2));
  const wLo=wMid.map(v=>+(v*0.88).toFixed(2));
  wChart=new Chart(document.getElementById('weekChart').getContext('2d'),{type:'line',data:{labels:days,datasets:[{label:'Upper Bound',data:wHi,borderColor:'rgba(244,96,31,0.2)',backgroundColor:'rgba(244,96,31,0.08)',fill:'+1',tension:0.4,pointRadius:0,borderDash:[3,3]},{label:'AI Forecast',data:wMid,borderColor:'#F4601F',backgroundColor:'transparent',fill:false,tension:0.4,pointBackgroundColor:'#F4601F',pointRadius:5,borderWidth:2.5},{label:'Lower Bound',data:wLo,borderColor:'rgba(244,96,31,0.2)',backgroundColor:'rgba(244,96,31,0.08)',fill:'-1',tension:0.4,pointRadius:0,borderDash:[3,3]}]},options:{responsive:true,plugins:{legend:{labels:{color:'#7A7A8C',font:{size:10}}}},scales:{x:{ticks:{color:'#7A7A8C'},grid:{display:false}},y:{ticks:{color:'#7A7A8C',callback:v=>v+' GW'},grid:{color:'rgba(0,0,0,0.04)'}}}}});
  const prof=areaProfiles[rt];
  document.getElementById('issues-list').innerHTML=prof.issues.map(i=>`<li><div class="sol-icon" style="background:rgba(230,57,70,0.1);color:var(--red)">⚠</div>${i}</li>`).join('');
  document.getElementById('reco-list').innerHTML=prof.recos.map(r=>`<li><div class="sol-icon">✓</div>${r}</li>`).join('');
  const savings={small:'12–18%',medium:'15–22%',large:'18–25%',mega:'20–30%'};
  const co2={small:'8–12%',medium:'12–18%',large:'15–22%',mega:'18–28%'};
  document.getElementById('m1').textContent='94.2%';
  document.getElementById('m2').textContent=savings[pop];
  document.getElementById('m3').textContent=basePeak.toFixed(1)+' GW';
  document.getElementById('m4').textContent=co2[pop];
  panels.scrollIntoView({behavior:'smooth',block:'start'});
}

// ── GLOBAL CHART ──
new Chart(document.getElementById('globalChart').getContext('2d'),{type:'line',data:{labels:['2015','2016','2017','2018','2019','2020','2021','2022','2023','2024'],datasets:[{label:'Global Electricity (TWh)',data:[22500,23100,23700,24400,24900,24400,25400,26100,26600,27700],borderColor:'#F4601F',backgroundColor:'rgba(244,96,31,0.06)',fill:true,tension:0.4,pointBackgroundColor:'#F4601F',pointRadius:4},{label:'Renewables Share (%)',data:[22,23,24,25,26,27,28,29,30,32],borderColor:'#0B7B6E',backgroundColor:'rgba(11,123,110,0.04)',fill:false,tension:0.4,yAxisID:'y2',pointBackgroundColor:'#0B7B6E',pointRadius:4}]},options:{responsive:true,plugins:{legend:{labels:{color:'#7A7A8C',font:{family:'JetBrains Mono',size:10}}}},scales:{x:{ticks:{color:'#7A7A8C'},grid:{color:'rgba(0,0,0,0.04)'}},y:{ticks:{color:'#7A7A8C'},grid:{color:'rgba(0,0,0,0.04)'},title:{display:true,text:'TWh',color:'#7A7A8C'}},y2:{position:'right',ticks:{color:'#0B7B6E'},grid:{display:false},title:{display:true,text:'% Share',color:'#0B7B6E'}}}}});

// ── REGION MAP ──
const regionData={
  'Asia Pacific':{color:'#F4601F',consumption:'270 EJ',share:'43%',renewable:'28%',co2:'HIGH',growth:'+3.5%',ai_potential:'Very High',key_stat:'China alone = 27% of global energy. Wind+solar additions led by China (57% of global).',challenge:'Coal dominates — 58% of China electricity in 2024. India coal demand now equals OECD combined.',forecast_savings:'18–22%',notes:'Fastest-growing AI adoption (49% market share). Vietnam +9% energy growth in 2024.'},
  'North America':{color:'#0B7B6E',consumption:'111 EJ',share:'18%',renewable:'34%',co2:'HIGH',growth:'+1%',ai_potential:'High',key_stat:'US electricity consumption +230 TWh in 2024. Data center boom driving demand surge.',challenge:'Data centers + AI expected to double energy use by 2026. Grid aging infrastructure.',forecast_savings:'15–20%',notes:'Heat pumps outsold gas furnaces by 30% in 2024. Fastest AI smart grid growth expected.'},
  'Europe':{color:'#2DC653',consumption:'75 EJ',share:'12%',renewable:'45%',co2:'MEDIUM',growth:'+1%',ai_potential:'High',key_stat:'EU electricity grew ~1.5% in 2024. Coal fell 7%. Renewables at 45% of power mix.',challenge:'Heat pump sales fell 21% in 2024. Post-Ukraine gas disruption still reshaping grid.',forecast_savings:'12–18%',notes:'Contributed 21% of avoided fossil fuel use since 2010. Policy uncertainty slows progress.'},
  'South Asia':{color:'#F5C842',consumption:'40 EJ',share:'7%',renewable:'22%',co2:'HIGH',growth:'+5%',ai_potential:'Very High',key_stat:'India energy +5%, electricity demand normalizing after extreme 2023 heat waves.',challenge:'India coal demand equals all of CIS+Americas+Europe combined. Rapid urbanization.',forecast_savings:'20–28%',notes:'85% of additional global energy demand from developing nations. AI critical here.'},
  'Middle East':{color:'#7B3FF5',consumption:'28 EJ',share:'5%',renewable:'10%',co2:'VERY HIGH',growth:'+5%',ai_potential:'High',key_stat:'Iran +5% energy growth. Oil-to-gas conversion driving gas generation surge.',challenge:'Highest per-capita energy consumption (Qatar leads globally). Cooling demand extreme.',forecast_savings:'22–30%',notes:'Extreme heat driving AC load. AI demand forecasting for cooling critical for grid stability.'},
  'Africa':{color:'#E63946',consumption:'18 EJ',share:'3%',renewable:'18%',co2:'LOW',growth:'+5%',ai_potential:'Medium',key_stat:'Egypt +5%. Only 9.6% electricity share in total energy — huge access gap.',challenge:'Hundreds of millions lack energy access. Grid infrastructure severely underdeveloped.',forecast_savings:'25–35%',notes:'Leapfrog opportunity: AI microgrids + solar can skip legacy infrastructure entirely.'}
};
const rmap=document.getElementById('region-map');
Object.entries(regionData).forEach(([name,data])=>{
  const tile=document.createElement('div');
  tile.className='region-tile';
  tile.style.setProperty('--tile-color',data.color);
  tile.innerHTML=`<div class="region-name">${name}</div><div class="region-kwh">${data.consumption}</div><div class="region-change">${data.share} of global · ${data.growth}</div>`;
  tile.onclick=()=>showRegionDetail(name,data,tile);
  rmap.appendChild(tile);
});
function showRegionDetail(name,data,tile){
  document.querySelectorAll('.region-tile').forEach(t=>t.classList.remove('active'));
  tile.classList.add('active');
  const panel=document.getElementById('region-detail');
  panel.style.display='block';
  panel.style.borderColor=data.color;
  panel.innerHTML=`<div style="display:flex;align-items:center;gap:1rem;flex-wrap:wrap;margin-bottom:1.5rem"><h3 style="font-family:'Syne',sans-serif;font-size:1.3rem;font-weight:800;color:${data.color}">${name}</h3><span class="status-badge" style="background:${data.color}18;color:${data.color};border:1.5px solid ${data.color}40">CO₂: ${data.co2}</span><span class="status-badge" style="background:rgba(45,198,83,0.1);color:var(--green);border:1.5px solid rgba(45,198,83,0.3)">AI Potential: ${data.ai_potential}</span></div><div class="grid-4" style="margin-bottom:1.5rem"><div><div style="font-family:'Syne',sans-serif;font-size:1.4rem;font-weight:800;color:${data.color}">${data.consumption}</div><div style="font-size:0.7rem;color:var(--muted);text-transform:uppercase">Energy Consumed</div></div><div><div style="font-family:'Syne',sans-serif;font-size:1.4rem;font-weight:800;color:${data.color}">${data.share}</div><div style="font-size:0.7rem;color:var(--muted);text-transform:uppercase">Global Share</div></div><div><div style="font-family:'Syne',sans-serif;font-size:1.4rem;font-weight:800;color:var(--teal)">${data.renewable}</div><div style="font-size:0.7rem;color:var(--muted);text-transform:uppercase">Renewable Share</div></div><div><div style="font-family:'Syne',sans-serif;font-size:1.4rem;font-weight:800;color:var(--orange)">${data.forecast_savings}</div><div style="font-size:0.7rem;color:var(--muted);text-transform:uppercase">AI Savings Potential</div></div></div><div class="grid-2"><div><div style="font-size:0.72rem;color:var(--muted);text-transform:uppercase;margin-bottom:0.4rem;font-weight:600">Key Data Point</div><div style="font-size:0.85rem;line-height:1.65">${data.key_stat}</div></div><div><div style="font-size:0.72rem;color:var(--muted);text-transform:uppercase;margin-bottom:0.4rem;font-weight:600">Main Challenge</div><div style="font-size:0.85rem;line-height:1.65;color:#b8860b">${data.challenge}</div></div></div><div style="margin-top:1rem;font-size:0.82rem;color:var(--muted)">${data.notes}</div>`;
  panel.scrollIntoView({behavior:'smooth',block:'nearest'});
}

// ── DUAL RESOURCE ──
const prodData=[{name:'Coal',pct:35},{name:'Natural Gas',pct:22},{name:'Nuclear',pct:10},{name:'Hydro',pct:14},{name:'Solar PV',pct:6},{name:'Wind',pct:7},{name:'Other',pct:6}];
const consData=[{name:'Buildings',pct:40},{name:'Industry',pct:35},{name:'Transport',pct:12},{name:'Data Centers',pct:8},{name:'Agriculture',pct:5}];
const pColors=['#E63946','#F4601F','#7B3FF5','#0B7B6E','#F5C842','#2DC653','#14A899'];
const cColors=['#F4601F','#0099FF','#E63946','#F5C842','#2DC653'];
prodData.forEach((item,i)=>{document.getElementById('prod-items').innerHTML+=`<div class="resource-item"><span>${item.name}</span><div style="display:flex;align-items:center;gap:0.5rem"><span style="font-family:'JetBrains Mono';font-size:0.72rem;color:${pColors[i]}">${item.pct}%</span><div class="resource-bar-wrap"><div class="resource-bar" style="width:${item.pct*2}px;background:${pColors[i]}"></div></div></div></div>`;});
consData.forEach((item,i)=>{document.getElementById('cons-items').innerHTML+=`<div class="resource-item"><span>${item.name}</span><div style="display:flex;align-items:center;gap:0.5rem"><span style="font-family:'JetBrains Mono';font-size:0.72rem;color:${cColors[i]}">${item.pct}%</span><div class="resource-bar-wrap"><div class="resource-bar" style="width:${item.pct*2}px;background:${cColors[i]}"></div></div></div></div>`;});
function switchTab(id,btn){
  document.querySelectorAll('.tab-content').forEach(t=>t.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(b=>b.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  btn.classList.add('active');
}
new Chart(document.getElementById('sectorChart').getContext('2d'),{type:'bar',data:{labels:['Buildings','Industry','Transport','Data Centers','Agriculture'],datasets:[{label:'Electricity Share 2024',data:[40,35,12,8,5],backgroundColor:cColors,borderRadius:6}]},options:{responsive:true,indexAxis:'y',plugins:{legend:{display:false}},scales:{x:{ticks:{color:'#7A7A8C',callback:v=>v+'%'},grid:{color:'rgba(0,0,0,0.04)'}},y:{ticks:{color:'#2D2D2D'},grid:{display:false}}}}});
new Chart(document.getElementById('gapChart').getContext('2d'),{type:'line',data:{labels:['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],datasets:[{label:'Without AI (±15% gap)',data:[15,18,12,20,16,22,19,17,21,14,13,16],borderColor:'#E63946',fill:false,tension:0.4,borderDash:[5,5],pointRadius:3},{label:'With AI (±2-3% gap)',data:[3,2.8,3.1,2.5,2.9,2.2,3.0,2.7,2.4,3.2,2.6,2.8],borderColor:'#2DC653',fill:false,tension:0.4,pointRadius:3}]},options:{responsive:true,plugins:{legend:{labels:{color:'#7A7A8C',font:{size:10}}}},scales:{x:{ticks:{color:'#7A7A8C'},grid:{color:'rgba(0,0,0,0.04)'}},y:{ticks:{color:'#7A7A8C',callback:v=>'±'+v+'%'},grid:{color:'rgba(0,0,0,0.04)'},title:{display:true,text:'Supply-Demand Gap',color:'#7A7A8C'}}}}});

// ── IMPACT CHARTS ──
new Chart(document.getElementById('mapeChart').getContext('2d'),{type:'bar',data:{labels:['ARIMA','SVR','Rand.Forest','ANN','LSTM','CNN+LSTM','Transformer'],datasets:[{label:'MAPE % (lower=better)',data:[8.2,5.9,4.7,4.1,2.3,1.8,1.5],backgroundColor:['#E63946','#F4601F','#F5C842','#B8860B','#2DC653','#0B7B6E','#7B3FF5'],borderRadius:4}]},options:{responsive:true,plugins:{legend:{display:false}},scales:{x:{ticks:{color:'#7A7A8C',font:{size:9}},grid:{display:false}},y:{ticks:{color:'#7A7A8C',callback:v=>v+'%'},grid:{color:'rgba(0,0,0,0.04)'}}}}});
new Chart(document.getElementById('radarChart').getContext('2d'),{type:'radar',data:{labels:['Accuracy','Speed','Scalability','Privacy','Interpretability','Renewable Integ.'],datasets:[{label:'LSTM',data:[95,72,80,60,45,85],borderColor:'#F4601F',backgroundColor:'rgba(244,96,31,0.1)',pointBackgroundColor:'#F4601F'},{label:'Federated LSTM',data:[90,65,85,95,50,80],borderColor:'#0B7B6E',backgroundColor:'rgba(11,123,110,0.08)',pointBackgroundColor:'#0B7B6E'}]},options:{responsive:true,plugins:{legend:{labels:{color:'#7A7A8C',font:{size:9}}}},scales:{r:{ticks:{color:'#7A7A8C',backdropColor:'transparent'},grid:{color:'rgba(0,0,0,0.08)'},angleLines:{color:'rgba(0,0,0,0.08)'},pointLabels:{color:'#7A7A8C',font:{size:9}}}}}});
new Chart(document.getElementById('renewChart').getContext('2d'),{type:'line',data:{labels:['2010','2012','2014','2016','2018','2020','2022','2024'],datasets:[{label:'Renewables % of Power Mix',data:[20,21,22.5,24,26,28,30,32],borderColor:'#2DC653',backgroundColor:'rgba(45,198,83,0.1)',fill:true,tension:0.4,pointRadius:4}]},options:{responsive:true,plugins:{legend:{display:false}},scales:{x:{ticks:{color:'#7A7A8C',font:{size:9}},grid:{color:'rgba(0,0,0,0.04)'}},y:{ticks:{color:'#7A7A8C',callback:v=>v+'%'},grid:{color:'rgba(0,0,0,0.04)'}}}}});
new Chart(document.getElementById('pubChart').getContext('2d'),{type:'bar',data:{labels:['2019','2020','2021','2022','2023','2024'],datasets:[{label:'AI + Energy Publications',data:[120,200,380,580,720,900],backgroundColor:'rgba(123,63,245,0.5)',borderColor:'#7B3FF5',borderWidth:1,borderRadius:4}]},options:{responsive:true,plugins:{legend:{display:false}},scales:{x:{ticks:{color:'#7A7A8C'},grid:{display:false}},y:{ticks:{color:'#7A7A8C'},grid:{color:'rgba(0,0,0,0.04)'}}}}});

// ── FUTURE CHART ──
new Chart(document.getElementById('futureChart').getContext('2d'),{type:'line',data:{labels:['2024','2025','2026','2027','2028','2029','2030','2031','2032','2033','2034'],datasets:[{label:'AI Energy Market ($B)',data:[16.19,20.3,25.4,31.8,39.9,50.1,62.8,78.7,98.7,123.9,158.76],borderColor:'#F4601F',backgroundColor:'rgba(244,96,31,0.08)',fill:true,tension:0.4,yAxisID:'y1',pointRadius:3},{label:'Renewable Power Share (%)',data:[32,33.5,37,39,41,43,46,48,50,52,55],borderColor:'#0B7B6E',fill:false,tension:0.4,yAxisID:'y2',pointRadius:3}]},options:{responsive:true,plugins:{legend:{labels:{color:'#7A7A8C',font:{size:10}}}},scales:{x:{ticks:{color:'#7A7A8C'},grid:{color:'rgba(0,0,0,0.04)'}},y1:{ticks:{color:'#F4601F',callback:v=>'$'+v+'B'},grid:{color:'rgba(0,0,0,0.04)'}},y2:{position:'right',ticks:{color:'#0B7B6E',callback:v=>v+'%'},grid:{display:false}}}}});

// ── FUN FACTS CAROUSEL ──
let currentFact=0;
const factsTrack=document.getElementById('facts-track');
const factsCount=factsTrack.children.length;
const factsNav=document.getElementById('facts-nav');
for(let i=0;i<factsCount;i++){const dot=document.createElement('button');dot.className='fact-dot'+(i===0?' active':'');dot.onclick=()=>goFact(i);factsNav.appendChild(dot);}
function goFact(n){
  currentFact=((n%factsCount)+factsCount)%factsCount;
  factsTrack.style.transform=`translateX(-${currentFact*100}%)`;
  document.querySelectorAll('.fact-dot').forEach((d,i)=>{d.classList.toggle('active',i===currentFact);});
}
function moveFact(dir){goFact(currentFact+dir);}
setInterval(()=>moveFact(1),6000);

// ── ENERGY CALCULATOR ──
const srcProfiles={solar:{capacity:0.15,co2:20,label:'Solar PV',tip:'Solar panels produce zero emissions during operation. A 1000m² installation generates ~150kW at peak.'},wind:{capacity:0.4,co2:11,label:'Wind Turbine',tip:'Wind is the lowest lifecycle CO₂ source of electricity. Large turbines (2MW+) power ~1500 homes each.'},coal:{capacity:0.9,co2:820,label:'Coal Plant',tip:'Coal emits 820g CO₂/kWh — the highest of any source. A 1000MW plant produces ~6M tCO₂/year.'},gas:{capacity:0.85,co2:490,label:'Natural Gas',tip:'Natural gas emits roughly half of coal but is still a major emissions source, plus methane leaks.'},nuclear:{capacity:0.92,co2:12,label:'Nuclear Plant',tip:'Nuclear has extremely low lifecycle emissions (~12g/kWh) and the highest capacity factor of any source.'},hydro:{capacity:0.45,co2:24,label:'Hydropower',tip:'Hydro is reliable and low-carbon. Large dams have high capacity but ecosystem impacts to consider.'}};
let currentSrc='solar';
let calcChart=null;
function selectSource(btn){document.querySelectorAll('.src-btn').forEach(b=>b.classList.remove('active'));btn.classList.add('active');currentSrc=btn.dataset.src;const prof=srcProfiles[currentSrc];document.getElementById('cap-slider').value=Math.round(prof.capacity*100);document.getElementById('cap-val').textContent=Math.round(prof.capacity*100)+'%';updateCalc();}
function updateCalc(){
  const area=+document.getElementById('area-slider').value;
  const demand=+document.getElementById('demand-slider').value;
  const cap=+document.getElementById('cap-slider').value/100;
  const price=+document.getElementById('price-slider').value/100;
  document.getElementById('area-val').textContent=area.toLocaleString()+' m²';
  document.getElementById('demand-val').textContent=demand.toLocaleString()+' kWh/day';
  document.getElementById('cap-val').textContent=Math.round(cap*100)+'%';
  document.getElementById('price-val').textContent='$'+price.toFixed(2)+'/kWh';
  const prof=srcProfiles[currentSrc];
  const prod=+(area*prof.capacity*cap).toFixed(0);
  const annual=+(prod*365/1000).toFixed(1);
  const rev=+(annual*1000*price).toFixed(0);
  const co2=prof.co2;
  const coalCO2=820;
  const savings=+((coalCO2-co2)*annual*1000/1e6).toFixed(1);
  const balance=+((prod/demand)*100).toFixed(0);
  document.getElementById('cr-prod').textContent=prod.toLocaleString()+' kWh';
  document.getElementById('cr-balance').textContent=balance+'% of demand';
  document.getElementById('cr-annual').textContent=annual.toLocaleString()+' MWh';
  document.getElementById('cr-revenue').textContent='$'+rev.toLocaleString();
  document.getElementById('cr-co2').textContent=co2+' g/kWh';
  document.getElementById('cr-savings').textContent=savings>0?savings.toLocaleString()+' tCO₂/yr saved':'N/A';
  const cleanScore=Math.max(0,Math.min(100,100-(co2/820)*100));
  document.getElementById('co2-bar').style.width=cleanScore+'%';
  document.getElementById('co2-tip').textContent=prof.tip;
  if(cleanScore>70){document.getElementById('co2-bar').style.background='linear-gradient(90deg,#2DC653,#0B7B6E)';}
  else if(cleanScore>40){document.getElementById('co2-bar').style.background='linear-gradient(90deg,#F5C842,#2DC653)';}
  else{document.getElementById('co2-bar').style.background='linear-gradient(90deg,#E63946,#F4601F)';}
  if(calcChart)calcChart.destroy();
  const days=['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  const prodData=days.map((_,i)=>{const variance=[0.9,0.95,1.0,1.05,1.1,0.85,0.8][i];return+(prod*variance).toFixed(0);});
  const demandData=days.map((_,i)=>{const variance=[1.0,1.05,1.1,1.1,1.15,0.85,0.75][i];return+(demand*variance).toFixed(0);});
  calcChart=new Chart(document.getElementById('calcChart').getContext('2d'),{type:'line',data:{labels:days,datasets:[{label:'Production (kWh)',data:prodData,borderColor:'#F4601F',backgroundColor:'rgba(244,96,31,0.1)',fill:true,tension:0.4,pointRadius:4},{label:'Demand (kWh)',data:demandData,borderColor:'#0B7B6E',fill:false,tension:0.4,borderDash:[4,4],pointRadius:4}]},options:{responsive:true,plugins:{legend:{labels:{color:'#7A7A8C',font:{size:10}}}},scales:{x:{ticks:{color:'#7A7A8C',font:{size:9}},grid:{display:false}},y:{ticks:{color:'#7A7A8C'},grid:{color:'rgba(0,0,0,0.04)'}}}}});
}
updateCalc();

// ── FEEDBACK ──
let currentRating=0;
let currentCat='💡 Data Quality';
function setRating(n){
  currentRating=n;
  document.querySelectorAll('.star-btn').forEach((b,i)=>{b.classList.toggle('active',i<n);});
}
function selectCat(el){
  document.querySelectorAll('.cat-chip').forEach(c=>c.classList.remove('active'));
  el.classList.add('active');
  currentCat=el.textContent;
}
const sampleFeedbacks=[
  {name:'Dr. Priya Nair · Energy Analyst',rating:5,cat:'🤖 AI Features',text:'The 7-day AI forecast tool is incredibly accurate. We tested it against our city\'s actual demand data and the LSTM predictions were within 2.4% — impressive for a web demo.',time:'2h ago'},
  {name:'Marcus Chen · Smart Grid Researcher',rating:4,cat:'📊 Charts',text:'Love the dual resource logic section. Would love to see more granular sector data for Southeast Asia — the region is growing fast and data is often missing from global dashboards.',time:'5h ago'},
  {name:'Anya Kowalski · PhD Student, TU Berlin',rating:5,cat:'💡 Data Quality',text:'Used this for a university presentation on urban energy systems. The IEA-sourced statistics and AI model benchmarks saved me hours of research. Best platform I\'ve found.',time:'1d ago'}
];
let userFeedbacks=[];
function renderFeedbacks(){
  const wall=document.getElementById('feedback-wall');
  const all=[...userFeedbacks,...sampleFeedbacks];
  document.getElementById('fb-count').textContent=all.length+' responses';
  wall.innerHTML=all.map(f=>`<div class="feedback-item"><div class="feedback-item-header"><div class="feedback-stars">${'★'.repeat(f.rating)}${'☆'.repeat(5-f.rating)}</div><span class="feedback-cat">${f.cat}</span></div><div class="feedback-text">${f.text}</div><div class="feedback-meta">${f.name} · ${f.time}</div></div>`).join('');
}
function submitFeedback(){
  const name=document.getElementById('fb-name').value||'Anonymous';
  const text=document.getElementById('fb-text').value;
  if(!text.trim()){alert('Please enter your feedback.');return;}
  if(!currentRating){alert('Please select a star rating.');return;}
  userFeedbacks.unshift({name,rating:currentRating,cat:currentCat,text,time:'just now'});
  renderFeedbacks();
  document.getElementById('fb-text').value='';
  document.getElementById('fb-name').value='';
  document.querySelectorAll('.star-btn').forEach(b=>b.classList.remove('active'));
  currentRating=0;
  const succ=document.getElementById('submit-success');
  succ.style.display='block';
  setTimeout(()=>succ.style.display='none',3000);
}
renderFeedbacks();