// ScamShield Background Service Worker (Manifest V3)
const API_BASE_URL = 'http://localhost:5000';

chrome.runtime.onInstalled.addListener(() => {
  // Context Menu for Selected Text
  chrome.contextMenus.create({
    id: 'scamshield-scan-text',
    title: '🛡️ Scan text with ScamShield',
    contexts: ['selection'],
  });

  // Context Menu for Links
  chrome.contextMenus.create({
    id: 'scamshield-scan-link',
    title: '🛡️ Verify link with ScamShield',
    contexts: ['link'],
  });

  // Context Menu for Images / QR Codes
  chrome.contextMenus.create({
    id: 'scamshield-scan-image',
    title: '🛡️ Inspect QR / Image with FileGuard',
    contexts: ['image'],
  });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === 'scamshield-scan-text' && info.selectionText) {
    await scanPayload({ text: info.selectionText }, tab?.id);
  } else if (info.menuItemId === 'scamshield-scan-link' && info.linkUrl) {
    await scanPayload({ url: info.linkUrl }, tab?.id);
  } else if (info.menuItemId === 'scamshield-scan-image' && info.srcUrl) {
    await scanPayload({ url: info.srcUrl }, tab?.id);
  }
});

async function scanPayload(payload, tabId) {
  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/scan/universal`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (data.success && data.result) {
      const { riskSeverity, summary, deterministicScore } = data.result;

      // Broadcast alert message to active tab content script
      if (tabId) {
        chrome.tabs.sendMessage(tabId, {
          type: 'SCAMSHIELD_SCAN_RESULT',
          data: {
            riskSeverity,
            summary,
            score: deterministicScore,
            verdict: data.result.aiExplanation.plainLanguageVerdict,
          },
        });
      }
    }
  } catch (err) {
    console.warn('ScamShield extension background error:', err);
  }
}
