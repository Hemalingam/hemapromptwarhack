/**
 * India Treatment Directory & De-Addiction Center Locator Component
 * Renders vetted national helpline (Tele-MANAS 14446), NIMHANS, AIIMS NDDTC, TTK Hospital, Muktangan.
 */
class IndiaDirectory {
  constructor() {
    this.renderDirectory();
  }

  renderDirectory() {
    const list = window.crisisAiEngine.getIndiaDirectory();
    const container = document.getElementById('india-directory-list');
    if (!container) return;

    container.innerHTML = list.map(item => `
      <div class="directory-card">
        <div class="directory-header">
          <div>
            <span class="badge-tag">${item.badge}</span>
            <h4 class="center-title">${item.name}</h4>
            <span class="center-type">${item.type}</span>
          </div>
          <a href="tel:${item.phone.replace(/[^0-9]/g, '')}" class="call-btn-sm">
            📞 ${item.phone}
          </a>
        </div>
        <p class="center-address">📍 <strong>Location:</strong> ${item.address}</p>
        <p class="center-services">💼 <strong>Services:</strong> ${item.services}</p>
      </div>
    `).join('');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.indiaDirectory = new IndiaDirectory();
});
