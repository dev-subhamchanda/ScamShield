// ScamShield In-Page Passive Protection (Content Script)
chrome.runtime.onMessage.addListener((message) => {
  if (message.type === 'SCAMSHIELD_SCAN_RESULT') {
    showScanBanner(message.data);
  }
});

function showScanBanner(data) {
  const existing = document.getElementById('scamshield-floating-alert');
  if (existing) existing.remove();

  const isDanger = data.riskSeverity === 'CRITICAL' || data.riskSeverity === 'HIGH';

  const banner = document.createElement('div');
  banner.id = 'scamshield-floating-alert';
  banner.style.position = 'fixed';
  banner.style.bottom = '20px';
  banner.style.right = '20px';
  banner.style.zIndex = '999999';
  banner.style.maxWidth = '360px';
  banner.style.backgroundColor = '#11151E';
  banner.style.color = '#F1F5F9';
  banner.style.border = isDanger ? '1px solid #EF4444' : '1px solid #22C55E';
  banner.style.borderRadius = '12px';
  banner.style.boxShadow = '0 10px 25px rgba(0,0,0,0.5)';
  banner.style.padding = '14px 16px';
  banner.style.fontFamily = '-apple-system, sans-serif';
  banner.style.fontSize = '12px';

  banner.innerHTML = `
    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
      <strong style="color: ${isDanger ? '#EF4444' : '#22C55E'}; font-size: 13px;">
        🛡️ ScamShield: ${data.riskSeverity} (${data.score}/100)
      </strong>
      <button id="scamshield-close-btn" style="background: none; border: none; color: #94A3B8; cursor: pointer; font-size: 16px;">×</button>
    </div>
    <p style="color: #F1F5F9; line-height: 1.4; margin-bottom: 8px;">${data.verdict}</p>
    <div style="display: flex; gap: 8px; font-size: 11px;">
      ${isDanger ? '<span style="color: #EF4444; font-weight: 600;">⚠️ Do not enter PIN or download files</span>' : '<span style="color: #22C55E;">Verified Safe</span>'}
    </div>
  `;

  document.body.appendChild(banner);

  document.getElementById('scamshield-close-btn')?.addEventListener('click', () => {
    banner.remove();
  });

  // Auto-dismiss safe alerts after 8 seconds
  if (!isDanger) {
    setTimeout(() => {
      if (document.body.contains(banner)) banner.remove();
    }, 8000);
  }
}
