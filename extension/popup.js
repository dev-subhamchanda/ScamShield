const API_URL = 'http://localhost:5000/api/v1/scan/universal';

const tabText = document.getElementById('tab-text');
const tabUrl = document.getElementById('tab-url');
const viewText = document.getElementById('view-text');
const viewUrl = document.getElementById('view-url');
const btnScan = document.getElementById('btn-scan');
const inputText = document.getElementById('input-text');
const inputUrl = document.getElementById('input-url');

const resultBox = document.getElementById('scan-result');
const resBadge = document.getElementById('res-badge');
const resScore = document.getElementById('res-score');
const resVerdict = document.getElementById('res-verdict');
const resSteps = document.getElementById('res-steps');

let currentTab = 'text';

tabText.addEventListener('click', () => {
  currentTab = 'text';
  tabText.classList.add('active');
  tabUrl.classList.remove('active');
  viewText.style.display = 'block';
  viewUrl.style.display = 'none';
});

tabUrl.addEventListener('click', () => {
  currentTab = 'url';
  tabUrl.classList.add('active');
  tabText.classList.remove('active');
  viewText.style.display = 'none';
  viewUrl.style.display = 'block';
});

btnScan.addEventListener('click', async () => {
  btnScan.disabled = true;
  btnScan.innerText = 'Scanning...';
  resultBox.style.display = 'none';

  const payload = {};
  if (currentTab === 'text') {
    payload.text = inputText.value.trim();
  } else {
    payload.url = inputUrl.value.trim();
  }

  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (data.success && data.result) {
      const r = data.result;
      resultBox.style.display = 'flex';
      resBadge.innerText = r.riskSeverity;
      resBadge.className = 'severity-badge ' + (r.riskSeverity === 'SAFE' ? 'safe' : 'critical');
      resScore.innerText = `Score: ${r.deterministicScore}/100`;
      resVerdict.innerText = r.aiExplanation.plainLanguageVerdict;

      resSteps.innerHTML = '';
      (r.aiExplanation.immediateActionSteps || []).slice(0, 3).forEach((s) => {
        const li = document.createElement('li');
        li.innerText = s;
        resSteps.appendChild(li);
      });
    }
  } catch (err) {
    alert('Unable to connect to ScamShield Security Gateway. Ensure localhost:5000 is running.');
  } finally {
    btnScan.disabled = false;
    btnScan.innerText = 'Scan & Verify Safety';
  }
});
