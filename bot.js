// Bot chơi thử v7 — biết khảo sát, kim loại hiếm, thái độ dân bản địa. Dùng:
//   window.__HEADLESS=true; await runBatch([[seed,diff],...], maxGameSeconds)   (tempo=1, im lặng)
(()=>{
const N=window.__NH;
const BEATS={light:'bomb',bomb:'heavy',heavy:'light'};
const counterOf=d=>d==='mixed'?'heavy':Object.keys(BEATS).find(c=>BEATS[c]===d);
const sum=o=>Object.values(o).reduce((a,b)=>a+b,0);
const TECHORDER=['eco','mining','optics','gasex','weapon','armor','drive','solar','fusion','sensor','missile','shield','compress','automation','netlab','plasma','cargo','foundry','logistics','scout2','diplo','envoy','recycling','deepmining','habitat','tactics','rapid'];

function runGame(seed,diff,maxT,stopC){
  N.newGame(seed,diff,1);
  const G=N.G;window.__HEADLESS=true;document.querySelector('#modal').hidden=true;
  const own=()=>G.planets.filter(p=>p.owner===0);
  const SYS=i=>G.systems[i],dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
  const M={seed,diff,lost:0,plunder:0,repelled:0,intercepted:0,crisisStart:null,crisisEnd:null,maxSwarm:0,maxOwn:1,t8:null,t16:null,
    surveys:0,coop:0,vassal:0,subdued:0,assaultFail:0,uprisings:0,reclaimed:0,suppressed:0,shotDown:0,snap:{},preLost:null};
  let lastTop=G.log[0]||null,lastAtk=-999;
  function scanLog(){
    for(const l of G.log){
      if(l===lastTop)break;const m=l.msg;
      if(m.includes('HÀNH TINH MẸ ')&&m.includes('THẤT THỦ'))M.homeFall=(M.homeFall||0)+1;
      else if(m.includes('LIÊN MINH CHỐNG'))M.coalition=(M.coalition||0)+1;
      else if(m.includes('đổi học thuyết'))M.adapt=(M.adapt||0)+1;
      else if(m.includes('nhân lúc hạm đội'))M.opportunist=(M.opportunist||0)+1;
      else if(m.includes('Danh hiệu mới'))M.titles=(M.titles||0)+1;
      else if(m.includes('thất thủ trước'))M.lost++;
      else if(m.includes('bị cướp phá'))M.plunder++;
      else if(m.includes('Đẩy lùi'))M.repelled++;
      else if(m.includes('Chặn đánh thành công'))M.intercepted++;
      else if(m.includes('Khảo sát '))M.surveys++;
      else if(m.includes('đồng ý hợp tác'))M.coop++;
      else if(m.includes('nhận bảo hộ'))M.vassal++;
      else if(m.includes('Trấn áp thành công'))M.subdued++;
      else if(m.includes('phản kháng quyết liệt'))M.assaultFail++;
      else if(m.includes('Dập tắt'))M.suppressed++;
      else if(m.includes('giành lại'))M.reclaimed++;
      else if(m.includes('nổi dậy tại'))M.uprisings++;
      else if(m.includes('bắn hạ tàu thực dân'))M.shotDown++;
    }
    lastTop=G.log[0]||lastTop;
  }
  const worth=p=>(p.mult.m||0)+(p.mult.c||0)+(p.mult.f||0)*.8+(p.mult.r||0)*1.2+(p.trait?.3:0);
  function build(){
    const t=G.t;
    own().forEach(p=>{
      if(p.bq.length>=2)return;
      N.act('selpl',p.id);
      const tg={mine:3+t/500,cry:3+t/700,fuel:3+t/450,rare:1+t/1500,yard:p.home?(t<900?2:5):(t>2400?2:0),lab:p.home?5:0,def:t>900?(2+t/1500)|0:0,store:2};
      for(const k of ['pow','mine','cry','fuel','rare','yard','lab','def','store']){
        if(k==='pow'){if(p.b.pow<(p.b.mine+p.b.cry+p.b.fuel+p.b.rare)*.5+1){N.act('bld','pow');if(p.bq.length>=2)return}continue}
        if(p.b[k]<tg[k]){N.act('bld',k);if(p.bq.length>=2)return}
      }
    });
    {const full=()=>(G.rqs||[]).length>=N.resSlots();
      for(const k of TECHORDER){if(full())break;N.act('res',k)}
      if(!full()){const ks=Object.keys(G.tech).sort((a,b)=>G.tech[a]-G.tech[b]);for(const k of ks){if(full())break;N.act('res',k)}}
    }
    if(G.pol.length<N.polSlots()&&G.t>=G.polCd){const pick=['expand','def','trade'].find(k=>!G.pol.includes(k));if(pick)N.act('pol',pick)}
  }
  function targetsList(){
    const hive=G.crisis.state===2?[G.planets[G.crisis.hive]]:[];
    const fac=G.planets.filter(p=>p.owner>0&&p.owner<5&&SYS(p.sys).st===2&&!G.facs[p.owner].ally&&G.t>=G.facs[p.owner].truce);
    const nat=G.planets.filter(p=>N.isHost(p)&&p.surveyed);
    return hive.concat(nat.concat(fac).sort((a,b)=>(a.dp-b.dp)));
  }
  function docOf(p){return p.owner>0?N.FACDOC(p.owner):'light'}
  function shipFor(doc){
    const c=counterOf(doc),y=G.planets[0].b.yard,r=G.res.r;
    if(c==='bomb'&&G.tech.missile>=1&&y>=2&&r>=15)return'bomber';
    if(c==='heavy'){if(G.tech.plasma>=1&&y>=5&&G.res.m>6000&&r>=150)return'battle';if(G.tech.weapon>=2&&y>=3&&r>=30)return'cruiser'}
    return 'fighter';
  }
  function ships(){
    const home=G.planets[0];N.act('selpl',0);
    if(!(home.b.yard>0&&home.yq.length<3))return;
    if((home.ships.scout||0)<4)return N.act('ship','scout',1);
    if(home.b.yard>=2&&(home.ships.colony||0)<1&&own().length<22&&G.fleets.filter(f=>f.mission==='colonize').length<2&&G.planets.some(p=>p.owner===-1&&p.surveyed&&!N.isHost(p)&&worth(p)>=1.5))return N.act('ship','colony',1);
    if(G.t>450){const tg=targetsList()[0],doc=tg?docOf(tg):'heavy',k=shipFor(doc);N.act('ship',k,k==='fighter'?3:k==='bomber'?3:k==='cruiser'?2:1)}
  }
  function ops(){
    const busy=new Set(G.fleets.map(f=>f.tp));
    const src=own().filter(p=>sum(p.ships)>0).sort((a,b)=>sum(b.ships)-sum(a.ships))[0];
    if(!src)return;
    const nf=m=>G.fleets.filter(f=>f.mission===m).length;
    // thám hiểm / viễn chinh
    if(src.ships.scout>1&&nf('explore')+nf('expedition')<1){
      const un=G.systems.filter(s=>s.st===1).sort((a,b)=>dist(a,SYS(0))-dist(b,SYS(0)));
      const tg=un[0]||G.systems.filter(s=>s.st===2).sort((a,b)=>dist(b,SYS(0))-dist(a,SYS(0)))[Math.floor(Math.random()*8)];
      if(tg)N.launch(src,tg.id,null,un.length&&Math.random()<.5?'expedition':'explore',{scout:1});
    }
    // khảo sát hành tinh gần nhất chưa biết
    if(src.ships.scout>1&&nf('survey')<2){
      const cand=G.planets.filter(p=>p.owner!==0&&!p.surveyed&&SYS(p.sys).st===2&&!busy.has(p.id)).sort((a,b)=>dist(SYS(a.sys),SYS(0))-dist(SYS(b.sys),SYS(0)))[0];
      if(cand)N.launch(src,cand.sys,cand.id,'survey',{scout:1});
    }
    // dân bản địa hợp tác / lệ thuộc
    G.planets.forEach(p=>{
      if(p.owner!==-1||p.race<0||!p.surveyed)return;
      if(p.att==='coop'&&!p.coop&&G.res.m>1500)N.act('coop',p.id);
      if(p.att==='dep'&&!p.vassal&&G.res.m>1500&&p.mult.m+p.mult.c+p.mult.f>1.5)N.act('vassal',p.id);
    });
    // thực dân hóa nơi giàu tài nguyên, đã khảo sát, không chống đối
    if(src.ships.colony>0){
      const fp=G.planets.filter(p=>p.owner===-1&&p.surveyed&&!N.isHost(p)&&!busy.has(p.id)&&worth(p)>=1.5).sort((a,b)=>dist(SYS(a.sys),SYS(0))-dist(SYS(b.sys),SYS(0)))[0];
      if(fp)N.launch(src,fp.sys,fp.id,'colonize',{colony:1});
    }
    // đồn trú cho thuộc địa đang bất ổn
    own().forEach(p=>{
      if(!(p.unrest>20)||p===src)return;
      const gar=sum(p.ships)-(p.ships.scout||0)-(p.ships.colony||0);if(gar>=10)return;
      if(G.fleets.some(f=>f.mission==='defend'&&f.tp===p.id))return;
      const comb={...src.ships};delete comb.scout;delete comb.colony;const send={};for(const k in comb){const n=Math.floor(comb[k]*.3);if(n>0)send[k]=n}
      if(sum(send)>=6)N.launch(src,p.sys,p.id,'defend',send);
    });
    // tấn công
    const comb={...src.ships};delete comb.scout;delete comb.colony;
    const send={};for(const k in comb){const n=Math.floor(comb[k]*.6);if(n>0)send[k]=n}
    if(sum(send)>0&&nf('attack')<1&&G.t-lastAtk>240){
      const tg=targetsList()[0];
      if(tg){
        const fresh=tg.recon&&G.t-tg.recon.t<900;
        if(!fresh){if((src.ships.scout||0)>0&&nf('recon')<1)N.launch(src,tg.sys,tg.id,'recon',{scout:1})}
        else{
          const fs=N.fstats(send),doc=docOf(tg),host=N.isHost(tg);let w=0,l=0;
          const def=host?{atk:.9*tg.dp,hp:Math.max(6,7*tg.dp)}:N.npcDef({dp:tg.dp});
          for(let i=0;i<20;i++){const r=N.fight(fs,def,N.mulVs(send,doc),N.mulOf(doc,send)*(host?1.15:1));if(r.aw)w++;l+=r.aL}
          if(w>=17&&l/20<.5){lastAtk=G.t;if(G.crisis.state===2&&tg===G.planets[G.crisis.hive])M.hiveAttack={t:Math.round(G.t),atk:Math.round(fs.atk),hp:Math.round(fs.hp),w,dp:Math.round(tg.dp),send:{...send}};N.launch(src,tg.sys,tg.id,'attack',send)}
        }
      }
    }
  }
  function intercepts(){
    G.raids.forEach(r=>{
      const p=G.planets[r.pid];if(p.owner!==0||r.rebel)return;
      if(G.fleets.some(f=>f.mission==='intercept'&&f.tp===r.pid))return;
      const src=own().filter(q=>q.id!==p.id&&sum(q.ships)>0).sort((a,b)=>dist(SYS(a.sys),SYS(p.sys))-dist(SYS(b.sys),SYS(p.sys)))[0];
      if(!src)return;
      const comb={...src.ships};delete comb.scout;delete comb.colony;
      const send={};for(const k in comb){const n=Math.floor(comb[k]*.8);if(n>0)send[k]=n}
      if(!sum(send))return;
      const d=dist(SYS(src.sys),SYS(p.sys)),spd=Math.min(...Object.keys(send).map(k=>N.SHSPD(k)))*N.spdMul(),eta=Math.max(6,d/spd);
      if(eta>r.t-G.t)return;
      const docR=r.fac>0?N.FACDOC(r.fac):'light',fs=N.fstats(send);let w=0;
      for(let i=0;i<12;i++){if(N.fight(fs,{atk:.8*r.S,hp:6*r.S},N.mulVs(send,docR),N.mulOf(docR,send)).aw)w++}
      if(w>=8)N.launch(src,p.sys,p.id,'intercept',send);
    });
  }
  const CP=[1800,3600,7200,10800,14400];
  for(let i=0;i<maxT&&!G.won&&!G.lost&&!(stopC&&G.crisis.state===2);i++){
    N.step(1);
    if(i%10===0){build();ships();ops();intercepts();scanLog()}
    if(i%60===0){
      const n=own().length;M.maxOwn=Math.max(M.maxOwn,n);
      if(n>=8&&M.t8===null)M.t8=i;if(n>=16&&M.t16===null)M.t16=i;
      M.maxSwarm=Math.max(M.maxSwarm,G.planets.filter(p=>p.owner===5).length/G.planets.length);
      if(G.crisis.state>=2&&M.crisisStart===null){M.crisisStart=i;let a=0;own().forEach(p=>a+=N.fstats(p.ships).atk);G.fleets.forEach(f=>a+=N.fstats(f.ships).atk);M.crisis0={dp:Math.round(G.planets[G.crisis.hive].dp),atk:Math.round(a)}}
      if(G.crisis.state===3&&M.crisisEnd===null)M.crisisEnd=i;
    }
    if(i===17000){M.preLost=M.lost;M.prePlunder=M.plunder}
    if(CP.includes(i)){const rs=N.rates();M.snap[i]={own:n=>0}; M.snap[i]={own:own().length,res:[Math.round(G.res.m),Math.round(G.res.r)],rate:[+rs.m.toFixed(0),+rs.r.toFixed(1)],tech:Object.values(G.tech).reduce((a,b)=>a+b,0),races:new Set(own().filter(p=>p.race>=0).map(p=>p.race)).size}}
  }
  M.endT=Math.round(G.t);M.rank=G.rank;M.cycle=G.crisis.cycle||0;M.own=own().length;M.won=G.won;M.lostGame=G.lost;M.captured=G.captured;M.crisisState=G.crisis.state;
  M.coopRaces=Object.keys(G.coopRaces||{}).length;M.vassals=G.planets.filter(p=>p.vassal&&p.owner===-1).length;
  M.why=G.won?(G.crisis.state===3?'Cứu ngân hà':own().length/G.planets.length>=.2?'Thống trị':G.planets.filter(p=>p.capital&&p.owner===0).length>=4?'Chinh phục':'Ngoại giao'):(G.lost?'THUA':'hết giờ');
  return M;
}
window.runBatch=async function(list,maxT,stopC){const out=[];for(const[seed,diff]of list)out.push(runGame(seed,diff,maxT,stopC));window.__HEADLESS=false;return out};
})();
