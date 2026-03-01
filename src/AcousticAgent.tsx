import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Activity, 
  Database, 
  ShieldAlert, 
  Settings, 
  ChevronRight, 
  Bell, 
  Menu,
  LogOut,
  Maximize2,
  Cpu,
  TrendingUp,
  FileText,
  Sliders,
  Plus,
  Edit2,
  Trash2,
  Save,
  X,
  Zap,
  Waves,
  Beaker,
  Network,
  Box,
  Layers,
  Wind,
  Bot,
  Send,
  MessageSquare,
  Crosshair,
  UploadCloud,
  SlidersHorizontal,
  Settings2,
  Camera,
  History,
  Eye,
  EyeOff,
  Info,
  RefreshCw,
  SearchX,
  MousePointer2
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  LogarithmicScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  BarElement
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  LogarithmicScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  BarElement
);

// --- 聲學常數定義 ---
const RHO = 1.18; 
const C_AIR = 344; 

// --- 靜態數據 ---
const MESH_DATA = [
  { id: "M0", name: "None (Open)", rayl: 0 },
  { id: "M20", name: "#020 (HY)", rayl: 20 },
  { id: "M45", name: "#045 (HY)", rayl: 45 },
  { id: "M65", name: "#065 (HY)", rayl: 65 },
  { id: "M75", name: "#075 (HY)", rayl: 75 },
  { id: "M80", name: "#080 (HY)", rayl: 80 },
  { id: "M90", name: "#090 (HY)", rayl: 90 },
  { id: "M95", name: "#095 (HY)", rayl: 95 },
  { id: "M155", name: "#155 (HY)", rayl: 155 },
  { id: "M160", name: "#160 (HY)", rayl: 160 },
  { id: "M260", name: "#260 (HY)", rayl: 260 },
];

const INITIAL_DRIVERS = [
  {
    id: "DRV-001",
    sku: "SPK001",
    vendor: "CPPP",
    price: "",
    mat: "PET",
    weight: 12.6,
    re: 32,
    dim: 40,
    height: 7.4,
    fs: 95, 
    qts: 0.95,
    qes: "",
    qms: "",
    vas: 0.65,
    mms: 0.65,
    le: 0.15,
    sd: 10.18,
    bl: 2.3,
    spl: 102,
    rawFr: false,
    rawThd: false,
    rawSpl: false
  },
  {
    id: "DRV-006",
    sku: "SPK006",
    vendor: "CPPP",
    price: "USD3.9",
    mat: "Glass",
    weight: 13,
    re: 32,
    dim: 40,
    height: 7.5,
    fs: 89.6,
    qts: 0.813,
    qes: 1.908,
    qms: 1.418,
    vas: 0.6769,
    mms: 0.684,
    le: 0.173,
    sd: 10.18,
    bl: 2.484,
    spl: 105,
    rawFr: true,
    rawThd: false,
    rawSpl: true
  }
];

// --- 介面工具組件 ---
const CompactParam = ({ label, value, unit, onChange, min=0, step=0.1, errorMsg }) => (
  <div className={`flex flex-col bg-white border rounded-xl p-3 shadow-sm transition-all group relative ${errorMsg ? 'border-red-400 ring-1 ring-red-100' : 'border-slate-200 hover:border-blue-300 focus-within:ring-2 focus-within:ring-blue-100 focus-within:border-blue-500'}`}>
    <span className={`text-xs font-bold tracking-wide mb-1.5 transition-colors ${errorMsg ? 'text-red-500' : 'text-slate-500 group-focus-within:text-blue-600'}`}>{label}</span>
    <div className={`flex items-baseline justify-between border-b-2 pb-0.5 ${errorMsg ? 'border-red-200 focus-within:border-red-400' : 'border-transparent focus-within:border-blue-100'}`}>
      <input 
        type="number" 
        value={value} 
        onChange={e => onChange(parseFloat(e.target.value) || 0)} 
        className={`w-full bg-transparent text-lg font-black outline-none p-0 m-0 leading-none ${errorMsg ? 'text-red-600' : 'text-slate-800'}`} 
        min={min} 
        step={step} 
      />
      <span className={`text-xs font-bold ml-2 shrink-0 select-none ${errorMsg ? 'text-red-400' : 'text-slate-400'}`}>{unit}</span>
    </div>
    {errorMsg && <span className="text-[9px] text-red-500 font-bold mt-1.5 leading-tight tracking-tighter">⚠️ {errorMsg}</span>}
  </div>
);

const CompactInput = ({ label, value, onChange, min = 0, step = 0.01 }) => (
  <div className="flex flex-col bg-white border border-slate-200 rounded-xl p-2.5 shadow-sm focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
    <label className="text-[10px] font-extrabold text-slate-400 uppercase mb-1">{label}</label>
    <input 
      type="number" 
      value={value} 
      onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
      min={min}
      step={step}
      className="w-full bg-transparent text-sm font-black text-indigo-700 outline-none"
    />
  </div>
);

// --- 帶有 3D 截面圖卡提示的區域標題組件 ---
const SectionHeaderWithInfo = ({ icon: Icon, title, infoImage, infoText, iconColor = "text-blue-500" }) => (
  <div className="flex items-center space-x-2 text-slate-800 mb-3">
    <Icon size={18} className={iconColor} />
    <h3 className="font-extrabold text-sm">{title}</h3>
    
    <div className="relative group flex items-center">
      <div className="text-slate-300 hover:text-blue-500 cursor-help transition-colors">
        <Info size={18} />
      </div>
      
      {/* 懸停顯示的 3D 圖卡 Tooltip */}
      <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 w-[280px] bg-white/95 backdrop-blur-xl rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.3)] border border-slate-200 p-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-[100] pointer-events-none">
        {/* 左側箭頭 */}
        <div className="absolute top-1/2 -translate-y-1/2 -left-2 w-4 h-4 bg-white border-l border-b border-slate-200 transform rotate-45"></div>
        
        <div className="relative z-10">
          <h4 className="text-xs font-bold text-slate-700 mb-2 border-b border-slate-100 pb-2 leading-tight">
            {title} <br/><span className="text-[10px] text-slate-400 font-normal mt-0.5 inline-block">區域定義與量測標準</span>
          </h4>
          <div className="w-full h-32 bg-slate-50 rounded-lg overflow-hidden mb-3 border border-slate-200 flex items-center justify-center">
            {/* 未來請將 infoImage 的路徑換成您實際匯出的 PPT 圖片 */}
            <img 
              src={infoImage} 
              alt={`${title} 3D截面圖`} 
              className="w-full h-full object-contain p-1"
              onError={(e) => { e.target.src = `https://placehold.co/280x128/f8fafc/475569?text=${encodeURIComponent(title.split(' ')[0])}\\n(3D截面圖佔位)`; }}
            />
          </div>
          <p className="text-[11px] text-slate-500 font-medium leading-relaxed">{infoText}</p>
        </div>
      </div>
    </div>
  </div>
);

// 線性內插函數
const interpolateTarget = (data, targetF) => {
  if (!data || data.length === 0) return 100;
  if (targetF <= data[0].x) return data[0].y;
  if (targetF >= data[data.length - 1].x) return data[data.length - 1].y;
  
  for (let i = 0; i < data.length - 1; i++) {
    if (targetF >= data[i].x && targetF <= data[i+1].x) {
      const ratio = (targetF - data[i].x) / (data[i+1].x - data[i].x);
      return data[i].y + ratio * (data[i+1].y - data[i].y);
    }
  }
  return 100;
};

// --- 物理引擎核心 ---
const calculateResponse = (driver, params, viewMode, circuitType, freqs) => {
  const Sd = (driver.sd || 10.18) * 0.0001;
  const Vas_m3 = (driver.vas || 0.6769) * 0.001;
  const BL = driver.bl || 2.484;
  const Re = driver.re || 32;
  const Mms = (driver.mms || 0.684) * 0.001;
  const Le = (driver.le || 0.173) * 0.001;
  const Fs = driver.fs || 89.6;
  const Qts = driver.qts || 0.813;
  const Spl = driver.spl || 105;
  
  const Cms = 1 / (Math.pow(2 * Math.PI * Fs, 2) * Mms);
  const resonance_sys = 1 / (2 * Math.PI * Math.sqrt(Mms * Cms));
  
  return freqs.map(f => {
    const w = 2 * Math.PI * f;
    let Q_total = Qts * (1 + ((params.v_rear1 || 10) / 100));
    if (circuitType === 'TYPE_E') Q_total = Qts * (1 + ((params.v_rear2 || 50) / 100));
    
    let fn = f / resonance_sys;
    let mag = Math.pow(fn, 2) / Math.sqrt(Math.pow(1 - fn * fn, 2) + Math.pow(fn / Q_total, 2));

    const earpadLeakFactor = params.earpad_pu === 'Velour天鵝絨+TPU' ? 25 : params.earpad_pu === 'Hybrid' ? 8 : 1;
    const totalFrontLeak = (params.front_leak_count * params.front_leak_area) + earpadLeakFactor;
    const leakF_cutoff = totalFrontLeak > 0 ? 10 + (totalFrontLeak * 2) : 0;
    if (f < leakF_cutoff) mag *= Math.pow(f / leakF_cutoff, 2);

    if (circuitType === 'TYPE_A' || circuitType === 'CUSTOM_CIRCUIT') {
      const Ca_rear2 = (params.v_rear2 * 1e-6) / (RHO * C_AIR * C_AIR);
      const portB_res = (C_AIR / (2 * Math.PI)) * Math.sqrt((params.tube_area * 1e-6) / ((params.tube_length * 0.001) * Ca_rear2 || 1e-9));
      const boost_B = 0.8 * Math.exp(-Math.pow(f/portB_res - 1, 2) * (5 + (params.mesh_tube/260)*10)); 
      mag *= (1 + boost_B);
      if (f < 150) mag *= (1 - (1 - params.mesh_a/260) * 0.3 * Math.exp(-Math.pow(f/80, 2)));
      const totalRearLeak = params.rear2_leak_count * params.rear2_leak_area;
      const leakR_cutoff = totalRearLeak > 0 ? 15 + (totalRearLeak * 5) : 0;
      if (f < leakR_cutoff) mag *= Math.pow(f / leakR_cutoff, 1.5);
    } else if (circuitType === 'TYPE_C') {
      const Ca_rear2 = (params.v_rear2 * 1e-6) / (RHO * C_AIR * C_AIR);
      const portC_res = (C_AIR / (2 * Math.PI)) * Math.sqrt((params.tube_area * 1e-6) / ((params.tube_length * 0.001) * Ca_rear2 || 1e-9));
      const boost_C = 0.8 * Math.exp(-Math.pow(f/portC_res - 1, 2) * (5 + (params.mesh_tube/260)*10)); 
      mag *= (1 + boost_C);
      if (f < 150) mag *= (1 - (1 - params.mesh_a/260) * 0.3 * Math.exp(-Math.pow(f/80, 2)));
    } else if (circuitType === 'TYPE_E') {
      if (f < 200) mag *= (1 - (1 - params.mesh_tube/260) * 0.5 * Math.exp(-Math.pow(f/100, 2)));
      const totalRearLeak = params.rear2_leak_count * params.rear2_leak_area;
      const leakR_cutoff = totalRearLeak > 0 ? 15 + (totalRearLeak * 5) : 0;
      if (f < leakR_cutoff) mag *= Math.pow(f / leakR_cutoff, 1.5);
    }
    
    const Z_elec = Math.sqrt(Re * Re + Math.pow(w * Le, 2));
    const Z_motional = (BL * BL) / (w * Mms * 0.1);
    const Impedance = Z_elec + (Z_motional / (1 + fn));

    if (viewMode === 'IMP') return Impedance;
    if (viewMode === 'THD') return Math.min((100 / f) + (mag > 1.2 ? 1.5 : 0.2), 10);
    
    let main_mesh = circuitType === 'TYPE_E' ? params.mesh_tube : params.mesh_a;
    const mesh_loss = 20 * Math.log10(1 + ((main_mesh || 0) * 1e-7 * f)); 
    let spl = 20 * Math.log10(mag + 1e-6) + Spl - mesh_loss;
    return spl;
  });
};

