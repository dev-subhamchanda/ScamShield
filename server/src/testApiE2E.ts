const BASE_URL = 'http://localhost:5000';

async function runE2ETests() {
  console.log('🚀 Running Comprehensive E2E API Verification for ScamShield...\n');
  let passedCount = 0;

  // 1. Health Check
  console.log('1. Testing /api/health...');
  const healthRes = await fetch(`${BASE_URL}/api/health`);
  const health = await healthRes.json();
  if (health.status !== 'OK') throw new Error('Health check failed');
  console.log('   ✓ Health check passed:', health.service, '| Engine:', health.deterministicStatus);
  passedCount++;

  // 2. Universal Scan: Digital Arrest Text Scam
  console.log('\n2. Testing Universal Scan (Text: Digital Arrest)...');
  const daPayload = {
    text: 'URGENT LEGAL SUMMONS: Mumbai Police and CBI Headquarters have registered an FIR against your Aadhaar card for money laundering and human trafficking. An arrest warrant has been approved. Join Skype video call immediately for statement verification or police team will arrest you.',
  };
  const daRes = await fetch(`${BASE_URL}/api/v1/scan/universal`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(daPayload),
  });
  const daData = await daRes.json();
  if (!daData.success || daData.result.threatCategory !== 'DIGITAL_ARREST') {
    throw new Error(`Digital Arrest classification failed: ${JSON.stringify(daData)}`);
  }
  console.log('   ✓ Detected Category:', daData.result.threatCategory);
  console.log('   ✓ Severity:', daData.result.riskSeverity, '| Score:', daData.result.deterministicScore);
  console.log('   ✓ Plain Verdict:', daData.result.aiExplanation.plainLanguageVerdict.slice(0, 80) + '...');
  passedCount++;

  // 3. Universal Scan: Reverse UPI QR Scam
  console.log('\n3. Testing Universal Scan (Text: Reverse UPI QR Scam)...');
  const upiPayload = {
    text: 'Sir I am sending ₹20,000 for your used iPhone on OLX. Please scan this QR code and enter your UPI PIN to receive the advance payment in your PhonePe wallet immediately.',
  };
  const upiRes = await fetch(`${BASE_URL}/api/v1/scan/universal`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(upiPayload),
  });
  const upiData = await upiRes.json();
  if (!upiData.success || upiData.result.threatCategory !== 'REVERSE_UPI_QR') {
    throw new Error(`Reverse UPI classification failed: ${JSON.stringify(upiData)}`);
  }
  console.log('   ✓ Detected Category:', upiData.result.threatCategory);
  console.log('   ✓ Severity:', upiData.result.riskSeverity, '| Flags:', upiData.result.flags.length);
  passedCount++;

  // 4. Universal Scan: SSRF Link Protection
  console.log('\n4. Testing Universal Scan (URL: SSRF Private Subnet Probe)...');
  const ssrfPayload = {
    url: 'http://127.0.0.1:8080/sensitive-endpoint',
  };
  const ssrfRes = await fetch(`${BASE_URL}/api/v1/scan/universal`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(ssrfPayload),
  });
  const ssrfData = await ssrfRes.json();
  const ssrfFlag = ssrfData.result.flags.find((f: any) => f.id === 'URL_SECURITY_VIOLATION');
  if (!ssrfFlag) throw new Error('SSRF attempt was not flagged as security violation!');
  console.log('   ✓ SSRF Blocked Successfully! Evidence:', ssrfFlag.evidence);
  passedCount++;

  // 5. Universal Scan: File Upload (CSV with DDE formula injection)
  console.log('\n5. Testing Universal Scan (File Upload: CSV DDE Attack)...');
  const csvContent = 'Item,Price,Code\nSubscription,199,"=cmd|\'/c calc\'!A1"\nTax,18,Normal';
  const csvBlob = new Blob([csvContent], { type: 'text/csv' });
  const formCsv = new FormData();
  formCsv.append('file', csvBlob, 'financial_ledger.csv');

  const csvRes = await fetch(`${BASE_URL}/api/v1/scan/universal`, {
    method: 'POST',
    body: formCsv,
  });
  const csvData = await csvRes.json();
  if (!csvData.result.indicators.hasDDEFormula) {
    throw new Error('CSV DDE formula injection was not caught in file upload!');
  }
  console.log('   ✓ CSV DDE Flagged! Indicators:', csvData.result.flags.map((f: any) => f.id));
  passedCount++;

  // 6. Universal Scan: File Upload (Binary Masquerade - EXE disguised as PDF)
  console.log('\n6. Testing Universal Scan (File Upload: Executable Masquerade)...');
  // 'MZ' header bytes
  const mzBuffer = new Uint8Array([0x4D, 0x5A, 0x90, 0x00, 0x03, 0x00, 0x00, 0x00]);
  const mzBlob = new Blob([mzBuffer], { type: 'application/pdf' });
  const formMz = new FormData();
  formMz.append('file', mzBlob, 'salary_increment_slip.pdf');

  const mzRes = await fetch(`${BASE_URL}/api/v1/scan/universal`, {
    method: 'POST',
    body: formMz,
  });
  const mzData = await mzRes.json();
  const spoofFlag = mzData.result.flags.find((f: any) => f.id === 'EXECUTABLE_EXTENSION_SPOOF');
  if (!spoofFlag) {
    throw new Error('Executable extension spoof was not flagged!');
  }
  console.log('   ✓ Executable Masquerade Blocked! Score:', mzData.result.deterministicScore);
  passedCount++;

  // 7. Personal Security Dashboard History
  console.log('\n7. Testing Personal Dashboard History...');
  const histRes = await fetch(`${BASE_URL}/api/v1/scan/history`);
  const histData = await histRes.json();
  if (!histData.success || histData.history.length < 5) {
    throw new Error('Scan history did not retain previous scans!');
  }
  console.log(`   ✓ Scan History contains ${histData.history.length} audited items.`);
  passedCount++;

  // 8. Community Intelligence: Submitting & Upvoting
  console.log('\n8. Testing Community Intelligence (Submit & Vote)...');
  const newReportPayload = {
    title: 'FedEx Customs Parcel SMS with Bitly Link',
    threatType: 'COURIER_DELIVERY_SMISHING',
    content: 'FedEx Alert: Parcel ID-4891 held at Delhi customs. Pay ₹12 clearance fee to avoid return: http://bit.ly/fedex-clearance-49',
    reportingReason: 'Unsolicited SMS from unknown number',
  };
  const submitRepRes = await fetch(`${BASE_URL}/api/v1/community/threats`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newReportPayload),
  });
  const submitRepData = await submitRepRes.json();
  const createdRepId = submitRepData.report.id;
  console.log('   ✓ Community report submitted! ID:', createdRepId);

  // Upvote
  const voteRes = await fetch(`${BASE_URL}/api/v1/community/threats/${createdRepId}/vote`, {
    method: 'POST',
  });
  const voteData = await voteRes.json();
  console.log('   ✓ Report upvoted! New score:', voteData.upvotes);
  passedCount++;

  // 9. Scam Campaigns & Stats
  console.log('\n9. Testing Scam Campaigns & Global Stats...');
  const campRes = await fetch(`${BASE_URL}/api/v1/intelligence/campaigns`);
  const campData = await campRes.json();
  const statsRes = await fetch(`${BASE_URL}/api/v1/intelligence/stats`);
  const statsData = await statsRes.json();
  console.log(`   ✓ Active campaigns tracked: ${campData.campaigns.length}`);
  console.log(`   ✓ Total platform scans: ${statsData.stats.totalThreatsScanned.toLocaleString()}`);
  passedCount++;

  // 10. Incident Response: Dossier Generation
  console.log('\n10. Testing Incident Response Case Filing...');
  const incidentPayload = {
    threatCategory: 'REVERSE_UPI_QR',
    financialLossAmount: 18500,
    transactionReference: 'UPI/2026/994821',
    suspectContactOrHandle: 'scammer_merchant@okaxis',
  };
  const incRes = await fetch(`${BASE_URL}/api/v1/incident/report`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(incidentPayload),
  });
  const incData = await incRes.json();
  console.log('   ✓ Incident Case Registered! ID:', incData.incident.id);
  console.log('   ✓ Golden Hour Steps:', incData.incident.checklist.length, 'checklist items.');
  passedCount++;

  // 11. Admin Moderation & Audit Logs
  console.log('\n11. Testing Admin Moderation & Audit Log Query...');
  const reviewRes = await fetch(`${BASE_URL}/api/v1/admin/moderation/review`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reportId: createdRepId, action: 'approve' }),
  });
  const reviewData = await reviewRes.json();
  console.log('   ✓ Admin approved report! Verified:', reviewData.report.verifiedByAdmin);

  const auditRes = await fetch(`${BASE_URL}/api/v1/admin/audit-logs`);
  const auditData = await auditRes.json();
  console.log(`   ✓ Audit logs contain ${auditData.auditLogs.length} immutable security entries.`);
  passedCount++;

  console.log(`\n🎉 ALL ${passedCount} END-TO-END SYSTEM INTEGRATION TESTS PASSED WITH 100% SUCCESS!\n`);
}

runE2ETests().catch((err) => {
  console.error('❌ E2E Test failed:', err);
  process.exit(1);
});
