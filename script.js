const transformed=[0, 11, 19, 24, 29, 34, 38, 42, 45, 47, 49, 51, 53, 55, 57, 60, 63, 66, 69, 73, 77, 82, 89, 100];
const ses=[15.3, 9.1, 7.1, 6.4, 6.1, 6.0, 5.7, 5.2, 4.7, 4.3, 4.0, 3.9, 3.9, 4.1, 4.3, 4.7, 5.0, 5.2, 5.4, 5.6, 6.0, 6.8, 8.8, 15.1];
let current={a:null,b:null,delta:null};
const states={
coma:{title:'Coma',def:'A state characterized by absence of wakefulness and awareness.',beh:['No sustained eye opening or sleep–wake cycles','No evidence of purposeful or conscious behavior']},
uws:{title:'UWS / VS',def:'Wakefulness is present, but there is no reproducible behavioral evidence of awareness of self or environment.',beh:['Eye opening / sleep–wake cycles may be present','Responses are reflexive rather than behaviors demonstrating awareness']},
mcsminus:{title:'MCS−',def:'Minimal but definite behavioral evidence of awareness is present, without the language-related behaviors used to distinguish MCS+.',beh:['Examples include visual fixation or pursuit','Localization to noxious stimulation or other purposeful non-language behaviors']},
mcsplus:{title:'MCS+',def:'Behavioral evidence of awareness includes higher-level, language-related responses.',beh:['Command following','Intelligible verbalization','Intentional but nonfunctional communication']},
emcs:{title:'Emergence from MCS (eMCS)',def:'Recovery of functional behavior sufficient to meet criteria for emergence from the minimally conscious state.',beh:['Functional communication','Functional object use']}
};
function showPage(id){document.querySelectorAll('.page').forEach(p=>p.classList.remove('active-page'));document.getElementById(id).classList.add('active-page');document.querySelectorAll('nav button').forEach(b=>b.classList.toggle('active',b.dataset.page===id));window.scrollTo({top:0,behavior:'smooth'})}
document.querySelectorAll('nav button').forEach(b=>b.addEventListener('click',()=>showPage(b.dataset.page)));
function stateInfo(k){let s=states[k];stateTitle.textContent=s.title;stateDef.textContent=s.def;stateBehaviors.innerHTML=s.beh.map(x=>'<li>'+x+'</li>').join('');stateCard.classList.remove('hidden')}
function toggleMore(id){document.getElementById(id).classList.toggle('hidden')}
function fmt(n){return (n>0?'+':'')+n}
function interpretScores(){
 const a=Number(score1.value),b=Number(score2.value);
 if(!Number.isInteger(a)||!Number.isInteger(b)||a<0||a>23||b<0||b>23){error.textContent='Please enter whole-number CRS-R total scores between 0 and 23.';result.classList.add('hidden');return}
 error.textContent='';const ma=transformed[a],mb=transformed[b],rd=b-a,md=mb-ma;current={a,b,delta:md};
 raw1.textContent=a+' / 23';raw2.textContent=b+' / 23';rawDelta.textContent=fmt(rd);m1.textContent=ma+' / 100';m2.textContent=mb+' / 100';mDelta.textContent=fmt(md);
 translation.textContent=`A ${a}/23 → ${b}/23 raw-score change translates to ${ma}/100 → ${mb}/100 on the equal-interval scale (${fmt(md)} units).`;
 result.classList.remove('hidden');methodResult.innerHTML='<p class="muted">Select an approach above to view the interpretation.</p>';document.querySelectorAll('.method-tabs button').forEach(x=>x.classList.remove('active'));
}
function verdict(delta,threshold){let ad=Math.abs(delta);if(ad<threshold)return ['within','Observed difference is within measurement error.'];if(delta>0)return ['improve','Observed improvement exceeds measurement error.'];if(delta<0)return ['decline','Observed decline exceeds measurement error.'];return ['within','No observed difference.'];}
function interpretationSentence(delta,threshold,label){
 const ad=Math.abs(delta);const conf=label==='MDC₉₀'?'90%':'95%';const thresholdText=label==='cMDC₉₅'?`the ${threshold.toFixed(1)}-unit cMDC₉₅ threshold for these scores`:`the ${threshold}-unit ${label} threshold`;
 if(delta===0) return 'There was no difference between the two transformed CRS-R measures.';
 if(ad>=threshold){const direction=delta>0?'increase':'decrease';const outcome=delta>0?'improvement':'decline';return `This patient demonstrated a <strong>${ad}-unit ${direction} on the transformed 0–100 CRS-R measure</strong>, exceeding ${thresholdText}. This indicates <strong>${outcome} beyond measurement error with ${conf} confidence</strong>.`;}
 const direction=delta>0?'increase':'decrease';return `This patient demonstrated a <strong>${ad}-unit ${direction} on the transformed 0–100 CRS-R measure</strong>, which does not exceed ${thresholdText}. The observed difference is <strong>within expected measurement error at the ${conf} confidence level</strong>.`;
}
function showMethod(m){
 if(current.a===null)return;document.querySelectorAll('.method-tabs button').forEach(x=>x.classList.remove('active'));let t,label,explain,thresholdLabel='Threshold';
 if(m==='mdc90'){tab90.classList.add('active');t=9;label='MDC₉₀';explain='MDC₉₀ applies a single 9-unit threshold across the full measure. It supports interpretation with 90% confidence and is less conservative than MDC₉₅.';}
 if(m==='mdc95'){tab95.classList.add('active');t=11;label='MDC₉₅';explain='MDC₉₅ applies a single 11-unit threshold across the full measure. It supports interpretation with 95% confidence and is more conservative than MDC₉₀.';}
 if(m==='cmdc'){tabc.classList.add('active');t=1.96*Math.sqrt(ses[current.a]**2+ses[current.b]**2);label='cMDC₉₅';thresholdLabel='Threshold for these scores';explain='cMDC₉₅ accounts for differences in measurement precision across the scale. For this pair of scores, a difference greater than the threshold shown exceeds expected measurement error with 95% confidence.';}
 const [cls,msg]=verdict(current.delta,t);const shown=m==='cmdc'?t.toFixed(1):t;
 methodResult.innerHTML=`<p class="eyebrow">${label}</p><p class="verdict ${cls}">${msg}</p><div class="numbers"><span>Your transformed difference: <strong>${fmt(current.delta)} units</strong></span><span>${thresholdLabel}: <strong>${shown} units</strong></span></div><p class="muted">${explain}</p><div class="clinical-interpretation"><small>INTERPRETATION</small><p>${interpretationSentence(current.delta,t,label)}</p></div>${m==='cmdc'?'<button class="mini" id="cmdcLearnMore">? Learn more about cMDC</button>':''}`;
 const learn=document.getElementById('cmdcLearnMore');if(learn) learn.addEventListener('click',()=>openCmdcLearn());
}
function openCmdcLearn(){showPage('learn');const details=[...document.querySelectorAll('#learn details')];const target=details.find(d=>d.textContent.includes('change beyond measurement error'));if(target){target.open=true;document.getElementById('cmdcMore').classList.remove('hidden');setTimeout(()=>document.getElementById('cmdcMore').scrollIntoView({behavior:'smooth',block:'center'}),150);}}
