function normPlayerName(value){return String(value||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]/gi,"").toLowerCase();}
function applyRosterAudit(club,players){
 const audit=ROSTER_AUDIT[club]; if(!audit)return players;
 const byName=new Map(players.map(p=>[normPlayerName(p.name),p]));
 for(const [name,pos] of Object.entries(audit.positions||{})){const player=byName.get(normPlayerName(name));if(player)player.pos=pos;}
 for(const item of audit.additions||[]){const [pos,name,age,ovr]=item;const key=normPlayerName(name);if(!byName.has(key)){const player={id:`${club}::${key}`,pos,name,age,ovr};players.push(player);byName.set(key,player);}}
 return players;
}
function generatedSquadName(club,index,hash,used=new Set()){
 const first=["Adnan","Ajdin","Alen","Amar","Anel","Armin","Benjamin","Dario","Edin","Eldin","Emir","Enes","Faruk","Haris","Ibrahim","Ivan","Jasmin","Josip","Kerim","Luka","Mahir","Marko","Matej","Mirza","Nermin","Nikola","Ognjen","Petar","Rijad","Samir","Tarik","Vedad","Vedran","Zlatan"];
 const last=["Alić","Babić","Begić","Božić","Čaušević","Delić","Hadžić","Halilović","Hasanović","Hodžić","Ibrahimović","Jovanović","Kadić","Kovačević","Križanac","Lazić","Marković","Mehić","Milić","Mujkić","Nikolić","Osmanović","Pavlović","Petrović","Popović","Ramić","Smajić","Stanić","Tadić","Tomić","Vasiljević","Vuković","Zec","Živković","Barišić","Ćosić","Đurić","Filipović","Grgić","Knežević","Lukić","Matić","Musić","Ristić","Šarić","Šehić","Šimić","Štulić","Turić","Vučić"];
 const total=first.length*last.length,base=(hash+index*7919)%total;
 for(let n=0;n<total;n++){const slot=(base+n)%total,name=`${first[Math.floor(slot/last.length)]} ${last[slot%last.length]}`;if(!used.has(name))return name;}
 return `Generated player ${index+1}`;
}
function playersFor(club){
 let players=[];
 if(seedPlayers[club]) players=seedPlayers[club].map((x,i)=>({id:i,pos:x[0],name:x[1],age:x[2],ovr:x[3],rosterSource:"seeded"}));
 else {
  const real=REAL_PRVA_SQUADS[club];
  if(real)players=real.map((x,i)=>({id:i,pos:x[0],name:x[1],age:19+((i*3)%17),ovr:54+((i*7)%13),rosterSource:REAL_SQUAD_SOURCES[club]?"public-roster":"seeded",sourceUrl:REAL_SQUAD_SOURCES[club]||null}));
  else {
   const roles=["GK","DEF","DEF","DEF","DEF","MID","MID","MID","MID","ATT","ATT","GK","DEF","DEF","MID","MID","ATT","ATT"];
   const sourced=SOURCED_LOWER_SQUADS[club]||[];
   const rosterSize=Math.max(18,sourced.length);
   const hash=[...club].reduce((sum,ch)=>(sum*31+ch.charCodeAt(0))>>>0,7);
   const usedNames=new Set(sourced);
   // Source-backed matchday names lead the squad; generated depth fills gaps.
   // Clubs without any source names still receive a distinct, stable roster.
   players=Array.from({length:rosterSize},(_,i)=>{const name=sourced[i]||generatedSquadName(club,i,hash,usedNames);usedNames.add(name);return {id:i,pos:roles[i%roles.length],name,age:19+((hash+i*7)%17),ovr:48+((hash+i*11)%13),rosterSource:sourced[i]?(SOURCED_LOWER_SQUAD_TYPES[club]||"match-sheet"):"generated",sourceUrl:sourced[i]?SOURCED_LOWER_SQUAD_SOURCES[club]||null:null};});
  }
 }
 return applyRosterAudit(club,players);
}

const formations={
"4-3-3":[["GK",50,88],["LB",20,72],["CB",40,78],["CB",60,78],["RB",80,72],["CM",32,52],["CM",50,47],["CM",68,52],["LW",20,27],["ST",50,18],["RW",80,27]],
"4-4-2":[["GK",50,88],["LB",20,72],["CB",40,78],["CB",60,78],["RB",80,72],["LM",18,48],["CM",40,50],["CM",60,50],["RM",82,48],["ST",40,25],["ST",60,25]],
"3-5-2":[["GK",50,88],["CB",30,73],["CB",50,77],["CB",70,73],["LWB",12,53],["CM",32,48],["CM",50,43],["CM",68,48],["RWB",88,53],["ST",40,24],["ST",60,24]],
"4-2-3-1":[["GK",50,88],["LB",20,72],["CB",40,78],["CB",60,78],["RB",80,72],["DM",38,57],["DM",62,57],["LW",20,38],["AM",50,38],["RW",80,38],["ST",50,18]],
"4-1-4-1":[["GK",50,88],["LB",20,72],["CB",40,78],["CB",60,78],["RB",80,72],["DM",50,59],["LM",18,45],["CM",39,49],["CM",61,49],["RM",82,45],["ST",50,20]],
"4-3-1-2":[["GK",50,88],["LB",20,72],["CB",40,78],["CB",60,78],["RB",80,72],["CM",32,53],["CM",50,48],["CM",68,53],["AM",50,34],["ST",40,20],["ST",60,20]],
"3-4-3":[["GK",50,88],["CB",30,73],["CB",50,77],["CB",70,73],["LM",16,51],["CM",40,50],["CM",60,50],["RM",84,51],["LW",20,27],["ST",50,18],["RW",80,27]],
"5-3-2":[["GK",50,88],["LWB",12,70],["CB",32,76],["CB",50,80],["CB",68,76],["RWB",88,70],["CM",32,48],["CM",50,43],["CM",68,48],["ST",40,22],["ST",60,22]],
"5-4-1":[["GK",50,88],["LWB",12,70],["CB",32,76],["CB",50,80],["CB",68,76],["RWB",88,70],["LM",18,48],["CM",40,52],["CM",60,52],["RM",82,48],["ST",50,20]]
};
const TEAM_RATING={"FK Sarajevo":72,"FK Željezničar":71,"FK Borac Banja Luka":74,"HŠK Zrinjski Mostar":75,"FK Velež Mostar":68,"NK Široki Brijeg":67,"FK Sloga Doboj":62,"FK Radnik Bijeljina":59,"NK Čelik Zenica":58,"BSK Banja Luka":56};
const DEFAULT_RATING=56;
const SAVE_KEY="bhfm";
const SAVE_BACKUP_KEY="bhfm_backup";
const SAVE_VERSION=9;
const DEFAULT_STATE={club:"FK Sarajevo",league:"Premijer Liga BiH",rep:50,balance:500000,points:0,played:0,wins:0,draws:0,losses:0,lossStreak:0,managerFired:false,formation:"4-3-3",mentality:"Balanced",players:[],xi:[],tab:"Home",season:2026,matchday:0,fixtures:[],table:{},results:[],jobBoard:[],jobBoardMD:-1,jobOffers:[],repHistory:[],transferTick:0,summerTick:0,transferPool:[],transfersDone:[],transferOffers:[],aiBudgets:{},cup:null,playerStats:{},seasonHistory:[],achievements:[],seasonReport:null,clubSquads:{},competitionStates:{},leagueMembership:null,promotionHistory:[],transferSort:"position",statsCompetition:"league",lastMatch:null,pendingMatch:null,jobNotice:"",celebration:null,saveVersion:SAVE_VERSION};
function isObject(value){return !!value&&typeof value==="object"&&!Array.isArray(value)}
function normalizeSavedState(raw){
 if(!isObject(raw))return null;
 if(!("club" in raw)&&!("season" in raw)&&!("players" in raw))return null;
 const oldVersion=Number(raw.saveVersion)||0;
 const merged={...JSON.parse(JSON.stringify(DEFAULT_STATE)),...raw};
 const arrayKeys=["players","xi","fixtures","results","jobBoard","jobOffers","repHistory","transferPool","transfersDone","transferOffers","seasonHistory"];
 for(const key of arrayKeys)if(!Array.isArray(merged[key]))merged[key]=[];
 if(!Array.isArray(merged.promotionHistory))merged.promotionHistory=[];
 if(!Array.isArray(merged.achievements))merged.achievements=[];
 const objectKeys=["table","playerStats","clubSquads","competitionStates","aiBudgets"];
 for(const key of objectKeys)if(!isObject(merged[key]))merged[key]={};
 Object.entries(clubNameAliases).forEach(([oldName,newName])=>{
  if(merged.club===oldName)merged.club=newName;
  if(merged.clubSquads[oldName]&&!merged.clubSquads[newName])merged.clubSquads[newName]=merged.clubSquads[oldName];
  delete merged.clubSquads[oldName];
  merged.jobBoard=merged.jobBoard.map(j=>Array.isArray(j)&&j[0]===oldName?[newName,j[1]]:j);
  merged.jobOffers=merged.jobOffers.map(o=>o&&o.club===oldName?{...o,club:newName}:o);
 });
 if(!Number.isFinite(Number(merged.season))||Number(merged.season)<2026)merged.season=2026;
 merged.season=Math.floor(Number(merged.season));
 if(!Number.isFinite(Number(merged.matchday))||Number(merged.matchday)<0)merged.matchday=0;
 merged.matchday=Math.floor(Number(merged.matchday));
 for(const key of ["rep","balance","points","played","wins","draws","losses","lossStreak","transferTick","summerTick"])if(!Number.isFinite(Number(merged[key])))merged[key]=DEFAULT_STATE[key];
 if(typeof merged.managerFired!=="boolean")merged.managerFired=false;
 if(typeof merged.club!=="string"||!merged.club)merged.club=DEFAULT_STATE.club;
 if(typeof merged.league!=="string"||!leagues[merged.league])merged.league=Object.keys(leagues).find(l=>leagues[l].includes(merged.club))||DEFAULT_STATE.league;
 if(!formations[merged.formation])merged.formation=DEFAULT_STATE.formation;
 if(typeof merged.mentality!=="string")merged.mentality=DEFAULT_STATE.mentality;
 if(typeof merged.tab!=="string")merged.tab=DEFAULT_STATE.tab;
 if(merged.tab==="Celebration")merged.tab="Home";
 if(!["league","cup","all"].includes(merged.statsCompetition))merged.statsCompetition="league";
 if(!isObject(merged.seasonReport)&&merged.seasonReport!==null)merged.seasonReport=null;
 if(!isObject(merged.pendingMatch))merged.pendingMatch=null;
 if(!isObject(merged.celebration))merged.celebration=null;
 // The previous save schema persisted placeholder divisions as league members.
 // Drop that cache and stale round snapshots when switching to sourced 2026/27 lists.
 if(oldVersion<SAVE_VERSION){
  merged.leagueMembership=null; merged.competitionStates={}; merged.matchday=0;
  merged.fixtures=[]; merged.results=[]; merged.table={};
  merged.points=0; merged.played=0; merged.wins=0; merged.draws=0; merged.losses=0;
  merged.league=Object.keys(leagues).find(name=>leagues[name].includes(merged.club))||DEFAULT_STATE.league;
 }
 merged.saveVersion=SAVE_VERSION;
 return merged;
}
function readSave(key){
 try{const raw=localStorage.getItem(key);if(!raw)return null;return normalizeSavedState(JSON.parse(raw));}catch(e){return null;}
}
function loadInitialState(){
 try{
  const primary=readSave(SAVE_KEY);
  if(primary)return primary;
  const backup=readSave(SAVE_BACKUP_KEY);
  if(backup){window.__bhfmSaveRecovered=true;return backup;}
 }catch(e){}
 return JSON.parse(JSON.stringify(DEFAULT_STATE));
}
let state=loadInitialState();
let matchPlaybackTimer=null;
function applyLeagueMembership(){
 if(state.leagueMembership&&typeof state.leagueMembership==="object"){
  Object.entries(state.leagueMembership).forEach(([name,clubs])=>{if(leagues[name]&&Array.isArray(clubs))leagues[name]=clubs.slice();});
 }
}
function persistLeagueMembership(){state.leagueMembership=Object.fromEntries(Object.entries(leagues).map(([k,v])=>[k,v.slice()]));}
applyLeagueMembership();

