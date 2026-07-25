/**
 * App Orchestrator & Router
 * Handles tab navigation, PWA install prompts, and global UI state.
 */
class AppRouter {
  constructor() {
    this.initNavigation();
    this.initSubNavigation();
    this.initPWA();
    this.initGlobalControls();
  }

  initNavigation() {
    const navItems = document.querySelectorAll('.bottom-nav .nav-item');
    const pages = document.querySelectorAll('.tab-page');

    navItems.forEach(item => {
      item.addEventListener('click', (e) => {
        const targetTabId = e.currentTarget.getAttribute('data-tab');
        
        // Update Nav Active State
        navItems.forEach(nav => nav.classList.remove('active'));
        e.currentTarget.classList.add('active');

        // Update Page Active State
        pages.forEach(page => {
          page.classList.remove('active');
          page.classList.add('hidden');
        });
        const activePage = document.getElementById(targetTabId);
        if (activePage) {
          activePage.classList.add('active');
          activePage.classList.remove('hidden');
        }
        
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    });
  }

  initSubNavigation() {
    const subNavBtns = document.querySelectorAll('.sub-tab-btn');
    const subPanes = document.querySelectorAll('.sub-tab-pane');

    subNavBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const targetId = e.currentTarget.getAttribute('data-subtab');
        
        subNavBtns.forEach(b => b.classList.remove('active'));
        e.currentTarget.classList.add('active');

        subPanes.forEach(p => {
          p.classList.remove('active');
          p.classList.add('hidden');
        });
        
        const targetPane = document.getElementById(targetId);
        if (targetPane) {
          targetPane.classList.remove('hidden');
          targetPane.classList.add('active');
        }
      });
    });
  }

  switchTab(tabId) {
    const navBtn = document.querySelector(`.bottom-nav .nav-item[data-tab="${tabId}"]`);
    if (navBtn) navBtn.click();
  }

  initGlobalControls() {
    // Ambient Sound Toggle
    const ambientBtn = document.getElementById('ambient-sound-btn');
    if (ambientBtn) {
      ambientBtn.addEventListener('click', () => {
        const isPlaying = window.audioFxEngine.toggleAmbientSound();
        if (isPlaying) {
          ambientBtn.classList.add('active');
          ambientBtn.innerHTML = `<i data-lucide="volume-2" style="width:20px;height:20px;"></i>`;
          if (typeof lucide !== 'undefined') lucide.createIcons();
        } else {
          ambientBtn.classList.remove('active');
          ambientBtn.innerHTML = `<i data-lucide="music" style="width:20px;height:20px;"></i>`;
          if (typeof lucide !== 'undefined') lucide.createIcons();
        }
      });
    }

    // Voice Assistant Quick Toggle Header
    const voiceTrigger = document.getElementById('voice-assistant-toggle');
    if (voiceTrigger) {
      voiceTrigger.addEventListener('click', () => {
        // Jump to voice express tab and trigger mic
        this.switchTab('tab-zero-typing');
        const micBtn = document.getElementById('mic-main-btn');
        if (micBtn) micBtn.click();
      });
    }
  }

  initPWA() {
    let deferredPrompt;
    const toast = document.getElementById('pwa-install-toast');
    const installBtn = document.getElementById('pwa-install-btn');
    const dismissBtn = document.getElementById('pwa-dismiss-btn');

    const headerInstallBtn = document.getElementById('pwa-install-header-btn');

    window.addEventListener('beforeinstallprompt', (e) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      deferredPrompt = e;
      // Show custom install prompt
      if (toast) toast.classList.remove('hidden');
    });

    const triggerInstall = async () => {
      if (toast) toast.classList.add('hidden');
      if (deferredPrompt) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`User response to the install prompt: ${outcome}`);
        deferredPrompt = null;
      }
    };

    if (installBtn) {
      installBtn.addEventListener('click', triggerInstall);
    }
    
    if (headerInstallBtn) {
      headerInstallBtn.addEventListener('click', triggerInstall);
    }

    if (dismissBtn) {
      dismissBtn.addEventListener('click', () => {
        if (toast) toast.classList.add('hidden');
      });
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  if (typeof lucide !== 'undefined') lucide.createIcons();
  window.appRouter = new AppRouter();
});
