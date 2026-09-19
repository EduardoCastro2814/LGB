(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,20361,e=>{"use strict";var t=e.i(43476),s=e.i(71645),a=e.i(18566),r=e.i(24071),l=e.i(67927),o=e.i(63676),i=e.i(20545),n=e.i(95925),d=e.i(56420);let c=(0,d.default)("triangle-alert",[["path",{d:"m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3",key:"wmoenq"}],["path",{d:"M12 9v4",key:"juzpu7"}],["path",{d:"M12 17h.01",key:"p32p05"}]]);var m=e.i(51757),x=e.i(83967),f=e.i(56423);let p=(0,d.default)("layout-list",[["rect",{width:"7",height:"7",x:"3",y:"3",rx:"1",key:"1g98yp"}],["rect",{width:"7",height:"7",x:"3",y:"14",rx:"1",key:"1bb6yr"}],["path",{d:"M14 4h7",key:"3xa0d5"}],["path",{d:"M14 9h7",key:"1icrd9"}],["path",{d:"M14 15h7",key:"1mj8o2"}],["path",{d:"M14 20h7",key:"11slyb"}]]);var b=e.i(13285),u=e.i(76248),h=e.i(94004),g=e.i(28623),w=e.i(72382),j=e.i(81658),y=e.i(93269),v=e.i(23399),N=e.i(62368),C=e.i(26091);let k={background:"",textColor:"#0f172a",positions:{nombreEmpleado:{x:50,y:36,fontSize:42,visible:!0},numEmpleado:{x:50,y:44,fontSize:18,visible:!1},nombreCurso:{x:50,y:54,fontSize:36,visible:!0},fechaCompletado:{x:50,y:70,fontSize:18,visible:!0},calificacion:{x:70,y:70,fontSize:18,visible:!1},folio:{x:50,y:82,fontSize:14,visible:!0}},templateName:"Plantilla Estándar",templateUploadDate:"De fábrica",templateUrl:"Interno",useCustomTemplate:!1};async function S(e,t){let s=document.createElement("canvas");await function(e,t,s=k){return new Promise(a=>{let r=e.getContext("2d");if(!r)return void a();e.width=1200,e.height=850;let l=!!s.background&&!1!==s.useCustomTemplate,o=s.positions||k.positions,i=(e,t,s,a)=>{let r=o[e];return{x:r?.x!==void 0?r.x/100*1200:t/100*1200,y:r?.y!==void 0?r.y/100*850:s/100*850,fontSize:r?.fontSize||a,visible:r?.visible===void 0||r.visible}},n=()=>{r.textAlign="center",r.textBaseline="middle",l||(r.fillStyle="#007fc4",r.font="black 62px sans-serif",r.fillText("RECOGNITION",600,150),r.fillStyle="#475569",r.font="bold 20px sans-serif",r.fillText("Lean Academy Certification Program",600,205),r.fillStyle="#64748b",r.font="italic 18px sans-serif",r.fillText("Awarded to:",600,260));let e=i("nombreEmpleado",50,35,42);e.visible&&(r.fillStyle=s.textColor||"#0f172a",r.font=`bold ${e.fontSize}px Georgia, serif`,r.fillText(t.userName,e.x,e.y));let o=i("numEmpleado",50,41,16);o.visible&&(r.fillStyle="#64748b",r.font=`bold ${o.fontSize}px sans-serif`,r.fillText(`ID de Empleado: ${t.userId}`,o.x,o.y)),l||(r.fillStyle="#64748b",r.font="normal 18px sans-serif",r.fillText("For successfully completing and demonstrating proficiency in:",600,435));let n=i("nombreCurso",50,55,36);n.visible&&(r.fillStyle="#0284c7",r.font=`bold ${n.fontSize}px Georgia, serif`,r.fillText(t.courseName.toUpperCase(),n.x,n.y));let d=i("fechaCompletado",50,68,17);d.visible&&(r.fillStyle="#475569",r.font=`bold ${d.fontSize}px sans-serif`,r.fillText(`Completion Date: ${t.completionDate}   •   Score: ${t.score}%`,d.x,d.y));let c=i("calificacion",70,70,18);c.visible&&l&&(r.fillStyle="#059669",r.font=`bold ${c.fontSize}px sans-serif`,r.fillText(`Calificaci\xf3n: ${t.score}%`,c.x,c.y));let m=i("folio",50,80,14);if(m.visible&&(r.fillStyle="#64748b",r.font=`bold ${m.fontSize}px Courier New, monospace`,r.fillText(`ID: ${t.folio}`,m.x,m.y)),l||(r.strokeStyle="#94a3b8",r.lineWidth=1.5,r.beginPath(),r.moveTo(680,685),r.lineTo(880,685),r.stroke(),r.fillStyle="#005ea2",r.font="italic 24px Georgia, serif",r.fillText("Lean Academy",780,670),r.fillStyle="#334155",r.font="bold 14px sans-serif",r.fillText("Ing. Luis Hernández",780,705),r.fillStyle="#64748b",r.font="bold 12px sans-serif",r.fillText("Lean Academy Director",780,725),r.strokeStyle="#94a3b8",r.beginPath(),r.moveTo(930,685),r.lineTo(1130,685),r.stroke(),r.fillStyle="#005ea2",r.font="italic 24px Georgia, serif",r.fillText("Philo B29",1030,670),r.fillStyle="#334155",r.font="bold 14px sans-serif",r.fillText("Dir. Alejandro Ruiz",1030,705),r.fillStyle="#64748b",r.font="bold 12px sans-serif",r.fillText("Plant Manager",1030,725)),!l){let e=r.createLinearGradient(0,790,1200,790);e.addColorStop(0,"#005ea2"),e.addColorStop(1,"#0090e1"),r.fillStyle=e,r.fillRect(0,795,1200,55),r.fillStyle="#ffffff",r.font="bold italic 28px sans-serif",r.textAlign="right",r.fillText("flex",1140,830)}a()};if(l&&s.background){let e=new Image;e.crossOrigin="anonymous",e.onload=()=>{r.drawImage(e,0,0,1200,850),n()},e.onerror=()=>{n()},e.src=s.background}else{r.fillStyle="#f8fafc",r.fillRect(0,0,1200,850);let e=r.createLinearGradient(0,0,300,300);e.addColorStop(0,"#0090e1"),e.addColorStop(1,"#005ea2"),r.fillStyle=e,r.beginPath(),r.moveTo(0,0),r.lineTo(360,0),r.lineTo(0,360),r.closePath(),r.fill(),r.strokeStyle="rgba(255, 255, 255, 0.85)",r.lineWidth=3,r.setLineDash([6,6]),r.beginPath(),r.arc(110,110,62,0,2*Math.PI),r.stroke(),r.setLineDash([]),r.strokeStyle="rgba(255, 255, 255, 0.9)",r.lineWidth=1.5,r.beginPath(),r.arc(110,110,54,0,2*Math.PI),r.stroke(),r.fillStyle="#ffffff",r.textAlign="center",r.textBaseline="middle",r.font="bold 9px sans-serif",r.fillText("FLEX LEAN",110,88),r.font="black 22px sans-serif",r.fillText("LGB",110,110),r.font="bold 8px sans-serif",r.fillText("ENTERPRISE",110,132),n()}})}(s,e,t||k);try{let t=s.toDataURL("image/png"),a=document.createElement("a"),r=e.courseName.replace(/[^\w\s-]/gi,"").replace(/\s+/g,"_");a.download=`Certificado_${r}_${e.userId||"LGB"}.png`,a.href=t,document.body.appendChild(a),a.click(),document.body.removeChild(a)}catch(e){console.error("Error al descargar certificado PNG:",e),alert("No fue posible realizar la descarga automática. Por favor use la opción de Imprimir / Guardar PDF.")}}function $({isOpen:e,onClose:s,data:a,certConfig:r=k}){let l=!!r.background&&!1!==r.useCustomTemplate,n=r.positions||k.positions;return e?(0,t.jsx)("div",{className:"fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto animate-fade-in",children:(0,t.jsxs)("div",{className:"relative w-full max-w-4xl bg-white dark:bg-[#1e293b] rounded-3xl overflow-hidden shadow-2xl flex flex-col",children:[(0,t.jsxs)("div",{className:"flex justify-between items-center px-6 py-4 border-b border-slate-100 dark:border-slate-800",children:[(0,t.jsxs)("div",{className:"flex items-center gap-2.5",children:[(0,t.jsx)("div",{className:"w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center",children:(0,t.jsx)(i.Award,{className:"w-5 h-5"})}),(0,t.jsxs)("div",{children:[(0,t.jsx)("h3",{className:"text-sm font-extrabold text-slate-800 dark:text-white",children:"Certificado de Reconocimiento Oficial"}),(0,t.jsxs)("p",{className:"text-[10px] text-slate-400 font-semibold uppercase",children:["Lean Academy Program • ",a.courseName]})]})]}),(0,t.jsx)("button",{onClick:s,className:"p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors cursor-pointer",children:(0,t.jsx)(o.X,{className:"w-5 h-5"})})]}),(0,t.jsx)("div",{className:"p-6 bg-slate-100/50 dark:bg-slate-900/20 flex flex-col items-center gap-6 overflow-x-auto",children:(0,t.jsxs)("div",{id:"printable-certificate-element",className:"w-full min-w-[650px] aspect-[297/210] relative bg-[#f8fafc] rounded-2xl overflow-hidden border border-slate-200/60 dark:border-slate-800/40 shadow-lg select-none @container",children:[l&&r.background?(0,t.jsx)("img",{src:r.background,alt:"Fondo Certificado",className:"absolute inset-0 w-full h-full object-cover pointer-events-none"}):(0,t.jsxs)(t.Fragment,{children:[(0,t.jsx)("div",{className:"absolute top-0 left-0 w-[28%] h-[28%] bg-gradient-to-br from-[#0090e1] to-[#005ea2]",style:{clipPath:"polygon(0 0, 100% 0, 0 100%)"}}),(0,t.jsxs)("div",{className:"absolute top-[4%] left-[4%] w-[10%] aspect-square rounded-full border border-dashed border-white/80 flex flex-col items-center justify-center text-white z-10",children:[(0,t.jsx)("div",{className:"absolute inset-[4%] rounded-full border border-white/90"}),(0,t.jsx)("span",{className:"text-[0.6cqw] font-extrabold uppercase tracking-wide opacity-90 mt-[10%]",children:"Flex Lean"}),(0,t.jsx)("span",{className:"text-[1.8cqw] font-black leading-none my-[4%]",children:"LGB"}),(0,t.jsx)("span",{className:"text-[0.55cqw] font-bold uppercase tracking-wide opacity-90",children:"Enterprise"})]}),(0,t.jsx)("div",{className:"absolute top-[17.5%] left-0 w-full text-center text-[#007fc4] font-black uppercase tracking-[0.4em] text-[4.6cqw] leading-none pointer-events-none",children:"RECOGNITION"}),(0,t.jsx)("div",{className:"absolute top-[24%] left-0 w-full text-center text-slate-500 font-bold uppercase text-[1.5cqw] leading-none pointer-events-none",children:"Lean Academy Certification Program"}),(0,t.jsx)("div",{className:"absolute top-[31.5%] left-0 w-full text-center text-slate-400 font-semibold italic text-[1.4cqw] leading-none pointer-events-none",children:"Awarded to:"}),(0,t.jsx)("div",{className:"absolute top-[52%] left-0 w-full text-center text-slate-400 font-semibold text-[1.35cqw] leading-none pointer-events-none",children:"For successfully completing and demonstrating proficiency in:"})]}),Object.entries(n).map(([e,s])=>{if(!s.visible)return null;let l=(e=>{switch(e){case"nombreEmpleado":return a.userName;case"numEmpleado":return`ID: ${a.userId}`;case"nombreCurso":return a.courseName.toUpperCase();case"fechaCompletado":return`Completion Date: ${a.completionDate} • Score: ${a.score}%`;case"calificacion":return`Calificaci\xf3n: ${a.score}%`;case"folio":return`ID: ${a.folio}`;default:return""}})(e);if(!l)return null;let o={position:"absolute",left:`${s.x}%`,top:`${s.y}%`,transform:"translate(-50%, -50%)",fontSize:`${s.fontSize/1200*100}cqw`,fontWeight:"bold",textAlign:"center",whiteSpace:"nowrap",color:"nombreCurso"===e?"#0284c7":"folio"===e?"#64748b":"calificacion"===e?"#059669":r.textColor||"#0f172a",fontFamily:"nombreEmpleado"===e||"nombreCurso"===e?"Georgia, serif":"sans-serif"};return(0,t.jsx)("div",{style:o,className:"pointer-events-none rounded px-2.5 py-0.5",children:l},e)}),!l&&(0,t.jsxs)("div",{className:"absolute bottom-[9%] left-0 w-full px-[6%] box-border flex items-end justify-between pointer-events-none",children:[(0,t.jsxs)("div",{className:"flex flex-col items-center font-mono text-[0.9cqw] text-slate-400 font-bold",children:[(0,t.jsx)("span",{className:"uppercase text-[0.8cqw] tracking-wider font-sans font-semibold text-slate-400/80",children:"ID"}),(0,t.jsx)("span",{className:"mt-[0.2cqw]",children:a.folio})]}),(0,t.jsxs)("div",{className:"flex gap-[3cqw]",children:[(0,t.jsxs)("div",{className:"flex flex-col items-center w-[16cqw]",children:[(0,t.jsx)("div",{className:"w-full border-b border-slate-300 h-[2.5cqw] relative flex items-end justify-center",children:(0,t.jsx)("span",{className:"font-serif italic text-[1.6cqw] text-[#005ea2] font-semibold leading-none pb-[0.2cqw]",children:"Lean Academy"})}),(0,t.jsx)("span",{className:"text-[1cqw] font-extrabold text-slate-700 mt-[0.5cqw] leading-none",children:"Ing. Luis Hernández"}),(0,t.jsx)("span",{className:"text-[0.8cqw] font-bold text-slate-400 uppercase tracking-wider mt-[0.2cqw]",children:"Lean Academy Director"})]}),(0,t.jsxs)("div",{className:"flex flex-col items-center w-[16cqw]",children:[(0,t.jsx)("div",{className:"w-full border-b border-slate-300 h-[2.5cqw] relative flex items-end justify-center",children:(0,t.jsx)("span",{className:"font-serif italic text-[1.6cqw] text-[#005ea2] font-semibold leading-none pb-[0.2cqw]",children:"Philo B29"})}),(0,t.jsx)("span",{className:"text-[1cqw] font-extrabold text-slate-700 mt-[0.5cqw] leading-none",children:"Dir. Alejandro Ruiz"}),(0,t.jsx)("span",{className:"text-[0.8cqw] font-bold text-slate-400 uppercase tracking-wider mt-[0.2cqw]",children:"Plant Manager"})]})]})]}),!l&&(0,t.jsx)("div",{className:"absolute bottom-0 left-0 w-full h-[6.5%] bg-gradient-to-r from-[#005ea2] to-[#0090e1] flex items-center justify-end px-[5%] box-border",children:(0,t.jsx)("span",{className:"text-[#ffffff] text-[2.2cqw] font-black italic tracking-tighter leading-none select-none",children:"flex"})})]})}),(0,t.jsxs)("div",{className:"flex flex-col sm:flex-row justify-between items-center gap-3 px-6 py-4 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800",children:[(0,t.jsxs)("div",{className:"flex items-center gap-2 text-xs font-bold text-emerald-600",children:[(0,t.jsx)(m.CheckCircle2,{className:"w-4 h-4"}),(0,t.jsxs)("span",{children:["Calificación Aprobatoria: ",a.score,"%"]})]}),(0,t.jsxs)("div",{className:"flex items-center gap-2 w-full sm:w-auto justify-end",children:[(0,t.jsxs)("button",{onClick:()=>{S(a,r)},className:"px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-white shadow-sm flex items-center justify-center gap-1.5 cursor-pointer transition-colors",children:[(0,t.jsx)(N.Download,{className:"w-4 h-4"}),(0,t.jsx)("span",{children:"Descargar Imagen (PNG)"})]}),(0,t.jsxs)("button",{onClick:()=>{!function(e,t=k){let s=!!t.background&&!1!==t.useCustomTemplate,a=t.positions||k.positions,r=s?`background-image: url('${t.background}'); background-size: 100% 100%; background-repeat: no-repeat;`:"background-color: #f8fafc;",l=s?`
        <div class="certificate-container" style="${r}">
          ${a.nombreEmpleado?.visible!==!1?`<div class="dynamic-text employee-name" style="left: ${a.nombreEmpleado?.x||50}%; top: ${a.nombreEmpleado?.y||34}%; font-size: ${(a.nombreEmpleado?.fontSize||42)/1200*297}mm; color: ${t.textColor||"#0f172a"}; font-family: Georgia, serif;">${e.userName}</div>`:""}
          ${a.numEmpleado?.visible?`<div class="dynamic-text employee-id" style="left: ${a.numEmpleado?.x||50}%; top: ${a.numEmpleado?.y||42}%; font-size: ${(a.numEmpleado?.fontSize||18)/1200*297}mm; color: #64748b;">ID: ${e.userId}</div>`:""}
          ${a.nombreCurso?.visible!==!1?`<div class="dynamic-text course-name" style="left: ${a.nombreCurso?.x||50}%; top: ${a.nombreCurso?.y||56}%; font-size: ${(a.nombreCurso?.fontSize||36)/1200*297}mm; color: #0284c7; font-family: Georgia, serif; text-transform: uppercase;">${e.courseName}</div>`:""}
          ${a.fechaCompletado?.visible!==!1?`<div class="dynamic-text completion-date" style="left: ${a.fechaCompletado?.x||50}%; top: ${a.fechaCompletado?.y||70}%; font-size: ${(a.fechaCompletado?.fontSize||18)/1200*297}mm; color: #475569;">Completion Date: ${e.completionDate} • Score: ${e.score}%</div>`:""}
          ${a.folio?.visible!==!1?`<div class="dynamic-text evidence-id" style="left: ${a.folio?.x||50}%; top: ${a.folio?.y||82}%; font-size: ${(a.folio?.fontSize||14)/1200*297}mm; color: #64748b; font-family: monospace;">ID: ${e.folio}</div>`:""}
        </div>
      `:`
        <div class="certificate-container" style="${r}">
          <div class="corner-triangle"></div>
          <div class="seal-container">
            <div class="seal-outer-circle"></div>
            <div class="seal-text-top">Flex Lean</div>
            <div class="seal-center">LGB</div>
            <div class="seal-text-bottom">Enterprise</div>
          </div>
          
          <div class="cert-content">
            <h1 class="title-recognition">RECOGNITION</h1>
            <div class="subtitle">Lean Academy Certification Program</div>
            
            <div class="awarded-to">Awarded to:</div>
            <h2 class="employee-name" style="font-size: ${(a.nombreEmpleado?.fontSize||42)/1200*297}mm; color: ${t.textColor||"#0f172a"};">${e.userName}</h2>
            <div class="employee-id" style="font-size: 3.5mm; color: #64748b; font-weight: 700; margin-bottom: 5mm;">Colaborador ID: ${e.userId}</div>
            
            <div class="proficiency-text">For successfully completing and demonstrating proficiency in:</div>
            <h3 class="course-name" style="font-size: ${(a.nombreCurso?.fontSize||36)/1200*297}mm;">${e.courseName}</h3>
            
            <div class="stats-row" style="font-size: ${(a.fechaCompletado?.fontSize||18)/1200*297}mm;">
              <span>Completion Date: ${e.completionDate}</span>
              <span class="stats-dot">•</span>
              <span>Calificaci\xf3n: <strong>${e.score}%</strong></span>
            </div>
          </div>
          
          <div class="bottom-row">
            <div class="evidence-id-container" style="font-size: ${(a.folio?.fontSize||14)/1200*297}mm;">
              <span>ID:</span>
              <span>${e.folio}</span>
            </div>

            <div style="display: flex; gap: 15mm;">
              <div class="signature-block">
                <div class="signature-line">
                  <span class="signature-svg">Lean Academy</span>
                </div>
                <span class="signature-name">Ing. Luis Hern\xe1ndez</span>
                <span class="signature-title">Lean Academy Director</span>
              </div>
              
              <div class="signature-block">
                <div class="signature-line">
                  <span class="signature-svg">Philo B29</span>
                </div>
                <span class="signature-name">Dir. Alejandro Ruiz</span>
                <span class="signature-title">Plant Manager</span>
              </div>
            </div>
          </div>
          
          <div class="footer-bar">
            <span class="flex-logo">flex</span>
          </div>
        </div>
      `,o=`
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Certificado - ${e.courseName} - ${e.userName}</title>
        <style>
          @page {
            size: A4 landscape;
            margin: 0;
          }
          body {
            margin: 0;
            padding: 0;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #ffffff;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .certificate-container {
            width: 297mm;
            height: 210mm;
            position: relative;
            box-sizing: border-box;
            overflow: hidden;
          }
          .dynamic-text {
            position: absolute;
            transform: translate(-50%, -50%);
            text-align: center;
            white-space: nowrap;
            font-weight: bold;
          }
          .corner-triangle {
            position: absolute;
            top: 0;
            left: 0;
            width: 85mm;
            height: 85mm;
            background: linear-gradient(135deg, #0090e1 0%, #005ea2 100%);
            clip-path: polygon(0 0, 100% 0, 0 100%);
            z-index: 10;
          }
          .seal-container {
            position: absolute;
            top: 8mm;
            left: 8mm;
            width: 32mm;
            height: 32mm;
            border: 0.8mm dashed rgba(255, 255, 255, 0.85);
            border-radius: 50%;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            color: #ffffff;
            text-align: center;
            z-index: 20;
          }
          .seal-outer-circle {
            position: absolute;
            width: 30mm;
            height: 30mm;
            border: 0.4mm solid rgba(255, 255, 255, 0.9);
            border-radius: 50%;
          }
          .seal-text-top {
            font-size: 1.9mm;
            font-weight: 800;
            letter-spacing: 0.2mm;
            margin-top: 1mm;
            text-transform: uppercase;
          }
          .seal-center {
            font-size: 5.5mm;
            font-weight: 950;
            color: #ffffff;
            margin: 1mm 0;
            line-height: 1;
          }
          .seal-text-bottom {
            font-size: 1.7mm;
            font-weight: 700;
            letter-spacing: 0.15mm;
            text-transform: uppercase;
          }
          .cert-content {
            width: 100%;
            height: 100%;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding-top: 25mm;
            padding-bottom: 20mm;
            box-sizing: border-box;
            text-align: center;
          }
          .title-recognition {
            font-size: 15mm;
            font-weight: 900;
            color: #007fc4;
            margin: 0;
            letter-spacing: 1.5mm;
            text-transform: uppercase;
          }
          .subtitle {
            font-size: 4.8mm;
            font-weight: 700;
            color: #475569;
            margin-top: 1.5mm;
            margin-bottom: 6mm;
          }
          .awarded-to {
            font-size: 4.2mm;
            color: #64748b;
            font-style: italic;
            margin-bottom: 2mm;
          }
          .employee-name {
            margin: 0 0 1mm 0;
            font-family: Georgia, serif;
            font-weight: 800;
          }
          .proficiency-text {
            font-size: 4.2mm;
            color: #64748b;
            margin-bottom: 2.5mm;
          }
          .course-name {
            margin: 0 0 5mm 0;
            font-family: Georgia, serif;
            font-weight: 850;
            text-transform: uppercase;
          }
          .stats-row {
            display: flex;
            align-items: center;
            gap: 4mm;
            color: #475569;
            font-weight: 700;
            margin-bottom: 8mm;
          }
          .stats-dot {
            color: #007fc4;
          }
          .bottom-row {
            position: absolute;
            bottom: 22mm;
            left: 0;
            width: 100%;
            padding: 0 18mm;
            box-sizing: border-box;
            display: flex;
            align-items: flex-end;
            justify-content: space-between;
          }
          .signature-block {
            display: flex;
            flex-direction: column;
            align-items: center;
            width: 55mm;
            text-align: center;
          }
          .signature-line {
            width: 100%;
            border-bottom: 0.3mm solid #94a3b8;
            margin-bottom: 1.5mm;
            height: 8mm;
            position: relative;
          }
          .signature-svg {
            position: absolute;
            bottom: 0.5mm;
            left: 50%;
            transform: translateX(-50%);
            font-family: 'Brush Script MT', cursive, Georgia, serif;
            font-size: 6mm;
            font-style: italic;
            color: #005ea2;
          }
          .signature-title {
            font-size: 2.8mm;
            color: #64748b;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.1mm;
          }
          .signature-name {
            font-size: 3.2mm;
            color: #334155;
            font-weight: 800;
          }
          .evidence-id-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            color: #64748b;
            font-family: monospace;
            font-weight: 700;
          }
          .footer-bar {
            position: absolute;
            bottom: 0;
            left: 0;
            width: 100%;
            height: 13.5mm;
            background: linear-gradient(90deg, #005ea2 0%, #0090e1 100%);
            display: flex;
            align-items: center;
            justify-content: flex-end;
            padding-right: 18mm;
            box-sizing: border-box;
          }
          .flex-logo {
            color: #ffffff;
            font-size: 6.5mm;
            font-weight: 900;
            font-style: italic;
            font-family: 'Segoe UI', sans-serif;
          }
        </style>
      </head>
      <body>
        ${l}
        <script>
          window.onload = function() {
            window.print();
            setTimeout(function() { window.close(); }, 500);
          };
        </script>
      </body>
    </html>
  `,i=window.open("","_blank");i?(i.document.write(o),i.document.close()):alert("Por favor permita las ventanas emergentes en su navegador para imprimir o guardar el certificado en PDF.")}(a,r)},className:"px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-600 text-white shadow-md flex items-center justify-center gap-1.5 cursor-pointer transition-colors",children:[(0,t.jsx)(C.FileText,{className:"w-4 h-4"}),(0,t.jsx)("span",{children:"Imprimir / Guardar PDF"})]})]})]})]})}):null}let I=[{id:"lean-basics-1",name:"Lean Basics 1",description:"Conceptos básicos de manufactura esbelta, desperdicios y valor agregado en líneas de producción.",duration:"2 horas",order:1,materials:[]},{id:"5s-1",name:"5S + 1",description:"Metodología clásica de las 5S con enfoque transversal en la Seguridad (+1).",duration:"1.5 horas",order:2,materials:[]},{id:"5-whys",name:"5 Whys",description:"Herramienta de análisis de causa raíz que indaga de manera iterativa el origen físico y de gestión de una falla.",duration:"1 hora",order:3,materials:[]},{id:"7-ways",name:"7 Ways",description:"Resolución analítica de problemas orientada a proponer y seleccionar de entre 7 opciones distintas de solución.",duration:"2 horas",order:4,materials:[]},{id:"sga-guide",name:"Small Group Activities (SGA) Guide",description:"Guía de trabajo para la ejecución de proyectos de mejora en equipos pequeños y círculos de calidad.",duration:"3 horas",order:5,materials:[]}];function z(){let e=(0,a.useSearchParams)().get("courseId"),[d,N]=(0,s.useState)(null),[C,z]=(0,s.useState)(I),[D,L]=(0,s.useState)(v.default),[E,P]=(0,s.useState)(!0),[A,T]=(0,s.useState)(0),[q,O]=(0,s.useState)("stepped"),[M,G]=(0,s.useState)(0),[F,R]=(0,s.useState)({}),[_,B]=(0,s.useState)(null),[U,J]=(0,s.useState)("all"),[V,W]=(0,s.useState)(!1),[X,H]=(0,s.useState)(""),[K,Y]=(0,s.useState)(""),[Q,Z]=(0,s.useState)(k),[ee,et]=(0,s.useState)(!1);(0,s.useEffect)(()=>{let t=localStorage.getItem("lgb_logged_in_user"),s=localStorage.getItem("lgb_courses_list"),a=localStorage.getItem("lgb_exams_list");if(t)try{N(JSON.parse(t))}catch(e){console.error("Error al parsear usuario:",e)}else N({ID:"COLLAB-DIRECT",Nombre:"Colaborador LGB",Departamento:"Operaciones",Puesto:"Operador / Técnico",Manager:"Supervisor LGB",Action:"Create Form",Estatus:"Por Certificar",TipoPersonal:"IDL",role:"User"});if(s)try{let e=JSON.parse(s);Array.isArray(e)&&e.length>0&&z(e)}catch(e){console.error("Error al parsear cursos:",e)}if(a)try{let e=JSON.parse(a);e.length>=v.default.length&&e.every(e=>e.questions&&e.questions.length>=10&&e.questions.some(e=>!!e.explanation))?L(e):L(v.default)}catch(e){L(v.default)}else L(v.default);let r=localStorage.getItem("lgb_cert_config");if(r)try{Z(JSON.parse(r))}catch(e){console.error("Error al cargar certConfig:",e)}if(t&&e)try{let s=JSON.parse(t),a=localStorage.getItem("lgb_training_state");if(a){let t=JSON.parse(a),r=t[s.ID]?.[e];r?.certificateFolio&&H(r.certificateFolio),r?.completionDate&&Y(r.completionDate)}}catch(e){console.error(e)}P(!1)},[e]),(0,s.useEffect)(()=>{E||e||(window.location.href=(0,j.getAssetPath)("/"))},[e,E]);let es=e?.trim()||"",ea=(0,s.useMemo)(()=>{if(!es)return null;let e=C.find(e=>e.id.toLowerCase()===es.toLowerCase());return e||I.find(e=>e.id.toLowerCase()===es.toLowerCase())||null},[C,es]),er=(0,s.useMemo)(()=>{if(!es)return null;let e=D.find(e=>e.courseId.toLowerCase()===es.toLowerCase());return e||v.default.find(e=>e.courseId.toLowerCase()===es.toLowerCase())||null},[D,es]),el=(0,s.useMemo)(()=>er?.questions||[],[er]),eo=(0,s.useMemo)(()=>_?el.filter(e=>{let t=F[e.id]===e.correctOptionIndex;return"incorrect"===U?!t:"correct"!==U||t}):[],[el,F,U,_]);if(console.log("courseId:",e),console.log("exam:",er),E)return(0,t.jsx)("div",{className:"min-h-screen bg-slate-900 text-white flex items-center justify-center font-sans",children:(0,t.jsxs)("div",{className:"flex flex-col items-center gap-3",children:[(0,t.jsx)("div",{className:"animate-spin rounded-full h-10 w-10 border-b-2 border-[#0082c8]"}),(0,t.jsx)("p",{className:"text-sm font-semibold tracking-wider text-slate-400",children:"Cargando Evaluación..."})]})});if(!er||0===el.length)return(0,t.jsx)("div",{className:"min-h-screen bg-slate-900 text-white flex items-center justify-center font-sans p-6",children:(0,t.jsxs)("div",{className:"bg-[#1e293b] border border-slate-700 rounded-3xl p-8 max-w-md w-full text-center shadow-2xl animate-fade-in",children:[(0,t.jsx)("div",{className:"w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto mb-4 border border-amber-500/20",children:(0,t.jsx)(c,{className:"w-8 h-8"})}),(0,t.jsx)("h2",{className:"text-xl font-bold text-white mb-2",children:"Examen no encontrado"}),(0,t.jsxs)("p",{className:"text-xs text-slate-400 mb-6 leading-relaxed",children:["No se encontró ninguna evaluación disponible para el identificador de curso:",(0,t.jsx)("br",{}),(0,t.jsx)("span",{className:"font-mono text-amber-300 font-bold bg-slate-800/90 px-3 py-1 rounded-lg mt-2 inline-block border border-slate-700",children:e||"(parámetro vacío)"})]}),(0,t.jsx)("button",{onClick:()=>window.location.href=(0,j.getAssetPath)("/"),className:"w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl transition-all shadow-md cursor-pointer",children:"Volver a Academia Lean"})]})});let ei=(e,t)=>{R(s=>({...s,[e]:t}))},en=Object.keys(F).length,ed=el.length>0&&en===el.length,ec=async()=>{if(!d||!e||!er)return;if(!ed){let e=el.length-en;if(!confirm(`Tienes ${e} pregunta(s) sin responder. Las preguntas no contestadas se calificar\xe1n como incorrectas.

\xbfDeseas finalizar la evaluaci\xf3n de todas formas?`))return}let t=0;el.forEach(e=>{F[e.id]===e.correctOptionIndex&&t++});let s=el.length||10,a=Math.round(t/s*100),r=a>=(er.minScore||80),l=s-t;B({score:a,passed:r,correctCount:t,incorrectCount:l,totalQuestions:s});let o=localStorage.getItem("lgb_training_state"),i=o?JSON.parse(o):{},n=i[d.ID]||{},c=n[e]||{examAttempts:0,contentViewed:!1},m=(c.examAttempts||0)+1;T(m);let x=new Date().toISOString(),f=c.certificateFolio||null;if(r&&!f){let t=Math.floor(1e5+9e5*Math.random()).toString(16).toUpperCase();f=`LGB-${e.substring(0,3).toUpperCase()}-${t}`}r&&(Y(new Date().toLocaleDateString("es-MX",{year:"numeric",month:"short",day:"numeric"})),H(f||`LGB-${e.substring(0,3).toUpperCase()}-PASS`));let p=!r&&m%3==0,b=!0===c.contentViewed,u=r&&b,h={status:u?"completado":"en-progreso",progress:u?100:r?95:p?10:Math.max(c.progress||0,80),contentViewed:!p&&b,examAttempts:m,examScore:a,examPassed:r,completionDate:u?x:c.completionDate||null,certificateFolio:f||c.certificateFolio||null},g={id:`att-${Date.now()}-${Math.random().toString(36).substring(2,6)}`,employeeId:d.ID,courseId:e,courseName:ea?.name||"Curso Lean",score:a,passed:r,correctCount:t,incorrectCount:l,totalQuestions:s,attemptNumber:m,date:new Date().toLocaleDateString("es-MX",{year:"numeric",month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"}),timestamp:x,answers:{...F}};try{let e=localStorage.getItem("lgb_exam_history"),t=e?JSON.parse(e):[];t.unshift(g),localStorage.setItem("lgb_exam_history",JSON.stringify(t))}catch(e){console.error("Error al persistir historial de exámenes:",e)}n[e]=h,i[d.ID]=n,localStorage.setItem("lgb_training_state",JSON.stringify(i));try{await (0,y.saveSupabaseUserProgress)(d.ID,e,h)}catch(e){console.error("Error al guardar progreso en Supabase:",e)}if(u&&f)try{let t=`${d.ID}-${e}`;await (0,y.saveSupabaseCertificate)(t,d.ID,e,ea?.name||"Curso Lean",x,a,f)}catch(e){console.error("Error al registrar certificado en Supabase:",e)}let w=["lean-basics-1","5s-1","5-whys","7-ways","sga-guide"],j=w.every(e=>n[e]?.examPassed===!0),v=w.every(e=>n[e]?.status==="completado"),C=localStorage.getItem("lgb_applied_tools"),k=(C?JSON.parse(C):[]).some(e=>e.employee_number===d.ID&&"Aprobada"===e.status);if(j&&v&&k&&"Certificado"!==d.Estatus){let e={...d,Estatus:"Certificado",Action:"Complete"};N(e),localStorage.setItem("lgb_logged_in_user",JSON.stringify(e));try{await (0,y.updateSupabaseEmployeeDetails)(d.ID,{certification_status:"Certificado"})}catch(e){console.error("Error al actualizar estatus de colaborador a Certificado:",e)}}},em=()=>{window.location.href=(0,j.getAssetPath)("/")},ex=async()=>{if(d&&ea&&_){et(!0);try{let e=X||`LGB-${ea.id.substring(0,3).toUpperCase()}-${Math.floor(1e5+9e5*Math.random()).toString(16).toUpperCase()}`,t=K||new Date().toLocaleDateString("es-MX",{year:"numeric",month:"short",day:"numeric"}),s={userName:d.Nombre,userId:d.ID,courseName:ea.name,courseId:ea.id,completionDate:t,score:_.score,folio:e};await S(s,Q)}catch(e){console.error("Error al descargar certificado:",e)}finally{et(!1)}}},ef=el[M];return ef&&F[ef.id],(0,t.jsxs)("div",{className:"w-screen h-screen bg-[#f3f4f6] flex flex-col font-sans text-slate-800 select-none overflow-hidden m-0 p-0",children:[(0,t.jsxs)("div",{className:"flex justify-between items-center px-6 py-4 bg-white border-b border-slate-200 shadow-sm shrink-0",children:[(0,t.jsxs)("div",{className:"flex items-center gap-1",children:[(0,t.jsxs)("svg",{viewBox:"0 0 100 35",width:"85",height:"30",xmlns:"http://www.w3.org/2000/svg",className:"text-[#0082C8] fill-current",children:[(0,t.jsx)("path",{d:"M12,8 C9,8 7.5,9.5 7.5,12.5 L7.5,30 M3.5,14 L11.5,14",stroke:"#0082C8",strokeWidth:"4.5",strokeLinecap:"round",fill:"none"}),(0,t.jsx)("path",{d:"M16.5,4 L16.5,30",stroke:"#0082C8",strokeWidth:"4.5",strokeLinecap:"round",fill:"none"}),(0,t.jsx)("path",{d:"M26,20 L36,20 C36,13.5 26,13.5 26,20 C26,26.5 36,26.5 37.5,23",stroke:"#0082C8",strokeWidth:"4.2",strokeLinecap:"round",strokeLinejoin:"round",fill:"none"}),(0,t.jsx)("path",{d:"M54.5,12 L44.5,29",stroke:"#0082C8",strokeWidth:"4.2",strokeLinecap:"round",fill:"none"}),(0,t.jsx)("path",{d:"M44.5,12.5 C48,16 51,21 54.5,28.5",stroke:"#0082C8",strokeWidth:"4.8",strokeLinecap:"round",fill:"none"})]}),(0,t.jsx)("span",{className:"text-[10px] font-black text-[#0082C8] tracking-widest uppercase border-l border-slate-300 pl-3",children:"B29 SITE"})]}),(0,t.jsxs)("div",{className:"text-center",children:[(0,t.jsx)("span",{className:"text-[9px] font-black text-[#0082c8] uppercase tracking-wider block",children:"Evaluación Oficial"}),(0,t.jsxs)("h1",{className:"text-sm font-extrabold text-slate-800",children:["Examen de ",ea?.name||"Curso Lean"]})]}),(0,t.jsxs)("div",{className:"flex items-center gap-2",children:[!_&&(0,t.jsx)("button",{onClick:()=>O(e=>"stepped"===e?"full":"stepped"),className:"px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-all border border-slate-200 cursor-pointer",title:"stepped"===q?"Ver todo el cuestionario":"Ver pregunta por pregunta",children:"stepped"===q?(0,t.jsxs)(t.Fragment,{children:[(0,t.jsx)(p,{className:"w-3.5 h-3.5 text-[#0082c8]"}),(0,t.jsx)("span",{className:"hidden sm:inline",children:"Ver Cuestionario Completo"})]}):(0,t.jsxs)(t.Fragment,{children:[(0,t.jsx)(b.Layers,{className:"w-3.5 h-3.5 text-[#0082c8]"}),(0,t.jsx)("span",{className:"hidden sm:inline",children:"Modo Paso a Paso"})]})}),_?(0,t.jsxs)("button",{onClick:em,className:"px-4 py-1.5 rounded-xl bg-[#0082c8] hover:bg-[#0070ad] text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm cursor-pointer",children:[(0,t.jsx)("span",{children:"Volver a la Academia"}),(0,t.jsx)(o.X,{className:"w-3.5 h-3.5"})]}):(0,t.jsxs)("button",{onClick:()=>{confirm("¿Desea salir del examen? Tu progreso en esta evaluación no se guardará.")&&em()},className:"px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-all border border-slate-200 shadow-sm cursor-pointer",children:[(0,t.jsx)("span",{children:"Salir"}),(0,t.jsx)(o.X,{className:"w-3.5 h-3.5"})]})]})]}),(0,t.jsxs)("div",{className:"flex-1 flex flex-col items-center p-4 md:p-6 overflow-y-auto",children:[_?(0,t.jsxs)("div",{className:"max-w-4xl w-full flex flex-col gap-6 pb-12 animate-fade-in",children:[(0,t.jsxs)("div",{className:`bg-white rounded-3xl border shadow-xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 ${_.passed?"border-emerald-200 ring-1 ring-emerald-100":"border-red-200 ring-1 ring-red-100"}`,children:[(0,t.jsxs)("div",{className:"flex items-center gap-5",children:[(0,t.jsx)("div",{className:`w-20 h-20 rounded-2.5xl flex items-center justify-center shrink-0 ${_.passed?"bg-emerald-500/10 text-emerald-600":"bg-red-500/10 text-red-600"}`,children:_.passed?(0,t.jsx)(i.Award,{className:"w-10 h-10 animate-bounce"}):(0,t.jsx)(c,{className:"w-10 h-10"})}),(0,t.jsxs)("div",{children:[(0,t.jsxs)("div",{className:"flex items-center gap-2 mb-1",children:[(0,t.jsx)("span",{className:`text-xs font-black uppercase px-2.5 py-0.5 rounded-full border ${_.passed?"bg-emerald-500/10 text-emerald-600 border-emerald-500/20":"bg-red-500/10 text-red-600 border-red-500/20"}`,children:_.passed?"Aprobado ✅":"Reprobado ❌"}),(0,t.jsxs)("span",{className:"text-[11px] font-bold text-slate-400",children:["Intento #",A]})]}),(0,t.jsx)("h2",{className:"text-2xl font-black text-slate-900",children:_.passed?"¡Felicidades! Examen Acreditado":"Calificación Insuficiente"}),(0,t.jsx)("p",{className:"text-xs text-slate-500 font-semibold mt-1",children:_.passed?`Has superado exitosamente la evaluaci\xf3n oficial de ${ea?.name||"este curso"}.`:"Obtuviste una calificación menor al 80% mínimo requerido. Repasa el material y las explicaciones antes de reintentar."})]})]}),(0,t.jsxs)("div",{className:"flex items-center gap-4 bg-slate-50 border border-slate-200/80 rounded-2xl p-4 shrink-0",children:[(0,t.jsxs)("div",{className:"text-center px-3 border-r border-slate-200",children:[(0,t.jsx)("span",{className:"text-[10px] font-bold text-slate-400 uppercase block",children:"Calificación"}),(0,t.jsxs)("span",{className:`text-3xl font-black ${_.passed?"text-emerald-600":"text-red-600"}`,children:[_.score,(0,t.jsx)("span",{className:"text-sm font-bold text-slate-400",children:"/100"})]})]}),(0,t.jsxs)("div",{className:"space-y-1 text-xs font-bold text-slate-600 pr-2",children:[(0,t.jsxs)("div",{className:"flex items-center gap-2 text-emerald-600",children:[(0,t.jsx)(m.CheckCircle2,{className:"w-3.5 h-3.5"}),(0,t.jsxs)("span",{children:[_.correctCount," Correctas"]})]}),(0,t.jsxs)("div",{className:"flex items-center gap-2 text-red-500",children:[(0,t.jsx)(x.XCircle,{className:"w-3.5 h-3.5"}),(0,t.jsxs)("span",{children:[_.incorrectCount," Incorrectas"]})]}),(0,t.jsx)("div",{className:"text-[10px] text-slate-400 font-normal",children:"Mínimo aprobatorio: 80%"})]})]})]}),(0,t.jsxs)("div",{className:"flex flex-wrap gap-3 items-center",children:[_.passed&&_.score>=80&&(0,t.jsxs)(t.Fragment,{children:[(0,t.jsxs)("button",{onClick:()=>W(!0),className:"flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-bold bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 shadow-sm cursor-pointer transition-all hover:border-emerald-500 hover:text-emerald-600",children:[(0,t.jsx)(w.Eye,{className:"w-4 h-4 text-emerald-600"}),(0,t.jsx)("span",{children:"Ver Certificado"})]}),(0,t.jsxs)("button",{onClick:ex,disabled:ee,className:"flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-md shadow-emerald-600/20 cursor-pointer transition-all scale-100 hover:scale-[1.02] disabled:opacity-70",children:[(0,t.jsx)(i.Award,{className:"w-4 h-4"}),(0,t.jsx)("span",{children:ee?"Generando Certificado...":"🎓 Descargar Certificado"})]})]}),!_.passed&&(0,t.jsxs)("button",{onClick:()=>{G(0),R({}),B(null),J("all")},className:"flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-bold bg-[#0082c8] hover:bg-[#0070ad] text-white shadow-md cursor-pointer transition-all",children:[(0,t.jsx)(n.RotateCcw,{className:"w-4 h-4"}),(0,t.jsx)("span",{children:"Reintentar Examen"})]}),(0,t.jsxs)("button",{onClick:()=>{window.location.href=(0,j.getAssetPath)(`/course-player?courseId=${e}`)},className:"flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-bold bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-sm cursor-pointer transition-all",children:[(0,t.jsx)(f.BookOpen,{className:"w-4 h-4 text-[#0082c8]"}),(0,t.jsx)("span",{children:"Repasar Diapositivas"})]}),(0,t.jsxs)("button",{onClick:em,className:"flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-bold bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-sm cursor-pointer transition-all",children:[(0,t.jsx)(h.History,{className:"w-4 h-4 text-emerald-600"}),(0,t.jsx)("span",{children:"Ver Historial en Academia"})]})]}),(0,t.jsxs)("div",{className:"bg-white rounded-3xl border border-slate-200 shadow-xl p-6 md:p-8",children:[(0,t.jsxs)("div",{className:"flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 border-b border-slate-100 pb-4",children:[(0,t.jsxs)("div",{children:[(0,t.jsxs)("h3",{className:"text-base font-extrabold text-slate-900 flex items-center gap-2",children:[(0,t.jsx)(u.HelpCircle,{className:"w-4 h-4 text-[#0082c8]"}),(0,t.jsx)("span",{children:"Retroalimentación y Explicaciones Oficiales"})]}),(0,t.jsx)("p",{className:"text-xs text-slate-500 font-semibold mt-0.5",children:"Revisa las justificaciones técnicas tomadas directamente de los manuales y PDFs de Lean Enterprise."})]}),(0,t.jsxs)("div",{className:"flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/80 text-xs font-bold",children:[(0,t.jsxs)("button",{onClick:()=>J("all"),className:`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${"all"===U?"bg-white text-slate-800 shadow-sm font-extrabold":"text-slate-500 hover:text-slate-800"}`,children:["Todas (",el.length,")"]}),(0,t.jsxs)("button",{onClick:()=>J("incorrect"),className:`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${"incorrect"===U?"bg-red-50 text-red-600 shadow-sm font-extrabold border border-red-200":"text-slate-500 hover:text-red-600"}`,children:[(0,t.jsx)("span",{children:"Incorrectas"}),(0,t.jsx)("span",{className:"w-4 h-4 rounded-full bg-red-100 text-red-600 text-[10px] flex items-center justify-center font-bold",children:_.incorrectCount})]}),(0,t.jsxs)("button",{onClick:()=>J("correct"),className:`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${"correct"===U?"bg-emerald-50 text-emerald-600 shadow-sm font-extrabold border border-emerald-200":"text-slate-500 hover:text-emerald-600"}`,children:[(0,t.jsx)("span",{children:"Correctas"}),(0,t.jsx)("span",{className:"w-4 h-4 rounded-full bg-emerald-100 text-emerald-600 text-[10px] flex items-center justify-center font-bold",children:_.correctCount})]})]})]}),(0,t.jsx)("div",{className:"space-y-6",children:eo.length>0?eo.map(e=>{let s=F[e.id],a=s===e.correctOptionIndex,r=String.fromCharCode(65+e.correctOptionIndex),l=void 0!==s?String.fromCharCode(65+s):"Sin responder";return(0,t.jsxs)("div",{className:`rounded-2xl border p-5 transition-all ${a?"bg-emerald-50/20 border-emerald-200/80":"bg-red-50/20 border-red-200/80"}`,children:[(0,t.jsxs)("div",{className:"flex justify-between items-start gap-4 mb-2",children:[(0,t.jsxs)("span",{className:"text-[10px] font-bold text-slate-400 uppercase font-mono",children:["Pregunta ",e.questionNumber||e.id]}),(0,t.jsx)("span",{className:`inline-flex items-center gap-1 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full border ${a?"bg-emerald-100/60 text-emerald-700 border-emerald-300/60":"bg-red-100/60 text-red-700 border-red-300/60"}`,children:a?(0,t.jsxs)(t.Fragment,{children:[(0,t.jsx)(m.CheckCircle2,{className:"w-3.5 h-3.5"}),(0,t.jsx)("span",{children:"Correcta (+10 pts)"})]}):(0,t.jsxs)(t.Fragment,{children:[(0,t.jsx)(x.XCircle,{className:"w-3.5 h-3.5"}),(0,t.jsx)("span",{children:"Incorrecta (0 pts)"})]})})]}),(0,t.jsx)("h4",{className:"text-sm font-extrabold text-slate-900 mb-4 leading-snug",children:e.text}),(0,t.jsxs)("div",{className:"grid grid-cols-1 md:grid-cols-2 gap-3 mb-4",children:[(0,t.jsxs)("div",{className:`p-3 rounded-xl border text-xs font-semibold ${a?"bg-emerald-100/30 border-emerald-300 text-emerald-800":"bg-red-100/30 border-red-300 text-red-800"}`,children:[(0,t.jsx)("span",{className:"text-[10px] font-black uppercase block mb-1",children:"Tu Respuesta Seleccionada:"}),(0,t.jsx)("span",{className:"font-bold",children:void 0!==s?`${l}) ${e.options[s]}`:"Ninguna opción seleccionada"})]}),!a&&(0,t.jsxs)("div",{className:"p-3 rounded-xl border bg-emerald-100/30 border-emerald-300 text-emerald-800 text-xs font-semibold",children:[(0,t.jsx)("span",{className:"text-[10px] font-black uppercase block mb-1",children:"Respuesta Correcta:"}),(0,t.jsxs)("span",{className:"font-bold",children:[r,") ",e.options[e.correctOptionIndex]]})]})]}),e.explanation&&(0,t.jsxs)("div",{className:"bg-white/80 border border-slate-200/80 rounded-xl p-3.5 text-xs text-slate-700",children:[(0,t.jsxs)("span",{className:"text-[10px] font-black text-[#0082c8] uppercase tracking-wider block mb-1 flex items-center gap-1",children:[(0,t.jsx)(g.Sparkles,{className:"w-3 h-3 text-[#0082c8]"}),"Explicación Oficial (Clave Lean)"]}),(0,t.jsx)("p",{className:"leading-relaxed font-medium",children:e.explanation})]})]},e.id)}):(0,t.jsx)("div",{className:"text-center py-8 text-slate-400 font-semibold text-xs",children:"No hay preguntas para mostrar en este filtro."})})]})]}):"stepped"===q?(0,t.jsxs)("div",{className:"max-w-3xl w-full bg-white rounded-3xl border border-slate-200 shadow-xl p-6 md:p-8 flex flex-col justify-between min-h-[520px] my-auto",children:[(0,t.jsxs)("div",{className:"shrink-0 mb-5",children:[(0,t.jsxs)("div",{className:"flex justify-between items-center text-[10px] font-black text-slate-500 uppercase mb-2",children:[(0,t.jsxs)("span",{children:["Pregunta ",M+1," de ",el.length]}),(0,t.jsxs)("span",{className:"bg-slate-100 px-2 py-0.5 rounded-full font-mono text-slate-600",children:["Respondidas: ",en,"/",el.length]})]}),(0,t.jsx)("div",{className:"flex gap-1.5 mb-3",children:el.map((e,s)=>{let a=void 0!==F[e.id],r=M===s;return(0,t.jsx)("button",{onClick:()=>G(s),className:`flex-1 h-8 rounded-lg text-xs font-black transition-all flex items-center justify-center cursor-pointer border ${r?"border-[#0082c8] bg-[#0082c8] text-white shadow-md":a?"border-emerald-500/40 bg-emerald-50 text-emerald-700 font-extrabold":"border-slate-200 bg-slate-50 text-slate-400 hover:bg-slate-100"}`,title:`Pregunta ${s+1}${a?" (Respondida)":" (Pendiente)"}`,children:s+1},e.id)})}),(0,t.jsx)("div",{className:"w-full h-1.5 rounded-full bg-slate-100 overflow-hidden shadow-inner",children:(0,t.jsx)("div",{className:"h-full bg-gradient-to-r from-blue-500 to-[#0082C8] transition-all duration-300",style:{width:`${(M+1)/el.length*100}%`}})})]}),(0,t.jsxs)("div",{className:"flex-1 flex flex-col justify-center mb-6",children:[(0,t.jsxs)("span",{className:"text-[10px] font-bold text-[#0082c8] uppercase tracking-widest block mb-2 font-mono",children:["Pregunta ",ef.questionNumber||M+1," • Valor: 10 Puntos"]}),(0,t.jsx)("h2",{className:"text-lg md:text-xl font-extrabold text-slate-900 leading-snug",children:ef.text})]}),(0,t.jsx)("div",{className:"space-y-3 mb-6",children:ef.options.map((e,s)=>{let a=F[ef.id]===s,r=String.fromCharCode(65+s);return(0,t.jsxs)("button",{onClick:()=>ei(ef.id,s),className:`w-full flex items-center gap-4 p-4 rounded-2xl border text-left font-bold text-sm transition-all cursor-pointer ${a?"border-[#0082c8] bg-[#0082c8]/8 text-[#0082c8] shadow-sm ring-1 ring-[#0082c8]":"border-slate-200 hover:border-slate-300 bg-slate-50/60 hover:bg-slate-100/60 text-slate-700"}`,children:[(0,t.jsx)("span",{className:`w-7 h-7 rounded-xl font-black text-xs flex items-center justify-center shrink-0 border transition-all ${a?"bg-[#0082c8] text-white border-transparent":"bg-white border-slate-200 text-slate-500"}`,children:r}),(0,t.jsx)("span",{className:"leading-relaxed",children:e})]},s)})}),(0,t.jsxs)("div",{className:"flex justify-between items-center border-t border-slate-100 pt-5 shrink-0",children:[(0,t.jsxs)("button",{onClick:()=>{M>0&&G(M-1)},disabled:0===M,className:"flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-30 disabled:hover:bg-white text-slate-700 shadow-sm cursor-pointer transition-all",children:[(0,t.jsx)(r.ChevronLeft,{className:"w-4 h-4"}),(0,t.jsx)("span",{children:"Anterior"})]}),(0,t.jsx)("div",{className:"flex items-center gap-3",children:M===el.length-1?(0,t.jsxs)("button",{onClick:ec,className:"flex items-center gap-1.5 px-6 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md cursor-pointer transition-all",children:[(0,t.jsx)("span",{children:"Finalizar y Calificar Examen"}),(0,t.jsx)(m.CheckCircle2,{className:"w-4 h-4"})]}):(0,t.jsxs)("button",{onClick:()=>{M<el.length-1&&G(M+1)},className:"flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold bg-[#0082c8] hover:bg-[#0070ad] text-white shadow-md cursor-pointer transition-all",children:[(0,t.jsx)("span",{children:"Siguiente"}),(0,t.jsx)(l.ChevronRight,{className:"w-4 h-4"})]})})]})]}):(0,t.jsxs)("div",{className:"max-w-4xl w-full flex flex-col gap-6 pb-12",children:[(0,t.jsxs)("div",{className:"bg-white rounded-3xl border border-slate-200 shadow-sm p-6 flex flex-col sm:flex-row justify-between items-center gap-4 sticky top-0 z-20",children:[(0,t.jsxs)("div",{children:[(0,t.jsxs)("h2",{className:"text-base font-extrabold text-slate-800",children:["Cuestionario Completo (",el.length," Preguntas)"]}),(0,t.jsx)("p",{className:"text-xs text-slate-500 font-semibold",children:'Selecciona una respuesta para cada pregunta y presiona "Finalizar y Calificar Examen".'})]}),(0,t.jsxs)("div",{className:"flex items-center gap-3",children:[(0,t.jsxs)("span",{className:"text-xs font-black px-3 py-1 rounded-full bg-slate-100 text-slate-700",children:["Respondidas: ",en," de ",el.length]}),(0,t.jsxs)("button",{onClick:ec,className:"flex items-center gap-1.5 px-6 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md cursor-pointer transition-all",children:[(0,t.jsx)("span",{children:"Finalizar Examen"}),(0,t.jsx)(m.CheckCircle2,{className:"w-4 h-4"})]})]})]}),el.map((e,s)=>{let a=void 0!==F[e.id];return(0,t.jsxs)("div",{className:`bg-white rounded-3xl border p-6 md:p-8 shadow-sm transition-all ${a?"border-slate-200":"border-amber-300 ring-1 ring-amber-200 bg-amber-50/10"}`,children:[(0,t.jsxs)("div",{className:"flex justify-between items-center mb-3",children:[(0,t.jsxs)("span",{className:"text-[10px] font-bold text-[#0082c8] uppercase tracking-widest font-mono",children:["Pregunta ",s+1," de ",el.length," • 10 Pts"]}),a?(0,t.jsx)("span",{className:"text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200",children:"Respondida"}):(0,t.jsx)("span",{className:"text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200",children:"Pendiente"})]}),(0,t.jsx)("h3",{className:"text-base font-extrabold text-slate-900 mb-5 leading-snug",children:e.text}),(0,t.jsx)("div",{className:"grid grid-cols-1 md:grid-cols-2 gap-3",children:e.options.map((s,a)=>{let r=F[e.id]===a,l=String.fromCharCode(65+a);return(0,t.jsxs)("button",{onClick:()=>ei(e.id,a),className:`flex items-center gap-3 p-3.5 rounded-xl border text-left font-bold text-xs transition-all cursor-pointer ${r?"border-[#0082c8] bg-[#0082c8]/8 text-[#0082c8] ring-1 ring-[#0082c8]":"border-slate-200 hover:border-slate-300 bg-slate-50/60 hover:bg-slate-100/60 text-slate-700"}`,children:[(0,t.jsx)("span",{className:`w-6 h-6 rounded-lg font-black text-xs flex items-center justify-center shrink-0 border ${r?"bg-[#0082c8] text-white border-transparent":"bg-white border-slate-200 text-slate-500"}`,children:l}),(0,t.jsx)("span",{className:"leading-snug",children:s})]},a)})})]},e.id)}),(0,t.jsx)("div",{className:"text-center pt-4",children:(0,t.jsx)("button",{onClick:ec,className:"px-8 py-3.5 rounded-2xl text-sm font-extrabold bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg cursor-pointer transition-all",children:"Finalizar y Calificar Examen"})})]}),V&&ea&&d&&_&&_.passed&&_.score>=80&&(0,t.jsx)($,{isOpen:V,onClose:()=>W(!1),data:{userName:d.Nombre,userId:d.ID,courseName:ea.name,courseId:ea.id,completionDate:K||new Date().toLocaleDateString("es-MX",{year:"numeric",month:"short",day:"numeric"}),score:_.score,folio:X||`LGB-${ea.id.substring(0,3).toUpperCase()}-PASS`},certConfig:Q})]})]})}e.s(["default",0,function(){return(0,t.jsx)(s.Suspense,{fallback:(0,t.jsx)("div",{className:"min-h-screen bg-slate-900 text-white flex items-center justify-center font-sans",children:(0,t.jsxs)("div",{className:"flex flex-col items-center gap-3",children:[(0,t.jsx)("div",{className:"animate-spin rounded-full h-10 w-10 border-b-2 border-[#0082c8]"}),(0,t.jsx)("p",{className:"text-sm font-semibold tracking-wider text-slate-400",children:"Cargando..."})]})}),children:(0,t.jsx)(z,{})})}],20361)}]);