// --- 等效電路圖視覺元件 ---
const CircuitDiagramSVG = ({ type }) => {
  const stackImages = {
    'TYPE_A': '/images/type_a.png',
    'TYPE_C': '/images/type_c.png',
    'TYPE_E': '/images/type_e.png',
    'CUSTOM_CIRCUIT': '/images/type_a.png'
  };
  const hasIndRear = type === 'TYPE_A' || type === 'TYPE_C' || type === 'CUSTOM_CIRCUIT';
  const hasBackLeak = type === 'TYPE_A' || type === 'TYPE_E' || type === 'CUSTOM_CIRCUIT';

  return (
    <div className="w-full h-full bg-[#f8fafc] rounded-2xl border border-slate-200 p-4 relative flex flex-col lg:flex-row gap-4 items-center justify-center overflow-hidden">
      <div className="absolute top-4 left-6 text-[10px] font-bold text-slate-400 tracking-widest flex items-center bg-white px-3 py-1 rounded-full shadow-sm z-20 border border-slate-100">
        <Layers size={12} className="mr-2 text-blue-500" />
        ACOUSTIC ARCHITECTURE: <span className="text-slate-700 ml-1">{type.replace('_', ' ')}</span>
      </div>
      <div className="w-full lg:w-[260px] h-[340px] relative mt-8 lg:mt-0 rounded-2xl bg-white shadow-sm flex flex-col items-center justify-center overflow-hidden shrink-0 border border-slate-200">
        <img 
          src={stackImages[type] || `https://placehold.co/260x340/f8fafc/475569?text=${type}\\n(Image+Missing)`} 
          alt={`Mechanical Stack for ${type}`} 
          className="w-full h-full object-contain p-2" 
          onError={(e) => { e.target.src = `https://placehold.co/260x340/f8fafc/475569?text=${type}\\n(Please+insert+PPT+image)`; }}
        />
      </div>
      <div className="flex-1 w-full h-[320px] relative">
        <svg viewBox="0 0 500 300" className="w-full h-full drop-shadow-sm">
          <defs><marker id="dot" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="4" markerHeight="4"><circle cx="5" cy="5" r="5" fill="#64748b" /></marker></defs>
          <line x1="40" y1="260" x2="460" y2="260" stroke="#94a3b8" strokeWidth="3" />
          <path d="M 250 260 L 250 280 M 230 280 L 270 280 M 240 285 L 260 285 M 245 290 L 255 290" stroke="#94a3b8" strokeWidth="2" fill="none" />
          <text x="120" y="130" textAnchor="middle" className="text-[10px] font-bold fill-sky-600">Node F (前腔)</text>
          {hasIndRear ? (
            <><text x="250" y="130" textAnchor="middle" className="text-[10px] font-bold fill-blue-600">Node R1 (獨立)</text><text x="400" y="130" textAnchor="middle" className="text-[10px] font-bold fill-indigo-600">Node R2 (大背)</text></>
          ) : (<text x="350" y="130" textAnchor="middle" className="text-[10px] font-bold fill-indigo-600">Node R (大背腔)</text>)}
          <line x1="120" y1="140" x2={hasIndRear ? "400" : "350"} y2="140" stroke="#cbd5e1" strokeWidth="3" markerStart="url(#dot)" markerEnd="url(#dot)" />
          {hasIndRear && <circle cx="250" cy="140" r="4" fill="#64748b" />}
          <line x1="120" y1="140" x2="120" y2="190" stroke="#cbd5e1" strokeWidth="3" />
          <line x1="105" y1="190" x2="135" y2="190" stroke="#0284c7" strokeWidth="4" />
          <line x1="105" y1="200" x2="135" y2="200" stroke="#0284c7" strokeWidth="4" />
          <line x1="120" y1="200" x2="120" y2="260" stroke="#cbd5e1" strokeWidth="3" />
          <text x="95" y="200" className="text-[10px] font-bold fill-sky-600">C_af</text>
          <path d="M 150 140 L 150 170 L 140 175 L 160 185 L 140 195 L 160 205 L 150 210 L 150 260" stroke="#10b981" strokeWidth="2" fill="none" />
          <text x="175" y="200" className="text-[9px] font-bold fill-emerald-600">Leak F</text>
          {hasIndRear && (
            <>
              <line x1="250" y1="140" x2="250" y2="190" stroke="#cbd5e1" strokeWidth="3" />
              <line x1="235" y1="190" x2="265" y2="190" stroke="#2563eb" strokeWidth="4" />
              <line x1="235" y1="200" x2="265" y2="200" stroke="#2563eb" strokeWidth="4" />
              <line x1="250" y1="200" x2="250" y2="260" stroke="#cbd5e1" strokeWidth="3" />
              <text x="275" y="200" className="text-[10px] font-bold fill-blue-600">C_ab1</text>
            </>
          )}
          <line x1={hasIndRear ? "400" : "350"} y1="140" x2={hasIndRear ? "400" : "350"} y2="190" stroke="#cbd5e1" strokeWidth="3" />
          <line x1={hasIndRear ? "385" : "335"} y1="190" x2={hasIndRear ? "415" : "365"} y2="190" stroke="#4f46e5" strokeWidth="4" />
          <line x1={hasIndRear ? "385" : "335"} y1="200" x2={hasIndRear ? "415" : "365"} y2="200" stroke="#4f46e5" strokeWidth="4" />
          <line x1={hasIndRear ? "400" : "350"} y1="200" x2={hasIndRear ? "400" : "350"} y2="260" stroke="#cbd5e1" strokeWidth="3" />
          <text x={hasIndRear ? "425" : "375"} y="200" className="text-[10px] font-bold fill-indigo-600">{hasIndRear ? 'C_ab2' : 'C_ab'}</text>
          {hasBackLeak && (
            <>
              <path d={`M ${hasIndRear ? 430 : 380} 140 L ${hasIndRear ? 430 : 380} 170 L ${hasIndRear ? 420 : 370} 175 L ${hasIndRear ? 440 : 390} 185 L ${hasIndRear ? 420 : 370} 195 L ${hasIndRear ? 440 : 390} 205 L ${hasIndRear ? 430 : 380} 210 L ${hasIndRear ? 430 : 380} 260`} stroke="#10b981" strokeWidth="2" fill="none" />
              <text x={hasIndRear ? 455 : 405} y="200" className="text-[9px] font-bold fill-emerald-600">Leak R</text>
            </>
          )}
          <rect x={hasIndRear ? 155 : 205} y="130" width="60" height="20" rx="2" fill="white" stroke={hasIndRear ? "#3b82f6" : "#6366f1"} strokeWidth="2" strokeDasharray="4 2" />
          <text x={hasIndRear ? 185 : 235} y="143" textAnchor="middle" className={`text-[9px] font-bold ${hasIndRear ? 'fill-blue-600' : 'fill-indigo-600'}`}>
            {type === 'TYPE_E' ? 'Port B (Mesh)' : 'Port A (Mesh)'}
          </text>
          {hasIndRear && (
            <>
              <path d="M 295 140 C 305 120, 315 120, 315 140 C 325 120, 335 120, 335 140 C 345 120, 355 120, 355 140" stroke="#8b5cf6" strokeWidth="2" fill="none" />
              <rect x="295" y="135" width="60" height="10" rx="2" fill="white" stroke="#6366f1" strokeWidth="2" />
              <text x="325" y="155" textAnchor="middle" className="text-[9px] font-bold fill-indigo-600">
                {type === 'TYPE_C' ? 'Port C (Tube)' : type === 'CUSTOM_CIRCUIT' ? 'Custom Port (Tube)' : 'Port B (Tube)'}
              </text>
            </>
          )}
          <path d={`M 120 140 L 120 60 L ${hasIndRear ? 250 : 350} 60 L ${hasIndRear ? 250 : 350} 140`} stroke="#cbd5e1" strokeWidth="3" fill="none" />
          <circle cx="150" cy="60" r="15" fill="white" stroke="#e11d48" strokeWidth="3" />
          <path d="M 140 60 Q 145 50 150 60 T 160 60" stroke="#e11d48" strokeWidth="2" fill="none" />
          <text x="150" y="40" textAnchor="middle" className="text-[10px] font-bold fill-rose-600">P_gen</text>
          <rect x={hasIndRear ? 190 : 230} y="50" width="40" height="20" rx="2" fill="white" stroke="#64748b" strokeWidth="2" />
          <text x={hasIndRear ? 210 : 250} y="63" textAnchor="middle" className="text-[9px] font-bold fill-slate-600">Z_d</text>
        </svg>
      </div>
    </div>
  );
};

