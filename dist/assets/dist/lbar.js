// lbar.js v2 修复cors代理问题,后续有问题,替换代理即可

(function() {
  // --- 配置 ---
  const SIDEBAR_ID = 'dqsb-sidebar-panel'; // Prefixed to avoid conflicts
  const OVERLAY_ID = 'dqsb-overlay';
  const TRIGGER_BUTTON_ID = 'dqsb-trigger-button';
  const TRIGGER_CONTAINER_CLASS = 'dqsb-triggers-container';
  const STYLE_ELEMENT_ID = 'dqsb-styles';
  const SITE_START_DATE_ELEMENT_ID = 'running-days'; // ID of the element holding the site start date

  const REACT_CDN_URL = 'https://unpkg.com/react@18/umd/react.production.min.js';
  const REACT_DOM_CDN_URL = 'https://unpkg.com/react-dom@18/umd/react-dom.production.min.js';

  let React, ReactDOM; // Will be assigned after loading


  function loadScript(src, callbackName) {
    return new Promise((resolve, reject) => {
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
      #${SIDEBAR_ID}.dqsb-open { transform: translateX(0); }

      /* Sidebar Header */
      #${SIDEBAR_ID} .dqsb-sidebar-header {
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
      
      #${TRIGGER_BUTTON_ID} {
        width: 40px; height: 40px; background: rgba(255, 255, 255, 0.8);
        border: none; border-radius: 10px 0 0 10px; cursor: pointer;
        display: flex; align-items: center; justify-content: center;
        color: #64748b; font-size: 18px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.05), 0 0 1px rgba(0,0,0,0.1);
        transition: all 0.2s ease; position: relative; overflow: visible;
        backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px);
        border-right: none; border-left: 1px solid rgba(0,0,0,0.05);
        padding: 0; line-height: 1;
      }
      #${TRIGGER_BUTTON_ID}:hover {
        transform: translateX(-4px); background: rgba(255,255,255,0.95); color: #334155;
        box-shadow: 0 4px 12px rgba(0,0,0,0.08), 0 0 1px rgba(0,0,0,0.1);
      }
      #${TRIGGER_BUTTON_ID}.dqsb-active {
        background: #f8fafc; color: #0f172a; transform: translateX(-4px);
      }
      #${TRIGGER_BUTTON_ID}::before {
        content: attr(data-label); position: absolute; right: 100%; top: 50%;
        transform: translateY(-50%); background: rgba(15,23,42,0.75); color: white;
        padding: 4px 10px; border-radius: 6px; font-size: 12px; font-weight: 500;
        white-space: nowrap; opacity: 0; pointer-events: none;
        transition: opacity 0.2s ease, transform 0.2s ease; margin-right: 8px;
        backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px);
      }
      #${TRIGGER_BUTTON_ID}:hover::before { opacity: 1; transform: translateY(-50%) translateX(-5px); }

      /* Quote Card Styles */
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
      #${SIDEBAR_ID} .dqsb-icon { width: 1em; height: 1em; vertical-align: -0.15em; fill: currentColor; overflow: hidden; }
      #${SIDEBAR_ID} .dqsb-loading-card { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 160px; gap: 12px; color: #6b7280; }
      #${SIDEBAR_ID} .dqsb-loading-spinner { width: 32px; height: 32px; border: 3px solid #f3f4f6; border-top: 3px solid #64748b; border-radius: 50%; animation: spinDQSB 1s linear infinite; }
      #${SIDEBAR_ID} .dqsb-loading-text { font-size: 14px; font-weight: 500; }
      @keyframes spinDQSB { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      #${SIDEBAR_ID} .dqsb-error-card { text-align: center; padding: 24px; color: #ef4444; min-height: 160px; display: flex; flex-direction: column; justify-content: center; align-items: center; }
      #${SIDEBAR_ID} .dqsb-error-title { font-size: 14px; font-weight: 600; margin-bottom: 8px; }
      #${SIDEBAR_ID} .dqsb-error-message { font-size: 13px; margin-bottom: 16px; opacity: 0.8; color: #6b7280; }
      #${SIDEBAR_ID} .dqsb-retry-btn { background: #fee2e2; border: 1px solid #fecaca; color: #dc2626; padding: 8px 16px; border-radius: 8px; cursor: pointer; font-size: 12px; font-weight: 500; transition: all 0.2s ease; }
      #${SIDEBAR_ID} .dqsb-retry-btn:hover { background: #fecaca; transform: translateY(-1px); }

      /* Info Card Styles */
      #${SIDEBAR_ID} .dqsb-info-card {
        background: #ffffff; border: 1px solid rgba(0,0,0,0.04); border-radius: 16px; padding: 20px;
        box-shadow: 0 1px 3px rgba(0,0,0,0.02), 0 4px 12px rgba(0,0,0,0.02); margin-bottom: 20px;
        transition: all 0.3s ease;
      }
      #${SIDEBAR_ID} .dqsb-info-card:hover {
        box-shadow: 0 4px 8px rgba(0,0,0,0.04), 0 8px 20px rgba(0,0,0,0.03);
      }
      #${SIDEBAR_ID} .dqsb-info-card-header {
        display: flex; align-items: center; gap: 8px;
        font-size: 14px; font-weight: 600; color: #475569;
        margin-bottom: 12px; padding-bottom: 8px;
        border-bottom: 1px solid rgba(0, 0, 0, 0.05);
      }
      #${SIDEBAR_ID} .dqsb-info-card-header .dqsb-icon {
        font-size: 16px;
      }
      #${SIDEBAR_ID} .dqsb-info-card-content {
        font-size: 14px; color: #334155; line-height: 1.7;
      }
      #${SIDEBAR_ID} .dqsb-info-card-content .dqsb-uptime-value,
      #${SIDEBAR_ID} .dqsb-info-card-content .dqsb-date-emphasis { font-weight: 500; color: #1e293b; }
      
      /* History Card Styles */
      #${SIDEBAR_ID} .dqsb-history-card {
        background: #ffffff; border: 1px solid rgba(0,0,0,0.04); border-radius: 16px; padding: 20px;
        box-shadow: 0 1px 3px rgba(0,0,0,0.02), 0 4px 12px rgba(0,0,0,0.02); margin-bottom: 20px;
        transition: all 0.3s ease;
      }
      #${SIDEBAR_ID} .dqsb-history-card:hover {
        box-shadow: 0 4px 8px rgba(0,0,0,0.04), 0 8px 20px rgba(0,0,0,0.03);
      }
      #${SIDEBAR_ID} .dqsb-history-card-header {
        display: flex; align-items: center; gap: 8px;
        font-size: 14px; font-weight: 600; color: #475569;
        margin-bottom: 12px; padding-bottom: 8px;
        border-bottom: 1px solid rgba(0, 0, 0, 0.05);
      }
      #${SIDEBAR_ID} .dqsb-history-list {
        list-style: none; padding: 0; margin: 0; max-height: 250px; overflow-y: auto;
        scrollbar-width: thin; 
        scrollbar-color: #cbd5e1 #f1f5f9;
      }
      #${SIDEBAR_ID} .dqsb-history-list::-webkit-scrollbar { width: 6px; }
      #${SIDEBAR_ID} .dqsb-history-list::-webkit-scrollbar-track { background: #f1f5f9; border-radius:3px; }
      #${SIDEBAR_ID} .dqsb-history-list::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 3px; border: 1px solid #f1f5f9; }
      #${SIDEBAR_ID} .dqsb-history-list::-webkit-scrollbar-thumb:hover { background-color: #94a3b8; }

      #${SIDEBAR_ID} .dqsb-history-item {
        padding: 8px 4px 8px 0; border-bottom: 1px solid rgba(0,0,0,0.03);
        font-size: 13px; line-height: 1.6; display: flex; gap: 8px;
      }
      #${SIDEBAR_ID} .dqsb-history-item:last-child { border-bottom: none; }
      #${SIDEBAR_ID} .dqsb-history-item-year {
        font-weight: 600; color: #059669; white-space: nowrap; flex-shrink: 0;
      }
      #${SIDEBAR_ID} .dqsb-history-item-title { color: #374151; }
      #${SIDEBAR_ID} .dqsb-history-item-title a { color: inherit; text-decoration: none; }
      #${SIDEBAR_ID} .dqsb-history-item-title a:hover { text-decoration: underline; color: #047857; }
      #${SIDEBAR_ID} .dqsb-history-loading, #${SIDEBAR_ID} .dqsb-history-error {
        text-align: center; font-size: 13px; color: #6b7280; padding: 16px 0;
      }

      /* Mobile / Tablet Adjustments */
      @media (max-width: 768px) {
        .${TRIGGER_CONTAINER_CLASS} { top: auto; transform: none; bottom: 24px; right: 24px; }
        #${TRIGGER_BUTTON_ID} {
          width: 56px; height: 56px; border-radius: 50%; font-size: 24px;
          box-shadow: 0 6px 16px rgba(0,0,0,0.12); border: none;
        }
        #${TRIGGER_BUTTON_ID}:hover { transform: none; background: rgba(255,255,255,0.9); }
        #${TRIGGER_BUTTON_ID}.dqsb-active { transform: none; }
        #${TRIGGER_BUTTON_ID}::before { display: none; }
        #${SIDEBAR_ID} { width: 360px; max-width: 90vw; }
      }
      
      /* Dark Mode Styles */
      @media (prefers-color-scheme: dark) {
        #${SIDEBAR_ID} { background: rgba(15,23,42,0.95); border-left-color: rgba(255,255,255,0.05); }
        #${SIDEBAR_ID} .dqsb-sidebar-title { color: #f8fafc; }
        #${SIDEBAR_ID} .dqsb-sidebar-close { background: #1e293b; border-color: #334155; color: #94a3b8; }
        #${SIDEBAR_ID} .dqsb-sidebar-close:hover { background: #334155; border-color: #475569; color: #e2e8f0; }
        
        #${TRIGGER_BUTTON_ID} { background: rgba(30,41,59,0.8); color: #94a3b8; border-left: 1px solid rgba(255,255,255,0.05); }
        #${TRIGGER_BUTTON_ID}:hover { background: rgba(30,41,59,0.95); color: #cbd5e1; }
        #${TRIGGER_BUTTON_ID}.dqsb-active { background: #1e293b; color: #f8fafc; }

        @media (max-width: 768px) {
          #${TRIGGER_BUTTON_ID} { background: rgba(45,55,72,0.9); color: #e2e8f0; box-shadow: 0 6px 16px rgba(0,0,0,0.25); border: none; }
          #${TRIGGER_BUTTON_ID}:hover { background: rgba(55,65,82,0.95); }
          #${TRIGGER_BUTTON_ID}.dqsb-active { background: #1e293b; }
        }

        #${SIDEBAR_ID} .dqsb-quote-card:not(.dqsb-with-image) { background: #1e293b; border-color: rgba(255,255,255,0.05); color: #f8fafc; }
        #${SIDEBAR_ID} .dqsb-quote-card:not(.dqsb-with-image) .dqsb-quote-text { color: #f8fafc; }
        #${SIDEBAR_ID} .dqsb-quote-card:not(.dqsb-with-image) .dqsb-quote-translation { color: #cbd5e1; }
        #${SIDEBAR_ID} .dqsb-quote-text::before { color: #94a3b8; }
        #${SIDEBAR_ID} .dqsb-quote-card.dqsb-with-image .dqsb-quote-text::before { color: rgba(255,255,255,0.7); }
        #${SIDEBAR_ID} .dqsb-audio-btn { background: rgba(51,65,85,0.8); border-color: rgba(71,85,105,0.8); color: #cbd5e1; }
        #${SIDEBAR_ID} .dqsb-audio-btn:hover { background: rgba(71,85,105,0.8); color: #f1f5f9; }
        #${SIDEBAR_ID} .dqsb-nav-btn { background: rgba(51,65,85,0.8); border-color: rgba(71,85,105,0.8); color: #cbd5e1; }
        #${SIDEBAR_ID} .dqsb-nav-btn:hover { background: rgba(71,85,105,0.8); border-color: rgba(100,116,139,0.8); color: #f1f5f9; }
        #${SIDEBAR_ID} .dqsb-loading-spinner { border-top-color: #94a3b8; border-color: rgba(255,255,255,0.1); border-top-color: #94a3b8; }
        #${SIDEBAR_ID} .dqsb-error-message { color: #94a3b8; }
        #${SIDEBAR_ID} .dqsb-retry-btn { background: #5f2727; border-color: #7f1d1d; color: #fecaca; }
        #${SIDEBAR_ID} .dqsb-retry-btn:hover { background: #7f1d1d; }

        /* Dark Mode for Info Cards & History Card */
        #${SIDEBAR_ID} .dqsb-info-card, #${SIDEBAR_ID} .dqsb-history-card {
          background: #1e293b; border-color: rgba(255,255,255,0.07);
        }
        #${SIDEBAR_ID} .dqsb-info-card-header, #${SIDEBAR_ID} .dqsb-history-card-header {
          color: #cbd5e1; border-bottom-color: rgba(255,255,255,0.1);
        }
        #${SIDEBAR_ID} .dqsb-info-card-content { color: #e2e8f0; }
        #${SIDEBAR_ID} .dqsb-info-card-content .dqsb-uptime-value, 
        #${SIDEBAR_ID} .dqsb-info-card-content .dqsb-date-emphasis { color: #f8fafc; }

        /* Dark Mode for History List Scrollbar */
        #${SIDEBAR_ID} .dqsb-history-list { scrollbar-color: #4b5563 #1e293b; }
        #${SIDEBAR_ID} .dqsb-history-list::-webkit-scrollbar-track { background: #1e293b; }
        #${SIDEBAR_ID} .dqsb-history-list::-webkit-scrollbar-thumb { background-color: #4b5563; border-color: #1e293b; }
        #${SIDEBAR_ID} .dqsb-history-list::-webkit-scrollbar-thumb:hover { background-color: #6b7280; }

        #${SIDEBAR_ID} .dqsb-history-item { border-bottom-color: rgba(255,255,255,0.04); }
        #${SIDEBAR_ID} .dqsb-history-item-year { color: #34d399; } 
        #${SIDEBAR_ID} .dqsb-history-item-title { color: #d1d5db; }
        #${SIDEBAR_ID} .dqsb-history-item-title a { color: #d1d5db; }
        #${SIDEBAR_ID} .dqsb-history-item-title a:hover { color: #6ee7b7; }
        #${SIDEBAR_ID} .dqsb-history-loading, #${SIDEBAR_ID} .dqsb-history-error { color: #9ca3af; }
      }

      /* Smallest Screen Adjustments */
      @media (max-width: 480px) { 
        #${SIDEBAR_ID} { width: 100vw; padding: 20px; border-left: none; max-width: 100vw; } 
      }
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
    const { useState, useEffect, useRef } = React;

    function createSidebarDOMElements() {
      if (document.getElementById(SIDEBAR_ID)) {
        return { 
          sidebarPanel: document.getElementById(SIDEBAR_ID), 
          overlay: document.getElementById(OVERLAY_ID), 
          triggerButton: document.getElementById(TRIGGER_BUTTON_ID) 
        };
      }
      injectStyles();
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
      triggerButton.setAttribute('data-label', '信息栏');
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

    // --- Icon Components ---
    const VolumeIcon = () => (React.createElement('svg', { className: 'dqsb-icon', viewBox: '0 0 24 24', fill:"currentColor"}, React.createElement('path', { d: 'M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z' })));
    const ChevronLeftIcon = () => (React.createElement('svg', { className: 'dqsb-icon', viewBox: '0 0 24 24', fill:"currentColor"}, React.createElement('path', { d: 'M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z' })));
    const ChevronRightIcon = () => (React.createElement('svg', { className: 'dqsb-icon', viewBox: '0 0 24 24', fill:"currentColor"}, React.createElement('path', { d: 'M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z' })));
    const RefreshIcon = () => (React.createElement('svg', { className: 'dqsb-icon', viewBox: '0 0 24 24', fill:"currentColor"}, React.createElement('path', { d: 'M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z' })));
    const CloseIconSvg = () => (React.createElement('svg', { className: 'dqsb-close-icon', viewBox: '0 0 24 24', fill:"currentColor"}, React.createElement('path', { d: 'M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z' })));
    const CalendarIcon = () => (React.createElement('svg', { className: 'dqsb-icon', viewBox: '0 0 24 24', fill:"currentColor"}, React.createElement('path', { d: 'M17 12h-5v5h5v-5zM16 1v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-1V1h-2zm3 18H5V8h14v11z' })));
    const TimerIcon = () => (React.createElement('svg', { className: 'dqsb-icon', viewBox: '0 0 24 24', fill:"currentColor"}, React.createElement('path', { d: 'M15 1H9v2h6V1zm-4 13h2V8h-2v6zm8.03-6.61l1.42-1.42c-.43-.51-.9-.99-1.41-1.41l-1.42 1.42C16.07 4.74 14.12 4 12 4c-4.97 0-9 4.03-9 9s4.02 9 9 9 9-4.03 9-9c0-2.12-.74-4.07-1.97-5.61zM12 20c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z'})));
    const HistoryTimelineIcon = () => (React.createElement('svg', { className: 'dqsb-icon', viewBox: '0 0 24 24', fill:"currentColor"}, React.createElement('path', { d: 'M13 3a9 9 0 0 0-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1 5v5l4.25 2.52.77-1.28-3.52-2.09V8H12z' })));


    // --- React Components ---
    const DailyQuoteContent = () => {
      const [quote, setQuote] = useState(null);
      const [loading, setLoading] = useState(true);
      const [error, setError] = useState(null);
      const [isPlaying, setIsPlaying] = useState(false);
      const [currentDate, setCurrentDate] = useState(null); 
      const [isUpdating, setIsUpdating] = useState(false); 
      const audioRef = useRef(null);

      const getYesterdayDate = () => { const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1); return yesterday.toISOString().split("T")[0]; };
      const getRandomHistoryDate = () => { const today = new Date(); const randomDaysAgo = Math.floor(Math.random() * 365 * 3) + 1; const randomDate = new Date(today); randomDate.setDate(today.getDate() - randomDaysAgo); return randomDate.toISOString().split("T")[0]; };
      
      const fetchQuote = async (date, type) => { 
        try {
          if (!loading) setIsUpdating(true); else setLoading(true); 
          setError(null);
          // UPDATED proxy: Using api.codetabs.com
          const proxyUrls = ['https://api.codetabs.com/v1/proxy?quest=']; 
          let apiUrl = 'https://open.iciba.com/dsapi/';
          
          if (date) apiUrl += `?date=${date}`;
          if (type) apiUrl += `${date ? '&' : '?'}type=${type}`; 

          let response = null;
          let data = null;

          for (const proxyUrl of proxyUrls) {
            try {
              const fullUrl = proxyUrl + encodeURIComponent(apiUrl);
              response = await fetch(fullUrl);
              if (response.ok) {
                const responseText = await response.text();
                try {
                    data = JSON.parse(responseText);
                } catch (jsonError) {
                    console.error("JSON parsing error for quote with proxy " + proxyUrl + ": ", jsonError, "Response text:", responseText);
                    continue; 
                }
                break; 
              } else {
                console.warn(`Fetch quote failed with proxy ${proxyUrl}, status: ${response.status}`);
              }
            } catch (e) { 
              console.warn(`Network or other error for quote with proxy ${proxyUrl}:`, e);
            }
          }

          if (!data || !response || !response.ok) { 
            throw new Error('Quote API: Network request failed after trying all proxies or API returned an error.');
          }
          
          if (!data.content || !data.note) throw new Error('Quote API: Incomplete data from API');
          
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

      const fetchNextQuote = () => { const dateForApi = currentDate || new Date().toISOString().split("T")[0]; fetchQuote(dateForApi, "next"); };
      const fetchPreviousQuote = () => { const dateForApi = currentDate || getYesterdayDate(); fetchQuote(dateForApi, "last"); };
      const fetchRandomQuote = () => fetchQuote(getRandomHistoryDate()); 
      const retryFetch = () => { if (quote && currentDate) { fetchQuote(currentDate); } else { fetchRandomQuote(); } };

      const playAudio = async () => { 
        if (!quote?.tts || isPlaying) return;
        try {
          if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
          const newAudio = new Audio(quote.tts);
          audioRef.current = newAudio;
          setIsPlaying(true);
          newAudio.onended = () => { setIsPlaying(false); audioRef.current = null; };
          newAudio.onerror = (e) => { setIsPlaying(false); audioRef.current = null; console.error("Audio playback error:", e); setError("音频播放失败。"); };
          await newAudio.play();
        } catch (err) { setIsPlaying(false); audioRef.current = null; console.error("Error playing audio:", err); setError("无法播放音频。"); }
      };

      useEffect(() => { fetchRandomQuote(); return () => { if (audioRef.current) audioRef.current.pause(); }; }, []); 

      if (loading) { 
        return React.createElement('div', { className: 'dqsb-quote-card' }, 
          React.createElement('div', { className: 'dqsb-loading-card' }, 
            React.createElement('div', { className: 'dqsb-loading-spinner' }), 
            React.createElement('div', { className: 'dqsb-loading-text' }, '加载中...')
          )
        ); 
      }
      
      if (error || !quote) { 
        return React.createElement('div', { className: 'dqsb-quote-card' }, 
          React.createElement('div', { className: 'dqsb-error-card' }, 
            React.createElement('div', { className: 'dqsb-error-title' }, '加载失败'), 
            React.createElement('div', { className: 'dqsb-error-message' }, error || '无法获取数据。'), 
            React.createElement('button', { className: 'dqsb-retry-btn', onClick: retryFetch }, '重试')
          )
        ); 
      }
      
      const cardClass = `dqsb-quote-card ${quote.picture2 || quote.picture ? 'dqsb-with-image' : ''}`; 
      const cardStyle = (quote.picture2 || quote.picture) ? { backgroundImage: `url(${quote.picture2 || quote.picture})` } : {};

      const updatingOverlay = isUpdating ? React.createElement('div', {
        style: {
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'rgba(30,41,59,0.3)' : 'rgba(255,255,255,0.3)'), 
          backdropFilter: 'blur(3px)', WebkitBackdropFilter: 'blur(3px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 3, borderRadius: '16px' 
        }
      }, React.createElement('div', { className: 'dqsb-loading-spinner' })) : null;

      return React.createElement('div', { className: cardClass, style: cardStyle },
        updatingOverlay, 
        React.createElement('div', { className: `dqsb-quote-content`},
          React.createElement('div', { className: 'dqsb-quote-header' }, 
            React.createElement('div', { className: 'dqsb-quote-brand' }, '每日一句'),
          ),
          React.createElement('div', { className: 'dqsb-quote-text' }, quote.content),
          React.createElement('div', { className: 'dqsb-quote-translation' }, quote.note),
          React.createElement('div', { className: 'dqsb-quote-controls' },
            quote.tts && React.createElement('button', { className: 'dqsb-audio-btn', onClick: playAudio, disabled: isPlaying || isUpdating }, 
              React.createElement(VolumeIcon), 
              React.createElement('span', null, isPlaying ? '播放中...' : '朗读')
            ),
            React.createElement('div', { className: 'dqsb-nav-controls' },
              React.createElement('button', { className: 'dqsb-nav-btn', onClick: fetchPreviousQuote, title: '上一句', disabled: isUpdating }, React.createElement(ChevronLeftIcon)),
              React.createElement('button', { className: 'dqsb-nav-btn', onClick: fetchRandomQuote, title: '随机一句', disabled: isUpdating }, React.createElement(RefreshIcon)),
              React.createElement('button', { className: 'dqsb-nav-btn', onClick: fetchNextQuote, title: '下一句', disabled: isUpdating }, React.createElement(ChevronRightIcon))
            )
          )
        )
      );
    };
    
    const TodaysDateCard = () => {
      const [currentDateString, setCurrentDateString] = useState('');
      useEffect(() => {
        const updateDate = () => {
          const now = new Date();
          const year = now.getFullYear();
          const month = (now.getMonth() + 1).toString().padStart(2, '0');
          const day = now.getDate().toString().padStart(2, '0');
          const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
          const weekday = weekdays[now.getDay()];
          setCurrentDateString(`${year}年${month}月${day}日 ${weekday}`);
        };
        updateDate();
      }, []);
      return React.createElement('div', { className: 'dqsb-info-card' },
        React.createElement('div', { className: 'dqsb-info-card-header' }, React.createElement(CalendarIcon), React.createElement('span', null, '今日日期')),
        React.createElement('div', { className: 'dqsb-info-card-content' }, currentDateString ? React.createElement('span', {className: 'dqsb-date-emphasis'}, currentDateString) : '获取日期中...')
      );
    };

    const SiteUptimeCard = () => {
      const [startDate, setStartDate] = useState(null);
      const [uptime, setUptime] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      // REMOVED errorMsg state as it's not directly used for rendering based on the new logic
      const [shouldRender, setShouldRender] = useState(false);

      useEffect(() => {
        const siteStartDateElement = document.getElementById(SITE_START_DATE_ELEMENT_ID);
        if (siteStartDateElement) {
          const startDateString = siteStartDateElement.className; 
          if (startDateString && /^\d{4}-\d{2}-\d{2}$/.test(startDateString)) {
            const parsedDate = new Date(startDateString + "T00:00:00");
            if (!isNaN(parsedDate)) { 
              setStartDate(parsedDate);
              setShouldRender(true);
            } else {
              console.error(`SiteUptimeCard: 无效的起始日期格式: "${startDateString}"`);
              setShouldRender(false);
            }
          } else {
            console.error(`SiteUptimeCard: 未在 class 中找到有效的起始日期。Class: "${startDateString}"`);
            setShouldRender(false);
          }
        } else {
          console.warn(`SiteUptimeCard: HTML 元素 #${SITE_START_DATE_ELEMENT_ID} 未找到，组件将不会渲染。`);
          setShouldRender(false);
        }
      }, []);

      useEffect(() => {
        if (!startDate || !shouldRender) return;

        const calculateUptime = () => {
          const now = new Date(); let diff = now.getTime() - startDate.getTime();
          if (diff < 0) { setUptime({ days: 0, hours: 0, minutes: 0, seconds: 0 }); return; }
          const days = Math.floor(diff / (1000 * 60 * 60 * 24)); diff -= days * (1000 * 60 * 60 * 24);
          const hours = Math.floor(diff / (1000 * 60 * 60)); diff -= hours * (1000 * 60 * 60);
          const minutes = Math.floor(diff / (1000 * 60)); diff -= minutes * (1000 * 60);
          const seconds = Math.floor(diff / 1000);
          setUptime({ days, hours, minutes, seconds });
        };
        calculateUptime(); const intervalId = setInterval(calculateUptime, 1000);
        return () => clearInterval(intervalId);
      }, [startDate, shouldRender]);

      if (!shouldRender) {
          return null; 
      }

      const uptimeString = `${uptime.days} 天 ${String(uptime.hours).padStart(2, '0')} 时 ${String(uptime.minutes).padStart(2, '0')} 分 ${String(uptime.seconds).padStart(2, '0')} 秒`;
      return React.createElement('div', { className: 'dqsb-info-card' },
        React.createElement('div', { className: 'dqsb-info-card-header' }, React.createElement(TimerIcon), React.createElement('span', null, '本站已运行')),
        React.createElement('div', { className: 'dqsb-info-card-content' }, React.createElement('span', { className: 'dqsb-uptime-value' }, uptimeString))
      );
    };

    const OnThisDayCard = () => {
        const [events, setEvents] = useState([]);
        const [loading, setLoading] = useState(true);
        const [error, setError] = useState(null);
        const MAX_EVENTS = 7;

        useEffect(() => {
            const fetchHistoryEvents = async () => {
                setLoading(true);
                setError(null);
                setEvents([]); // Reset events on new fetch
                const now = new Date();
                const monthPadded = (now.getMonth() + 1).toString().padStart(2, '0');
                const dayPadded = now.getDate().toString().padStart(2, '0');
                const apiUrl = `https://baike.baidu.com/cms/home/eventsOnHistory/${monthPadded}.json`;
                // UPDATED proxy: Using api.codetabs.com
                const proxyUrls = ['https://api.codetabs.com/v1/proxy?quest=']; 
                
                let responseData = null;
                for (const proxyUrl of proxyUrls) {
                    try {
                        const fullUrl = proxyUrl + encodeURIComponent(apiUrl);
                        const response = await fetch(fullUrl);
                        if (response.ok) {
                            const responseText = await response.text();
                             try {
                                responseData = JSON.parse(responseText);
                            } catch (jsonError) {
                                console.error("JSON parsing error for history with proxy " + proxyUrl + ": ", jsonError, "Response text:", responseText);
                                continue; 
                            }
                            break; 
                        } else {
                            console.warn(`Fetch history failed with proxy ${proxyUrl}, status: ${response.status}`);
                        }
                    } catch (e) {
                        console.warn(`Network or other error for history with proxy ${proxyUrl}:`, e);
                    }
                }

                if (responseData) {
                    const todayKey = `${monthPadded}${dayPadded}`;
                    const monthData = responseData[monthPadded];
                    if (monthData && monthData[todayKey] && Array.isArray(monthData[todayKey])) {
                        setEvents(monthData[todayKey].slice(0, MAX_EVENTS));
                    } else {
                        console.warn(`No events found for key: ${monthPadded}.${todayKey} in API response`, responseData);
                        setError('今天似乎没有历史事件记录。');
                    }
                } else {
                    setError('获取历史上的今天数据失败。');
                }
                setLoading(false);
            };
            fetchHistoryEvents();
        }, []);

        return React.createElement('div', { className: 'dqsb-history-card' },
            React.createElement('div', { className: 'dqsb-history-card-header' },
                React.createElement(HistoryTimelineIcon),
                React.createElement('span', null, '历史上的今天')
            ),
            loading
                ? React.createElement('div', { className: 'dqsb-history-loading' }, '加载历史事件中...')
                : error
                    ? React.createElement('div', { className: 'dqsb-history-error' }, error)
                    : events.length > 0
                        ? React.createElement('ul', { className: 'dqsb-history-list' },
                            events.map((event, index) => 
                                React.createElement('li', { key: index, className: 'dqsb-history-item' },
                                    React.createElement('span', { className: 'dqsb-history-item-year' }, event.year + '年:'),
                                    React.createElement('span', { 
                                        className: 'dqsb-history-item-title',
                                        dangerouslySetInnerHTML: { __html: event.title } 
                                    })
                                )
                            )
                          )
                        : React.createElement('div', { className: 'dqsb-history-error' }, '今天暂无历史事件数据。')
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
          React.createElement('div', { className: 'dqsb-sidebar-title' }, '✨ 信息栏'), 
          React.createElement('button', { className: 'dqsb-sidebar-close', onClick: handleClose, title: '关闭侧边栏' }, React.createElement(CloseIconSvg))
        ),
        React.createElement(DailyQuoteContent),
        React.createElement(TodaysDateCard),
        React.createElement(SiteUptimeCard), 
        React.createElement(OnThisDayCard)
      );
    };

    const { sidebarPanel } = createSidebarDOMElements();
    if (sidebarPanel) {
      const root = ReactDOM.createRoot(sidebarPanel);
      root.render(React.createElement(FullDailyQuoteSidebar));
      console.log('Full DailyQuote sidebar rendered.');
    }
  }


  async function start() {
    try {
      if (!window.React) await loadScript(REACT_CDN_URL, 'React');
      if (!window.ReactDOM) await loadScript(REACT_DOM_CDN_URL, 'ReactDOM');
      
      React = window.React; 
      ReactDOM = window.ReactDOM;

      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeDailyQuoteApp);
      } else {
        initializeDailyQuoteApp();
      }
    } catch (error) {
      console.error("Failed to load dependencies or initialize DailyQuote sidebar:", error);
    }
  }

  start();

})();
