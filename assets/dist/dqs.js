// dailyQuoteSidebar.js

(function() {
  // --- 配置 ---
  const SIDEBAR_ID = 'dqsb-sidebar-panel'; // Prefixed to avoid conflicts
  const OVERLAY_ID = 'dqsb-overlay';
  const TRIGGER_BUTTON_ID = 'dqsb-trigger-button';
  const TRIGGER_CONTAINER_CLASS = 'dqsb-triggers-container';
  const STYLE_ELEMENT_ID = 'dqsb-styles';

  const REACT_CDN_URL = 'https://unpkg.com/react@18/umd/react.production.min.js';
  const REACT_DOM_CDN_URL = 'https://unpkg.com/react-dom@18/umd/react-dom.production.min.js';

  let React, ReactDOM; // Will be assigned after loading

  // --- 辅助函数：动态加载脚本 ---
  function loadScript(src, callbackName) {
    return new Promise((resolve, reject) => {
      // Check if already loaded by checking for the callback name or a known global
      if (callbackName === 'React' && window.React) {
        console.log('React already loaded.');
        resolve();
        return;
      }
      if (callbackName === 'ReactDOM' && window.ReactDOM) {
        console.log('ReactDOM already loaded.');
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = src;
      script.crossOrigin = "anonymous";
      script.onload = () => {
        console.log(`${callbackName} loaded from ${src}`);
        resolve();
      };
      script.onerror = () => {
        console.error(`Failed to load script: ${src}`);
        reject(new Error(`Failed to load ${src}`));
      };
      document.head.appendChild(script);
    });
  }

  // --- 动态注入 CSS ---
  function injectStyles() {
    if (document.getElementById(STYLE_ELEMENT_ID)) return;

    const css = `
      /* Sidebar Panel */
      #${SIDEBAR_ID} {
        position: fixed; top: 0; right: 0; width: 400px; height: 100vh;
        background: rgba(255, 255, 255, 0.95);
        backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
        border-left: 1px solid rgba(0, 0, 0, 0.05);
        box-shadow: -4px 0 24px rgba(0, 0, 0, 0.06);
        transform: translateX(100%);
        transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        z-index: 1001; overflow-y: auto; padding: 24px;
        box-sizing: border-box;
        font-family: 'HarmonyOS Sans SC', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      }
      #${SIDEBAR_ID}.dqsb-open { transform: translateX(0); } /* Use specific class for open state */

      /* Sidebar Header */
      #${SIDEBAR_ID} .dqsb-sidebar-header { /* Prefixed classes */
        display: flex; align-items: center; justify-content: space-between;
        margin-bottom: 24px; padding-bottom: 16px;
        border-bottom: 1px solid rgba(0, 0, 0, 0.05);
      }
      #${SIDEBAR_ID} .dqsb-sidebar-title {
        font-size: 16px; font-weight: 600; color: #1f2937;
        display: flex; align-items: center; gap: 8px;
      }
      #${SIDEBAR_ID} .dqsb-sidebar-close {
        width: 30px; height: 30px; background: #f8fafc;
        border: 1px solid #e2e8f0; border-radius: 8px; cursor: pointer;
        display: flex; align-items: center; justify-content: center;
        color: #64748b; transition: all 0.2s ease; padding:0;
      }
      #${SIDEBAR_ID} .dqsb-sidebar-close:hover {
        background: #f1f5f9; border-color: #cbd5e1; color: #475569;
      }
      #${SIDEBAR_ID} .dqsb-close-icon { width: 16px; height: 16px; fill: currentColor; }

      /* Overlay */
      #${OVERLAY_ID} {
        position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
        background: rgba(0, 0, 0, 0.2);
        opacity: 0; visibility: hidden;
        transition: opacity 0.3s ease, visibility 0.3s ease;
        z-index: 1000;
        backdrop-filter: blur(2px); -webkit-backdrop-filter: blur(2px);
      }
      #${OVERLAY_ID}.dqsb-visible { opacity: 1; visibility: visible; }

      /* Trigger Button & Container */
      .${TRIGGER_CONTAINER_CLASS} {
        position: fixed; top: 50%; right: 0; transform: translateY(-50%);
        z-index: 999; display: flex; flex-direction: column; gap: 10px;
        font-family: 'HarmonyOS Sans SC', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      }
      @media (max-width: 768px) { .${TRIGGER_CONTAINER_CLASS} { display: none !important; } }
      
      #${TRIGGER_BUTTON_ID} {
        width: 40px; height: 40px; background: rgba(255, 255, 255, 0.8);
        border: none; border-radius: 10px 0 0 10px; cursor: pointer;
        display: flex; align-items: center; justify-content: center;
        color: #64748b; font-size: 18px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.05), 0 0 1px rgba(0,0,0,0.1);
        transition: all 0.2s ease; position: relative; overflow: visible; /* Allow tooltip to show */
        backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px);
        border-right: none; border-left: 1px solid rgba(0,0,0,0.05);
        padding: 0; line-height: 1;
      }
      #${TRIGGER_BUTTON_ID}:hover {
        transform: translateX(-4px); background: rgba(255,255,255,0.95); color: #334155;
        box-shadow: 0 4px 12px rgba(0,0,0,0.08), 0 0 1px rgba(0,0,0,0.1);
      }
      #${TRIGGER_BUTTON_ID}.dqsb-active { /* Prefixed class */
        background: #f8fafc; color: #0f172a; transform: translateX(-4px);
      }
      #${TRIGGER_BUTTON_ID}::before { /* Tooltip */
        content: attr(data-label); position: absolute; right: 100%; top: 50%;
        transform: translateY(-50%); background: rgba(15,23,42,0.75); color: white;
        padding: 4px 10px; border-radius: 6px; font-size: 12px; font-weight: 500;
        white-space: nowrap; opacity: 0; pointer-events: none;
        transition: opacity 0.2s ease, transform 0.2s ease; margin-right: 8px;
        backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px);
      }
      #${TRIGGER_BUTTON_ID}:hover::before { opacity: 1; transform: translateY(-50%) translateX(-5px); }

      /* Quote Card Styles (prefixed) */
      #${SIDEBAR_ID} .dqsb-quote-card { /* ... (rest of the quote card styles, prefixed with dqsb- if needed for specificity) ... */ }
      /* ... (Include all other necessary styles, ensure they are specific enough or use the #SIDEBAR_ID prefix) ... */
      #${SIDEBAR_ID} .dqsb-quote-card { background: #ffffff; border: 1px solid rgba(0,0,0,0.04); border-radius: 16px; padding: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.02), 0 4px 12px rgba(0,0,0,0.02); margin-bottom: 20px; transition: all 0.3s ease; overflow: hidden; position: relative; }
      #${SIDEBAR_ID} .dqsb-quote-card:hover { box-shadow: 0 4px 8px rgba(0,0,0,0.04), 0 8px 20px rgba(0,0,0,0.03); }
      #${SIDEBAR_ID} .dqsb-quote-card.dqsb-with-image { background-size: cover; background-position: center; color: white; border: none; }
      #${SIDEBAR_ID} .dqsb-quote-card.dqsb-with-image::before { content: ''; position: absolute; top:0; left:0; right:0; bottom:0; background: linear-gradient(135deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.6) 100%); z-index: 1; border-radius: 16px; }
      #${SIDEBAR_ID} .dqsb-quote-card.dqsb-with-image .dqsb-quote-content { position: relative; z-index: 2; }
      #${SIDEBAR_ID} .dqsb-quote-header { margin-bottom: 16px; display: flex; align-items: center; justify-content: space-between; }
      #${SIDEBAR_ID} .dqsb-quote-brand { font-size: 13px; font-weight: 600; color: #64748b; display: flex; align-items: center; gap: 6px; }
      #${SIDEBAR_ID} .dqsb-quote-card.dqsb-with-image .dqsb-quote-brand { color: rgba(255,255,255,0.9); }
      #${SIDEBAR_ID} .dqsb-quote-brand::before { content: '✨'; font-size: 14px; }
      #${SIDEBAR_ID} .dqsb-quote-text { font-size: 16px; font-weight: 500; line-height: 1.6; margin-bottom: 12px; color: #1f2937; position: relative; padding-left: 16px; }
      #${SIDEBAR_ID} .dqsb-quote-text::before { content: '"'; position: absolute; left: 0; top: -4px; font-size: 24px; font-weight: 700; color: #64748b; line-height: 1; }
      #${SIDEBAR_ID} .dqsb-quote-card.dqsb-with-image .dqsb-quote-text { color: white; }
      #${SIDEBAR_ID} .dqsb-quote-card.dqsb-with-image .dqsb-quote-text::before { color: rgba(255,255,255,0.8); }
      #${SIDEBAR_ID} .dqsb-quote-translation { font-size: 14px; line-height: 1.5; margin-bottom: 20px; color: #6b7280; font-style: italic; padding-left: 16px; }
      #${SIDEBAR_ID} .dqsb-quote-card.dqsb-with-image .dqsb-quote-translation { color: rgba(255,255,255,0.85); }
      #${SIDEBAR_ID} .dqsb-quote-controls { display: flex; justify-content: space-between; align-items: center; gap: 12px; margin-top: auto; }
      #${SIDEBAR_ID} .dqsb-audio-btn { display: flex; align-items: center; gap: 6px; background: rgba(241,245,249,0.8); border: 1px solid rgba(226,232,240,0.8); padding: 8px 12px; border-radius: 8px; cursor: pointer; font-size: 12px; font-weight: 500; color: #475569; transition: all 0.2s ease; backdrop-filter: blur(5px); -webkit-backdrop-filter: blur(5px); }
      #${SIDEBAR_ID} .dqsb-audio-btn:hover { background: rgba(226,232,240,0.8); border-color: rgba(203,213,225,0.8); color: #334155; transform: translateY(-1px); }
      #${SIDEBAR_ID} .dqsb-quote-card.dqsb-with-image .dqsb-audio-btn { background: rgba(255,255,255,0.2); border: 1px solid rgba(255,255,255,0.3); color: white; }
      #${SIDEBAR_ID} .dqsb-nav-controls { display: flex; gap: 6px; }
      #${SIDEBAR_ID} .dqsb-nav-btn { width: 30px; height: 30px; background: rgba(248,250,252,0.8); border: 1px solid rgba(226,232,240,0.8); border-radius: 8px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s ease; color: #64748b; backdrop-filter: blur(5px); -webkit-backdrop-filter: blur(5px); }
      #${SIDEBAR_ID} .dqsb-nav-btn:hover { background: rgba(241,245,249,0.8); border-color: rgba(203,213,225,0.8); color: #475569; transform: translateY(-1px); }
      #${SIDEBAR_ID} .dqsb-quote-card.dqsb-with-image .dqsb-nav-btn { background: rgba(255,255,255,0.15); border-color: rgba(255,255,255,0.25); color: rgba(255,255,255,0.9); }
      #${SIDEBAR_ID} .dqsb-quote-card.dqsb-with-image .dqsb-nav-btn:hover { background: rgba(255,255,255,0.25); border-color: rgba(255,255,255,0.4); color: white; }
      #${SIDEBAR_ID} .dqsb-icon { width: 1em; height: 1em; vertical-align: middle; fill: currentColor; overflow: hidden; }
      #${SIDEBAR_ID} .dqsb-loading-card { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 160px; gap: 12px; color: #6b7280; }
      #${SIDEBAR_ID} .dqsb-loading-spinner { width: 32px; height: 32px; border: 3px solid #f3f4f6; border-top: 3px solid #64748b; border-radius: 50%; animation: spinDQSB 1s linear infinite; }
      #${SIDEBAR_ID} .dqsb-loading-text { font-size: 14px; font-weight: 500; }
      @keyframes spinDQSB { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      #${SIDEBAR_ID} .dqsb-error-card { text-align: center; padding: 24px; color: #ef4444; min-height: 160px; display: flex; flex-direction: column; justify-content: center; align-items: center; }
      #${SIDEBAR_ID} .dqsb-error-title { font-size: 14px; font-weight: 600; margin-bottom: 8px; }
      #${SIDEBAR_ID} .dqsb-error-message { font-size: 13px; margin-bottom: 16px; opacity: 0.8; color: #6b7280; }
      #${SIDEBAR_ID} .dqsb-retry-btn { background: #fee2e2; border: 1px solid #fecaca; color: #dc2626; padding: 8px 16px; border-radius: 8px; cursor: pointer; font-size: 12px; font-weight: 500; transition: all 0.2s ease; }
      #${SIDEBAR_ID} .dqsb-retry-btn:hover { background: #fecaca; transform: translateY(-1px); }
      @media (prefers-color-scheme: dark) {
        #${SIDEBAR_ID} { background: rgba(15,23,42,0.95); border-left-color: rgba(255,255,255,0.05); }
        #${SIDEBAR_ID} .dqsb-sidebar-title { color: #f8fafc; }
        #${SIDEBAR_ID} .dqsb-sidebar-close { background: #1e293b; border-color: #334155; color: #94a3b8; }
        #${SIDEBAR_ID} .dqsb-sidebar-close:hover { background: #334155; border-color: #475569; color: #e2e8f0; }
        #${TRIGGER_BUTTON_ID} { background: rgba(30,41,59,0.8); color: #94a3b8; border-left: 1px solid rgba(255,255,255,0.05); }
        #${TRIGGER_BUTTON_ID}:hover { background: rgba(30,41,59,0.95); color: #cbd5e1; }
        #${TRIGGER_BUTTON_ID}.dqsb-active { background: #1e293b; color: #f8fafc; }
        #${SIDEBAR_ID} .dqsb-quote-card:not(.dqsb-with-image) { background: #1e293b; border-color: rgba(255,255,255,0.05); color: #f8fafc; }
        #${SIDEBAR_ID} .dqsb-quote-card:not(.dqsb-with-image) .dqsb-quote-text { color: #f8fafc; }
        #${SIDEBAR_ID} .dqsb-quote-card:not(.dqsb-with-image) .dqsb-quote-translation { color: #cbd5e1; }
        #${SIDEBAR_ID} .dqsb-quote-text::before { color: #94a3b8; }
        #${SIDEBAR_ID} .dqsb-quote-card.dqsb-with-image .dqsb-quote-text::before { color: rgba(255,255,255,0.7); }
        #${SIDEBAR_ID} .dqsb-audio-btn { background: rgba(51,65,85,0.8); border-color: rgba(71,85,105,0.8); color: #cbd5e1; }
        #${SIDEBAR_ID} .dqsb-audio-btn:hover { background: rgba(71,85,105,0.8); color: #f1f5f9; }
        #${SIDEBAR_ID} .dqsb-nav-btn { background: rgba(51,65,85,0.8); border-color: rgba(71,85,105,0.8); color: #cbd5e1; }
        #${SIDEBAR_ID} .dqsb-nav-btn:hover { background: rgba(71,85,105,0.8); border-color: rgba(100,116,139,0.8); color: #f1f5f9; }
        #${SIDEBAR_ID} .dqsb-loading-spinner { border-top-color: #94a3b8; }
      }
      @media (max-width: 480px) { #${SIDEBAR_ID} { width: 100vw; padding: 20px; border-left: none; } }
    `;
    const styleElement = document.createElement('style');
    styleElement.id = STYLE_ELEMENT_ID;
    styleElement.type = 'text/css';
    styleElement.appendChild(document.createTextNode(css));
    document.head.appendChild(styleElement);
    console.log('DailyQuote sidebar styles injected.');
  }


  // --- 主要初始化逻辑 ---
  function initializeDailyQuoteApp() {
    // React 和 ReactDOM 应该已经被 loadDependencies 确保加载了
    const { useState, useEffect, useRef } = React; // 使用全局的 React

    function createSidebarDOMElements() {
      // 检查是否已存在，避免重复创建
      if (document.getElementById(SIDEBAR_ID)) {
        return { 
          sidebarPanel: document.getElementById(SIDEBAR_ID), 
          overlay: document.getElementById(OVERLAY_ID), 
          triggerButton: document.getElementById(TRIGGER_BUTTON_ID) 
        };
      }

      injectStyles(); // 确保样式已注入

      let overlay = document.createElement('div');
      overlay.id = OVERLAY_ID;
      document.body.appendChild(overlay);

      const sidebarPanel = document.createElement('div');
      sidebarPanel.id = SIDEBAR_ID;
      document.body.appendChild(sidebarPanel);
      
      let triggerButtonContainer = document.querySelector('.' + TRIGGER_CONTAINER_CLASS);
      if (!triggerButtonContainer) {
        triggerButtonContainer = document.createElement('div');
        triggerButtonContainer.className = TRIGGER_CONTAINER_CLASS;
        document.body.appendChild(triggerButtonContainer);
      }
      
      const triggerButton = document.createElement('button');
      triggerButton.id = TRIGGER_BUTTON_ID;
      triggerButton.setAttribute('data-label', '每日一句');
      triggerButton.innerHTML = '✨';
      triggerButtonContainer.appendChild(triggerButton);
      
      const toggleSidebar = () => {
        sidebarPanel.classList.toggle('dqsb-open');
        overlay.classList.toggle('dqsb-visible');
        triggerButton.classList.toggle('dqsb-active', sidebarPanel.classList.contains('dqsb-open'));
      };

      triggerButton.addEventListener('click', toggleSidebar);
      overlay.addEventListener('click', () => { if (sidebarPanel.classList.contains('dqsb-open')) toggleSidebar(); });
      document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && sidebarPanel.classList.contains('dqsb-open')) toggleSidebar(); });

      return { sidebarPanel, overlay, triggerButton };
    }

    const VolumeIcon = () => (React.createElement('svg', { className: 'dqsb-icon', viewBox: '0 0 24 24'}, React.createElement('path', { d: 'M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z' })));
    const ChevronLeftIcon = () => (React.createElement('svg', { className: 'dqsb-icon', viewBox: '0 0 24 24'}, React.createElement('path', { d: 'M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z' })));
    const ChevronRightIcon = () => (React.createElement('svg', { className: 'dqsb-icon', viewBox: '0 0 24 24'}, React.createElement('path', { d: 'M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z' })));
    const RefreshIcon = () => (React.createElement('svg', { className: 'dqsb-icon', viewBox: '0 0 24 24'}, React.createElement('path', { d: 'M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z' })));
    const CloseIconSvg = () => (React.createElement('svg', { className: 'dqsb-close-icon', viewBox: '0 0 24 24'}, React.createElement('path', { d: 'M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z' })));

    const DailyQuoteContent = () => { /* ... Same DailyQuoteContent logic as before ... */ 
      const [quote, setQuote] = useState(null);
      const [loading, setLoading] = useState(true);
      const [error, setError] = useState(null);
      const [isPlaying, setIsPlaying] = useState(false);
      const [currentDate, setCurrentDate] = useState(null);
      const [isUpdating, setIsUpdating] = useState(false);
      const audioRef = useRef(null);

      const getYesterdayDate = () => { const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1); return yesterday.toISOString().split("T")[0]; };
      const getRandomHistoryDate = () => { const today = new Date(); const randomDaysAgo = Math.floor(Math.random() * 365 * 2) + 1; const randomDate = new Date(today); randomDate.setDate(today.getDate() - randomDaysAgo); return randomDate.toISOString().split("T")[0]; };
      const fetchQuote = async (date, type) => { 
        try {
          if (!loading) setIsUpdating(true); else setLoading(true);
          setError(null);
          const proxyUrls = ['https://api.allorigins.win/raw?url=', 'https://corsproxy.io/?'];
          let apiUrl = 'https://open.iciba.com/dsapi/';
          if (date) apiUrl += `?date=${date}`;
          if (type) apiUrl += `${date ? '&' : '?'}type=${type}`; 

          let response = null;
          for (const proxyUrl of proxyUrls) {
            try {
              const fullUrl = proxyUrl + encodeURIComponent(apiUrl);
              response = await fetch(fullUrl);
              if (response.ok) break;
            } catch (e) { 
              console.warn(`Fetch failed with proxy ${proxyUrl}:`, e);
              continue; 
            }
          }
          if (!response || !response.ok) throw new Error('Network request failed after trying all proxies');
          const data = await response.json();
          if (!data.content || !data.note) throw new Error('Incomplete data from API');
          setQuote(data);
          if (data.dateline) setCurrentDate(data.dateline);
        } catch (err) {
          console.error("Error fetching quote:", err);
          setError(err.message || 'Failed to fetch quote');
          setQuote(null);
        } finally {
          setLoading(false);
          setIsUpdating(false);
        }
      };
      const fetchNextQuote = () => fetchQuote(currentDate || new Date().toISOString().split("T")[0], "next");
      const fetchPreviousQuote = () => fetchQuote(currentDate || getYesterdayDate(), "last");
      const fetchRandomQuote = () => fetchQuote(getRandomHistoryDate());
      const playAudio = async () => { 
        if (!quote?.tts || isPlaying) return;
        try {
          if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
          const newAudio = new Audio(quote.tts);
          audioRef.current = newAudio;
          setIsPlaying(true);
          newAudio.onended = () => { setIsPlaying(false); audioRef.current = null; };
          newAudio.onerror = (e) => { 
            setIsPlaying(false); 
            audioRef.current = null; 
            console.error("Audio playback error:", e);
            setError("音频播放失败，可能是网络或浏览器限制。");
          };
          await newAudio.play();
        } catch (err) {
          setIsPlaying(false); 
          audioRef.current = null; 
          console.error("Error playing audio:", err);
          setError("无法播放音频。");
        }
      };

      useEffect(() => {
        fetchQuote(getYesterdayDate()); 
        return () => { if (audioRef.current) audioRef.current.pause(); };
      }, []);

      if (loading) { return React.createElement('div', { className: 'dqsb-quote-card' }, React.createElement('div', { className: 'dqsb-loading-card' }, React.createElement('div', { className: 'dqsb-loading-spinner' }), React.createElement('div', { className: 'dqsb-loading-text' }, '加载中...'))); }
      if (error || !quote) { return React.createElement('div', { className: 'dqsb-quote-card' }, React.createElement('div', { className: 'dqsb-error-card' }, React.createElement('div', { className: 'dqsb-error-title' }, '加载失败'), React.createElement('div', { className: 'dqsb-error-message' }, error || '无法获取数据'), React.createElement('button', { className: 'dqsb-retry-btn', onClick: () => { fetchQuote(getYesterdayDate()); } }, '重试'))); }
      
      const cardClass = `dqsb-quote-card ${quote.picture2 || quote.picture ? 'dqsb-with-image' : ''}`; 
      const cardStyle = (quote.picture2 || quote.picture) ? { backgroundImage: `url(${quote.picture2 || quote.picture})` } : {};

      return React.createElement('div', { className: cardClass, style: cardStyle },
        React.createElement('div', { className: `dqsb-quote-content ${isUpdating ? 'dqsb-updating' : ''}` }, // Add prefix if needed
          React.createElement('div', { className: 'dqsb-quote-header' }, React.createElement('div', { className: 'dqsb-quote-brand' }, '每日一句')),
          React.createElement('div', { className: 'dqsb-quote-text' }, quote.content),
          React.createElement('div', { className: 'dqsb-quote-translation' }, quote.note),
          React.createElement('div', { className: 'dqsb-quote-controls' },
            quote.tts && React.createElement('button', { className: 'dqsb-audio-btn', onClick: playAudio, disabled: isPlaying || isUpdating }, React.createElement(VolumeIcon), React.createElement('span', null, isPlaying ? '播放中...' : '朗读')),
            React.createElement('div', { className: 'dqsb-nav-controls' },
              React.createElement('button', { className: 'dqsb-nav-btn', onClick: fetchPreviousQuote, title: '上一句', disabled: isUpdating }, React.createElement(ChevronLeftIcon)),
              React.createElement('button', { className: 'dqsb-nav-btn', onClick: fetchRandomQuote, title: '随机', disabled: isUpdating }, React.createElement(RefreshIcon)),
              React.createElement('button', { className: 'dqsb-nav-btn', onClick: fetchNextQuote, title: '下一句', disabled: isUpdating }, React.createElement(ChevronRightIcon))
            )
          )
        )
      );
    };
    
    const FullDailyQuoteSidebar = () => {
      const handleClose = () => {
        const sidebar = document.getElementById(SIDEBAR_ID);
        const overlay = document.getElementById(OVERLAY_ID);
        const trigger = document.getElementById(TRIGGER_BUTTON_ID);
        if (sidebar) sidebar.classList.remove('dqsb-open');
        if (overlay) overlay.classList.remove('dqsb-visible');
        if (trigger) trigger.classList.remove('dqsb-active');
      };

      return React.createElement(React.Fragment, null,
        React.createElement('div', { className: 'dqsb-sidebar-header' },
          React.createElement('div', { className: 'dqsb-sidebar-title' }, '✨ 每日一句'),
          React.createElement('button', { className: 'dqsb-sidebar-close', onClick: handleClose }, React.createElement(CloseIconSvg))
        ),
        React.createElement(DailyQuoteContent)
      );
    };

    const { sidebarPanel } = createSidebarDOMElements();
    if (sidebarPanel) {
      const root = ReactDOM.createRoot(sidebarPanel);
      root.render(React.createElement(FullDailyQuoteSidebar));
      console.log('Full DailyQuote sidebar rendered.');
    }
  }

  // --- 启动逻辑 ---
  async function start() {
    try {
      if (!window.React) await loadScript(REACT_CDN_URL, 'React');
      if (!window.ReactDOM) await loadScript(REACT_DOM_CDN_URL, 'ReactDOM');
      
      React = window.React; // Assign to local scope variables
      ReactDOM = window.ReactDOM;

      // Ensure DOM is ready before trying to manipulate it or render React components
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeDailyQuoteApp);
      } else {
        initializeDailyQuoteApp(); // DOM is already ready
      }
    } catch (error) {
      console.error("Failed to load dependencies or initialize DailyQuote sidebar:", error);
    }
  }

  start();

})();