// --- 子視圖 1：不懂就問 AI 助理 ---
const AiAssistantView = () => {
  const [messages, setMessages] = useState([
    { role: 'ai', text: '你好！我是 Acoustic Agent 專屬的 AI 聲學助理。\n\n有任何關於聲學集中參數模型 (Lumped Parameter Model)、等效電路設計、Mesh 網布阻尼特性，或者是軟體介面操作的問題，都可以隨時問我喔！' }
  ]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  useEffect(() => scrollToBottom(), [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    const userText = input;
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setInput('');
    setTimeout(() => {
      setMessages(prev => [...prev, { role: 'ai', text: `這是一個模擬回覆。\n\n您剛剛說了：「${userText}」\n\n未來這個模塊將透過 API 取得您專屬的聲學工程知識庫來進行準確解答！` }]);
    }, 1000);
  };

  return (
    <div className="space-y-6 h-full flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-2 gap-6 shrink-0">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter">不懂就問 (AI 助理)</h1>
          <p className="text-slate-500 mt-2 font-medium">本地語言 AI 模型介接端點，隨時解答聲學與系統操作疑問。</p>
        </div>
      </div>

      <div className="flex flex-col flex-1 min-h-[650px] bg-white/80 backdrop-blur-xl rounded-3xl border border-white shadow-xl shadow-slate-200/50 overflow-hidden">
        <div className="bg-gradient-to-r from-[#1c2434] to-slate-800 p-4 flex items-center space-x-3 shrink-0">
          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white shadow-lg"><Bot size={22} /></div>
          <div>
            <h2 className="text-white font-bold tracking-wide">Acoustic Agent AI</h2>
            <p className="text-blue-200 text-[10px] flex items-center mt-0.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5 animate-pulse"></span>Local Model Engine Ready</p>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-slate-50/50">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[75%] rounded-2xl p-4 shadow-sm ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-tr-sm' : 'bg-white border border-slate-100 text-slate-700 rounded-tl-sm'}`}>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        <div className="p-4 bg-white border-t border-slate-100 shrink-0">
          <div className="flex items-center space-x-3 bg-slate-50 rounded-2xl p-2 pl-4 border border-slate-200 focus-within:border-blue-400 focus-within:ring-4 focus-within:ring-blue-100 transition-all">
            <input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSend()} placeholder="輸入您的聲學疑問或介面操作問題..." className="flex-1 bg-transparent border-none outline-none text-sm text-slate-700 placeholder:text-slate-400" />
            <button onClick={handleSend} disabled={!input.trim()} className="p-3 bg-blue-600 disabled:bg-slate-300 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-md disabled:shadow-none"><Send size={18} className={!input.trim() ? 'ml-1' : 'ml-1 translate-x-0.5 -translate-y-0.5 transition-transform'} /></button>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- 子視圖 2：腔體預測系統 ---
const CavityPredictionView = ({ drivers }) => {
  const [selectedSimId, setSelectedSimId] = useState(drivers.length > 0 ? drivers[0].id : '');
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [circuitType, setCircuitType] = useState('TYPE_A'); 
  const [sidebarTab, setSidebarTab] = useState('setup'); 

  // Target Curve 狀態管理
  const [showTargetCurve, setShowTargetCurve] = useState(false);
  const [showTargetEditor, setShowTargetEditor] = useState(false); 
  const [targetTab, setTargetTab] = useState('eq'); 
  const [targetUploadedData, setTargetUploadedData] = useState(null);
  const [targetEqBands, setTargetEqBands] = useState([
    { id: 'b1', freq: 60, gain: 0 }, { id: 'b2', freq: 250, gain: 0 },
    { id: 'b3', freq: 1000, gain: 0 }, { id: 'b4', freq: 4000, gain: 0 }, { id: 'b5', freq: 10000, gain: 0 }
  ]);

  // 殘影 (Snapshots) 狀態管理
  const [snapshots, setSnapshots] = useState([]);
  const [showSnapshotPanel, setShowSnapshotPanel] = useState(false);
  const [viewingSnapshot, setViewingSnapshot] = useState(null);

  // 單體詳細資訊 Modal 狀態
  const [viewingDriverDetails, setViewingDriverDetails] = useState(null);

  // --- 圖表框選狀態管理 (Brush Selection) ---
  const [brushState, setBrushState] = useState({ active: false, startX: null, endX: null });
  const [selectedFreqs, setSelectedFreqs] = useState(null);

  const [customDriver, setCustomDriver] = useState({
    sku: 'Custom Prototype', vendor: 'Laboratory', mat: 'Experimental',
    weight: 12.6, dim: 40, height: 7.4, 
    fs: 90, qts: 0.8, vas: 0.65, mms: 0.68, bl: 2.4, re: 32, sd: 10.18, le: 0.15, spl: 105 
  });

  const [params, setParams] = useState({
    v_front: 3.5, front_leak_count: 1, front_leak_area: 0.5, front_leak_length: 2.0,
    v_rear1: 14.0, rear1_port_count: 1, rear1_port_area: 1.2, rear1_port_length: 1.0,
    v_rear2: 50.0, rear2_leak_count: 1, rear2_leak_area: 1.0,
    mesh_a: 160, mesh_tube: 65, tube_length: 15, tube_area: 5.0, 
    earpad_pu: 'Hybrid', earpad_mesh: '美佳布', earpad_foam: '惰性海棉YM 622', earpad_inner_area: 2500, earpad_thickness: 20, earpad_angled: 'No'
  });

  const [viewMode, setViewMode] = useState('FR'); 
  const chartRef = useRef(null);

  // 全域共用頻率陣列
  const freqsArray = useMemo(() => {
    const arr = [];
    for (let f = 20; f <= 20000; f *= Math.pow(2, 1/24)) arr.push(f);
    return arr;
  }, []);

  const effectiveDriver = useMemo(() => {
    if (isCustomMode) return customDriver;
    return drivers.find(d => d.id === selectedSimId) || drivers[0];
  }, [isCustomMode, customDriver, drivers, selectedSimId]);

  const handleDriverSelect = (e) => {
    const val = e.target.value;
    if (val === 'CUSTOM') setIsCustomMode(true);
    else { setIsCustomMode(false); setSelectedSimId(val); }
  };

  const updateParam = (key, val) => setParams(prev => ({ ...prev, [key]: val }));
  const updateCustomDriver = (key, val) => setCustomDriver(prev => ({ ...prev, [key]: val }));
  const updateEqBand = (id, key, val) => { setTargetEqBands(prev => prev.map(band => band.id === id ? { ...band, [key]: val } : band)); clearTargetUpload(); };
  const addEqBand = () => { setTargetEqBands(prev => [...prev, { id: `b${Date.now()}`, freq: 1000, gain: 0 }]); clearTargetUpload(); };
  const removeEqBand = (id) => { setTargetEqBands(prev => prev.filter(band => band.id !== id)); clearTargetUpload(); };
  const clearTargetUpload = () => setTargetUploadedData(null);
  
  const handleTargetUpload = (e) => {
    const file = e.target.files[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const lines = evt.target.result.split('\n');
      const data = [];
      lines.forEach(l => {
        const parts = l.trim().split(/[\s,]+/);
        if(parts.length >= 2) {
          const f = parseFloat(parts[0]); const spl = parseFloat(parts[1]);
          if(!isNaN(f) && !isNaN(spl) && f > 0) data.push({x: f, y: spl});
        }
      });
      data.sort((a, b) => a.x - b.x);
      if(data.length > 0) { setTargetUploadedData(data); setShowTargetCurve(true); }
    };
    reader.readAsText(file);
  };

  // 參數物理合理性驗證邏輯
  const paramErrors = useMemo(() => {
    const errors = {};
    const MSG = "機構參數可能不合理，請與ME討論";
    
    // 面積檢查 (避免設定極端不合理的開孔)
    if (params.front_leak_area > 100) errors.front_leak_area = MSG;
    if (params.rear1_port_area > 100) errors.rear1_port_area = MSG;
    if (params.rear2_leak_area > 100) errors.rear2_leak_area = MSG;
    if (params.tube_area > 100) errors.tube_area = MSG;

    // 長度與厚度檢查 (面積>0時長度不得<=0，以及防止過度誇張的長度)
    if (params.front_leak_area > 0 && params.front_leak_length <= 0) errors.front_leak_length = MSG;
    if (params.front_leak_length > 50) errors.front_leak_length = MSG;

    if (params.rear1_port_area > 0 && params.rear1_port_length <= 0) errors.rear1_port_length = MSG;
    if (params.rear1_port_length > 50) errors.rear1_port_length = MSG;

    if (params.tube_area > 0 && params.tube_length <= 0) errors.tube_length = MSG;
    if (params.tube_length > 100) errors.tube_length = MSG;

    // 耳罩檢查
    if (params.earpad_inner_area < 100 || params.earpad_inner_area > 10000) errors.earpad_inner_area = MSG;
    if (params.earpad_thickness <= 0 || params.earpad_thickness > 50) errors.earpad_thickness = MSG;

    return errors;
  }, [params]);

  const currentFrData = useMemo(() => calculateResponse(effectiveDriver, params, 'FR', circuitType, freqsArray), [effectiveDriver, params, circuitType, freqsArray]);
  const currentImpData = useMemo(() => calculateResponse(effectiveDriver, params, 'IMP', circuitType, freqsArray), [effectiveDriver, params, circuitType, freqsArray]);
  
  const currentTargetData = useMemo(() => {
    return freqsArray.map(f => {
      if (targetUploadedData) return interpolateTarget(targetUploadedData, f);
      let spl = 100;
      targetEqBands.forEach(band => {
        if (band.freq > 0) spl += band.gain * Math.exp(-Math.pow(Math.log10(f / band.freq), 2) * 5);
      });
      return spl;
    });
  }, [freqsArray, targetUploadedData, targetEqBands]);

  const handleSaveSnapshot = () => {
    const colorPalette = ['#f59e0b', '#8b5cf6', '#ec4899', '#0ea5e9', '#14b8a6', '#f43f5e'];
    const color = colorPalette[snapshots.length % colorPalette.length];
    const newSnap = {
      id: Date.now().toString(), name: `Result Snap ${snapshots.length + 1}`, color: color, visible: true,
      frData: currentFrData, impData: currentImpData, circuitType, driver: effectiveDriver, isCustomMode, params: { ...params }
    };
    setSnapshots(prev => [...prev, newSnap]);
    setShowSnapshotPanel(true);
  };

  const removeSnapshot = (id) => setSnapshots(prev => prev.filter(s => s.id !== id));
  const toggleSnapshotVisible = (id) => setSnapshots(prev => prev.map(s => s.id === id ? { ...s, visible: !s.visible } : s));
  const updateSnapshotName = (id, name) => setSnapshots(prev => prev.map(s => s.id === id ? { ...s, name } : s));

  const handleRestoreSnapshot = (snap) => {
    setCircuitType(snap.circuitType); setParams(snap.params);
    if (snap.isCustomMode) { setIsCustomMode(true); setCustomDriver(snap.driver); } 
    else { setIsCustomMode(false); setSelectedSimId(snap.driver.id); }
    setViewingSnapshot(null); 
  };

  const handleMouseDown = (e) => {
    if (viewMode !== 'FR') return;
    const chart = chartRef.current;
    if (!chart) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    if (x >= chart.chartArea.left && x <= chart.chartArea.right) {
      setBrushState({ active: true, startX: x, endX: x });
    }
  };

  const handleMouseMove = (e) => {
    if (!brushState.active || viewMode !== 'FR') return;
    const chart = chartRef.current;
    const rect = e.currentTarget.getBoundingClientRect();
    let x = e.clientX - rect.left;
    x = Math.max(chart.chartArea.left, Math.min(x, chart.chartArea.right));
    setBrushState(prev => ({ ...prev, endX: x }));
  };

  const handleMouseUp = () => {
    if (!brushState.active || viewMode !== 'FR') return;
    const chart = chartRef.current;
    if (brushState.startX !== null && brushState.endX !== null && Math.abs(brushState.endX - brushState.startX) > 10) {
      const f1 = chart.scales.x.getValueForPixel(brushState.startX);
      const f2 = chart.scales.x.getValueForPixel(brushState.endX);
      setSelectedFreqs([Math.min(f1, f2), Math.max(f1, f2)]);
    } else {
      setSelectedFreqs(null); 
    }
    setBrushState({ active: false, startX: null, endX: null });
  };

  const { labels, datasets } = useMemo(() => {
    if (viewMode === 'CIRCUIT') return { labels: [], datasets: [] };

    const simData = viewMode === 'FR' ? currentFrData : viewMode === 'IMP' ? currentImpData : calculateResponse(effectiveDriver, params, viewMode, circuitType, freqsArray);

    let borderColor = viewMode === 'FR' ? '#2563eb' : viewMode === 'IMP' ? '#db2777' : '#f59e0b';
    let bgColor = viewMode === 'FR' ? 'rgba(37, 99, 235, 0.05)' : viewMode === 'IMP' ? 'rgba(219, 39, 119, 0.05)' : 'rgba(245, 158, 11, 0.05)';
    if (isCustomMode) { borderColor = '#8b5cf6'; bgColor = 'rgba(139, 92, 246, 0.05)'; }

    const finalDatasets = [{
      label: viewMode === 'FR' ? 'SPL (dB)' : viewMode === 'IMP' ? 'Impedance (Ω)' : 'THD (%)',
      data: simData, borderColor, backgroundColor: bgColor, fill: true, pointRadius: 0, borderWidth: 2.5, tension: 0.4
    }];

    if (viewMode === 'FR' && showTargetCurve) {
      finalDatasets.push({
        label: 'Target Curve', data: currentTargetData, borderColor: '#10b981', borderDash: [5, 5], backgroundColor: 'transparent', fill: false, pointRadius: 0, borderWidth: 2, tension: 0.4
      });
    }

    if (viewMode === 'FR' || viewMode === 'IMP') {
      const activeSnapshots = snapshots.filter(s => s.visible);
      activeSnapshots.forEach(snap => {
        finalDatasets.push({
          label: snap.name, data: viewMode === 'FR' ? snap.frData : snap.impData, borderColor: snap.color, borderDash: [4, 4], backgroundColor: 'transparent', fill: false, pointRadius: 0, borderWidth: 1.5, tension: 0.4
        });
      });
    }

    return { labels: freqsArray.map(f => f.toFixed(0)), datasets: finalDatasets };
  }, [currentFrData, currentImpData, currentTargetData, effectiveDriver, params, viewMode, isCustomMode, circuitType, showTargetCurve, snapshots, freqsArray]);

  const chartOptions = {
    responsive: true, maintainAspectRatio: false,
    scales: {
      x: { type: 'logarithmic', min: 20, max: 20000, title: { display: true, text: 'Frequency (Hz)', font: { size: 10 } }, ticks: { callback: (val) => [20, 100, 1000, 10000, 20000].includes(val) ? val : '' } },
      y: { min: viewMode === 'FR' ? 60 : 0, max: viewMode === 'FR' ? 125 : viewMode === 'THD' ? 10 : 100, title: { display: true, text: viewMode === 'FR' ? 'SPL (dB)' : viewMode === 'THD' ? 'THD (%)' : 'Impedance (Ω)', font: { size: 10 } } }
    },
    plugins: { legend: { display: false }, tooltip: { mode: 'index', intersect: false } },
    animation: { duration: 400 },
    interaction: { mode: 'nearest', axis: 'x', intersect: false }
  };

  const paramLabels = {
    v_front: '前腔容積 (cc)', front_leak_count: '前腔洩漏孔數', front_leak_area: '前腔洩漏面積 (mm²)', front_leak_length: '前腔洩漏長度 (mm)',
    v_rear1: '獨立背腔容積 (cc)', rear1_port_count: '背腔1連通孔數', rear1_port_area: '背腔1連通面積 (mm²)', rear1_port_length: '背腔1連通長度 (mm)',
    v_rear2: '大背腔容積 (cc)', rear2_leak_count: '大背腔洩漏孔數', rear2_leak_area: '大背腔洩漏面積 (mm²)',
    mesh_a: '連通孔 A 網布 (Rayls)', mesh_tube: '連通管/孔 網布 (Rayls)', tube_length: '調音管長度 (mm)', tube_area: '調音管面積 (mm²)', 
    earpad_pu: '耳罩-PU皮革', earpad_mesh: '耳罩-網布', earpad_foam: '耳罩-泡棉', earpad_inner_area: '耳罩-內徑面積 (mm²)', earpad_thickness: '耳罩-厚度 (mm)', earpad_angled: '耳罩-斜角'
  };

  const aiDiagnosticAnalysis = useMemo(() => {
    if (!selectedFreqs || !showTargetCurve) return null;
    const indices = freqsArray.map((f, i) => f >= selectedFreqs[0] && f <= selectedFreqs[1] ? i : -1).filter(i => i !== -1);
    if (indices.length === 0) return null;

    const simAvg = indices.reduce((sum, i) => sum + currentFrData[i], 0) / indices.length;
    const targetAvg = indices.reduce((sum, i) => sum + currentTargetData[i], 0) / indices.length;
    const diff = simAvg - targetAvg; 
    const absDiff = Math.abs(diff);

    const centerFreq = (selectedFreqs[0] + selectedFreqs[1]) / 2;
    let bandName = "中頻 (Mids)";
    if (centerFreq < 250) bandName = "低頻 (Bass)";
    else if (centerFreq > 4000) bandName = "高頻 (Highs / Air)";

    let action = "目前頻響與 Target 吻合度高，無需大幅調整。";
    let risk = "無明顯風險";
    let statusColor = "text-emerald-500";

    if (absDiff > 1.5) {
      statusColor = diff > 0 ? "text-rose-500" : "text-blue-500";
      if (centerFreq < 250) {
        if (diff < 0) { 
          if (circuitType === 'TYPE_A' || circuitType === 'TYPE_C' || circuitType === 'CUSTOM_CIRCUIT') {
            action = "建議加長調音管長度，或增大大背腔容積，並檢查前腔是否過度洩漏。";
            risk = "管長過長可能產生共振雜音，容積過大會降低系統承受功率。";
          } else {
            action = "建議降低前腔或背腔的洩漏量，換用密封性更佳的耳罩皮革。";
            risk = "過度密封可能導致配戴悶熱或單體氣壓不平衡 (Clicking)。";
          }
        } else { 
          action = "建議縮短調音管，或適度增加前腔洩漏面積 (Front Leak)。";
          risk = "增加前腔洩漏會導致極低頻 (Sub-bass) 大幅滾降。";
        }
      } else if (centerFreq > 4000) {
        if (diff > 0) { 
          action = `建議提高「${circuitType === 'TYPE_E' ? '連通孔B' : '連通孔A'}」的 SAATI Mesh 阻尼值 (增加 Rayls)。`;
          risk = "阻尼過高可能造成高頻細節喪失，聲音聽起來發悶。";
        } else { 
          action = `建議降低「${circuitType === 'TYPE_E' ? '連通孔B' : '連通孔A'}」的 SAATI Mesh 阻尼值，或減少前腔容積。`;
          risk = "阻尼過低可能造成 3kHz-5kHz 齒音過重，導致聽覺疲勞。";
        }
      } else { 
        action = "中頻區域主要由單體本身 T/S 參數與振膜特性決定。";
        risk = "若需大幅改變中頻，可能需要重新選用或開模設計不同的 Driver。";
      }
    }

    return { bandStr: `${Math.round(selectedFreqs[0])} - ${Math.round(selectedFreqs[1])} Hz`, diff, absDiff, bandName, action, risk, statusColor };
  }, [selectedFreqs, showTargetCurve, freqsArray, currentFrData, currentTargetData, circuitType]);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* 獨立模組的 Header 區塊 */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-2 gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter">頻響預測系統</h1>
          <p className="text-slate-500 mt-2 font-medium">整合 Lumped Parameter Model 與多階聲學類比電路。</p>
        </div>
        <div className="flex space-x-3">
          <button onClick={handleSaveSnapshot} className="flex items-center px-4 py-2.5 bg-blue-600 text-white rounded-2xl text-xs font-black shadow-lg shadow-blue-500/30 hover:bg-blue-700 transition-colors">
            <Camera size={16} className="mr-2" />記錄結果
          </button>
          <button onClick={() => setShowSnapshotPanel(!showSnapshotPanel)} className={`flex items-center px-4 py-2.5 rounded-2xl text-xs font-black border transition-all ${showSnapshotPanel ? 'bg-indigo-50 border-indigo-200 text-indigo-700 shadow-sm' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 shadow-sm'}`}>
            <History size={16} className="mr-2" />預測結果管理 ({snapshots.length})
          </button>
          <button className="px-5 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs font-black shadow-sm hover:bg-slate-50 transition-all uppercase tracking-widest text-slate-700">
            Export Report
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* 左側面板 - 加入 relative z-40 確保懸浮圖卡不會被右側圖表覆蓋 */}
        <div className="lg:col-span-4 space-y-4 relative z-40">
          <div className="flex bg-white/60 backdrop-blur-md p-1.5 rounded-2xl border border-white shadow-sm mb-2">
            <button onClick={() => setSidebarTab('setup')} className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex justify-center items-center ${sidebarTab === 'setup' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:bg-white/50'}`}><Beaker size={14} className="mr-1.5" /> 選用設定</button>
            <button onClick={() => setSidebarTab('mech')} className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex justify-center items-center ${sidebarTab === 'mech' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:bg-white/50'}`}><Box size={14} className="mr-1.5" /> 機構設計</button>
            <button onClick={() => setSidebarTab('tuning')} className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex justify-center items-center ${sidebarTab === 'tuning' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:bg-white/50'}`}><Waves size={14} className="mr-1.5" /> 被動調音</button>
          </div>

          {/* 頁籤內容 1：等效迴路形式選擇 + 單體選用 */}
          {sidebarTab === 'setup' && (
            <div className="bg-white/60 backdrop-blur-md p-6 rounded-2xl border border-white shadow-sm transition-all duration-300 animate-in slide-in-from-left-2">
              
              {/* 第一部分：等效迴路形式選擇 */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2 text-slate-800">
                  <Network size={18} className="text-blue-500" />
                  <h3 className="font-extrabold text-sm">等效迴路形式選擇</h3>
                </div>
              </div>
              <select value={circuitType} onChange={(e) => setCircuitType(e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm font-bold text-blue-700 focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none cursor-pointer shadow-sm mb-6">
                <option value="TYPE_A">A迴路 (HDT001) - 雙背腔 + 導管B + 雙開孔</option>
                <option value="TYPE_C">C迴路 (HDT002) - 雙背腔 + 導管C (大背腔密閉)</option>
                <option value="TYPE_E">E迴路 (HDT003) - 單背腔 + 連通孔B + 雙開孔</option>
                <option value="CUSTOM_CIRCUIT">自定義迴路 (全參數開放)</option>
              </select>

              {/* 第二部分：目標單體選用 */}
              <div className="pt-6 border-t border-slate-200">
                <div className="flex items-center justify-between mb-4">
                  <div className={`flex items-center space-x-2 ${isCustomMode ? 'text-indigo-600' : 'text-slate-800'}`}>
                    {isCustomMode ? <Beaker size={18} /> : <Zap size={18} className="text-amber-500" />}
                    <h3 className="font-extrabold text-sm">目標單體選用</h3>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${isCustomMode ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-500'}`}>{isCustomMode ? 'Sandbox' : 'Database'}</span>
                </div>
                
                <select value={isCustomMode ? 'CUSTOM' : selectedSimId} onChange={handleDriverSelect} className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none cursor-pointer mb-5 shadow-sm">
                  <optgroup label="資料庫已建檔單體 (Database)">{drivers.map(d => <option key={d.id} value={d.id}>{d.sku} ({d.vendor})</option>)}</optgroup>
                  <optgroup label="實驗室推演 (Sandbox)"><option value="CUSTOM">✨ 自定義單體 (Custom Prototype)</option></optgroup>
                </select>

                {/* 單體資訊卡 (非自定義模式顯示) */}
                {!isCustomMode && (
                  <div 
                    onClick={() => setViewingDriverDetails(effectiveDriver)}
                    className="flex items-center p-3 bg-white border border-slate-200 rounded-xl shadow-sm cursor-pointer hover:border-blue-400 hover:shadow-md transition-all group relative"
                    title="點擊查看完整單體建檔資訊"
                  >
                    <div className="w-[50px] h-[50px] bg-[#1c2434] rounded-xl flex items-center justify-center text-white font-black text-sm tracking-tighter shrink-0 transition-transform group-hover:scale-105">
                      Ø{effectiveDriver.dim || '--'}
                    </div>
                    <div className="ml-3 flex flex-col justify-center">
                      <span className="text-base font-black text-slate-800 leading-tight group-hover:text-blue-700 transition-colors">{effectiveDriver.sku || 'Unknown'}</span>
                      <span className="text-[11px] font-medium text-slate-500 mt-1">
                        {effectiveDriver.vendor || '--'} · {effectiveDriver.mat || '--'} Diaphragm · {effectiveDriver.re || '--'}Ω
                      </span>
                    </div>
                    <div className="ml-auto mr-2 text-slate-300 group-hover:text-blue-500 transition-colors">
                      <Info size={20} />
                    </div>
                  </div>
                )}

                {/* 自定義單體參數輸入 */}
                {isCustomMode && (
                  <div className="animate-in fade-in zoom-in-95 duration-300 bg-indigo-50/50 rounded-xl p-5 border border-indigo-100/50">
                    <p className="text-xs text-indigo-600 font-bold mb-4 flex items-center"><Beaker size={14} className="mr-1.5"/> 自定義參數</p>
                    <div className="grid grid-cols-2 lg:grid-cols-2 gap-3">
                      <div className="flex flex-col bg-white border border-slate-200 rounded-xl p-2.5 shadow-sm focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-100 transition-all col-span-2">
                        <label className="text-[10px] font-extrabold text-slate-400 uppercase mb-1">振膜材質 (Material)</label>
                        <input type="text" value={customDriver.mat} onChange={e => updateCustomDriver('mat', e.target.value)} className="w-full bg-transparent text-sm font-black text-indigo-700 outline-none" />
                      </div>
                      <CompactInput label="總重量 (Weight)" value={customDriver.weight} onChange={v => updateCustomDriver('weight', v)} />
                      <CompactInput label="音圈阻抗 (Re)" value={customDriver.re} onChange={v => updateCustomDriver('re', v)} />
                      <CompactInput label="尺寸 Ø (Dimension)" value={customDriver.dim} onChange={v => updateCustomDriver('dim', v)} />
                      <CompactInput label="尺寸 H (Dimension)" value={customDriver.height} onChange={v => updateCustomDriver('height', v)} />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 頁籤內容 2：機構設計 */}
          {sidebarTab === 'mech' && (
            <div className="bg-white/60 backdrop-blur-md p-6 rounded-2xl border border-white shadow-sm space-y-6 animate-in slide-in-from-left-2">
              <div className="space-y-3">
                <SectionHeaderWithInfo 
                  icon={Box} 
                  title="前腔 (Front Cavity)" 
                  infoImage="/images/info_front_cavity.png" 
                  infoText="定義範圍：包含單體振膜前方至耳道之密閉或半密閉空間。影響前腔洩漏與高頻諧振，量測標準依據 IEC 相關規範進行估算。" 
                />
                <div className="grid grid-cols-2 gap-3">
                  <CompactParam label="容積" value={params.v_front} unit="cc" onChange={v => updateParam('v_front', v)} errorMsg={paramErrors.v_front} />
                  <CompactParam label="洩漏孔數" value={params.front_leak_count} unit="pcs" step={1} onChange={v => updateParam('front_leak_count', v)} errorMsg={paramErrors.front_leak_count} />
                  <CompactParam label="洩漏截面積" value={params.front_leak_area} unit="mm²" onChange={v => updateParam('front_leak_area', v)} errorMsg={paramErrors.front_leak_area} />
                  <CompactParam label="洩漏長度" value={params.front_leak_length} unit="mm" onChange={v => updateParam('front_leak_length', v)} errorMsg={paramErrors.front_leak_length} />
                </div>
              </div>
              {(circuitType === 'TYPE_A' || circuitType === 'TYPE_C' || circuitType === 'CUSTOM_CIRCUIT') && (
                <div className="space-y-3 pt-5 border-t border-slate-200/60 animate-in fade-in">
                  <SectionHeaderWithInfo 
                    icon={Box} 
                    title="獨立背腔 (Rear Cavity 1)" 
                    infoImage="/images/info_rear_cavity_1.png" 
                    infoText="定義範圍：單體後方第一層密閉或半密閉腔體。主要影響系統中高頻之聲學順性與阻尼過渡特性。" 
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <CompactParam label="容積" value={params.v_rear1} unit="cc" onChange={v => updateParam('v_rear1', v)} errorMsg={paramErrors.v_rear1} />
                    <CompactParam label="連通孔數" value={params.rear1_port_count} unit="pcs" step={1} onChange={v => updateParam('rear1_port_count', v)} errorMsg={paramErrors.rear1_port_count} />
                    <CompactParam label="連通孔截面積" value={params.rear1_port_area} unit="mm²" onChange={v => updateParam('rear1_port_area', v)} errorMsg={paramErrors.rear1_port_area} />
                    <CompactParam label="連通孔長度" value={params.rear1_port_length} unit="mm" onChange={v => updateParam('rear1_port_length', v)} errorMsg={paramErrors.rear1_port_length} />
                  </div>
                </div>
              )}
              <div className="space-y-3 pt-5 border-t border-slate-200/60 animate-in fade-in">
                <SectionHeaderWithInfo 
                  icon={Box} 
                  title={`大背腔 (${circuitType === 'TYPE_E' ? 'Rear Cavity' : 'Rear Cavity 2'})`} 
                  infoImage="/images/info_rear_cavity_2.png" 
                  infoText="定義範圍：耳機最外層之主要背腔。決定系統主共振頻率 (Sys f0) 與整體低頻下潛之極限能力。" 
                />
                <div className="grid grid-cols-2 gap-3">
                  <CompactParam label="容積" value={params.v_rear2} unit="cc" onChange={v => updateParam('v_rear2', v)} errorMsg={paramErrors.v_rear2} />
                  {(circuitType === 'TYPE_A' || circuitType === 'TYPE_E' || circuitType === 'CUSTOM_CIRCUIT') && <CompactParam label="洩漏孔數" value={params.rear2_leak_count} unit="pcs" step={1} onChange={v => updateParam('rear2_leak_count', v)} errorMsg={paramErrors.rear2_leak_count} />}
                  {(circuitType === 'TYPE_A' || circuitType === 'TYPE_E' || circuitType === 'CUSTOM_CIRCUIT') && <CompactParam label="洩漏截面積" value={params.rear2_leak_area} unit="mm²" onChange={v => updateParam('rear2_leak_area', v)} errorMsg={paramErrors.rear2_leak_area} />}
                </div>
              </div>
            </div>
          )}

          {/* 頁籤內容 3：被動調音 */}
          {sidebarTab === 'tuning' && (
            <div className="bg-white/60 backdrop-blur-md p-6 rounded-2xl border border-white shadow-sm space-y-6 animate-in slide-in-from-left-2">
              <div className="space-y-4">
                <div className="flex items-center space-x-2 text-slate-800 mb-3">
                  <Waves size={18} className="text-emerald-500" />
                  <h3 className="font-extrabold text-sm">阻尼網布 (SAATI Mesh)</h3>
                </div>
                {(circuitType === 'TYPE_A' || circuitType === 'TYPE_C' || circuitType === 'CUSTOM_CIRCUIT') && (
                  <div><label className="text-xs font-bold text-slate-500 block mb-2">連通孔 A 網布</label><select value={params.mesh_a} onChange={(e) => updateParam('mesh_a', parseInt(e.target.value))} className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm font-bold text-slate-800 focus:ring-2 focus:ring-emerald-100 focus:border-emerald-400 outline-none cursor-pointer shadow-sm transition-all">{MESH_DATA.map(m => <option key={m.id} value={m.rayl}>{m.name} - {m.rayl} Rayls</option>)}</select></div>
                )}
                <div><label className="text-xs font-bold text-slate-500 block mb-2">{circuitType === 'TYPE_A' ? '連通管 B 網布' : circuitType === 'TYPE_C' ? '連通管 C 網布' : circuitType === 'CUSTOM_CIRCUIT' ? '自定義連通管/孔 網布' : '連通孔 B 網布'}</label><select value={params.mesh_tube} onChange={(e) => updateParam('mesh_tube', parseInt(e.target.value))} className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm font-bold text-slate-800 focus:ring-2 focus:ring-emerald-100 focus:border-emerald-400 outline-none cursor-pointer shadow-sm transition-all">{MESH_DATA.map(m => <option key={m.id} value={m.rayl}>{m.name} - {m.rayl} Rayls</option>)}</select></div>
              </div>
              <div className="space-y-3 pt-5 border-t border-slate-200/60">
                <div className="flex items-center space-x-2 text-slate-800 mb-3">
                  <Wind size={18} className="text-emerald-500" />
                  <h3 className="font-extrabold text-sm">調音管 ({circuitType === 'TYPE_C' ? 'Tube C' : circuitType === 'CUSTOM_CIRCUIT' ? 'Custom Tube' : 'Tube B'})</h3>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <CompactParam label="管長" value={params.tube_length} unit="mm" onChange={v => updateParam('tube_length', v)} errorMsg={paramErrors.tube_length} />
                  <CompactParam label="管截面積" value={params.tube_area} unit="mm²" onChange={v => updateParam('tube_area', v)} errorMsg={paramErrors.tube_area} />
                </div>
              </div>
              <div className="space-y-3 pt-5 border-t border-slate-200/60 animate-in fade-in">
                <SectionHeaderWithInfo 
                  icon={Activity} 
                  title="耳罩參數 (Earpads)" 
                  infoImage="/images/info_earpads.png" 
                  infoText="定義範圍：耳罩物理尺寸與材質結構。直接影響前腔整體洩漏率 (Leakage) 與低頻區段之聲學短路效應。" 
                  iconColor="text-emerald-500"
                />
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-500 block mb-2">外圈 PU 皮革材質</label>
                    <select value={params.earpad_pu} onChange={(e) => updateParam('earpad_pu', e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm font-bold text-slate-800 focus:ring-2 focus:ring-emerald-100 focus:border-emerald-400 outline-none cursor-pointer shadow-sm transition-all">
                      <option value="Leather國產蛋白皮">Leather 國產蛋白皮 (封閉佳 / 洩漏低)</option>
                      <option value="Hybrid">Hybrid (半開放 / 洩漏中)</option>
                      <option value="Velour天鵝絨+TPU">Velour 天鵝絨+TPU (開放 / 洩漏高)</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-slate-500 block mb-2">中間網布材質</label>
                      <select value={params.earpad_mesh} onChange={(e) => updateParam('earpad_mesh', e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm font-bold text-slate-800 focus:ring-2 focus:ring-emerald-100 focus:border-emerald-400 outline-none cursor-pointer shadow-sm transition-all"><option value="美佳布">美佳布</option></select>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-500 block mb-2">中間泡棉材質</label>
                      <select value={params.earpad_foam} onChange={(e) => updateParam('earpad_foam', e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm font-bold text-slate-800 focus:ring-2 focus:ring-emerald-100 focus:border-emerald-400 outline-none cursor-pointer shadow-sm transition-all"><option value="惰性海棉YM 622">惰性海棉YM 622</option></select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <CompactParam label="內徑面積" value={params.earpad_inner_area} unit="mm²" onChange={v => updateParam('earpad_inner_area', v)} errorMsg={paramErrors.earpad_inner_area} />
                    <CompactParam label="未壓縮厚度" value={params.earpad_thickness} unit="mm" onChange={v => updateParam('earpad_thickness', v)} errorMsg={paramErrors.earpad_thickness} />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 block mb-2">是否為斜角設計 (Angled)</label>
                    <select value={params.earpad_angled} onChange={(e) => updateParam('earpad_angled', e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm font-bold text-slate-800 focus:ring-2 focus:ring-emerald-100 focus:border-emerald-400 outline-none cursor-pointer shadow-sm transition-all">
                      <option value="No">否 (Flat)</option><option value="Yes">是 (Angled)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 右側：圖表與動態編輯面板 */}
        <div className="lg:col-span-8 space-y-6 flex flex-col h-full min-h-[600px]">
          <div className="bg-white/80 backdrop-blur-xl p-6 rounded-3xl border border-white shadow-xl shadow-slate-200/50 flex flex-col min-h-[520px] h-fit transition-all duration-300">
            
            {/* Header: Controls */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-4 shrink-0 gap-3">
              <div className="flex items-center space-x-2">
                <div className="flex bg-slate-100 p-1 rounded-xl whitespace-nowrap">
                  {[
                    { id: 'CIRCUIT', label: '架構圖 / 電路圖', color: 'bg-white text-slate-800 shadow-sm' },
                    { id: 'FR', label: 'FR 頻響', color: 'bg-white text-blue-600 shadow-sm' },
                    { id: 'THD', label: 'THD 失真', color: 'bg-white text-amber-600 shadow-sm' },
                    { id: 'IMP', label: 'IMP 阻抗', color: 'bg-white text-pink-600 shadow-sm' }
                  ].map(v => (
                    <button key={v.id} onClick={() => setViewMode(v.id)} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${viewMode === v.id ? v.color : 'text-slate-400 hover:text-slate-600'}`}>{v.label}</button>
                  ))}
                </div>
              </div>

              <div className="flex items-center space-x-4">
                {/* Target 控制按鈕組 (移至右側並僅非電路圖時顯示) */}
                {viewMode === 'FR' && (
                  <div className="flex items-center space-x-1.5 bg-white p-1 rounded-xl border border-slate-200">
                    <button onClick={() => { const willShow = !showTargetCurve; setShowTargetCurve(willShow); if(willShow && !showTargetEditor) setShowTargetEditor(true); }} className={`flex items-center px-2 py-1.5 rounded-lg text-[11px] font-bold transition-all ${showTargetCurve ? 'bg-emerald-50 text-emerald-600' : 'text-slate-400 hover:bg-slate-50'}`}>
                      <Crosshair size={14} className="mr-1" />Target {showTargetCurve ? 'ON' : 'OFF'}
                    </button>
                    {showTargetCurve && <button onClick={() => setShowTargetEditor(!showTargetEditor)} className={`p-1.5 ml-0.5 rounded-lg transition-all ${showTargetEditor ? 'bg-slate-800 text-white' : 'text-slate-400 hover:bg-slate-100'}`}><Settings2 size={14} /></button>}
                  </div>
                )}
                
                <div className="flex items-center space-x-2 text-[10px] font-bold text-slate-400">
                  <span className={`w-2 h-2 rounded-full ${isCustomMode ? 'bg-indigo-500 animate-pulse' : 'bg-blue-500'}`}></span>
                  <span>{isCustomMode ? 'Custom Simulation' : 'Simulated Data'}</span>
                </div>
              </div>
            </div>
            
            <div className="flex-1 w-full relative min-h-[350px]">
              {viewMode === 'CIRCUIT' ? <CircuitDiagramSVG type={circuitType} /> : (
                <div 
                  className="absolute inset-0 cursor-crosshair group"
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                  onDoubleClick={() => { setSelectedFreqs(null); setBrushState({active: false, startX: null, endX: null}); }}
                >
                  <Line ref={chartRef} options={chartOptions} data={{ labels, datasets }} />
                  
                  {/* 動態渲染框選遮罩 */}
                  {(brushState.startX !== null && brushState.endX !== null) && (
                    <div 
                      className="absolute bg-emerald-500/20 border-x border-emerald-500/50 pointer-events-none"
                      style={{
                        left: Math.min(brushState.startX, brushState.endX),
                        width: Math.abs(brushState.endX - brushState.startX),
                        top: chartRef.current?.chartArea?.top || 0,
                        height: chartRef.current?.chartArea?.height || '100%'
                      }}
                    />
                  )}
                  {/* 持續顯示已選定的頻段遮罩 */}
                  {(!brushState.active && selectedFreqs && chartRef.current) && (
                    <div 
                      className="absolute bg-emerald-500/10 border-x border-emerald-500/50 pointer-events-none flex items-start justify-center"
                      style={{
                        left: chartRef.current.scales.x.getPixelForValue(selectedFreqs[0]),
                        width: chartRef.current.scales.x.getPixelForValue(selectedFreqs[1]) - chartRef.current.scales.x.getPixelForValue(selectedFreqs[0]),
                        top: chartRef.current.chartArea.top,
                        height: chartRef.current.chartArea.height
                      }}
                    >
                      <span className="bg-emerald-500 text-white text-[9px] px-1.5 py-0.5 rounded-b font-bold shadow-sm mt-0.5">已框選</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 內嵌式 Snapshots 殘影管理面板 */}
            {showSnapshotPanel && viewMode !== 'CIRCUIT' && (
              <div className="mt-4 border-t border-slate-200/80 pt-4 animate-in slide-in-from-bottom-4 duration-300">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold text-slate-600 flex items-center"><History size={14} className="mr-1.5"/> 預測結果對比管理</h4>
                  <button onClick={() => setShowSnapshotPanel(false)} className="text-slate-400 hover:bg-slate-100 p-1 rounded-full"><X size={14}/></button>
                </div>
                {snapshots.length === 0 ? (
                  <p className="text-xs text-slate-400 bg-slate-50 p-3 rounded-xl border border-slate-100">目前尚無預測記錄。請點擊上方「記錄結果」按鈕儲存當前參數曲線。</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {snapshots.map(snap => (
                      <div key={snap.id} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-200 shadow-sm hover:border-blue-300 transition-colors">
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 rounded-full shadow-sm" style={{backgroundColor: snap.color}}></div>
                          <input type="text" value={snap.name} onChange={(e) => updateSnapshotName(snap.id, e.target.value)} className="text-xs font-bold text-slate-700 bg-transparent outline-none w-24 border-b border-transparent focus:border-slate-300" />
                        </div>
                        <div className="flex space-x-0.5">
                          <button onClick={() => toggleSnapshotVisible(snap.id)} className={`p-1.5 rounded-md transition-colors ${snap.visible ? 'text-blue-600 hover:bg-blue-100' : 'text-slate-400 hover:bg-slate-200'}`} title={snap.visible ? '隱藏' : '顯示'}>{snap.visible ? <Eye size={14}/> : <EyeOff size={14}/>}</button>
                          <button onClick={() => setViewingSnapshot(snap)} className="p-1.5 text-indigo-500 hover:bg-indigo-100 rounded-md transition-colors" title="查看參數狀態"><Info size={14}/></button>
                          <button onClick={() => removeSnapshot(snap.id)} className="p-1.5 text-red-400 hover:bg-red-100 hover:text-red-600 rounded-md transition-colors" title="刪除"><Trash2 size={14}/></button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 內嵌式 Target Curve 動態編輯面板 */}
            {showTargetEditor && viewMode === 'FR' && showTargetCurve && (
              <div className="mt-4 border-t border-slate-200/80 pt-4 animate-in slide-in-from-bottom-4 duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex space-x-4 border-b border-slate-200/50 w-full">
                    <button onClick={()=>setTargetTab('eq')} className={`text-xs font-bold pb-2 transition-all ${targetTab==='eq'?'border-b-2 border-emerald-500 text-emerald-600':'text-slate-400 hover:text-slate-600'}`}><SlidersHorizontal size={14} className="inline mr-1.5 -mt-0.5"/>自定義 EQ 頻段</button>
                    <button onClick={()=>setTargetTab('upload')} className={`text-xs font-bold pb-2 transition-all ${targetTab==='upload'?'border-b-2 border-emerald-500 text-emerald-600':'text-slate-400 hover:text-slate-600'}`}><UploadCloud size={14} className="inline mr-1.5 -mt-0.5"/>上傳 Raw Data</button>
                  </div>
                  <button onClick={() => setShowTargetEditor(false)} className="text-slate-400 hover:bg-slate-100 p-1 rounded-full -mt-2"><X size={14}/></button>
                </div>
                {targetTab === 'eq' ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {targetEqBands.map((band) => (
                        <div key={band.id} className="flex flex-col bg-slate-50 p-3 rounded-2xl border border-slate-200 focus-within:border-emerald-300 transition-colors shadow-sm">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center bg-white border border-slate-200 rounded-lg overflow-hidden focus-within:ring-1 focus-within:ring-emerald-400">
                              <input type="number" value={band.freq} onChange={e => updateEqBand(band.id, 'freq', parseFloat(e.target.value)||0)} className="w-16 text-xs font-black text-center py-1 text-slate-700 outline-none"/>
                              <span className="text-[10px] text-slate-400 pr-2 font-bold bg-slate-50 border-l border-slate-100 py-1 pl-1">Hz</span>
                            </div>
                            <button onClick={() => removeEqBand(band.id)} className="text-slate-300 hover:text-red-500 transition-colors"><X size={14}/></button>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input type="range" min="-15" max="15" step="0.5" value={band.gain} onChange={e => updateEqBand(band.id, 'gain', parseFloat(e.target.value))} className="flex-1 accent-emerald-500 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer" />
                            <span className="w-12 text-right text-[11px] font-black text-emerald-600 tracking-tighter">{band.gain > 0 ? '+' : ''}{band.gain} dB</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    <button onClick={addEqBand} className="w-full py-2.5 border-2 border-dashed border-slate-300 text-slate-500 text-xs font-bold rounded-2xl hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-300 transition-all flex items-center justify-center shadow-sm"><Plus size={16} className="mr-1.5" /> 增加自定義 EQ 頻段</button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {targetUploadedData ? (
                      <div className="flex items-center justify-between p-5 border border-emerald-200 bg-emerald-50 rounded-2xl shadow-sm">
                        <div className="flex items-center text-emerald-700 text-sm font-bold"><Crosshair size={18} className="mr-2"/> 已成功載入外部 Target 數據</div>
                        <button onClick={clearTargetUpload} className="text-xs text-red-500 hover:text-red-700 font-bold px-4 py-2 bg-white rounded-xl shadow-sm border border-red-100 transition-colors">移除數據</button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-300 border-dashed rounded-2xl cursor-pointer bg-slate-50 hover:bg-slate-100 hover:border-emerald-400 transition-all">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6"><UploadCloud className="w-8 h-8 text-slate-400 mb-2" /><p className="text-sm font-bold text-slate-600">點擊選擇檔案上傳</p><p className="text-xs text-slate-400 mt-1">支援 .txt 或 .csv (格式：頻率, SPL)</p></div>
                        <input type="file" className="hidden" accept=".csv,.txt" onChange={handleTargetUpload} />
                      </label>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* AI 診斷面板 (雙重狀態：預設概覽 vs 框選頻段分析) */}
          <div className="bg-slate-900 rounded-3xl p-6 text-white overflow-hidden relative shadow-xl shrink-0 transition-all duration-300">
            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none"><Activity size={120} /></div>
            <div className="relative z-10">
              {aiDiagnosticAnalysis ? (
                // 狀態 2：顯示局部頻段框選的深度分析
                <div className="animate-in fade-in zoom-in-95 duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="flex items-center space-x-2 font-bold text-emerald-400"><SearchX size={18} /><span>框選頻段分析 (局部對比 Target)</span></h4>
                    <button onClick={() => setSelectedFreqs(null)} className="text-xs text-slate-400 hover:text-white border border-slate-700 hover:bg-slate-800 px-3 py-1 rounded-lg transition-colors">清除框選</button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="space-y-1 bg-slate-800/50 p-3 rounded-xl border border-slate-700/50">
                      <p className="text-slate-400 text-[10px] uppercase font-bold tracking-widest">目標區間 ({aiDiagnosticAnalysis.bandName})</p>
                      <p className="text-lg font-black text-blue-200">{aiDiagnosticAnalysis.bandStr}</p>
                    </div>
                    <div className="space-y-1 bg-slate-800/50 p-3 rounded-xl border border-slate-700/50">
                      <p className="text-slate-400 text-[10px] uppercase font-bold tracking-widest">平均誤差 (Sim vs Target)</p>
                      <p className={`text-2xl font-black ${aiDiagnosticAnalysis.statusColor}`}>
                        {aiDiagnosticAnalysis.diff > 0 ? '+' : ''}{aiDiagnosticAnalysis.diff.toFixed(1)} <span className="text-sm font-normal opacity-70">dB</span>
                      </p>
                    </div>
                    <div className="md:col-span-2 space-y-2 bg-slate-800/50 p-3 rounded-xl border border-slate-700/50">
                      <p className="text-emerald-400 text-[10px] uppercase font-bold tracking-widest">💡 系統建議 (Action)</p>
                      <p className="text-sm text-slate-200 leading-tight">{aiDiagnosticAnalysis.action}</p>
                      <p className="text-xs text-rose-400/90 flex items-start"><ShieldAlert size={12} className="mt-0.5 mr-1 shrink-0"/> {aiDiagnosticAnalysis.risk}</p>
                    </div>
                  </div>
                </div>
              ) : selectedFreqs && !showTargetCurve ? (
                // 狀態 1.5：有框選但未開啟 Target
                <div className="animate-in fade-in duration-300 flex flex-col items-center justify-center py-4">
                  <Crosshair size={32} className="text-slate-600 mb-2" />
                  <p className="text-slate-300 text-sm font-bold">已選取頻段 {Math.round(selectedFreqs[0])} - {Math.round(selectedFreqs[1])} Hz</p>
                  <p className="text-slate-500 text-xs mt-1">請在圖表右上角開啟 Target Curve，以啟用 AI 局部誤差分析功能。</p>
                  <button onClick={() => setSelectedFreqs(null)} className="mt-3 text-xs text-slate-400 hover:text-white underline">取消框選</button>
                </div>
              ) : (
                // 狀態 1：預設全局分析 (Global Overview)
                <div className="animate-in fade-in duration-300">
                  <h4 className={`flex items-center space-x-2 font-bold mb-3 ${isCustomMode ? 'text-indigo-400' : 'text-blue-400'}`}>
                    <ShieldAlert size={18} /><span>AI 聲學診斷報告 {isCustomMode && '(實驗室模式)'}</span>
                    <span className="ml-auto text-[10px] text-slate-500 font-normal border border-slate-700 px-2 py-0.5 rounded bg-slate-800/50"><MousePointer2 size={10} className="inline mr-1 -mt-0.5"/>滑鼠拖曳圖表可局部框選診斷</span>
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-1"><p className="text-slate-500 text-[10px] uppercase font-bold tracking-widest">系統主共振 (Sys f0)</p><p className="text-2xl font-black">{Math.round(effectiveDriver.fs * (1 + (circuitType==='TYPE_E'?params.v_rear2:params.v_rear1)/100))} Hz</p><p className="text-xs text-emerald-400 flex items-center"><TrendingUp size={12} className="mr-1"/> 取決於 {circuitType === 'TYPE_E' ? '大背腔' : '獨立背腔'}容積</p></div>
                    <div className="space-y-1"><p className="text-slate-500 text-[10px] uppercase font-bold tracking-widest">低頻補償特徵</p><p className="text-2xl font-black">{circuitType === 'TYPE_E' ? '被動' : 'Active'} <span className="text-sm font-normal text-slate-400"></span></p><p className={`text-xs ${isCustomMode ? 'text-indigo-400' : 'text-blue-400'}`}>{circuitType === 'TYPE_A' || circuitType === 'CUSTOM_CIRCUIT' ? '大背腔+導管 共振' : circuitType === 'TYPE_C' ? '大背腔+導管C 共振' : '主要受洩漏抵消影響'}</p></div>
                    <div className="space-y-1"><p className="text-slate-500 text-[10px] uppercase font-bold tracking-widest">模型適配度</p><p className="text-2xl font-black">{isCustomMode ? 'N/A' : '96.5%'}</p><div className="w-full bg-slate-800 h-1.5 rounded-full mt-2"><div className={`h-full rounded-full w-[96%] shadow-[0_0_8px_rgba(59,130,246,0.5)] ${isCustomMode ? 'bg-indigo-500 w-1/2 opacity-50' : 'bg-blue-500'}`}></div></div></div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 預測結果參數快照 Modal */}
      {viewingSnapshot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div>
                <h3 className="font-bold text-slate-800 flex items-center"><Info size={18} className="mr-2 text-indigo-500"/> 預測結果參數狀態 <span className="ml-2 text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-md">{viewingSnapshot.name}</span></h3>
              </div>
              <button onClick={() => setViewingSnapshot(null)} className="text-slate-400 hover:text-slate-600 bg-white p-1.5 rounded-full shadow-sm border border-slate-100"><X size={18}/></button>
            </div>
            
            <div className="p-6 bg-white overflow-y-auto max-h-[60vh] custom-scrollbar">
              <div className="mb-6 flex space-x-4">
                <div className="flex-1 bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                  <p className="text-[10px] text-blue-500 font-bold uppercase mb-1">使用單體 (Driver)</p>
                  <p className="text-sm font-black text-slate-800">{viewingSnapshot.driver.sku} <span className="text-xs font-normal text-slate-500 ml-1">({viewingSnapshot.isCustomMode ? '自定義' : '資料庫'})</span></p>
                </div>
                <div className="flex-1 bg-indigo-50/50 p-4 rounded-xl border border-indigo-100">
                  <p className="text-[10px] text-indigo-500 font-bold uppercase mb-1">迴路拓樸 (Topology)</p>
                  <p className="text-sm font-black text-slate-800">{viewingSnapshot.circuitType.replace('_', ' ')}</p>
                </div>
              </div>

              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2 mb-3">機構與調音參數快照</h4>
              <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                {Object.entries(viewingSnapshot.params).map(([k, v]) => {
                  if (v === undefined || v === '') return null;
                  return (
                    <div key={k} className="flex justify-between items-end border-b border-slate-50 pb-1">
                      <span className="text-slate-500 text-xs">{paramLabels[k] || k}</span>
                      <span className="font-bold text-slate-800 font-mono">{v}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="p-5 border-t border-slate-100 bg-slate-50 flex justify-between items-center">
              <p className="text-xs text-slate-400">若滿意此曲線，可點擊右側將系統倒轉回此狀態。</p>
              <div className="flex space-x-3">
                <button onClick={() => setViewingSnapshot(null)} className="px-5 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-100 transition-colors">關閉</button>
                <button onClick={() => handleRestoreSnapshot(viewingSnapshot)} className="flex items-center px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-colors">
                  <RefreshCw size={14} className="mr-2"/> ✨ 覆蓋並還原此參數
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 單體詳細資訊 Modal */}
      {viewingDriverDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div>
                <h3 className="font-bold text-slate-800 flex items-center"><Database size={18} className="mr-2 text-blue-500"/> 單體建檔完整資訊 <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-md">{viewingDriverDetails.sku}</span></h3>
              </div>
              <button onClick={() => setViewingDriverDetails(null)} className="text-slate-400 hover:text-slate-600 bg-white p-1.5 rounded-full shadow-sm border border-slate-100"><X size={18}/></button>
            </div>
            
            <div className="p-6 bg-white overflow-y-auto max-h-[60vh] custom-scrollbar space-y-6">
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2 mb-3">基本與物理規格</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-3 text-sm">
                  {[
                    { k: 'vendor', l: '供應商' }, { k: 'mat', l: '振膜材質' }, { k: 'price', l: '單價' },
                    { k: 'weight', l: '總重量 (g)' }, { k: 're', l: '音圈阻抗 (Ω)' }, { k: 'dim', l: '尺寸 Ø (mm)' }, { k: 'height', l: '尺寸 H (mm)' }
                  ].map(({k, l}) => (
                    <div key={k} className="flex flex-col border-b border-slate-50 pb-1">
                      <span className="text-slate-500 text-[10px] uppercase font-bold">{l}</span>
                      <span className="font-black text-slate-800">{viewingDriverDetails[k] || '--'}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2 mb-3 flex justify-between items-end">
                  <span>T/S 參數 (Thiele/Small)</span>
                  <span className="text-[10px] text-indigo-500 flex items-center font-bold bg-indigo-50 px-2 py-1 rounded-lg"><Bot size={12} className="mr-1"/> ML Prediction Engine Hook Ready</span>
                </h4>
                <p className="text-xs text-slate-400 mb-3 leading-relaxed">提示：當 T/S 參數有缺失或套用「自定義單體」時，底層物理引擎將自動呼叫您的 Machine Learning 模型進行參數補全演算，確保預測曲線精準生成。</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-3 text-sm">
                  {[
                    { k: 'fs', u: 'Hz' }, { k: 'qts', u: '' }, { k: 'qes', u: '' }, { k: 'qms', u: '' }, { k: 'vas', u: 'L' },
                    { k: 'mms', u: 'g' }, { k: 'bl', u: 'T·m' }, { k: 'sd', u: 'cm²' }, { k: 'le', u: 'mH' }, { k: 'spl', u: 'dB' }
                  ].map(({k, u}) => (
                    <div key={k} className="flex justify-between items-end border-b border-slate-50 pb-1">
                      <span className="text-slate-500 text-[11px] uppercase font-bold">{k}</span>
                      <span className="font-black text-slate-800 font-mono flex items-center">
                        {viewingDriverDetails[k] ? (
                          <>{viewingDriverDetails[k]} <span className="text-[9px] text-slate-400 ml-1 font-sans font-normal">{u}</span></>
                        ) : (
                          <span className="text-[10px] text-indigo-400 italic flex items-center"><Bot size={12} className="mr-1"/> 待 ML 演算</span>
                        )}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-5 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button onClick={() => setViewingDriverDetails(null)} className="px-6 py-2.5 bg-slate-800 text-white rounded-xl text-sm font-bold shadow-lg hover:bg-slate-700 transition-colors">關閉</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- 子視圖 3：單體資料庫管理 ---
const DriverDatabaseView = ({ drivers, setDrivers, selectedId, setSelectedId }) => {
  const [isModalOpen, setModalOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState(null);
  const [activeTab, setActiveTab] = useState('basic');

  const handleSave = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const parseNum = (val) => { const num = parseFloat(val); return (isNaN(num) || num <= 0) ? '' : num; };
    const newDriver = {
      id: editingDriver?.id || `DRV-${Date.now()}`,
      sku: formData.get('sku') || '', vendor: formData.get('vendor') || '', price: formData.get('price') || '', mat: formData.get('mat') || '',
      weight: parseNum(formData.get('weight')), re: parseNum(formData.get('re')), dim: parseNum(formData.get('dim')), height: parseNum(formData.get('height')),
      fs: parseNum(formData.get('fs')), qts: parseNum(formData.get('qts')), qes: parseNum(formData.get('qes')), qms: parseNum(formData.get('qms')),
      vas: parseNum(formData.get('vas')), mms: parseNum(formData.get('mms')), bl: parseNum(formData.get('bl')), sd: parseNum(formData.get('sd')),
      le: parseNum(formData.get('le')), spl: parseNum(formData.get('spl')),
      rawFr: formData.get('rawFr')?.size > 0 ? true : (editingDriver?.rawFr || false),
      rawThd: formData.get('rawThd')?.size > 0 ? true : (editingDriver?.rawThd || false),
      rawSpl: formData.get('rawSpl')?.size > 0 ? true : (editingDriver?.rawSpl || false),
    };
    if (editingDriver) setDrivers(drivers.map(d => d.id === editingDriver.id ? newDriver : d));
    else setDrivers([...drivers, newDriver]);
    setModalOpen(false); setEditingDriver(null);
  };

  const FileUploadBtn = ({ label, name, isUploaded }) => (
    <div className="flex items-center justify-between p-3.5 border border-slate-200 rounded-xl bg-slate-50 hover:bg-slate-100/50 transition-colors">
      <div>
        <p className="text-sm font-bold text-slate-700">{label}</p>
        <p className="text-[10px] text-slate-400 mt-0.5">{isUploaded ? '✓ 已上傳可用數據' : '未上傳 (.csv, .txt)'}</p>
      </div>
      <label className="cursor-pointer bg-white border border-slate-200 hover:border-blue-400 hover:text-blue-600 px-4 py-2 rounded-xl text-xs font-bold text-slate-500 transition-all shadow-sm">
        {isUploaded ? '重新上傳' : '選擇檔案'}
        <input type="file" name={name} accept=".csv,.txt,.frd,.zma" className="hidden" />
      </label>
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter">單體數據庫</h1>
          <p className="text-slate-500 mt-2 font-medium">管理所有測試過的 Driver 規格與 T/S 參數。</p>
        </div>
        <div className="flex space-x-3">
          <button className="px-5 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs font-black shadow-sm hover:bg-slate-50 transition-all uppercase tracking-widest text-slate-700">
            Export Report
          </button>
          <button onClick={() => { setEditingDriver(null); setActiveTab('basic'); setModalOpen(true); }} className="flex items-center px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-black transition-all shadow-lg shadow-blue-500/30">
            <Plus size={16} className="mr-2" />新增單體
          </button>
        </div>
      </div>

      <div className="bg-white/70 backdrop-blur-md rounded-2xl border border-white/50 shadow-sm overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[900px]">
          <thead>
            <tr className="bg-slate-50/50 text-slate-400 text-[11px] uppercase tracking-wider">
              <th className="px-6 py-4 font-semibold">料號 (SKU)</th><th className="px-6 py-4 font-semibold">供應商 / 材質</th>
              <th className="px-6 py-4 font-semibold text-center">Fs (Hz)</th><th className="px-6 py-4 font-semibold text-center">Re (Ω)</th>
              <th className="px-6 py-4 font-semibold text-center">Qts</th><th className="px-6 py-4 font-semibold text-center">Vas (L)</th>
              <th className="px-6 py-4 font-semibold text-center">Raw Data</th><th className="px-6 py-4 font-semibold text-right">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {drivers.map(driver => (
              <tr key={driver.id} className={`group hover:bg-blue-50/30 transition-colors cursor-pointer ${selectedId === driver.id ? 'bg-blue-50/50' : ''}`} onClick={() => setSelectedId(driver.id)}>
                <td className="px-6 py-4"><div className="font-bold text-slate-700">{driver.sku || 'N/A'}</div><div className="text-[10px] text-slate-400 font-mono truncate max-w-[150px]">{driver.id}</div></td>
                <td className="px-6 py-4"><div className="text-sm text-slate-600">{driver.vendor || '-'}</div><span className="inline-block px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded text-[10px]">{driver.mat || '-'}</span></td>
                <td className="px-6 py-4 text-center font-mono text-sm text-blue-600">{driver.fs || '-'}</td>
                <td className="px-6 py-4 text-center font-mono text-sm">{driver.re || '-'}</td>
                <td className="px-6 py-4 text-center font-mono text-sm">{driver.qts || '-'}</td>
                <td className="px-6 py-4 text-center font-mono text-sm">{driver.vas || '-'}</td>
                <td className="px-6 py-4 text-center">
                  <div className="flex justify-center space-x-1.5">
                    <span className={`w-2 h-2 rounded-full ${driver.rawFr ? 'bg-emerald-400 shadow-[0_0_5px_rgba(52,211,153,0.5)]' : 'bg-slate-200'}`} title="FR Data" />
                    <span className={`w-2 h-2 rounded-full ${driver.rawThd ? 'bg-emerald-400 shadow-[0_0_5px_rgba(52,211,153,0.5)]' : 'bg-slate-200'}`} title="THD Data" />
                    <span className={`w-2 h-2 rounded-full ${driver.rawSpl ? 'bg-emerald-400 shadow-[0_0_5px_rgba(52,211,153,0.5)]' : 'bg-slate-200'}`} title="SPL Data" />
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={(e) => { e.stopPropagation(); setEditingDriver(driver); setActiveTab('basic'); setModalOpen(true); }} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded"><Edit2 size={14} /></button>
                    <button onClick={(e) => { e.stopPropagation(); setDrivers(drivers.filter(d => d.id !== driver.id)); }} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded"><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200 p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0">
              <div><h3 className="font-bold text-slate-800 text-lg">{editingDriver ? '編輯單體參數' : '新增單體規格'}</h3><p className="text-xs text-slate-500 mt-1">無資料項目可留白，輸入數值需大於 0。</p></div>
              <button onClick={() => setModalOpen(false)} className="p-2 bg-white rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 shadow-sm"><X size={20}/></button>
            </div>
            
            <div className="flex border-b border-slate-100 shrink-0 px-6 bg-slate-50/30">
              {[{ id: 'basic', label: '基本資料' }, { id: 'ts', label: 'T/S 參數' }, { id: 'raw', label: 'Raw Data 上傳' }].map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`px-4 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === tab.id ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>{tab.label}</button>
              ))}
            </div>

            <form id="driverForm" onSubmit={handleSave} className="overflow-y-auto custom-scrollbar p-6 flex-1 bg-white">
              <div className={activeTab === 'basic' ? 'block space-y-6' : 'hidden'}>
                <div className="grid grid-cols-2 gap-5">
                  <div className="space-y-1.5"><label className="text-xs font-bold text-slate-500">料號 (SKU) <span className="text-red-400">*</span></label><input name="sku" defaultValue={editingDriver?.sku} required className="w-full px-4 py-2 bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-400 rounded-xl text-sm outline-none" /></div>
                  <div className="space-y-1.5"><label className="text-xs font-bold text-slate-500">供應商 (Vendor)</label><input name="vendor" defaultValue={editingDriver?.vendor} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none" /></div>
                  <div className="space-y-1.5"><label className="text-xs font-bold text-slate-500">單價 (Price)</label><input name="price" defaultValue={editingDriver?.price} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none" /></div>
                  <div className="space-y-1.5"><label className="text-xs font-bold text-slate-500">振膜材質 (Material)</label><input name="mat" defaultValue={editingDriver?.mat} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none" /></div>
                </div>
                <div className="pt-2 border-t border-slate-100">
                  <h4 className="font-bold text-sm text-slate-800 mb-4">物理規格 (Physical Specs)</h4>
                  <div className="grid grid-cols-4 gap-4">
                    {[{ id: 'weight', label: '總重量', unit: 'g' }, { id: 're', label: '音圈阻抗', unit: 'Ω' }, { id: 'dim', label: '尺寸 Ø', unit: 'mm' }, { id: 'height', label: '尺寸 H', unit: 'mm' }].map(field => (
                      <div key={field.id} className="space-y-1.5"><label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{field.label} ({field.unit})</label><input name={field.id} type="number" step="any" min="0.0001" defaultValue={editingDriver?.[field.id]} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono outline-none" /></div>
                    ))}
                  </div>
                </div>
              </div>
              <div className={activeTab === 'ts' ? 'block space-y-5' : 'hidden'}>
                <div className="grid grid-cols-3 gap-x-6 gap-y-5">
                  {[{ id: 'fs', label: 'Fs', unit: 'Hz' }, { id: 'qts', label: 'Qts', unit: '' }, { id: 'qes', label: 'Qes', unit: '' }, { id: 'qms', label: 'Qms', unit: '' }, { id: 'vas', label: 'Vas', unit: 'L' }, { id: 'mms', label: 'Mms', unit: 'g' }, { id: 'bl', label: 'BL', unit: 'T·m' }, { id: 'sd', label: 'Sd', unit: 'cm²' }, { id: 'le', label: 'Le', unit: 'mH' }, { id: 'spl', label: 'SPL', unit: 'dB' }].map(field => (
                    <div key={field.id} className="space-y-1.5"><label className="text-[11px] font-bold text-slate-500 uppercase flex justify-between"><span>{field.label}</span><span className="text-slate-400 font-normal">{field.unit}</span></label><input name={field.id} type="number" step="any" min="0.0001" defaultValue={editingDriver?.[field.id]} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono outline-none" /></div>
                  ))}
                </div>
              </div>
              <div className={activeTab === 'raw' ? 'block space-y-4' : 'hidden'}>
                <div className="p-4 bg-blue-50 text-blue-800 rounded-xl text-xs mb-6 flex items-start space-x-3"><FileText size={16} className="shrink-0 mt-0.5" /><p>請上傳外部量測儀器導出的原始頻響數據。支援格式包含 .csv 或 .txt。若已上傳，指示燈會亮起。</p></div>
                <div className="space-y-3">
                  <FileUploadBtn label="Frequency Response (FR)" name="rawFr" isUploaded={editingDriver?.rawFr} />
                  <FileUploadBtn label="Total Harmonic Distortion (THD)" name="rawThd" isUploaded={editingDriver?.rawThd} />
                  <FileUploadBtn label="Sound Pressure Level (SPL)" name="rawSpl" isUploaded={editingDriver?.rawSpl} />
                </div>
              </div>
            </form>

            <div className="p-5 border-t border-slate-100 flex space-x-3 shrink-0 bg-slate-50/50">
              <button type="button" onClick={() => setModalOpen(false)} className="flex-1 px-4 py-2.5 border border-slate-200 bg-white rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors">取消</button>
              <button type="submit" form="driverForm" className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-colors">儲存資料</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default function App() {
  const [activeView, setActiveView] = useState('prediction_hdt');
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [expandedGroups, setExpandedGroups] = useState({ prediction: true, database: true }); 
  const [drivers, setDrivers] = useState(INITIAL_DRIVERS);
  const [selectedDbDriverId, setSelectedDbDriverId] = useState(INITIAL_DRIVERS[0].id);

  const NAV_ITEMS = [
    { id: 'ai_assistant', icon: MessageSquare, label: '不懂就問', tag: 'AI Engine', tagColor: 'bg-indigo-500/20 text-indigo-400' },
    {
      id: 'prediction',
      icon: Sliders,
      label: '頻響預測系統',
      subItems: [
        { id: 'prediction_hdt', label: 'HDT 產品線' },
        { id: 'prediction_tws', label: 'TWS 產品線', tag: '已開發', tagColor: 'bg-emerald-500/20 text-emerald-400' },
        { id: 'prediction_ows', label: 'OWS 產品線', tag: '開發中', tagColor: 'bg-[#3c50e0]/40 text-blue-300' }
      ]
    },
    { id: 'leakage', icon: ShieldAlert, label: '異常洩漏檢查', tag: '開發中', tagColor: 'bg-[#3c50e0]/40 text-blue-300' },
    { 
      id: 'database', 
      icon: Database, 
      label: '資料庫管理',
      subItems: [
        { id: 'database_history', label: '歷史機種數據庫', tag: '開發中', tagColor: 'bg-[#3c50e0]/40 text-blue-300' },
        { id: 'database_drivers', label: '單體數據庫' }
      ]
    }
  ];

  const handleNavClick = (item) => {
    if (item.subItems) {
      setExpandedGroups(prev => ({ ...prev, [item.id]: !prev[item.id] }));
    } else {
      setActiveView(item.id);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f7fa] flex text-slate-800 font-sans selection:bg-blue-100" style={{ backgroundImage: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }}>
      
      {/* 側邊導航欄 */}
      <aside className={`bg-[#1c2434] text-slate-400 transition-all duration-500 flex flex-col z-40 shadow-2xl ${isSidebarOpen ? 'w-64' : 'w-20'}`}>
        <div className="p-6 flex items-center space-x-3 text-white">
          <div className="w-9 h-9 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-900/20 shrink-0"><Activity size={22} /></div>
          {isSidebarOpen && <span className="text-xl font-black tracking-tight whitespace-nowrap">Acoustic<span className="text-blue-500 ml-1">Agent</span></span>}
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto custom-scrollbar">
          {NAV_ITEMS.map(item => {
            const isActiveGroup = activeView === item.id || (item.subItems && item.subItems.some(sub => sub.id === activeView));
            const isExpanded = expandedGroups[item.id];
            
            return (
              <div key={item.id} className="space-y-1">
                <button 
                  onClick={() => handleNavClick(item)} 
                  className={`w-full flex items-center space-x-3 px-4 py-3.5 rounded-2xl transition-all duration-300 group ${isActiveGroup && !item.subItems ? 'bg-blue-600 text-white shadow-xl shadow-blue-900/40 translate-x-1' : 'hover:bg-white/5 hover:text-white'}`}
                >
                  <item.icon size={20} className={isActiveGroup ? 'text-white' : 'group-hover:text-blue-400'} />
                  {isSidebarOpen && <span className="text-sm tracking-wide flex-1 text-left">{item.label}</span>}
                  {isSidebarOpen && item.tag && !item.subItems && <span className={`ml-auto text-[10px] font-medium px-2 py-0.5 rounded tracking-wide ${item.tagColor}`}>{item.tag}</span>}
                  {isSidebarOpen && item.subItems && (
                    <ChevronRight size={14} className={`transition-transform duration-300 ${isExpanded ? 'rotate-90' : ''}`} />
                  )}
                </button>

                {/* 子選單渲染 */}
                {isSidebarOpen && item.subItems && isExpanded && (
                  <div className="pl-11 pr-2 space-y-1 mt-1 animate-in slide-in-from-top-2 duration-200">
                    {item.subItems.map(sub => (
                      <button
                        key={sub.id}
                        onClick={() => setActiveView(sub.id)}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200 text-xs ${activeView === sub.id ? 'bg-blue-600 text-white font-bold shadow-md' : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'}`}
                      >
                        <span>{sub.label}</span>
                        {sub.tag && (
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${sub.tagColor}`}>
                            {sub.tag}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        <div className="p-6 border-t border-white/5">
          <div className={`flex items-center ${isSidebarOpen ? 'space-x-4' : 'justify-center'}`}>
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-slate-700 to-slate-800 border border-white/10 flex items-center justify-center text-xs font-bold text-white shrink-0">SA</div>
            {isSidebarOpen && (<div className="flex-1 min-w-0"><p className="text-xs font-black text-white truncate">聲學工程師</p><p className="text-[10px] text-slate-500 truncate">Acoustic Engineer</p></div>)}
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-16 bg-white/40 backdrop-blur-md flex items-center justify-between px-8 shrink-0 z-30 border-b border-white/50">
          <div className="flex items-center space-x-6">
            <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-white/60 rounded-xl text-slate-400 transition-colors"><Menu size={20} /></button>
            <div className="flex items-center text-[11px] font-bold text-slate-400 uppercase tracking-widest">
              <span>Workspace</span><ChevronRight size={14} className="mx-2 opacity-50" />
              <span className="text-slate-900">
                {activeView === 'ai_assistant' ? 'AI Assistant' : 
                 activeView === 'prediction_hdt' ? 'HDT Prediction V12' : 
                 activeView.startsWith('prediction_') ? 'Prediction Build' :
                 activeView === 'database_drivers' ? 'Driver Database' : 
                 activeView === 'database_history' ? 'History Archive' : 'Development'}
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="hidden sm:flex bg-slate-100/80 rounded-full px-3 py-1 items-center space-x-2 border border-white">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div><span className="text-[10px] font-bold text-slate-500">Engine Online</span>
            </div>
            <button className="p-2.5 text-slate-400 hover:text-slate-800 transition-colors"><Bell size={18} /></button>
            <div className="h-6 w-px bg-slate-300/30"></div>
            <button className="flex items-center space-x-2 text-xs font-bold text-red-500 hover:bg-red-50 px-3 py-2 rounded-xl transition-all"><LogOut size={16} /><span className="hidden lg:inline">Exit System</span></button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 lg:p-12 custom-scrollbar">
          <div className="max-w-7xl mx-auto">
            {/* 視圖切換器邏輯 */}
            {activeView === 'ai_assistant' ? (
              <AiAssistantView />
            ) : activeView === 'prediction_hdt' ? (
              <CavityPredictionView drivers={drivers} />
            ) : activeView === 'database_drivers' || activeView === 'database' ? (
              <DriverDatabaseView drivers={drivers} setDrivers={setDrivers} selectedId={selectedDbDriverId} setSelectedId={setSelectedDbDriverId} />
            ) : (
              <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-6">
                  <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tighter">
                      {activeView.startsWith('prediction') ? '頻響預測系統' : 
                       activeView.startsWith('database') ? '資料庫管理' : '系統模組'}
                    </h1>
                    <p className="text-slate-500 mt-2 font-medium">
                      {activeView === 'database_history' ? '歷史機種聲學數據與結構參數歸檔庫。' : '功能模組開發中...'}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-center justify-center h-[500px] bg-white/40 backdrop-blur-md rounded-[40px] border-2 border-dashed border-slate-200">
                  <div className="p-6 bg-blue-50 rounded-3xl text-blue-500 mb-6 animate-pulse"><ShieldAlert size={48} /></div>
                  <h3 className="text-xl font-black text-slate-800 tracking-tight">功能模組規劃中</h3>
                  <p className="text-slate-500 text-sm mt-2 max-w-xs text-center">
                    {activeView === 'prediction_tws' ? '「TWS 產品線」預測引擎已開發完成，即將上線。' : 
                     activeView === 'prediction_ows' ? '「OWS 產品線」開放式腔體演算法持續開發中。' : 
                     activeView === 'database_history' ? '「歷史機種數據庫」正在整併歷年聲學產品的測量數據。' :
                     '此模組將於下個版本推出，敬請期待。'}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
      `}} />
    </div>
  );
}