function clonePlayer(p){return {...p};}
function seedSquadForClub(club){return playersFor(club).map((p,i)=>({...p,id:`${club}::${i}`}));}
function copiedRosterFrom(source,squad){
 if(!Array.isArray(source)||!Array.isArray(squad)||source.length<12||squad.length<source.length)return false;
 const names=new Set(source.map(p=>p.name));
 const matches=squad.filter(p=>names.has(p.name)).length;
 return matches>=Math.max(12,Math.ceil(names.size*.75));
}
function matchesOtherClubSquad(club,squad){
 return Object.entries(state.clubSquads||{}).some(([other,source])=>other!==club&&Array.isArray(source)&&((source.length===squad.length&&squad.every((p,i)=>p.name===source[i]?.name))||copiedRosterFrom(source,squad)));
}
function ensureClubSquads(){
 if(!state.clubSquads||typeof state.clubSquads!=="object")state.clubSquads={};
 const all=[...new Set(Object.values(leagues).flat())].filter(c=>c&&!String(c).startsWith("TBD")&&!String(c).includes("regional"));
 let repairedCurrentSquad=false;
 all.forEach(c=>{
  const squad=state.clubSquads[c];
  if(!Array.isArray(squad)||!squad.length){state.clubSquads[c]=seedSquadForClub(c);return;}
  // Repair saves affected by the old empty-squad fallback: a lower-division
  // club could contain an entire other club's roster, identifiable by its IDs.
  const originIds=squad.map(p=>String(p.id||"").match(/^(.*?)::/u)?.[1]).filter(Boolean);
  const foreign=originIds.filter(origin=>origin!==c);
  if(foreign.length===squad.length&&new Set(foreign).size===1&&state.clubSquads[foreign[0]]?.length){
   const sourceIds=new Set(state.clubSquads[foreign[0]].map(p=>String(p.id)));
   if(squad.every(p=>sourceIds.has(String(p.id)))||copiedRosterFrom(state.clubSquads[foreign[0]],squad)){state.clubSquads[c]=seedSquadForClub(c);if(c===state.club)repairedCurrentSquad=true;}
  }
  if(matchesOtherClubSquad(c,squad)){state.clubSquads[c]=seedSquadForClub(c);if(c===state.club)repairedCurrentSquad=true;}
  if(squad.every(p=>String(p.name||"").startsWith(`${c} Player `))){state.clubSquads[c]=seedSquadForClub(c);if(c===state.club)repairedCurrentSquad=true;}
 });
 if(repairedCurrentSquad)state.players=(state.clubSquads[state.club]||[]).map(clonePlayer);
 if(Array.isArray(state.players)&&state.players.length&&matchesOtherClubSquad(state.club,state.players))state.players=(state.clubSquads[state.club]||[]).map(clonePlayer);
 if(Array.isArray(state.players)&&state.players.length&&state.players.every(p=>String(p.name||"").startsWith(`${state.club} Player `)))state.players=(state.clubSquads[state.club]||[]).map(clonePlayer);
 if(Array.isArray(state.players)&&state.players.length){
   const existing=state.clubSquads[state.club];
   if(!existing||!existing.length)state.clubSquads[state.club]=state.players.map((p,i)=>({...p,id:p.id??`${state.club}::${i}`}));
 }
 // Targeted roster migration: add Ante Hrkać to Velež saves created before his seed entry existed.
 const velez=state.clubSquads["FK Velež Mostar"];
 if(Array.isArray(velez)&&!velez.some(p=>String(p.name||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase()==="ante hrkac")){
   velez.push({id:"FK Velež Mostar::ante-hrkac",pos:"MID",name:"Ante Hrkać",age:34,ovr:68});
 }
 if(state.club==="FK Velež Mostar"&&Array.isArray(state.players)&&!state.players.some(p=>String(p.name||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase()==="ante hrkac")){
   state.players.push({id:"FK Velež Mostar::ante-hrkac",pos:"MID",name:"Ante Hrkać",age:34,ovr:68});
 }
 // Apply verified broad-position corrections and missing-player additions to existing saves too.
 Object.entries(state.clubSquads).forEach(([club,squad])=>{if(Array.isArray(squad))state.clubSquads[club]=applyRosterAudit(club,squad);});
 if(Array.isArray(state.players))state.players=applyRosterAudit(state.club,state.players);
}

function upgradeRealSquadsV012(){
 Object.keys(REAL_PRVA_SQUADS).forEach(club=>{
  const real=REAL_PRVA_SQUADS[club]; const cur=state.clubSquads[club]; if(!Array.isArray(cur)||!cur.length)return;
  const own=cur.filter(p=>String(p.id||"").startsWith(club+"::"));
  const transferred=cur.filter(p=>!String(p.id||"").startsWith(club+"::"));
  // Older saves may contain a whole foreign club roster copied into this club.
  // Drop it during the sourced-roster upgrade instead of treating it as transfers.
  const origins=new Set(transferred.map(p=>String(p.id||"").match(/^(.*?)::/)?.[1]).filter(Boolean));
  const origin=origins.size===1?[...origins][0]:null;
  const sourceSquad=origin&&state.clubSquads[origin];
  const copiedRoster=own.length===0&&((!!sourceSquad&&((transferred.length===sourceSquad.length&&
   transferred.every(p=>sourceSquad.some(s=>String(s.id)===String(p.id))))||copiedRosterFrom(sourceSquad,transferred)))||matchesOtherClubSquad(club,cur));
  const realNames=new Set(real.map(x=>x[1]));
  const alreadyReal=own.filter(p=>realNames.has(p.name));
  if(alreadyReal.length<Math.max(1,Math.min(own.length,3)) || own.length<=11){
    const base=playersFor(club).map((p,i)=>({...p,id:`${club}::${i}`}));
    const byName=new Set(base.map(p=>p.name));
    state.clubSquads[club]=base.concat((copiedRoster?[]:transferred).filter(p=>!byName.has(p.name)));
  }
 });
}
function syncCurrentClub(){ensureClubSquads();state.clubSquads[state.club]=(state.players||[]).map(p=>clonePlayer(p));}
try{upgradeRealSquadsV012();}catch(e){}
function loadClubSquad(club){ensureClubSquads();state.players=(state.clubSquads[club]||[]).map(p=>clonePlayer(p));normalizeXI();initPlayerStats();}
function squadById(club,id){ensureClubSquads();return (state.clubSquads[club]||[]).find(p=>String(p.id)===String(id));}
function squadRating(){
 const ps=state.players||[]; if(!ps.length)return 0;
 const sorted=[...ps].sort((a,b)=>b.ovr-a.ovr); const top=sorted.slice(0,11);
 const topAvg=top.reduce((a,p)=>a+p.ovr,0)/top.length;
 const depth=sorted.slice(11).reduce((a,p)=>a+p.ovr,0)/(Math.max(1,sorted.length-11));
 return Math.round(topAvg*0.82 + (sorted.length>11?depth*0.18:0));
}
function squadSourceNote(){
 const counts={};(state.players||[]).forEach(p=>{const label=p.rosterSource||"existing save";counts[label]=(counts[label]||0)+1;});
 const labels={"public-roster":"public-roster names","match-sheet":"match-sheet names",generated:"generated depth",seeded:"seeded roster names","existing save":"saved squad players"};
 const urls=[...new Set((state.players||[]).map(p=>p.sourceUrl).filter(Boolean))];
 const summary=Object.entries(counts).map(([k,n])=>`${n} ${labels[k]||k}`).join(" · ");
 return `<div class="sub">${summary}${urls.length?` · ${urls.map((url,i)=>`<a href="${url}" target="_blank" rel="noopener">Source ${i+1}</a>`).join(" · ")}`:""}</div>`;
}
function teamRating(club){if(club===state.club)return squadRating()||TEAM_RATING[club]||DEFAULT_RATING;ensureClubSquads();const ps=state.clubSquads[club]||[];if(ps.length)return Math.round(ps.reduce((a,p)=>a+p.ovr,0)/ps.length)||DEFAULT_RATING;return TEAM_RATING[club]||DEFAULT_RATING}
function historicalGoalFactors(club){
 const seasons=HISTORICAL_LEAGUE_GOALS?.[state.league]||[];let attackLog=0,defenseLog=0,weightTotal=0;
 seasons.forEach((season,i)=>{const goals=season.clubs[club];if(!goals)return;const avg=Object.values(season.clubs).reduce((n,g)=>n+g[0],0)/Object.values(season.clubs).length/season.played;const against=Object.values(season.clubs).reduce((n,g)=>n+g[1],0)/Object.values(season.clubs).length/season.played;const w=i===0?.68:.32;attackLog+=w*Math.log(Math.max(.45,goals[0]/season.played/avg));defenseLog+=w*Math.log(Math.max(.45,goals[1]/season.played/against));weightTotal+=w;});
 return weightTotal?{attack:Math.exp(attackLog/weightTotal),concede:Math.exp(defenseLog/weightTotal)}:{attack:1,concede:1};
}
function recentFormFactor(club){
 const rounds=state.results||[],form=[];for(let i=rounds.length-1;i>=0&&form.length<5;i--){const r=rounds[i]?.find(x=>x.home===club||x.away===club);if(!r)continue;const h=r.home===club?r.hg:r.ag,a=r.home===club?r.ag:r.hg;form.push(h>a?3:h===a?1:0);}
 if(form.length<3)return 1;const ppg=form.reduce((a,x)=>a+x,0)/form.length;return Math.max(.92,Math.min(1.08,1+(ppg-1.35)*.045));
}
function teamGoalStrength(club){
 const h=historicalGoalFactors(club),rating=Math.max(45,Math.min(85,teamRating(club)||DEFAULT_RATING));
 // Squad strength anchors historical performance; short historical samples are shrunk toward neutral.
 const prior=Math.exp((rating-65)*.022);return{attack:Math.max(.62,Math.min(1.65,Math.sqrt(h.attack)*Math.sqrt(prior)*recentFormFactor(club))),concede:Math.max(.62,Math.min(1.65,Math.sqrt(h.concede)/Math.sqrt(prior)/recentFormFactor(club)))};
}
function expectedGoalsForFixture(home,away,referee=assignReferee()){
 const h=teamGoalStrength(home),a=teamGoalStrength(away),rates=refereeGoalRates(referee);
 return{home:Math.max(.18,Math.min(3.4,1.28*h.attack*a.concede*1.07*Math.exp(rates.home))),away:Math.max(.16,Math.min(3.2,1.02*a.attack*h.concede*Math.exp(rates.away)))};
}
function tacticGoalMultiplier(tactic){return tactic==="Attacking"?1.12:tactic==="Defensive"?.92:tactic==="Ultra Defensive"?.84:tactic==="Counter-Attack"?1.055:tactic==="Tiki-Taka"?1.04:1}
function playableClubsForLeague(name){return (leagues[name]||[]).filter(c=>c&&!String(c).startsWith("TBD")&&!String(c).includes("regional"));}
function leagueClubs(){return playableClubsForLeague(state.league)}
function meetingsForLeague(name=state.league){return name==="Premijer Liga BiH"?4:2}
function seasonMatchdays(){return Math.max(0,(leagueClubs().length-1)*meetingsForLeague())}
function leagueRoundCount(name){const clubs=playableClubsForLeague(name);return clubs.length<2?0:(clubs.length-1)*meetingsForLeague(name)}
function createCompetitionSnapshot(name){
 const clubs=playableClubsForLeague(name);
 return {season:state.season,matchday:0,fixtures:generateFixturesForLeague(clubs,name),table:makeTableForClubs(clubs),results:[],lastMatch:null};
}
function ensureCompetitionSnapshot(name){
 state.competitionStates=state.competitionStates||{};
 const clubs=playableClubsForLeague(name), expected=clubs.length<2?0:generateFixturesForLeague(clubs,name).length;
 let snap=state.competitionStates[name];
 if(clubs.length<2)return null;
 if(!snap||snap.season!==state.season||!Array.isArray(snap.fixtures)||snap.fixtures.length!==expected||!snap.table||Object.keys(snap.table).length!==clubs.length){
  // Preserve a legacy active-season snapshot when it is structurally valid; otherwise start a clean snapshot for this league only.
  snap=createCompetitionSnapshot(name);
  state.competitionStates[name]=snap;
 }
 const total=leagueRoundCount(name);
 snap.matchday=Math.max(0,Math.min(Number(snap.matchday)||0,total));
 if(!Array.isArray(snap.results))snap.results=[];
 return snap;
}
function advanceOtherLeaguesOneRound(activeLeague){
 Object.keys(leagues).forEach(name=>{
  if(name===activeLeague)return;
  const clubs=playableClubsForLeague(name);if(clubs.length<2)return;
  const snap=ensureCompetitionSnapshot(name);if(!snap)return;
  const total=leagueRoundCount(name);if(snap.matchday>=total)return;
  const perRound=clubs.length/2;
  const round=snap.fixtures.slice(snap.matchday*perRound,(snap.matchday+1)*perRound);
  if(!round.length)return;
  const results=round.map(simulateFixture);
  results.forEach(r=>applyResultToTable(snap.table,r));
  snap.results.push(results);snap.matchday++;
 });
}
function makeTableForClubs(clubs){const t={};clubs.forEach(c=>t[c]={club:c,p:0,w:0,d:0,l:0,gf:0,ga:0,pts:0});return t}
function makeTable(){return makeTableForClubs(leagueClubs())}
function generateFixturesForLeague(clubs,name){
 let arr=[...clubs],n=arr.length,rounds=[]; if(n<2||n%2!==0)return [];
 for(let r=0;r<n-1;r++){let games=[];for(let i=0;i<n/2;i++){let a=arr[i],b=arr[n-1-i];games.push(r%2===0?{home:a,away:b}:{home:b,away:a})}rounds.push(games);arr=[arr[0],arr[n-1],...arr.slice(1,n-1)]}
 const reverse=rounds.map(g=>g.map(x=>({home:x.away,away:x.home})));
 const sets=meetingsForLeague(name);let out=[...rounds,...reverse];if(sets===4)out=[...out,...rounds,...reverse];return out.flat();
}
function generateFixtures(clubs){return generateFixturesForLeague(clubs,state.league)}
const JOB_POOL=[
 ["FK Sarajevo",72],["FK Željezničar",71],["FK Borac Banja Luka",70],["HŠK Zrinjski Mostar",72],["FK Velež Mostar",62],["NK Široki Brijeg",60],["FK Sloga Doboj",55],["FK Radnik Bijeljina",52],["NK Čelik Zenica",50],["BSK Banja Luka",48],
 ["NK Bratstvo Gračanica",48],["FK Igman Konjic",47],["HNK Čapljina",42],["FK Rudar Kakanj",42],["NK Vitez",40],["HNK Tomislav",43],["FK Budućnost Banovići",40],["NK TOŠK Tešanj",44],["NK Zvijezda Gradačac",45],["FK Radnik Hadžići",42],["NK GOŠK Gabela",48],["FK Sloboda Tuzla",50],["NK Travnik",42],["NK Jedinstvo Bihać",40],["NK Stupčanica Olovo",46],["HŠK Posušje",52]
];
function allJobTargets(){
 const byClub=new Map(JOB_POOL.map(([club,rep])=>[club,rep]));
 Object.entries(leagues).forEach(([name,clubs])=>clubs.forEach(club=>{
  if(byClub.has(club))return;
  const minimum=name==="Premijer Liga BiH"?48:name==="Prva liga FBiH"||name==="Prva liga RS"?36:25;
  const hash=[...club].reduce((sum,ch)=>(sum*31+ch.charCodeAt(0))>>>0,7);
  byClub.set(club,minimum+(hash%9));
 }));
 return [...byClub].map(([club,rep])=>[club,rep]);
}
function canApplyToJob(job){return state.rep>=job[1]||(state.managerFired&&job[1]<=Math.max(25,state.rep+10))}
function shuffle(a){return [...a].sort(()=>Math.random()-.5)}
function refreshJobBoard(force=false){
 const eligible=allJobTargets().filter(j=>j[0]!==state.club&&Object.keys(leagues).some(name=>playableClubsForLeague(name).includes(j[0])));
 const boardIsValid=Array.isArray(state.jobBoard)&&state.jobBoard.length>0&&state.jobBoard.every(j=>eligible.some(e=>e[0]===j[0]));
 if(force||!boardIsValid||!Array.isArray(state.jobBoard)||state.jobBoardMD!==state.matchday){
  const shuffled=shuffle(eligible);
  const accessible=shuffled.filter(canApplyToJob).slice(0,3);
  const locked=shuffled.filter(j=>j[1]>state.rep).slice(0,3);
  let board=[...accessible,...locked];
  if(board.length<6) board=[...board,...shuffled.filter(j=>!board.some(x=>x[0]===j[0])).slice(0,6-board.length)];
  state.jobBoard=board.slice(0,6);state.jobBoardMD=state.matchday;
 }
}
function transferStatus(){
 const total=seasonMatchdays();
 if(state.matchday>=total) return state.summerTick<10?{type:"summer",remaining:10-state.summerTick,label:`Summer transfer market • ${state.summerTick}/10 ticks used`}:{type:"closed",remaining:0,label:"Summer transfer market closed"};
 const midStart=Math.max(1,Math.floor(total/2)-1),midEnd=midStart+3;
 if(state.matchday>=midStart&&state.matchday<=midEnd) return {type:"mid",remaining:midEnd-state.matchday+1,label:`Mid-season transfer window • ${midEnd-state.matchday+1} matchday ticks remaining`};
 return {type:"closed",remaining:0,label:`Transfer window closed • Mid-season opens at matchday ${midStart}`};
}
function generateTransferPool(){
 ensureClubSquads();
 const all=[];Object.entries(state.clubSquads).forEach(([club,players])=>players.forEach(p=>all.push({id:p.id,club,pos:p.pos,name:p.name,age:p.age,ovr:p.ovr,fee:Math.max(15000,Math.round((p.ovr-45)*(p.ovr-45)*900)),wage:Math.max(400,Math.round((p.ovr-45)*45))})));
 const candidates=all.filter(p=>p.club!==state.club&&p.ovr>=Math.max(55,teamRating(state.club)-6));
 return shuffle(candidates).slice(0,24);
}

function ensureTransferPool(){if(!Array.isArray(state.transferPool)||!state.transferPool.length)state.transferPool=generateTransferPool()}
function initialAIBudget(club){
 const league=Object.keys(leagues).find(name=>playableClubsForLeague(name).includes(club));
 return league==="Premijer Liga BiH"?1200000:league==="Prva liga FBiH"||league==="Prva liga RS"?400000:100000;
}
function ensureAIBudgets(){
 if(!isObject(state.aiBudgets))state.aiBudgets={};
 Object.values(leagues).flat().forEach(club=>{if(!Number.isFinite(Number(state.aiBudgets[club])))state.aiBudgets[club]=initialAIBudget(club)});
}
function playerPositionCount(squad,pos){return squad.filter(p=>p.pos===pos).length}
function maybeGenerateAITransferOffer(windowType){
 state.transferOffers=Array.isArray(state.transferOffers)?state.transferOffers:[];
 if(state.transferOffers.filter(o=>o.season===state.season).length>=3||Math.random()>.3)return null;
 const pendingIds=new Set(state.transferOffers.map(o=>String(o.playerId)));
 const available=state.players.filter(p=>!state.xi.includes(p.id)&&!pendingIds.has(String(p.id)));
 const candidates=[];
 available.forEach(player=>{
  const fee=Math.max(5000,Math.round(playerValue(player)*(.8+Math.random()*.5)));
  Object.entries(state.clubSquads).forEach(([buyer,squad])=>{
   if(buyer===state.club||!Array.isArray(squad)||squad.length>=27||Number(state.aiBudgets[buyer]||0)<fee)return;
   if(playerPositionCount(squad,player.pos)>=2)return;
   candidates.push({player,buyer,fee});
  });
 });
 if(!candidates.length)return null;
 const offer=candidates[Math.floor(Math.random()*candidates.length)];
 const item={playerId:offer.player.id,playerName:offer.player.name,from:state.club,to:offer.buyer,fee:offer.fee,season:state.season,window:windowType,createdMatchday:state.matchday};
 state.transferOffers.push(item);return item;
}
function isAITransferOfferActive(offer){
 const createdMatchday=Number(offer?.createdMatchday);
 if(!offer||offer.season!==state.season||offer.from!==state.club||!Number.isFinite(createdMatchday)||state.matchday>createdMatchday)return false;
 const current=transferStatus();
 if(current.type===offer.window)return true;
 // The final mid-season tick advances the matchday past the window before
 // the manager gets a chance to review offers generated during that tick.
 const midEnd=Math.max(1,Math.floor(seasonMatchdays()/2)-1)+3;
 return offer.window==="mid"&&current.type==="closed"&&state.matchday===midEnd+1&&state.matchday===createdMatchday;
}
function runAITransferTick(windowType){
 ensureClubSquads();ensureAIBudgets();
 maybeGenerateAITransferOffer(windowType);
 if(Math.random()>=(windowType==="summer"?.58:.42))return [];
 const sellers=Object.entries(state.clubSquads).filter(([club,squad])=>club!==state.club&&Array.isArray(squad)&&squad.length>12);
 const candidates=[];
 sellers.forEach(([from,squad])=>squad.slice(11).forEach(player=>{
  if(playerPositionCount(squad,player.pos)<=2)return;
  const fee=Math.max(5000,Math.round(playerValue(player)*.22));
  Object.entries(state.clubSquads).forEach(([to,target])=>{
   if(to===from||to===state.club||!Array.isArray(target)||target.length>=27||Number(state.aiBudgets[to]||0)<fee)return;
   if(playerPositionCount(target,player.pos)>=2)return;
   candidates.push({from,to,player,fee});
  });
 }));
 if(!candidates.length)return [];
 const deal=candidates[Math.floor(Math.random()*candidates.length)];
 const fromSquad=state.clubSquads[deal.from],toSquad=state.clubSquads[deal.to];
 const index=fromSquad.findIndex(p=>String(p.id)===String(deal.player.id));
 if(index<0||fromSquad.length<=12||toSquad.length>=27)return [];
 const [player]=fromSquad.splice(index,1);toSquad.push(player);
 state.aiBudgets[deal.from]=Number(state.aiBudgets[deal.from]||0)+deal.fee;
 state.aiBudgets[deal.to]=Number(state.aiBudgets[deal.to]||0)-deal.fee;
 const record={name:player.name,from:deal.from,to:deal.to,fee:deal.fee,id:player.id,season:state.season,window:windowType,ai:true};
 state.transfersDone.push(record);state.transferPool=[];
 return [record];
}
function maybeGenerateJobOffer(oldRep,newRep){
 if(newRep<=oldRep)return;
 state.repHistory=Array.isArray(state.repHistory)?state.repHistory:[];
 state.repHistory.push({md:state.matchday,rep:newRep});
 state.repHistory=state.repHistory.slice(-5);
 const recent=state.repHistory.filter(x=>x.md>=state.matchday-2);
 const gained=recent.length?newRep-recent[0].rep:0;
 const winsRecent=state.results.slice(-3).flat().filter(r=>r.home===state.club||r.away===state.club).filter(r=>{const g=r.home===state.club?r.hg:r.ag,o=r.home===state.club?r.ag:r.hg;return g>o}).length;
 if(!state.jobOffers.length&&gained>=4&&winsRecent>=2){
  const targets=allJobTargets().filter(j=>j[0]!==state.club&&j[1]<=newRep+3).filter(j=>!state.jobBoard.some(x=>x[0]===j[0]));
  if(targets.length){const offer=shuffle(targets)[0];state.jobOffers=[{club:offer[0],required:offer[1],expiresMD:state.matchday+3,reason:"Your reputation has risen quickly after a strong run of results."}]}
 }
}
function recordManagerResult(myGoals,oppGoals){
 const oldRep=state.rep;
 if(myGoals>oppGoals){state.wins++;state.lossStreak=0;state.rep+=2;state.balance+=15000}
 else if(myGoals<oppGoals){state.losses++;state.lossStreak=(Number(state.lossStreak)||0)+1;state.rep=Math.max(0,state.rep-1);state.balance-=5000}
 else{state.draws++;state.lossStreak=0;state.balance+=5000}
 maybeGenerateJobOffer(oldRep,state.rep);
 if(state.lossStreak>=6&&!state.managerFired){
  state.managerFired=true;state.jobOffers=[];state.transferOffers=[];state.jobBoard=[];state.jobBoardMD=-1;
  state.jobNotice=`The board dismissed you from ${state.club} after six consecutive league defeats.`;state.tab="Jobs";
 }
}
function useTransferTick(){
 const st=transferStatus();
 if(st.type!=="summer")return;
 if(state.summerTick<10){state.summerTick++;runAITransferTick("summer");state.transferPool=generateTransferPool();save();render();}
}
function currentSeasonLabel(){return `${state.season}/${String(state.season+1).slice(-2)}`}
function seasonLabel(year){const y=Number(year);return Number.isFinite(y)&&y>=1900?`${y}/${String(y+1).slice(-2)}`:currentSeasonLabel()}
function playerValue(p){return Math.max(5000,Math.round((p.ovr-40)*(p.ovr-40)*700*(p.age<25?1.18:p.age<30?1:Math.max(.45,1-(p.age-30)*.06))))}
function ratingDeltaForPlayer(p,apps=0){
 const roll=Math.random();let delta=0;
 if(p.age<=20){delta=roll<.20?4:roll<.48?3:roll<.72?2:roll<.88?1:roll<.94?-1:0;}
 else if(p.age<=23){delta=roll<.12?4:roll<.30?3:roll<.55?2:roll<.73?1:roll<.84?-1:roll<.89?-2:0;}
 else if(p.age<=26){delta=roll<.06?3:roll<.22?2:roll<.43?1:roll<.62?0:roll<.78?-1:roll<.86?-2:0;}
 else if(p.age<=29){delta=roll<.05?2:roll<.20?1:roll<.47?0:roll<.70?-1:roll<.86?-2:roll<.92?-3:0;}
 else if(p.age<=32){delta=roll<.04?1:roll<.25?0:roll<.52?-1:roll<.78?-2:roll<.91?-3:0;}
 else {delta=roll<.20?0:roll<.52?-1:roll<.78?-2:roll<.94?-3:-4;}
 if(apps>=25&&p.age<29&&Math.random()<.25)delta=Math.max(delta,2);
 if(apps<5&&p.age<24&&Math.random()<.25)delta=Math.min(delta,0);
 return Math.max(-4,Math.min(4,delta));
}
function developSquad(squad,club){
 const changes=[];
 squad.forEach(p=>{const stat=state.playerStats[statKey(club,p,"league")]||blankPlayerStat(club,p,"league");const old=p.ovr;const delta=ratingDeltaForPlayer(p,stat.apps||0);p.ovr=Math.max(35,Math.min(85,p.ovr+delta));p.age+=1;changes.push({id:p.id,name:p.name,old,now:p.ovr,delta,age:p.age,club});});
 return changes;
}
function developPlayersAtSeasonEnd(){
 const changes=[];ensureClubSquads();
 Object.keys(state.clubSquads).forEach(club=>{const squad=state.clubSquads[club]||[];changes.push(...developSquad(squad,club));});
 state.players=(state.clubSquads[state.club]||state.players).map(clonePlayer);
 return changes.filter(p=>p.club===state.club);
}
function retirePlayers(){
 const retired=[];ensureClubSquads();
 Object.keys(state.clubSquads).forEach(club=>{state.clubSquads[club]=(state.clubSquads[club]||[]).filter(p=>{let chance=0;if(p.age>=38)chance=.65;else if(p.age>=37)chance=.35;else if(p.age>=36)chance=.18;else if(p.age>=35)chance=.08;else if(p.age>=34)chance=.025;if(Math.random()<chance){retired.push({...p,club});return false}return true;});});
 state.players=(state.clubSquads[state.club]||[]).map(clonePlayer);normalizeXI();return retired;
}
function buildSeasonReport(development,retired,squadStart){
 const tableRow=state.table[state.club];
 const pos=standings().findIndex(x=>x.club===state.club)+1;
 const leaguePrize=leagueReward(pos);
 const stats=Object.values(state.playerStats).filter(x=>x.club===state.club&&(!x.competition||x.competition==="league"));
 const topScorer=[...stats].sort((a,b)=>b.goals-a.goals||b.assists-a.assists)[0];
 const topAssist=[...stats].sort((a,b)=>b.assists-a.assists||b.goals-a.goals)[0];
 const bestDev=[...development].sort((a,b)=>b.delta-a.delta)[0];
 const oldRating=squadStart;
 return {season:state.season,label:currentSeasonLabel(),club:state.club,position:pos,points:tableRow?.pts||0,played:tableRow?.p||0,wins:tableRow?.w||0,draws:tableRow?.d||0,losses:tableRow?.l||0,gf:tableRow?.gf||0,ga:tableRow?.ga||0,cup:state.cup?.winner===state.club?"Winners":(state.cup?.results?.some(rs=>rs.some(r=>(r.home===state.club||r.away===state.club)&&((r.home===state.club?r.hg:r.ag)<(r.home===state.club?r.ag:r.hg))))?"Eliminated":"Not completed"),squadRatingStart:oldRating,squadRatingEnd:squadRating(),topScorer:topScorer?{name:topScorer.name,goals:topScorer.goals,assists:topScorer.assists}:null,topAssist:topAssist?{name:topAssist.name,assists:topAssist.assists,goals:topAssist.goals}:null,bestDev:bestDev||null,development,retired:retired.filter(p=>p.club===state.club).map(p=>({name:p.name,age:p.age})),stats:stats.map(x=>({...x})),leagueReward:leaguePrize,cupReward:state.cup?.rewardMoney||0,totalRewards:leaguePrize+(state.cup?.rewardMoney||0),balance:state.balance};
}
function leagueReward(position){
 const rewards={1:150000,2:120000,3:100000,4:80000,5:65000,6:50000,7:40000,8:30000,9:20000,10:10000,11:9000,12:8000,13:7000,14:6000,15:5000,16:4000};
 return rewards[position]||3000;
}
function cupRewardForRound(round){
 // Reward is paid when a club wins/passes a round: R32 20k, R16 40k, QF 80k, SF 160k.
 return 20000*Math.pow(2,Math.max(0,round-1));
}
function addAchievement(type,title,description,emoji="🏆",extra={}){
 state.achievements=Array.isArray(state.achievements)?state.achievements:[];
 const season=Number(extra.season??state.season),club=extra.club||state.club;
 const key=`${type}|${season}|${club}|${title}`;
 if(state.achievements.some(a=>a.key===key))return false;
 state.achievements.unshift({key,type,title,description,emoji,season,club,date:new Date().toISOString(),...extra});
 return true;
}
function showCelebration(kind,title,message,emoji="🏆",returnTab="Home"){
 // A celebration is a one-time modal overlay, not a permanent navigation tab.
 const id=`${kind}|${state.season}|${state.club}|${title}`;
 if(state.celebration?.id===id)return;
 state.celebration={id,kind,title,message,emoji,returnTab,season:state.season,club:state.club};
}
function dismissCelebration(){state.celebration=null;document.getElementById("celebrationOverlay")?.remove();save();render();}
function celebrationOverlay(){
 const c=state.celebration;if(!c)return;
 const host=document.createElement("div");host.id="celebrationOverlay";host.style.cssText="position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;padding:18px;background:rgba(3,7,12,.86);backdrop-filter:blur(7px);overflow:hidden";
 const bits=Array.from({length:36},(_,i)=>`<i style="position:absolute;left:${(i*37)%100}%;top:-18px;width:7px;height:12px;border-radius:2px;background:${["#facc15","#4ade80","#60a5fa","#f472b6","#fb923c"][i%5]};transform:rotate(${i*29%180}deg);animation:bhConfetti ${2+(i%9)/3}s linear ${-(i%7)/2}s infinite"></i>`).join("");
 host.innerHTML=`<style>@keyframes bhConfetti{to{top:110%;transform:translateX(${(c.kind.length%2?1:-1)*40}px) rotate(720deg)}}@keyframes bhTrophyPop{0%{transform:scale(.4) rotate(-12deg);opacity:0}75%{transform:scale(1.12) rotate(3deg);opacity:1}100%{transform:scale(1);opacity:1}}@media(prefers-reduced-motion:reduce){#celebrationOverlay i{animation:none!important}}</style>${bits}<div style="position:relative;width:min(100%,520px);text-align:center;padding:30px 22px;border:1px solid #4ade80;border-radius:22px;background:linear-gradient(160deg,#1d3026,#151b23 70%);box-shadow:0 24px 100px #0009;color:#f4f7fb"><div style="font-size:76px;line-height:1.2;animation:bhTrophyPop .6s ease-out">${c.emoji||"🏆"}</div><div style="font-size:12px;letter-spacing:3px;color:#86efac;font-weight:800;margin:12px 0">CONGRATULATIONS</div><h2 style="font-size:clamp(26px,5vw,38px);margin:8px 0 12px">${c.title}</h2><p style="font-size:16px;line-height:1.55;color:#d6deea">${c.message}</p><div style="padding:12px;margin:20px 0;background:#0f1724;border-radius:12px;color:#d6deea">${c.club||state.club} · ${seasonLabel(c.season??state.season)}</div><button class="primary" style="width:100%;font-size:16px;padding:14px" onclick="dismissCelebration()">Continue career</button></div>`;
 document.body.appendChild(host);
}
function historyPage(){
 const seasons=[...(state.seasonHistory||[])].sort((a,b)=>(b.season||0)-(a.season||0));
 const achievements=state.achievements||[];
 const seasonCards=seasons.length?seasons.map(r=>`<div class="card"><div class="row" style="align-items:flex-start"><div style="flex:1"><div class="sub">${r.label||seasonLabel(r.season)}</div><h3 style="margin:5px 0">${r.club||"Unknown club"}</h3><div class="sub">${r.league||"League unavailable"}</div></div><div style="text-align:right"><div class="stat">${r.position?`#${r.position}`:"—"}</div><div class="sub">Final position</div></div></div><div class="grid"><div><div class="label">Points</div><div class="stat">${r.points??"—"}</div></div><div><div class="label">Record</div><div class="stat">${[r.wins,r.draws,r.losses].every(Number.isFinite)?`${r.wins}-${r.draws}-${r.losses}`:"—"}</div></div><div><div class="label">Cup</div><div class="stat" style="font-size:16px">${r.cup||"Not recorded"}</div></div></div>${r.topScorer?`<div class="sub" style="margin-top:8px">Top scorer: ${r.topScorer.name} (${r.topScorer.goals} goals)</div>`:""}${r.totalRewards?`<div class="sub">Rewards: €${Number(r.totalRewards).toLocaleString()}</div>`:""}</div>`).join(""):'<div class="card sub">No completed seasons have been archived yet. Your first season report will appear here after the season ends.</div>';
 const achievementCards=achievements.length?achievements.map(a=>`<div class="club"><div style="font-size:28px;width:42px;text-align:center">${a.emoji||"🏅"}</div><div style="flex:1"><b>${a.title}</b><div class="sub">${a.club||"Career"} · ${a.season?seasonLabel(a.season):"Career milestone"}</div><div class="sub">${a.description||"Achievement unlocked"}</div></div></div>`).join(""):'<div class="sub">No achievements unlocked yet. Titles, cups, promotions and major transfers will be recorded here.</div>';
 document.getElementById("app").innerHTML=`<div class="card"><div class="sub">Your managerial career</div><h2>History & Achievements</h2><p class="sub">Completed seasons and milestones are saved to this career.</p><div class="grid"><div><div class="label">Seasons archived</div><div class="stat">${seasons.length}</div></div><div><div class="label">Achievements</div><div class="stat">${achievements.length}</div></div><div><div class="label">Trophies</div><div class="stat">${achievements.filter(a=>["league-title","cup-win","promotion","european-win"].includes(a.type)).length}</div></div></div></div><div class="card"><h3>🏆 Season history</h3>${seasonCards}</div><div class="card"><h3>🎖️ Achievements</h3>${achievementCards}</div>`;
}
function finishSeason(){
 if(state.matchday<seasonMatchdays()||state.seasonReport)return false;
 syncCurrentClub();
 const squadStart=squadRating();
 const development=developPlayersAtSeasonEnd();
 const retired=retirePlayers();
 syncCurrentClub();
 const pos=standings().findIndex(x=>x.club===state.club)+1;
 const leaguePrize=leagueReward(pos);
 state.balance+=leaguePrize;
 let cupReward=state.cup&&Number.isFinite(state.cup.rewardMoney)?state.cup.rewardMoney:0;
 let cupLabel="Not completed";
 if(state.cup){
   if(state.cup.winner===state.club) cupLabel="Winners";
   else if(Array.isArray(state.cup.results)){
     const eliminated=state.cup.results.flat().some(r=>{
       if(r.home!==state.club&&r.away!==state.club)return false;
       const mine=r.home===state.club?r.hg:r.ag, opp=r.home===state.club?r.ag:r.hg;
       return mine<opp;
     });
     if(eliminated)cupLabel="Eliminated";
   }
 }
 const report=buildSeasonReport(development,retired,squadStart)||{};
 report.cup=cupLabel; report.league=state.league; report.leagueReward=leaguePrize; report.cupReward=cupReward;
 report.totalRewards=leaguePrize+cupReward; report.balance=state.balance;
 state.seasonReport=report;
 state.seasonHistory=Array.isArray(state.seasonHistory)?state.seasonHistory:[];
 state.seasonHistory.push(JSON.parse(JSON.stringify(report)));
 if(pos===1){addAchievement("league-title",`${state.league} Champions`,`${state.club} won the ${state.league}.`,"🏆",{season:state.season,club:state.club});showCelebration("league-title","League Champions!",`${state.club} have finished top of ${state.league}. The league title is yours!` ,"🏆","Season Report");}
 else if(state.cup?.winner===state.club){addAchievement("cup-win","Kup BiH Winners",`${state.club} won Kup BiH.`,"🏆",{season:state.season,club:state.club});showCelebration("cup-win","Kup BiH Winners!",`${state.club} have won the Kup BiH. Enjoy the trophy and the prize money!`,"🏆","Season Report");}
 else state.tab="Season Report";
 save(); render(); return true;
}
function standingsForTable(table){return Object.values(table||{}).sort((a,b)=>b.pts-a.pts||(b.gf-b.ga)-(a.gf-a.ga)||b.gf-a.gf||b.w-a.w||a.club.localeCompare(b.club));}
function settleLeagueSnapshot(name){
 const clubs=playableClubsForLeague(name);if(clubs.length<2)return null;
 let snap=state.competitionStates[name];
 if(!snap||snap.season!==state.season||!Array.isArray(snap.fixtures)||snap.fixtures.length!==generateFixturesForLeague(clubs,name).length){snap={season:state.season,matchday:0,fixtures:generateFixturesForLeague(clubs,name),table:makeTableForClubs(clubs),results:[]};}
 while(snap.matchday<(clubs.length-1)*meetingsForLeague(name)){
  const n=clubs.length,round=snap.fixtures.slice(snap.matchday*n/2,(snap.matchday+1)*n/2);if(!round.length)break;
  const rs=round.map(simulateFixture);rs.forEach(r=>applyResultToTable(snap.table,r));snap.results.push(rs);snap.matchday++;
 }
 state.competitionStates[name]=snap;return standingsForTable(snap.table);
}
function applyResultToTable(table,r){const h=table[r.home],a=table[r.away];if(!h||!a)return;h.p++;a.p++;h.gf+=r.hg;h.ga+=r.ag;a.gf+=r.ag;a.ga+=r.hg;if(r.hg>r.ag){h.w++;h.pts+=3;a.l++}else if(r.hg<r.ag){a.w++;a.pts+=3;h.l++}else{h.d++;a.d++;h.pts++;a.pts++}}
function settleAllPlayableLeagues(){const standingsByLeague={};Object.keys(leagues).forEach(name=>{const clubs=playableClubsForLeague(name);if(clubs.length>=2)standingsByLeague[name]=settleLeagueSnapshot(name);});return standingsByLeague;}
function applyPromotionsRelegations(standingsByLeague){
 const top="Premijer Liga BiH",fbih="Prva liga FBiH",rs="Prva liga RS";
 const topRows=standingsByLeague[top],fbihRows=standingsByLeague[fbih],rsRows=standingsByLeague[rs];
 if(!topRows||!fbihRows||!rsRows||!leagues[top]||!leagues[fbih]||!leagues[rs])return [];
 // Federation regulations set two top-flight relegations and promotion places
 // for the champions of both entity first divisions (licensing abstracted here).
 const relegated=topRows.slice(-2).map(row=>row?.club).filter(Boolean);
 const promoted=[fbihRows[0]?.club,rsRows[0]?.club].filter(Boolean);
 if(relegated.length!==2||promoted.length!==2)return [];
 leagues[top]=leagues[top].filter(c=>!relegated.includes(c));
 leagues[fbih]=leagues[fbih].filter(c=>c!==promoted[0]);
 leagues[rs]=leagues[rs].filter(c=>c!==promoted[1]);
 const tierForClub=club=>leagues["Prva liga RS"].includes(club)||["FK Borac Banja Luka","FK Radnik Bijeljina","FK Sloga Doboj","BSK Banja Luka"].includes(club)?rs:fbih;
 const changes=[];
 promoted.forEach((club,i)=>{const from=i===0?fbih:rs;leagues[top].push(club);changes.push({club,from,to:top});});
 relegated.forEach(club=>{const to=tierForClub(club);leagues[to].push(club);changes.push({club,from:top,to});});
 persistLeagueMembership();
 state.promotionHistory=Array.isArray(state.promotionHistory)?state.promotionHistory:[];state.promotionHistory.push({season:state.season,changes});
 return changes;
}
function startNextSeason(){
 if(!state.seasonReport)return;
 syncCurrentClub();saveActiveCompetition();
 const standingsByLeague=settleAllPlayableLeagues();const movement=applyPromotionsRelegations(standingsByLeague);
 const userPromotion=movement.find(x=>x.club===state.club&&x.to!==x.from);
 state.season+=1; state.competitionStates={}; state.matchday=0;
 state.league=Object.keys(leagues).find(l=>leagues[l].includes(state.club))||state.league;
 state.fixtures=generateFixturesForLeague(leagueClubs(),state.league); state.table=makeTable(); state.results=[];
 state.points=0; state.played=0; state.wins=0; state.draws=0; state.losses=0;
 state.jobBoard=[]; state.jobBoardMD=-1; state.jobOffers=[]; state.repHistory=[{md:0,rep:state.rep}];
 state.transferTick=0; state.summerTick=0; state.transferPool=[]; state.transfersDone=[];state.transferOffers=[];
 ensureAIBudgets();Object.keys(state.aiBudgets).forEach(club=>{state.aiBudgets[club]+=Math.round(initialAIBudget(club)*.3)});
 state.cup=null; state.seasonReport=null; state.playerStats={};
 loadClubSquad(state.club); normalizeXI(); initPlayerStats();
 if(userPromotion&&userPromotion.to==="Premijer Liga BiH"){
  addAchievement("promotion","Promotion achieved",`${state.club} promoted to ${userPromotion.to}.`,"🎉",{season:state.season,club:state.club});
  showCelebration("promotion","Promoted!",`${state.club} have earned promotion to ${userPromotion.to}. A new challenge awaits!`,"🎉","Home");
 }else if(userPromotion){
  addAchievement("promotion","Promotion achieved",`${state.club} promoted from ${userPromotion.from} to ${userPromotion.to}.`,"🎉",{season:state.season,club:state.club});
  showCelebration("promotion","Promotion achieved!",`${state.club} have moved up from ${userPromotion.from} to ${userPromotion.to}.`,"🎉","Home");
 }else state.tab="Home";
 saveActiveCompetition(); save(); render();
}
function seasonReportPage(){
 const r=state.seasonReport;
 if(!r){document.getElementById("app").innerHTML='<div class="card"><h2>Season Report</h2><div class="sub">The report will appear when the league season is complete.</div></div>';return;}
 const dev=r.development||[];
 document.getElementById("app").innerHTML=`<div class="card"><div class="sub">Season complete</div><h2>🏆 ${r.label} Season Report</h2><h3>${r.club}</h3><div class="grid"><div><div class="label">Final position</div><div class="stat">#${r.position}</div></div><div><div class="label">Points</div><div class="stat">${r.points}</div></div><div><div class="label">Record</div><div class="stat">${r.wins}-${r.draws}-${r.losses}</div></div><div><div class="label">Goal difference</div><div class="stat">${r.gf-r.ga}</div></div><div><div class="label">Squad OVR</div><div class="stat">${r.squadRatingStart} → ${r.squadRatingEnd}</div></div><div><div class="label">Cup</div><div class="stat">${r.cup}</div></div></div></div>
 <div class="card"><h3>💰 Season rewards</h3><p>🏆 League placement: <b>€${(r.leagueReward||0).toLocaleString()}</b></p><p>🏆 Cup rewards: <b>€${(r.cupReward||0).toLocaleString()}</b></p><p>Total competition rewards: <b>€${(r.totalRewards||0).toLocaleString()}</b></p></div>
 <div class="card"><h3>Player awards</h3>${r.topScorer?`<p>⚽ <b>Top scorer:</b> ${r.topScorer.name} — ${r.topScorer.goals} goals</p>`:'<p class="sub">No goals recorded.</p>'}${r.topAssist?`<p>🅰️ <b>Top assists:</b> ${r.topAssist.name} — ${r.topAssist.assists} assists</p>`:''}${r.bestDev?`<p>📈 <b>Biggest development:</b> ${r.bestDev.name} — ${r.bestDev.old} → ${r.bestDev.now} OVR</p>`:''}</div>
 <div class="card"><h3>Squad development</h3><div class="list">${dev.map(p=>`<div class="row" style="padding:7px 0;border-bottom:1px solid var(--line)"><span>${p.name}<br><span class="sub">Age ${p.age}</span></span><b class="${p.delta>0?'green':p.delta<0?'red':''}">${p.old} → ${p.now} ${p.delta>0?'▲ '+p.delta:p.delta<0?'▼ '+Math.abs(p.delta):'—'}</b></div>`).join('')}</div></div>
 <div class="card"><h3>Retirements</h3>${r.retired.length?r.retired.map(p=>`<p>👋 ${p.name} retired at age ${p.age}.</p>`).join(''):'<div class="sub">No retirements this season.</div>'}</div>
 <div class="card"><h3>Season player stats</h3><div style="overflow:auto"><table style="width:100%;border-collapse:collapse;font-size:12px"><thead><tr><th style="text-align:left">Player</th><th>App</th><th>G</th><th>A</th><th>CS</th></tr></thead><tbody>${r.stats.map(p=>`<tr style="border-top:1px solid var(--line)"><td style="padding:7px 3px;text-align:left">${p.name}</td><td>${p.apps}</td><td>${p.goals}</td><td>${p.assists}</td><td>${p.cleanSheets}</td></tr>`).join('')}</tbody></table></div></div>
 <button class="primary" style="width:100%" onclick="startNextSeason()">Continue to ${state.season+1}/${String(state.season+2).slice(-2)}</button>`;
}
function initSeason(force=false){
 const clubs=leagueClubs(),needed=(clubs.length*(clubs.length-1)*meetingsForLeague())/2;
 if(force||!Array.isArray(state.fixtures)||state.fixtures.length!==needed||!state.table||Object.keys(state.table).length!==clubs.length){
  state.matchday=0;state.fixtures=generateFixtures(clubs);state.table=makeTable();state.results=[];state.lastMatch=null;state.points=0;state.played=0;state.wins=0;state.draws=0;state.losses=0;state.lastMatch=null;state.jobBoard=[];state.jobBoardMD=-1;state.jobOffers=[];state.repHistory=[{md:0,rep:state.rep}];state.transferTick=0;state.summerTick=0;state.transferPool=[];state.transfersDone=[];state.transferOffers=[];state.cup=null;state.playerStats={};state.seasonReport=null;
 }
 initPlayerStats();saveActiveCompetition();
}
function save(){
 try{persistLeagueMembership();
  const existing=localStorage.getItem(SAVE_KEY);
  if(existing){try{const parsed=JSON.parse(existing);if(normalizeSavedState(parsed))localStorage.setItem(SAVE_BACKUP_KEY,existing);}catch(e){/* Never replace a good backup with corrupt data. */}}
  state.saveVersion=SAVE_VERSION;
  localStorage.setItem(SAVE_KEY,JSON.stringify(state));
  state.saveError=false;
  return true;
 }catch(e){
  state.saveError=true;
  console.error("BHFM save failed; browser storage may be full or unavailable.",e);
  return false;
 }
}
function normalizeXI(){
 const valid=state.players.map(p=>p.id), seen=new Set(), out=[];
 (Array.isArray(state.xi)?state.xi:[]).forEach(id=>{if(valid.includes(id)&&!seen.has(id)){seen.add(id);out.push(id)}});
 valid.forEach(id=>{if(out.length<Math.min(11,valid.length)&&!seen.has(id)){seen.add(id);out.push(id)}});
 state.xi=out;
}

function initClub(){ensureClubSquads();loadClubSquad(state.club);initSeason(false);save()}
function tabs(){let t=["Home","Squad & Tactics","Player Stats","League","Results","Cup","Jobs","Transfers","Match Report","Season Report","History"];document.getElementById("tabs").innerHTML=t.map(x=>`<button class="${state.tab===x?'on':''}" onclick="state.tab='${x}';save();render()">${x}</button>`).join("")}
function ensureSeasonReady(){
  if(state.seasonReport) return;
  const clubs=leagueClubs();
  const needed=(clubs.length*(clubs.length-1)*meetingsForLeague())/2;
  const tableValid=state.table&&typeof state.table==="object"&&Object.keys(state.table).length===clubs.length;
  const fixturesValid=Array.isArray(state.fixtures)&&state.fixtures.length===needed;
  if(!fixturesValid||!tableValid){
    state.fixtures=generateFixtures(clubs);
    state.table=makeTable();
    state.results=Array.isArray(state.results)?state.results:[];
    if(state.matchday<0||state.matchday>seasonMatchdays()) state.matchday=0;
    state.points=state.table[state.club]?.pts||0;
    state.played=state.table[state.club]?.p||0;
    state.wins=state.table[state.club]?.w||0;
    state.draws=state.table[state.club]?.d||0;
    state.losses=state.table[state.club]?.l||0;
    save();
  }
}
function render(){
 ensureSeasonReady();
 if(state.matchday>=seasonMatchdays()&&!state.seasonReport){ finishSeason(); return; }
 tabs();
 ({Home:home,"Squad & Tactics":squad,"Player Stats":playerStatsPage,League:league,Results:resultsPage,Cup:cup,Jobs:jobs,Transfers:transfers,"Match Report":matchReportPage,"Season Report":seasonReportPage,History:historyPage}[state.tab]||home)();
 document.getElementById("celebrationOverlay")?.remove();
 if(state.celebration)celebrationOverlay();
 scheduleLiveMatchEvent();
}
function home(){
 const pos=standings().findIndex(x=>x.club===state.club)+1,total=seasonMatchdays();
 document.getElementById("app").innerHTML=`${state.jobNotice?`<div class="notice" style="margin-bottom:12px">${state.jobNotice}</div>`:""}<div class="card"><div class="sub">${state.league} • Matchday ${state.matchday}/${total}</div><h2>${state.club}</h2><div class="grid"><div><div class="label">Manager rep</div><div class="stat">${state.rep}</div></div><div><div class="label">Balance</div><div class="stat">€${Math.round(state.balance).toLocaleString()}</div></div><div><div class="label">Record</div><div class="stat">${state.wins}-${state.draws}-${state.losses}</div></div><div><div class="label">League</div><div class="stat">#${pos||"-"} • ${state.points} pts</div></div><div><div class="label">Squad OVR</div><div class="stat">${squadRating()}</div></div></div></div>
 <div class="card"><h3>Next fixture</h3><p>${nextOpponent()}</p>${state.managerFired?'<div class="notice">You have been dismissed. Open Jobs to continue your career.</div>':state.matchday<total?'<button class="primary" onclick="playMatch()">Play matchday</button>':'<div class="notice">League season complete.</div>'}</div>
 <div class="card"><h3>Promotion & relegation</h3><p class="sub">The top tier exchanges two clubs with the champions of the FBiH and RS first divisions. Lower-tier promotion routes are still being added.</p>${(state.promotionHistory||[]).slice(-1).map(x=>`<div class="notice">${x.season}/${String(x.season+1).slice(-2)}: ${x.changes.map(c=>`${c.club}: ${c.from} → ${c.to}`).join(" • ")}</div>`).join("")}</div><div class="card"><h3>Transfer market</h3><div class="sub">${transferStatus().label}</div></div><div class="card"><h3>Latest matchday</h3>${latestRoundHTML()}</div>
 <div class="card"><h3>Real 2026/27 data</h3><p class="sub">Club/player names are sourced from current 2026/27 federation and squad listings. OVR is a game attribute, not an official player rating. Prva liga FBiH starting XIs are based on published 2026/27 match lineups.</p></div><div class="card"><h3>Season engine</h3><p class="sub">Every populated league advances one round per world matchday, with separate saved fixtures, tables and results. Premijer Liga BiH uses 36 matchdays (four meetings per opponent); other populated leagues retain their two-meeting format.</p></div>`
}
function fixtureForRound(round){const n=leagueClubs().length;return state.fixtures.slice(round*n/2,(round+1)*n/2)}
function nextOpponent(){const total=seasonMatchdays();if(state.matchday>=total)return"Season complete";const f=fixtureForRound(state.matchday).find(x=>x.home===state.club||x.away===state.club);if(!f)return"Schedule pending";return`${f.home===state.club?"Home":"Away"} • ${f.home===state.club?f.away:f.home}`}
function poissonish(lambda){const rate=Math.max(0,Number(lambda)||0),limit=Math.exp(-rate);let product=1,count=0;do{count++;product*=Math.random()}while(product>limit);return count-1}
function simulateFixture(f,referee=assignReferee()){
 const xg=expectedGoalsForFixture(f.home,f.away,referee);
 return{home:f.home,away:f.away,hg:Math.min(poissonish(xg.home),6),ag:Math.min(poissonish(xg.away),6),referee:referee.name,refereeProfile:referee.id};
}
function applyResult(r){const h=state.table[r.home],a=state.table[r.away];h.p++;a.p++;h.gf+=r.hg;h.ga+=r.ag;a.gf+=r.ag;a.ga+=r.hg;if(r.hg>r.ag){h.w++;h.pts+=3;a.l++}else if(r.hg<r.ag){a.w++;a.pts+=3;h.l++}else{h.d++;a.d++;h.pts++;a.pts++}}
function standings(){return Object.values(state.table).sort((a,b)=>b.pts-a.pts||(b.gf-b.ga)-(a.gf-a.ga)||b.gf-a.gf||b.w-a.w||a.club.localeCompare(b.club))}
function latestRoundHTML(){if(!state.results.length)return'<div class="sub">No matches played yet.</div>';return state.results[state.results.length-1].map(r=>`<div class="row" style="padding:7px 0;border-bottom:1px solid var(--line)"><span>${r.home}</span><b>${r.hg}–${r.ag}</b><span>${r.away}</span></div>`).join("")}
function statKey(club,p,competition="league"){return `${competition}::${club}::${p.id}`}
function blankPlayerStat(club,p,competition="league"){return{competition,club,id:p.id,name:p.name,pos:p.pos,age:p.age,ovr:p.ovr,apps:0,starts:0,goals:0,assists:0,cleanSheets:0,minutes:0,yellows:0,reds:0}}
function initPlayerStats(){
 if(!state.playerStats||typeof state.playerStats!=="object")state.playerStats={};
 // Migrate pre-v0.18 keys to league stats without discarding existing career saves.
 Object.entries(state.playerStats).forEach(([key,st])=>{
   if(!st||typeof st!=="object") {delete state.playerStats[key];return;}
   if(!st.competition){
     const prefixed=key.startsWith("league::")||key.startsWith("cup::");
     st.competition=key.startsWith("cup::")?"cup":"league";
     if(!prefixed&&key.includes("::"))state.playerStats[`league::${key}`]=st;
     else if(!prefixed){delete state.playerStats[key];return;}
     if(!prefixed)delete state.playerStats[key];
   }
 });
 ensureClubSquads(); leagueClubs().forEach(c=>(state.clubSquads[c]||[]).forEach(p=>{const k=statKey(c,p,"league");if(!state.playerStats[k])state.playerStats[k]=blankPlayerStat(c,p,"league")}));
 (state.players||[]).forEach(p=>{const k=statKey(state.club,p,"league");if(!state.playerStats[k])state.playerStats[k]=blankPlayerStat(state.club,p,"league")});
}
function lineupForStats(club){
 if(club===state.club){normalizeXI();return state.xi.map(id=>state.players.find(p=>p.id===id)).filter(Boolean).slice(0,11)}
 ensureClubSquads();return (state.clubSquads[club]||[]).slice(0,11);
}
function weightedPlayer(players){
 if(!players.length)return null;
 const weights=players.map(p=>p.pos==="ATT"?5:p.pos==="MID"?3:p.pos==="DEF"?1.5:.4);let total=weights.reduce((a,b)=>a+b,0),r=Math.random()*total;
 for(let i=0;i<players.length;i++){r-=weights[i];if(r<=0)return players[i]}return players[players.length-1];
}

function pickPlayer(players, weights){
 const pool=players.filter(Boolean); if(!pool.length)return null;
 const w=pool.map(p=>weights?.[p.pos]||1), total=w.reduce((a,b)=>a+b,0);
 let r=Math.random()*total;
 for(let i=0;i<pool.length;i++){r-=w[i];if(r<=0)return pool[i]}
 return pool[pool.length-1];
}
function matchMinute(existing){
 let m=1+Math.floor(Math.random()*90);
 while(existing.includes(m))m=1+Math.floor(Math.random()*90);
 return m;
}
const REFEREE_PROFILES=[
 {id:"lenient",name:"Lenient",strictness:-1,homeBias:0,goalPressure:-.025},
 {id:"balanced",name:"Balanced",strictness:0,homeBias:0,goalPressure:0},
 {id:"strict",name:"Strict",strictness:1,homeBias:0,goalPressure:.035},
 {id:"home_favoring",name:"Home-favoring",strictness:0,homeBias:.16,goalPressure:.01}
];
// NFSBiH's published 2026/27 Premijer Liga A-list. The gameplay profile is
// assigned separately and is not a claim about an official's real tendencies.
const BIH_REFEREES_2026_27=[
 "Nemanja Aleksić","Antoni Bandić","Luka Bilbija","Armin Efendić","Darko Gedžić",
 "Miloš Gigović","Haris Halkić","Frano Jelić","Mirza Kazlagić","Dragan Kesić",
 "Armin Kukić","Nihad Ljajić","Dražen Marić","Josip Martinović","Mateo Musa",
 "Admir Musić","Aleksandar Njegomirović","Irfan Peljto","Dragan Petrović",
 "Ermin Sivac","Dragan Todić","Antonio Tomić","Sabrija Topalović"
];
function assignReferee(){
 const profile=REFEREE_PROFILES[Math.floor(Math.random()*REFEREE_PROFILES.length)];
 const name=BIH_REFEREES_2026_27[Math.floor(Math.random()*BIH_REFEREES_2026_27.length)];
 return {...profile,name,profileName:profile.name};
}
function refereeSummary(m){
 const profile=REFEREE_PROFILES.find(p=>p.id===m.refereeProfile);
 return `${m.referee||"Not recorded"} · ${profile?.name||"Balanced"} game profile (simulated)`;
}
function refereeGoalRates(referee){return {home:referee.homeBias+referee.goalPressure,away:-referee.homeBias*.55+referee.goalPressure}}
function generateMatchReport(r,referee=assignReferee()){
 const homeXI=lineupForStats(r.home), awayXI=lineupForStats(r.away);
 const events=[], usedMinutes=[];
 const add=(minute,type,text,team,player)=>events.push({minute,type,text,team:team||null,player:player?player.name:null});
 const homeScorers=[], awayScorers=[];
 const score=[0,0];

 for(let i=0;i<r.hg;i++){
   const p=pickPlayer(homeXI,{ATT:5,MID:3,DEF:1.5,GK:.2})||homeXI[0];
   const aPool=homeXI.filter(x=>x&&x.id!==p.id);
   const a=Math.random()<.82?pickPlayer(aPool,{ATT:3,MID:4,DEF:1.2,GK:.2}):null;
   const minute=matchMinute(usedMinutes);usedMinutes.push(minute);
   score[0]++;
   homeScorers.push({player:p,assist:a,minute});
   add(minute,"goal",`${p.name} scores for ${r.home}${a?` after a pass from ${a.name}`:""}.`,r.home,p);
 }
 for(let i=0;i<r.ag;i++){
   const p=pickPlayer(awayXI,{ATT:5,MID:3,DEF:1.5,GK:.2})||awayXI[0];
   const aPool=awayXI.filter(x=>x&&x.id!==p.id);
   const a=Math.random()<.82?pickPlayer(aPool,{ATT:3,MID:4,DEF:1.2,GK:.2}):null;
   const minute=matchMinute(usedMinutes);usedMinutes.push(minute);
   score[1]++;
   awayScorers.push({player:p,assist:a,minute});
   add(minute,"goal",`${p.name} scores for ${r.away}${a?` after a pass from ${a.name}`:""}.`,r.away,p);
 }

 // 2–5 cards, weighted toward midfield/defenders.
 const cardCount=Math.max(0,Math.min(6,Math.floor(Math.random()*4)+referee.strictness));
 const allPlayers=[...homeXI,...awayXI];
 for(let i=0;i<cardCount;i++){
   const p=pickPlayer(allPlayers,{ATT:.7,MID:2.2,DEF:2.8,GK:.5}); if(!p)continue;
   const team=homeXI.some(x=>x.id===p.id)?r.home:r.away;
   const minute=matchMinute(usedMinutes);usedMinutes.push(minute);
   const straightRed=Math.random()<(.035+Math.max(0,referee.strictness)*.035);
   add(minute,straightRed?"red":"yellow",
     straightRed?`${p.name} is sent off after a serious challenge.`:`${p.name} is booked.`,
     team,p);
 }

 // Match texture: chances, saves and pressure events.
 const texture=5+Math.floor(Math.random()*6);
 for(let i=0;i<texture;i++){
   const minute=matchMinute(usedMinutes);usedMinutes.push(minute);
   const homeEvent=Math.random()<.5;
   const team=homeEvent?r.home:r.away;
   const lineup=homeEvent?homeXI:awayXI;
   const attacker=pickPlayer(lineup,{ATT:5,MID:3,DEF:1,GK:.2});
   const keeperLineup=homeEvent?awayXI:homeXI;
   const keeper=keeperLineup.find(p=>p.pos==="GK")||keeperLineup.find(p=>p.pos==="DEF");
   const roll=Math.random();
   if(roll<.45){
     add(minute,"chance",`${attacker?.name||"The attack"} creates a dangerous chance for ${team}.`,team,attacker);
   }else if(roll<.70){
     add(minute,"shot",`${attacker?.name||"The attacker"} fires just wide.`,team,attacker);
   }else{
     add(minute,"save",`${keeper?.name||"The goalkeeper"} makes a good save to keep ${team===r.home?r.away:r.home} in the match.`,team,keeper);
   }
 }

 // Halftime / full-time markers.
 add(45,"half","Half-time.",null,null);
 add(90,"full",`Full-time: ${r.home} ${r.hg}–${r.ag} ${r.away}.`,null,null);
 events.sort((a,b)=>a.minute-b.minute || (a.type==="half"?-1:a.type==="full"?1:0));

 const shotsHome=Math.max(r.hg+2,Math.floor(7+Math.random()*9));
 const shotsAway=Math.max(r.ag+2,Math.floor(7+Math.random()*9));
 const onHome=Math.min(shotsHome,Math.max(r.hg,Math.floor(2+Math.random()*5)));
 const onAway=Math.min(shotsAway,Math.max(r.ag,Math.floor(2+Math.random()*5)));
 return {
   ...r,
   referee:referee.name,
   refereeProfile:referee.id,
   events,
   homeScorers,awayScorers,
   stats:{
     possession:[Math.max(35,Math.min(65,50+Math.floor(Math.random()*13)-6)),0],
     shots:[shotsHome,shotsAway],
     shotsOnTarget:[onHome,onAway],
     corners:[Math.floor(Math.random()*8),Math.floor(Math.random()*8)]
   }
 };
}
function updatePlayerStatsFromReport(report,competition="league"){
 const sides=[[report.home,lineupForStats(report.home),report.homeScorers,report.ag],[report.away,lineupForStats(report.away),report.awayScorers,report.hg]];
 sides.forEach(([club,lineup,scorers,conceded])=>{
   if(!lineup.length)return;
   const appearanceRows=Array.isArray(report.appearances?.[club])?report.appearances[club].map(x=>typeof x==="string"?{player:lineup.find(p=>p.id===x),minutes:90,starts:true}:x).filter(x=>x.player):lineup.map(player=>({player,minutes:90,starts:true}));
   appearanceRows.forEach(({player,minutes,starts})=>{
     const k=statKey(club,player,competition);if(!state.playerStats[k])state.playerStats[k]=blankPlayerStat(club,player,competition);
     state.playerStats[k].apps++;if(starts)state.playerStats[k].starts++;state.playerStats[k].minutes+=Number(minutes||90);
   });
   scorers.forEach(x=>{
     const k=statKey(club,x.player,competition);if(!state.playerStats[k])state.playerStats[k]=blankPlayerStat(club,x.player,competition);
     state.playerStats[k].goals++;
     if(x.assist){
       const ak=statKey(club,x.assist,competition);if(!state.playerStats[ak])state.playerStats[ak]=blankPlayerStat(club,x.assist,competition);
       state.playerStats[ak].assists++;
     }
   });
   if(conceded===0)lineup.filter(p=>p.pos==="GK"||p.pos==="DEF").forEach(p=>{
     const k=statKey(club,p,competition);if(!state.playerStats[k])state.playerStats[k]=blankPlayerStat(club,p,competition);
     state.playerStats[k].cleanSheets++;
   });
 });
 report.events.forEach(e=>{
   if(!e.player||!e.team||!["yellow","red"].includes(e.type))return;
   const p=(e.team===state.club?state.players:state.clubSquads[e.team]||[]).find(x=>x.name===e.player);
   if(!p)return;
   const k=statKey(e.team,p,competition);if(!state.playerStats[k])state.playerStats[k]=blankPlayerStat(e.team,p,competition);
   if(e.type==="yellow")state.playerStats[k].yellows++;
   else state.playerStats[k].reds++;
 });
}
function updateTeamPlayerStats(club,goals,conceded,competition="league"){
 // Used for simulated AI league matches and cup matches; stats are kept separate by competition.
 const lineup=lineupForStats(club);if(!lineup.length)return [];
 lineup.forEach(p=>{const k=statKey(club,p,competition);if(!state.playerStats[k])state.playerStats[k]=blankPlayerStat(club,p,competition);const st=state.playerStats[k];st.apps++;st.starts++;st.minutes+=90;});
 const scorers=[];for(let i=0;i<goals;i++){const scorer=weightedPlayer(lineup);if(!scorer)continue;const st=state.playerStats[statKey(club,scorer,competition)];st.goals++;scorers.push(scorer);const assistPool=lineup.filter(p=>p.id!==scorer.id);if(assistPool.length&&Math.random()<.82){const assister=weightedPlayer(assistPool);if(assister)state.playerStats[statKey(club,assister,competition)].assists++}}
 if(conceded===0)lineup.filter(p=>p.pos==="GK"||p.pos==="DEF").forEach(p=>state.playerStats[statKey(club,p,competition)].cleanSheets++);
 return scorers;
}
function updatePlayerStatsForResult(r,competition="league"){updateTeamPlayerStats(r.home,r.hg,r.ag,competition);updateTeamPlayerStats(r.away,r.ag,r.hg,competition)}
function playerStatsPage(){
 initPlayerStats();
 const competition=state.statsCompetition||"league";
 const all=Object.values(state.playerStats).filter(x=>competition==="all"||x.competition===competition);
 const aggregate=list=>{const grouped={};list.forEach(x=>{const k=`${x.club}::${x.id}`;if(!grouped[k])grouped[k]={...x,apps:0,starts:0,goals:0,assists:0,cleanSheets:0,minutes:0,yellows:0,reds:0};["apps","starts","goals","assists","cleanSheets","minutes","yellows","reds"].forEach(f=>grouped[k][f]+=Number(x[f]||0));});return Object.values(grouped)};
 const rows=aggregate(all);
 const mine=rows.filter(x=>x.club===state.club).sort((a,b)=>b.goals-a.goals||b.assists-a.assists||b.apps-a.apps);
 const scorers=rows.sort((a,b)=>b.goals-a.goals||b.assists-a.assists||b.apps-a.apps).slice(0,10);
 const label=competition==="league"?"League":competition==="cup"?"Kup BiH":"All competitions";
 document.getElementById("app").innerHTML=`<div class="card"><h2>Player Stats</h2><p class="sub">${currentSeasonLabel()} season • Statistics are separated by competition.</p><div class="row"><label for="statsCompetition">Competition</label><select id="statsCompetition" onchange="state.statsCompetition=this.value;save();render()"><option value="league" ${competition==="league"?"selected":""}>League</option><option value="cup" ${competition==="cup"?"selected":""}>Kup BiH</option><option value="all" ${competition==="all"?"selected":""}>All competitions</option></select></div></div><div class="card"><h3>${state.club} — ${label}</h3><div style="overflow:auto"><table style="width:100%;border-collapse:collapse;font-size:12px"><thead><tr><th style="text-align:left">Player</th><th>Pos</th><th>App</th><th>G</th><th>A</th><th>CS</th><th>Min</th><th>YC</th><th>RC</th></tr></thead><tbody>${mine.map(p=>`<tr style="border-top:1px solid var(--line)"><td style="padding:8px 3px;text-align:left"><b>${p.name}</b></td><td>${p.pos}</td><td>${p.apps}</td><td>${p.goals}</td><td>${p.assists}</td><td>${p.cleanSheets}</td><td>${p.minutes}</td><td>${p.yellows}</td><td>${p.reds}</td></tr>`).join("")||'<tr><td colspan="9" class="sub" style="padding:10px">No statistics recorded for this competition yet.</td></tr>'}</tbody></table></div></div><div class="card"><h3>${label} Top Scorers</h3>${scorers.map((p,i)=>`<div class="row" style="padding:7px 0;border-bottom:1px solid var(--line)"><span>${i+1}. ${p.name}<br><span class="sub">${p.club}</span></span><b>${p.goals} G • ${p.assists} A</b></div>`).join("")||'<div class="sub">No statistics recorded yet.</div>'}</div>`;
}
function remapMatchSegment(report,startMinute,endMinute,markerType){
 const span=endMinute-startMinute+1;
 const mapMinute=m=>startMinute+Math.min(span-1,Math.max(0,Math.floor((Math.max(1,Math.min(90,m))-1)/90*span)));
 report.events=report.events.filter(e=>e.type!="half"&&e.type!="full").map(e=>({...e,minute:mapMinute(e.minute)}));
 report.homeScorers=report.homeScorers.map(x=>({...x,minute:mapMinute(x.minute)}));
 report.awayScorers=report.awayScorers.map(x=>({...x,minute:mapMinute(x.minute)}));
 if(markerType==="half")report.events.push({minute:45,type:"half",text:"Half-time. The manager can now adjust the team.",team:null,player:null});
 if(markerType==="full")report.events.push({minute:90,type:"full",text:`Full-time: ${report.home} ${report.hg}–${report.ag} ${report.away}.`,team:null,player:null});
 report.events.sort((a,b)=>a.minute-b.minute||(a.type==="half"?-1:a.type==="full"?1:0));
 return report;
}
function combineMatchSegments(first,second,finalHome,finalAway){
 const events=[...first.events.filter(e=>e.type!=="half"&&e.type!=="full"),...second.events.filter(e=>e.type!=="half"&&e.type!=="full")];
 events.push({minute:45,type:"half",text:"Half-time: tactical changes applied.",team:null,player:null},{minute:90,type:"full",text:`Full-time: ${first.home} ${finalHome}–${finalAway} ${first.away}.`,team:null,player:null});
 events.sort((a,b)=>a.minute-b.minute||(a.type==="half"?-1:a.type==="full"?1:0));
 const addPair=(a,b)=>[a[0]+b[0],a[1]+b[1]];
 const possession=[Math.round((first.stats.possession[0]+second.stats.possession[0])/2),0];possession[1]=100-possession[0];
 return {...first,hg:finalHome,ag:finalAway,events,homeScorers:[...first.homeScorers,...second.homeScorers],awayScorers:[...first.awayScorers,...second.awayScorers],stats:{possession,shots:addPair(first.stats.shots,second.stats.shots),shotsOnTarget:addPair(first.stats.shotsOnTarget,second.stats.shotsOnTarget),corners:addPair(first.stats.corners,second.stats.corners)}};
}
function liveMatchEvents(pending){return pending.phase==="first"?pending.firstHalf?.events||[]:pending.secondHalf?.events||[]}
function scheduleLiveMatchEvent(){
 const pending=state.pendingMatch,pb=pending?.playback;
 if(pb?.goalOverlay){pb.goalOverlay=null;pb.paused=false;}
 if(matchPlaybackTimer!==null||state.tab!=="Match Report"||!pb||pb.paused||!(["first","second"].includes(pending.phase)))return;
 const event=liveMatchEvents(pending)[pb.index];
 const delay=event?.type==="goal"?2600:event?.type==="half"?900:1400;
 matchPlaybackTimer=setTimeout(()=>{matchPlaybackTimer=null;if(state.tab==="Match Report")advanceLiveMatchEvent()},delay);
}
function advanceLiveMatchEvent(){
 const pending=state.pendingMatch,pb=pending?.playback;
 if(!pending||!pb||!(["first","second"].includes(pending.phase)))return;
 pb.goalOverlay=null;
 const event=liveMatchEvents(pending)[pb.index];
 if(!event){if(pending.phase==="first"){pending.phase="halftime";pb.paused=true;}else completePendingMatch();save();render();return;}
 pb.index++;pb.shown=Array.isArray(pb.shown)?pb.shown:[];pb.shown.push(event);
 if(event.type==="goal"){
  const side=event.team===pending.fixture.home?0:1;pb.score=Array.isArray(pb.score)?pb.score:[0,0];pb.score[side]++;
  pb.goalOverlay=null;
 }
 if(event.type==="half"){pending.phase="halftime";pb.paused=true;}
 save();render();
}
function toggleLiveMatchPlayback(){
 const pb=state.pendingMatch?.playback;if(!pb)return;
 if(pb.paused){pb.paused=false;scheduleLiveMatchEvent();}
 else{if(matchPlaybackTimer!==null){clearTimeout(matchPlaybackTimer);matchPlaybackTimer=null;}pb.paused=true;}
 save();render();
}
function liveEventIcon(type){return type==="goal"?"⚽":type==="yellow"?"🟨":type==="red"?"🟥":type==="save"?"🧤":type==="chance"?"🔥":type==="shot"?"🎯":type==="half"?"⏸️":type==="full"?"🏁":"•"}
function playMatch(){
 if(state.managerFired){state.tab="Jobs";state.jobNotice=`You were dismissed by ${state.club}. Apply for another club to continue your career.`;save();render();return;}
 if(state.pendingMatch){state.tab="Match Report";render();return;}
 ensureSeasonReady();
 const total=seasonMatchdays();if(state.matchday>=total)return;
 normalizeXI();
 const activeSnap=ensureCompetitionSnapshot(state.league);
 if(activeSnap){state.matchday=activeSnap.matchday;state.fixtures=activeSnap.fixtures;state.table=activeSnap.table;state.results=activeSnap.results;}
 const round=fixtureForRound(state.matchday),my=round.find(x=>x.home===state.club||x.away===state.club);if(!my){state.jobNotice="No fixture was found for this matchday. Your saved league schedule was preserved.";save();render();return;}
 const referee=assignReferee(),results=round.map(f=>simulateFixture(f,f.home===my.home&&f.away===my.away?referee:assignReferee())),idx=results.findIndex(r=>r.home===my.home&&r.away===my.away);
 const starters=state.xi.map(id=>state.players.find(p=>p.id===id)).filter(Boolean);
 const avg=starters.length?starters.reduce((a,p)=>a+p.ovr,0)/starters.length:teamRating(state.club);
 const xg=expectedGoalsForFixture(my.home,my.away,referee),squadFactor=Math.max(.9,Math.min(1.1,1+(avg-teamRating(state.club))*.012));
 const homeIsUser=my.home===state.club,homeTactic=homeIsUser?tacticGoalMultiplier(state.mentality):1,awayTactic=!homeIsUser?tacticGoalMultiplier(state.mentality):1;
 const homeFirst=Math.min(poissonish(xg.home*.46*(homeIsUser?squadFactor:1)*homeTactic),4),awayFirst=Math.min(poissonish(xg.away*.46*(!homeIsUser?squadFactor:1)*awayTactic),4);
 const firstRaw=generateMatchReport({home:my.home,away:my.away,hg:homeFirst,ag:awayFirst},referee);
 const first=remapMatchSegment(firstRaw,1,45,"half");
 results[idx]={home:my.home,away:my.away,hg:homeFirst,ag:awayFirst};
 state.pendingMatch={results,roundIndex:idx,fixture:{...my},firstHalf:first,referee,startingXI:state.xi.map(id=>state.players.find(p=>p.id===id)).filter(Boolean).map(p=>({...p})),startedMatchday:state.matchday,phase:"first",playback:{segment:"first",index:0,shown:[],score:[0,0],goalOverlay:null,paused:false},secondHalfChoices:{tactic:"Attacking",talk:"Encourage",substitution:"none"}};
 state.lastMatch={...first,hg:homeFirst,ag:awayFirst,halfTime:true};
 state.tab="Match Report";save();render();
}
function resumeSecondHalf(){
 const pending=state.pendingMatch;if(!pending)return;
 const choices=pending.secondHalfChoices||{tactic:"Attacking",talk:"Encourage",substitution:"none"};
 const fixture=pending.fixture,first=pending.firstHalf;
 state.mentality=choices.tactic||"Attacking";
 let substitutionText="No substitutions at half-time.";
 if(choices.substitution&&choices.substitution!=="none"){
   normalizeXI();
   const starters=state.xi.map(id=>state.players.find(p=>p.id===id)).filter(Boolean);
   const bench=state.players.filter(p=>!state.xi.includes(p.id));
   let outgoing=null;
   if(choices.substitution==="attacking")outgoing=starters.filter(p=>p.pos==="DEF"||p.pos==="MID").sort((a,b)=>a.ovr-b.ovr)[0]||starters.sort((a,b)=>a.ovr-b.ovr)[0];
   else outgoing=starters.slice().sort((a,b)=>a.ovr-b.ovr)[0];
   const incoming=choices.substitution==="attacking"?(bench.filter(p=>p.pos==="ATT"||p.pos==="MID").sort((a,b)=>b.ovr-a.ovr)[0]||bench.sort((a,b)=>b.ovr-a.ovr)[0]):bench.slice().sort((a,b)=>b.ovr-a.ovr)[0];
   if(outgoing&&incoming){const slot=state.xi.indexOf(outgoing.id);if(slot>=0)state.xi[slot]=incoming.id;substitutionText=`${incoming.name} replaces ${outgoing.name} at half-time.`;}
   else substitutionText="No suitable substitute was available; the starting XI remains unchanged.";
 }
 const starters=state.xi.map(id=>state.players.find(p=>p.id===id)).filter(Boolean);
 const avg=starters.length?starters.reduce((a,p)=>a+p.ovr,0)/starters.length:teamRating(state.club);
 const referee=pending.referee||assignReferee();
 const xg=expectedGoalsForFixture(fixture.home,fixture.away,referee),squadFactor=Math.max(.9,Math.min(1.1,1+(avg-teamRating(state.club))*.012));
 const tacticFactor=tacticGoalMultiplier(state.mentality);
 const talkFactor=choices.talk==="Encourage"?1.045:choices.talk==="Demand more"?1.035:choices.talk==="Calm down"?.99:1;
 const subFactor=substitutionText.includes("replaces")?1.025:1;
 const homeIsUser=fixture.home===state.club;
 const homeSecond=Math.min(poissonish(xg.home*.54*(homeIsUser?squadFactor*tacticFactor*talkFactor*subFactor:1)),4);
 const awaySecond=Math.min(poissonish(xg.away*.54*(!homeIsUser?squadFactor*tacticFactor*talkFactor*subFactor:1)),4);
 const secondRaw=generateMatchReport({home:fixture.home,away:fixture.away,hg:homeSecond,ag:awaySecond},referee);
 const second=remapMatchSegment(secondRaw,46,90,"full");
 const finalHome=first.hg+homeSecond,finalAway=first.ag+awaySecond;
 const report=combineMatchSegments(first,second,finalHome,finalAway);
 report.events.push({minute:46,type:"tactic",text:`Second-half plan: ${state.mentality}. Team talk: ${choices.talk}. ${substitutionText}`,team:state.club,player:null});
 report.events.sort((a,b)=>a.minute-b.minute||(a.type==="half"?-1:a.type==="full"?1:0));
 report.stats.shotsOnTarget[0]=Math.max(report.stats.shotsOnTarget[0],finalHome);report.stats.shotsOnTarget[1]=Math.max(report.stats.shotsOnTarget[1],finalAway);
 const roundResults=pending.results;roundResults[pending.roundIndex]={home:fixture.home,away:fixture.away,hg:finalHome,ag:finalAway};
 // Track a real half-time substitution as 45 minutes for the outgoing player and 45 for the incoming player.
 const initialXI=pending.startingXI||[],finalXI=state.xi.map(id=>state.players.find(p=>p.id===id)).filter(Boolean);
 const appearanceMap={};
 const userApps=[];
 initialXI.forEach(p=>{const stillOn=finalXI.some(x=>x.id===p.id);userApps.push({player:p,minutes:stillOn?90:45,starts:true});});
 finalXI.forEach(p=>{if(!initialXI.some(x=>x.id===p.id))userApps.push({player:p,minutes:45,starts:false});});
 appearanceMap[state.club]=userApps;
 report.appearances=appearanceMap;
 pending.secondHalf=second;pending.finalReport=report;pending.phase="second";
 pending.playback={segment:"second",index:0,shown:[],score:[first.hg,first.ag],goalOverlay:null,paused:false};
 state.pendingMatch=pending;state.lastMatch={...first,hg:first.hg,ag:first.ag,halfTime:true};
 state.tab="Match Report";save();render();
}
function completePendingMatch(){
 const pending=state.pendingMatch;if(!pending||!pending.finalReport)return;
 const report=pending.finalReport,fixture=pending.fixture;
 const finalHome=report.hg,finalAway=report.ag;
 // Only commit the matchday after the manager completes the second half.
 updatePlayerStatsFromReport(report);
 const roundResults=pending.results;
 roundResults.forEach((x,i)=>{if(i!==pending.roundIndex)updatePlayerStatsForResult(x);applyResult(x)});
 state.results.push(roundResults);state.lastMatch=report;state.pendingMatch=null;state.matchday++;
 advanceOtherLeaguesOneRound(state.league);
 if(transferStatus().type==="mid")runAITransferTick("mid");
 saveActiveCompetition();
 const myGoals=fixture.home===state.club?finalHome:finalAway,oppGoals=fixture.home===state.club?finalAway:finalHome;
 state.played++;recordManagerResult(myGoals,oppGoals);
 const row=state.table[state.club];state.points=row?row.pts:state.points;state.wins=row?row.w:state.wins;state.draws=row?row.d:state.draws;state.losses=row?row.l:state.losses;state.jobBoardMD=-1;
 if(state.matchday>=seasonMatchdays()){save();finishSeason();return;}
 save();state.tab="Match Report";render();
}
function matchReportPage(){
 if(state.pendingMatch){
  const p=state.pendingMatch,m=p.firstHalf,choices=p.secondHalfChoices||(p.secondHalfChoices={tactic:"Attacking",talk:"Encourage",substitution:"none"});
  if(!p.phase)p.phase="halftime"; // Older saves paused here before live playback was introduced.
  if(["first","second"].includes(p.phase)){
   const pb=p.playback||(p.playback={segment:p.phase,index:0,shown:[],score:p.phase==="second"?[m.hg,m.ag]:[0,0],goalOverlay:null,paused:false});
   const events=(pb.shown||[]).map(e=>`<div class="live-event"><b class="live-minute">${e.minute}'</b><span class="live-icon">${liveEventIcon(e.type)}</span><span>${e.text}</span></div>`).join("");
   const segment=p.phase==="first"?"First half":"Second half";
   document.getElementById("app").innerHTML=`<div class="card"><div class="sub">${state.league} • Matchday ${state.matchday+1} • ${segment}</div><h2 class="live-score">${p.fixture.home} <span>${pb.score?.[0]||0} – ${pb.score?.[1]||0}</span> ${p.fixture.away}</h2></div><div class="card"><div class="row"><h3>Live commentary</h3><span class="sub">Events play automatically</span></div><div id="liveEventFeed" class="live-feed" aria-live="polite">${events||'<div class="sub" style="padding:12px 0">Kick-off. The teams are settling into the match.</div>'}</div><div class="live-controls"><button onclick="toggleLiveMatchPlayback()">${pb.paused?"Resume":"Pause"}</button></div></div>`;
   const feed=document.getElementById("liveEventFeed");if(feed)feed.scrollTop=feed.scrollHeight;
   return;
  }
  const shown=p.playback?.shown;
  const halfEvents=(Array.isArray(shown)&&shown.length?shown:m.events).map(e=>`<div class="live-event"><b class="live-minute">${e.minute}'</b><span class="live-icon">${liveEventIcon(e.type)}</span><span>${e.text}</span></div>`).join("");
  document.getElementById("app").innerHTML=`<div class="card"><div class="sub">${state.league} • Matchday ${state.matchday+1}</div><h2 style="text-align:center">HALF-TIME</h2><h2 style="text-align:center;margin:8px 0">${m.home} <span style="margin:0 12px">${m.hg}–${m.ag}</span> ${m.away}</h2><div class="notice">Referee: <b>${refereeSummary(m)}</b><div class="sub">The game profile affects goal rates and disciplinary decisions. It is simulated and does not describe the named official's real style.</div></div></div><div class="card"><h3>First-half commentary</h3><div class="live-feed" aria-live="polite">${halfEvents}</div></div><div class="card"><h3>Second-half tactics</h3><label>Team mentality</label><select id="htTactic" style="width:100%;margin:6px 0 12px"><option ${choices.tactic==="Ultra Defensive"?"selected":""}>Ultra Defensive</option><option ${choices.tactic==="Defensive"?"selected":""}>Defensive</option><option ${choices.tactic==="Balanced"?"selected":""}>Balanced</option><option ${choices.tactic==="Counter-Attack"?"selected":""}>Counter-Attack</option><option ${choices.tactic==="Tiki-Taka"?"selected":""}>Tiki-Taka</option><option ${choices.tactic==="Attacking"?"selected":""}>Attacking</option></select><label>Team talk</label><select id="htTalk" style="width:100%;margin:6px 0 12px"><option ${choices.talk==="Encourage"?"selected":""}>Encourage</option><option ${choices.talk==="Demand more"?"selected":""}>Demand more</option><option ${choices.talk==="Calm down"?"selected":""}>Calm down</option></select><label>Half-time substitution</label><select id="htSub" style="width:100%;margin:6px 0 12px"><option value="none" ${choices.substitution==="none"?"selected":""}>No substitution</option><option value="fresh" ${choices.substitution==="fresh"?"selected":""}>Replace lowest-rated starter with best available substitute</option><option value="attacking" ${choices.substitution==="attacking"?"selected":""}>Make an attacking change</option></select><button class="primary" style="width:100%" onclick="saveHalfTimeChoicesAndResume()">Apply changes & start second-half commentary</button><p class="sub">Your choices affect the second-half simulation. The matchday and league table are not committed until full-time.</p></div>`;return;
 }
 const m=state.lastMatch;
 if(!m){document.getElementById("app").innerHTML='<div class="card"><h2>Match Report</h2><div class="sub">Play a match to generate a detailed match report.</div></div>';return}
 const isHome=m.home===state.club, myScore=isHome?m.hg:m.ag, oppScore=isHome?m.ag:m.hg;
 const events=m.events.map(e=>{
   const label=e.minute===45?"45'":e.minute===90?"90'":`${e.minute}'`;
   const icon=e.type==="goal"?"⚽":e.type==="yellow"?"🟨":e.type==="red"?"🟥":e.type==="save"?"🧤":e.type==="chance"?"🔥":e.type==="shot"?"🎯":e.type==="half"?"⏸️":"🏁";
   return `<div class="row" style="padding:9px 0;border-bottom:1px solid var(--line);align-items:flex-start"><b style="min-width:42px">${label}</b><span>${icon} ${e.text}</span></div>`;
 }).join("");
 const sh=m.stats;
 const homePoss=sh.possession[0], awayPoss=100-homePoss;
 document.getElementById("app").innerHTML=`
 <div class="card"><div class="sub">${state.league} • Matchday ${state.matchday}</div>
 <h2 style="text-align:center;margin:8px 0">${m.home} <span style="margin:0 12px">${m.hg}–${m.ag}</span> ${m.away}</h2>
 <p style="text-align:center" class="sub">${myScore>oppScore?"🏆 Victory":myScore<oppScore?"Defeat":"Draw"} • ${state.mentality}</p><div class="notice">Referee: <b>${refereeSummary(m)}</b><div class="sub">The game profile affected goal rates and disciplinary decisions. It is simulated and does not describe the named official's real style.</div></div></div>
 <div class="card"><h3>Match timeline</h3>${events}</div>
 <div class="card"><h3>Match statistics</h3>
 <div class="row"><span>Possession</span><b>${homePoss}% — ${awayPoss}%</b></div>
 <div class="row"><span>Shots</span><b>${sh.shots[0]} — ${sh.shots[1]}</b></div>
 <div class="row"><span>Shots on target</span><b>${sh.shotsOnTarget[0]} — ${sh.shotsOnTarget[1]}</b></div>
 <div class="row"><span>Corners</span><b>${sh.corners[0]} — ${sh.corners[1]}</b></div></div>
 <div class="card"><h3>Scorers</h3>
 ${[...m.homeScorers.map(x=>`<div class="row"><span>${x.minute}' ${x.player.name}</span><span>${m.home}</span></div>`),...m.awayScorers.map(x=>`<div class="row"><span>${x.minute}' ${x.player.name}</span><span>${m.away}</span></div>`)].join("")||'<div class="sub">No goals.</div>'}</div>
 <div class="card"><button class="primary" onclick="state.tab='Home';save();render()">Continue</button> <button onclick="state.tab='Results';save();render()">View results</button></div>`;
}
function saveHalfTimeChoicesAndResume(){
 if(!state.pendingMatch)return;
 state.pendingMatch.secondHalfChoices={tactic:document.getElementById("htTactic")?.value||"Attacking",talk:document.getElementById("htTalk")?.value||"Encourage",substitution:document.getElementById("htSub")?.value||"none"};
 save();resumeSecondHalf();
}
function squad(){
 if(!state.players.length)initClub(); normalizeXI();
 let formation=formations[state.formation],mapped=formation.map((slot,i)=>({slot,p:state.players.find(p=>p.id===state.xi[i])||null}));
 const bench=state.players.filter(p=>!state.xi.includes(p.id));
 const sourceLabel=p=>p.rosterSource==="match-sheet"?"Match sheet":p.rosterSource==="public-roster"?"Public roster":p.rosterSource==="generated"?"Generated depth":"Seeded roster";
 const playerList=(list,showSell=false)=>`<div class="list">${list.map(p=>`<div class="player"><span>${p.name}<br><span class="sub">${p.pos} • ${p.age} yrs • ${sourceLabel(p)}</span></span><b>${p.ovr}</b>${showSell?`<button class="danger" onclick="sellPlayer(decodeURIComponent('${encodeURIComponent(String(p.id))}'))" ${state.players.length<=11?"disabled":""}>Sell</button>`:""}</div>`).join("")}</div>`;
 document.getElementById("app").innerHTML=`<div class="card"><div class="row"><div><h2>Squad & Tactics</h2><div class="sub">${state.club} • Squad OVR ${squadRating()}</div>${squadSourceNote()}</div><select onchange="changeFormation(this.value)">${Object.keys(formations).map(f=>`<option ${f===state.formation?'selected':''}>${f}</option>`).join("")}</select></div></div><div class="pitch">${mapped.map(m=>`<div class="mark" style="left:${m.slot[1]}%;top:${m.slot[2]}%"><div class="shirt">${m.p?m.p.pos:"?"}</div><div class="small">${m.p?m.p.name:"Empty"}</div></div>`).join("")}</div><div class="card"><div class="row"><h3>Starting XI</h3><select onchange="state.mentality=this.value;save()"><option ${state.mentality==="Ultra Defensive"?"selected":""}>Ultra Defensive</option><option ${state.mentality==="Defensive"?"selected":""}>Defensive</option><option ${state.mentality==="Balanced"?"selected":""}>Balanced</option><option ${state.mentality==="Counter-Attack"?"selected":""}>Counter-Attack</option><option ${state.mentality==="Tiki-Taka"?"selected":""}>Tiki-Taka</option><option ${state.mentality==="Attacking"?"selected":""}>Attacking</option></select></div>${mapped.map((m,i)=>`<div class="row" style="padding:7px 0;border-bottom:1px solid var(--line)"><span>${m.slot[0]}</span><select onchange="replaceXI(${i},this.value)">${state.players.map(p=>`<option value="${p.id}" ${m.p&&p.id===m.p.id?'selected':''}>${p.name} • ${p.ovr}</option>`).join("")}</select></div>`).join("")}</div><div class="card"><h3>Bench (${bench.length})</h3>${bench.length?playerList(bench):'<div class="notice">No additional squad players are loaded for this club yet.</div>'}</div><div class="card"><h3>Squad</h3>${playerList(state.players,true)}</div>`}
function changeFormation(f){state.formation=f;normalizeXI();save();render()}
function replaceXI(i,id){
 normalizeXI(); id=String(id);
 const current=state.xi[i], other=state.xi.indexOf(id);
 if(other>=0 && other!==i){state.xi[other]=current;state.xi[i]=id}
 else if(state.players.some(p=>p.id===id)){state.xi[i]=id}
 normalizeXI();save();render()
}
function resultsPage(){
 const rounds=state.results.slice().reverse();
 document.getElementById("app").innerHTML=`<div class="card"><h2>Matchday Results</h2><p class="sub">All completed league matchdays. Your club is highlighted.</p></div>${rounds.length?rounds.map((rs,ri)=>{const md=state.results.length-ri;return `<div class="card"><h3>Matchday ${md}</h3>${rs.map(r=>`<div class="row" style="padding:8px 0;border-bottom:1px solid var(--line);font-weight:${r.home===state.club||r.away===state.club?'800':'400'}"><span>${r.home}</span><b>${r.hg}–${r.ag}</b><span>${r.away}</span></div>`).join("")}</div>`}).join(""):`<div class="card"><div class="sub">No matchdays played yet.</div></div>`}`
}
function league(){const rows=standings();document.getElementById("app").innerHTML=`<div class="card"><h2>${state.league}</h2><div class="sub">After matchday ${state.matchday}. All fixtures are simulated simultaneously.</div></div><div class="card" style="overflow:auto"><table style="width:100%;border-collapse:collapse;font-size:13px"><thead><tr><th>#</th><th style="text-align:left">Club</th><th>P</th><th>W</th><th>D</th><th>L</th><th>GD</th><th>Pts</th></tr></thead><tbody>${rows.map((r,i)=>`<tr style="border-top:1px solid var(--line);${r.club===state.club?'font-weight:800':''}"><td style="padding:8px 4px">${i+1}</td><td style="padding:8px 4px;text-align:left">${r.club}</td><td>${r.p}</td><td>${r.w}</td><td>${r.d}</td><td>${r.l}</td><td>${r.gf-r.ga}</td><td>${r.pts}</td></tr>`).join("")}</tbody></table></div><div class="card"><h3>Recent results</h3>${latestRoundHTML()}</div>`}
function cupClubs(){return shuffle(["FK Sarajevo","FK Željezničar","FK Borac Banja Luka","HŠK Zrinjski Mostar","FK Velež Mostar","NK Široki Brijeg","FK Sloga Doboj","FK Radnik Bijeljina","NK Čelik Zenica","BSK Banja Luka","NK Bratstvo Gračanica","FK Igman Konjic","HNK Čapljina","FK Rudar Kakanj","NK Vitez","HNK Tomislav","FK Budućnost Banovići","NK TOŠK Tešanj","NK Zvijezda Gradačac","FK Radnik Hadžići","NK GOŠK Gabela","FK Sloboda Tuzla","NK Travnik","NK Jedinstvo Bihać","NK Stupčanica Olovo","HŠK Posušje","FK Mladost Doboj Kakanj","FK Goražde","NK Vis Simm-Bau","NK Gradina Srebrenik","FK Tuzla City","FK Rudar Prijedor"])}
function initCup(){if(state.cup&&state.cup.season===state.season)return;let clubs=cupClubs();state.cup={season:state.season,round:1,roundName:"Round of 32",pending:clubs.map((c,i)=>({home:c,away:clubs[i^1]})).filter((x,i,a)=>i%2===0),results:[],winner:null,played:false,rewardMoney:0};}
function cupCurrentFixture(){initCup();return state.cup.pending.find(f=>f.home===state.club||f.away===state.club)||null}
function cupRoundName(r){return ["","Round of 32","Round of 16","Quarter-final","Semi-final","Final"][r]||"Cup"}
function simulateCupGame(f){const referee=assignReferee(),xg=expectedGoalsForFixture(f.home,f.away,referee);let hg=Math.min(poissonish(xg.home),6),ag=Math.min(poissonish(xg.away),6);if(hg===ag){if(Math.random()<teamRating(f.home)/(teamRating(f.home)+teamRating(f.away)))hg++;else ag++;}return{...f,hg,ag,referee:referee.name,refereeProfile:referee.id};}
function playCup(){if(state.managerFired){state.tab="Jobs";state.jobNotice=`You were dismissed by ${state.club}. Apply for another club to continue your career.`;save();render();return;}initCup();const f=cupCurrentFixture();if(!f){alert("Your club has no cup match in this round.");return;}let games=state.cup.pending.map(x=>simulateCupGame(x));games.forEach(r=>updatePlayerStatsForResult(r,"cup"));state.cup.results.push(games);let winners=games.map(r=>r.hg>r.ag?r.home:r.away);let userResult=games.find(r=>r.home===state.club||r.away===state.club);if(userResult){const my=userResult.home===state.club?userResult.hg:userResult.ag,opp=userResult.home===state.club?userResult.ag:userResult.hg;state.rep=Math.max(0,state.rep+(my>opp?2:my===opp?0:-1)); if(my>opp){const prize=cupRewardForRound(state.cup.round); state.balance+=prize; state.cup.rewardMoney=(state.cup.rewardMoney||0)+prize;}}if(winners.length===1){state.cup.winner=winners[0];state.cup.pending=[];state.cup.round=5; if(winners[0]===state.club){state.balance+=100000;state.cup.rewardMoney=(state.cup.rewardMoney||0)+100000;addAchievement("cup-win","Kup BiH Winners",`${state.club} won Kup BiH.`,"🏆",{season:state.season,club:state.club});showCelebration("cup-win","Kup BiH Winners!",`${state.club} have won the Kup BiH. Your club receives the winner's bonus!`,"🏆","Cup");}}else{let next=[];for(let i=0;i<winners.length;i+=2)next.push({home:winners[i],away:winners[i+1]});state.cup.pending=next;state.cup.round++;state.cup.roundName=cupRoundName(state.cup.round);}save();render();}
function cup(){initCup();const f=cupCurrentFixture();const last=state.cup.results.length?state.cup.results[state.cup.results.length-1]:[];document.getElementById("app").innerHTML=`<div class="card"><h2>Kup BiH</h2><div class="sub">${state.cup.winner?"Champion: "+state.cup.winner:state.cup.roundName+" • Knockout competition"}</div><div class="sub">Cup earnings: €${(state.cup.rewardMoney||0).toLocaleString()}</div>${f?`<div class="notice"><b>${f.home} vs ${f.away}</b><br>Your cup match is ready.</div><button class="primary" onclick="playCup()">Play cup match</button>`:`<div class="notice">Your club has been eliminated or is awaiting the next draw.</div>`}</div>${last.length?`<div class="card"><h3>Latest cup round</h3>${last.map(r=>`<div class="row" style="padding:7px 0;border-bottom:1px solid var(--line);font-weight:${r.home===state.club||r.away===state.club?'800':'400'}"><span>${r.home}</span><b>${r.hg}–${r.ag}</b><span>${r.away}</span></div>`).join("")}</div>`:""}` }
function jobs(){
 refreshJobBoard(false);
 const offers=Array.isArray(state.jobOffers)?state.jobOffers:[];
 const activeOffers=offers.filter(o=>o.expiresMD>=state.matchday&&o.club!==state.club);
 state.jobOffers=activeOffers;
 document.getElementById("app").innerHTML=`<div class="card"><h2>Jobs</h2><p class="sub">Your reputation: ${state.rep}. Six clubs are shown each matchday; three are normally available and three require higher reputation.</p>
 ${state.jobNotice?`<div class="notice" style="margin:8px 0">${state.jobNotice}</div>`:""}
 ${state.seasonReport?`<div class="notice">Your league season is complete. Continue to the next season before accepting another job.</div>`:""}
 ${activeOffers.length?`<div class="notice"><b>Job offers</b>${activeOffers.map((o,i)=>`<div class="club"><div style="flex:1"><b>${o.club}</b><div class="sub">${o.reason} • Offer expires after matchday ${o.expiresMD}</div></div><button class="primary" onclick="acceptOffer(${i})" ${state.seasonReport?'disabled':''}>Accept offer</button></div>`).join("")}</div>`:""}
 ${state.managerFired?'<div class="notice">You are currently unemployed after being dismissed. Choose an available club below to resume your career.</div>':''}
 ${state.jobBoard.map((j,i)=>{const available=canApplyToJob(j)&&j[0]!==state.club;return `<div class="club"><div class="badge">${i+1}</div><div style="flex:1"><b>${j[0]}</b><div class="sub">Required reputation: ${j[1]} • ${available?'Available now':'Reputation locked'}</div></div><button ${available&&!state.seasonReport?'':'disabled'} onclick="takeJob('${j[0]}')">Apply</button></div>`}).join("")}</div>`
}
function acceptOffer(i){const offer=state.jobOffers[i];if(!offer||offer.expiresMD<state.matchday){state.jobNotice="This job offer has expired.";save();render();return;}takeJob(offer.club,true)}
function saveActiveCompetition(){
 if(!state.league)return;
 state.competitionStates=state.competitionStates||{};
 const previous=state.competitionStates[state.league]||{};
 state.competitionStates[state.league]={season:state.season,matchday:state.matchday,fixtures:JSON.parse(JSON.stringify(state.fixtures||[])),table:JSON.parse(JSON.stringify(state.table||{})),results:JSON.parse(JSON.stringify(state.results||[])),lastMatch:state.lastMatch||previous.lastMatch||null};
 persistLeagueMembership();
}
function loadCompetition(name){
 state.league=name;
 const snap=ensureCompetitionSnapshot(name);
 if(snap){
  state.matchday=snap.matchday;state.fixtures=JSON.parse(JSON.stringify(snap.fixtures));state.table=JSON.parse(JSON.stringify(snap.table||{}));state.results=JSON.parse(JSON.stringify(snap.results||[]));
 }else{state.matchday=0;state.fixtures=[];state.table={};state.results=[];}
 const row=state.table[state.club];state.points=row?.pts||0;state.played=row?.p||0;state.wins=row?.w||0;state.draws=row?.d||0;state.losses=row?.l||0;state.lastMatch=null;
 saveActiveCompetition();
}
function takeJob(c,fromOffer=false){
 const job=allJobTargets().find(j=>j[0]===c);
 const targetLeague=Object.keys(leagues).find(l=>playableClubsForLeague(l).includes(c));
 const activeOffer=(state.jobOffers||[]).find(o=>o.club===c&&o.expiresMD>=state.matchday);
 if(state.seasonReport){state.jobNotice="Your season is complete. Continue to the next season before changing clubs.";save();render();return false;}
 if(!job||!targetLeague||c===state.club){state.jobNotice=c===state.club?"You already manage this club. Choose a different job.":"This job is no longer available. Refresh the Jobs screen and try again.";state.jobBoardMD=-1;save();render();return false;}
 if(!canApplyToJob(job)&&!(fromOffer&&activeOffer)){state.jobNotice="Your reputation is too low for this job.";save();render();return false;}
 syncCurrentClub();saveActiveCompetition();
 state.club=c;state.league=targetLeague;state.managerFired=false;state.lossStreak=0;loadClubSquad(c);state.xi=state.players.slice(0,11).map(p=>p.id);state.jobOffers=[];state.transferOffers=[];
 // Do not reset season or global competition snapshots: restore this club's already-progressed league.
 loadCompetition(targetLeague);state.jobBoard=[];state.jobBoardMD=-1;state.jobNotice=`Job accepted: you are now managing ${c}. The ${currentSeasonLabel()} season and league results have been preserved.`;state.tab="Home";save();render();return true;
}

function acceptAITransferOffer(index){
 const offer=state.transferOffers?.[index];ensureAIBudgets();ensureClubSquads();
 if(!isAITransferOfferActive(offer)){state.jobNotice="That transfer offer has expired.";state.transferOffers=(state.transferOffers||[]).filter((_,i)=>i!==index);save();render();return false;}
 const player=state.players.find(p=>String(p.id)===String(offer.playerId)),buyer=state.clubSquads[offer.to]||[];
 if(!player||buyer.length>=27||Number(state.aiBudgets[offer.to]||0)<offer.fee){state.jobNotice="That club can no longer complete the transfer.";state.transferOffers.splice(index,1);save();render();return false;}
 state.players=state.players.filter(p=>String(p.id)!==String(player.id));state.clubSquads[state.club]=state.players.map(clonePlayer);
 buyer.push(clonePlayer(player));state.clubSquads[offer.to]=buyer;state.xi=state.xi.filter(id=>String(id)!==String(player.id));normalizeXI();
 state.balance+=offer.fee;state.aiBudgets[offer.to]=Number(state.aiBudgets[offer.to])-offer.fee;
 state.transfersDone.push({name:player.name,from:state.club,to:offer.to,fee:offer.fee,id:player.id,season:state.season,window:offer.window,ai:true});
 state.transferOffers.splice(index,1);state.transferPool=[];state.jobNotice=`${offer.to} signed ${player.name} for €${offer.fee.toLocaleString()}.`;save();render();return true;
}
function declineAITransferOffer(index){state.transferOffers=(state.transferOffers||[]).filter((_,i)=>i!==index);save();render()}
function transfers(){
 const st=transferStatus();
 if(st.type!=="closed")ensureTransferPool();
 const available=st.type!=="closed"?state.transferPool.filter(p=>p.club!==state.club):[];
 const sort=state.transferSort||"position";
 const sorted=[...available].sort((a,b)=>sort==="rating"?(b.ovr-a.ovr)||a.name.localeCompare(b.name):sort==="price"?(a.fee-b.fee)||a.name.localeCompare(b.name):(a.pos.localeCompare(b.pos)||b.ovr-a.ovr||a.name.localeCompare(b.name)));
 const recentDeals=(state.transfersDone||[]).filter(t=>t.season===state.season).slice(-8).reverse();
 const activeOffers=(state.transferOffers||[]).filter(isAITransferOfferActive);
 document.getElementById("app").innerHTML=`<div class="card"><h2>Transfers</h2><p class="sub">${st.label}</p>
 <div class="row"><span><b>Sort transfer pool</b></span><select onchange="state.transferSort=this.value;save();render()"><option value="position" ${sort==="position"?"selected":""}>Position</option><option value="rating" ${sort==="rating"?"selected":""}>Rating</option><option value="price" ${sort==="price"?"selected":""}>Price</option></select></div>
 ${st.type==="mid"?`<div class="notice">Mid-season window lasts 4 matchday ticks. AI clubs can sign and sell squad players during each open matchday.</div>`:""}
 ${st.type==="summer"?`<div class="notice">Summer market lasts 10 transfer ticks. Advance a tick to refresh the pool and let the market move.</div><button class="primary" onclick="useTransferTick()">Advance summer transfer tick</button>`:""}
 ${st.type==="closed"?`<div class="notice">No transfer window is currently open. ${st.label}</div>`:""}
 ${activeOffers.length?`<div class="card"><h3>Offers for your players</h3>${activeOffers.map(o=>{const i=state.transferOffers.indexOf(o);return `<div class="club"><div style="flex:1"><b>${o.playerName}</b><div class="sub">${o.to} offer €${Number(o.fee).toLocaleString()}</div></div><button class="primary" onclick="acceptAITransferOffer(${i})">Accept</button><button onclick="declineAITransferOffer(${i})">Reject</button></div>`}).join("")}</div>`:""}
 ${sorted.length?`<div class="list">${sorted.map((p,i)=>`<div class="club"><div style="flex:1"><b>${p.name}</b><div class="sub">${p.club} • ${p.pos} • ${p.age} yrs • OVR ${p.ovr}</div><div class="sub">Fee €${p.fee.toLocaleString()} • Wage €${p.wage.toLocaleString()}/mo</div></div><button onclick="buyPlayerById(decodeURIComponent('${encodeURIComponent(String(p.id))}'))">${state.balance>=p.fee?'Buy':'Too expensive'}</button></div>`).join("")}</div>`:`${st.type!=="closed"?'<div class="sub">No players currently match the simplified transfer pool.</div>':''}`}</div><div class="card"><h3>Recent transfers</h3>${recentDeals.length?recentDeals.map(t=>`<div class="row"><span>${t.name}<br><span class="sub">${t.from} → ${t.to}${t.ai?' • AI':''}</span></span><b>€${Number(t.fee||0).toLocaleString()}</b></div>`).join(""):'<div class="sub">No completed transfers this season.</div>'}</div>`
}
function buyPlayerById(id){
 const st=transferStatus();if(st.type==="closed")return;ensureClubSquads();ensureAIBudgets();
 const p=state.transferPool.find(x=>String(x.id)===String(id)&&x.club!==state.club);if(!p||state.balance<p.fee)return;
 const source=state.clubSquads[p.club]||[];const sourceIndex=source.findIndex(x=>String(x.id)===String(p.id));if(sourceIndex<0)return;
 state.balance-=p.fee;state.aiBudgets[p.club]=Number(state.aiBudgets[p.club]||0)+p.fee;state.clubSquads[p.club]=source.filter((_,i)=>i!==sourceIndex);
 const moved=clonePlayer(source[sourceIndex]);state.players.push(moved);state.clubSquads[state.club]=state.players.map(clonePlayer);
 normalizeXI();state.transfersDone.push({name:moved.name,from:p.club,to:state.club,fee:p.fee,id:moved.id,season:state.season});
 if(p.fee>=250000)addAchievement("major-transfer",`Major signing: ${moved.name}`,`${state.club} signed ${moved.name} from ${p.club} for €${Number(p.fee).toLocaleString()}.`,"💸",{season:state.season,club:state.club,fee:p.fee,player:moved.name});
 state.transferPool=state.transferPool.filter(x=>String(x.id)!==String(p.id));save();render();
}
function buyPlayer(i){const st=transferStatus();if(st.type==="closed")return;ensureTransferPool();const p=state.transferPool.filter(x=>x.club!==state.club)[i];if(p)buyPlayerById(p.id)}

function sellPlayer(id){
 if(state.players.length<=11)return;
 const p=state.players.find(x=>String(x.id)===String(id)); if(!p)return;
 const fee=Math.round(playerValue(p)*0.55);
 if(!confirm(`Sell ${p.name} for €${fee.toLocaleString()}?`))return;
 state.players=state.players.filter(x=>String(x.id)!==String(id));
 syncCurrentClub();
 state.xi=state.xi.filter(x=>String(x)!==String(id));
 normalizeXI(); state.balance+=fee; state.transfersDone.push({name:p.name,from:state.club,to:"Sold",fee,season:state.season}); if(fee>=250000)addAchievement("major-sale",`Major sale: ${p.name}`,`${state.club} sold ${p.name} for €${Number(fee).toLocaleString()}.`,"💰",{season:state.season,club:state.club,fee,player:p.name});
 save();render();
}
function resetGame(){if(confirm("Reset local career? This also removes the local backup.")){localStorage.removeItem(SAVE_KEY);localStorage.removeItem(SAVE_BACKUP_KEY);location.reload()}}
initClub();
if(window.__bhfmSaveRecovered){save();alert("Your main save could not be read, so BH Football Manager Lite restored the most recent backup. Please check your career before continuing.");}
render();

