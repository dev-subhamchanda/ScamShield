import { validateAndTraceUrl } from './security/ssrfGuard.js';
import { inspectFileMagicAndSignature } from './security/magicBytes.js';
import { analyzeMessageHeuristics } from './security/heuristics.js';
import { inspectFileWithFileGuard } from './security/fileGuard.js';
import { redactSensitivePii } from './security/piiRedactor.js';

async function runTests() {
  console.log('🧪 Starting ScamShield Deterministic Security Verification...');

  // Test 1: SSRF Guard
  console.log('\n--- 1. Testing SSRF Protection ---');
  const ssrf1 = await validateAndTraceUrl('http://127.0.0.1:8080/admin');
  console.log('127.0.0.1 blocked:', !ssrf1.isSafe, '| Reason:', ssrf1.blockedReason);
  if (ssrf1.isSafe) throw new Error('SSRF failed to block loopback!');

  const ssrf2 = await validateAndTraceUrl('http://169.254.169.254/computeMetadata/v1/');
  console.log('Metadata IP blocked:', !ssrf2.isSafe, '| Reason:', ssrf2.blockedReason);
  if (ssrf2.isSafe) throw new Error('SSRF failed to block cloud metadata IP!');

  // Test 2: Magic Byte Masquerade
  console.log('\n--- 2. Testing Magic Byte Masquerade Detection ---');
  const fakePdfBuffer = Buffer.from([0x4D, 0x5A, 0x90, 0x00, 0x03, 0x00, 0x00, 0x00]); // 'MZ' header
  const magicResult = await inspectFileMagicAndSignature('salary_slip.pdf', fakePdfBuffer);
  console.log('Detected MIME:', magicResult.detectedMime);
  console.log('Is Executable Masquerade:', magicResult.isExecutableMasquerade);
  console.log('Suspicion Score:', magicResult.suspicionScore);
  if (!magicResult.isExecutableMasquerade) throw new Error('Magic byte inspector failed to catch PE disguised as PDF!');

  // Test 3: Heuristics on Social Engineering & Digital Arrest
  console.log('\n--- 3. Testing Social Engineering & Digital Arrest Heuristics ---');
  const msg1 = 'Urgent: CBI and Mumbai Police have issued an arrest warrant against your Aadhaar under NDPS act. Join video call interrogation immediately.';
  const heur1 = analyzeMessageHeuristics(msg1);
  console.log('Category:', heur1.threatCategory, '| Severity:', heur1.severity, '| Score:', heur1.score);
  if (heur1.threatCategory !== 'DIGITAL_ARREST' || heur1.severity !== 'CRITICAL') {
    throw new Error('Failed to flag Digital Arrest threat!');
  }

  const msg2 = 'Scan this QR code and enter your UPI PIN to receive Rs 15,000 refund in your Google Pay account.';
  const heur2 = analyzeMessageHeuristics(msg2);
  console.log('Category:', heur2.threatCategory, '| Severity:', heur2.severity, '| Score:', heur2.score);
  if (heur2.threatCategory !== 'REVERSE_UPI_QR' || heur2.severity !== 'CRITICAL') {
    throw new Error('Failed to flag Reverse UPI QR threat!');
  }

  // Test 4: CSV Formula Injection (DDE)
  console.log('\n--- 4. Testing CSV DDE Formula Injection ---');
  const csvPayload = Buffer.from('Name,Amount,Notes\nJohn,100,"=cmd|\'/c calc\'!A1"\nAlice,200,Regular');
  const csvGuard = inspectFileWithFileGuard('statement.csv', csvPayload, 'text/csv');
  console.log('Category:', csvGuard.threatCategory, '| Severity:', csvGuard.severity, '| Has DDE:', csvGuard.indicators.hasDDEFormula);
  if (!csvGuard.indicators.hasDDEFormula) {
    throw new Error('FileGuard failed to detect CSV DDE formula injection!');
  }

  // Test 5: PII Redaction
  console.log('\n--- 5. Testing PII Redactor ---');
  const rawPiiText = 'Contact officer at +91 98765 43210 or send Rs 5000 to victim@okhdfcbank. My card is 4111 2222 3333 4444.';
  const redResult = redactSensitivePii(rawPiiText);
  console.log('Sanitized text:', redResult.sanitizedText);
  console.log('Extracted phones:', redResult.extractedPhones);
  console.log('Extracted UPIs:', redResult.extractedUpiVpas);
  if (redResult.sanitizedText.includes('4111 2222 3333 4444') || redResult.sanitizedText.includes('9876543210')) {
    throw new Error('PII Redactor failed to mask sensitive phone or card numbers!');
  }

  console.log('\n✅ ALL 5 CORE DETERMINISTIC SECURITY TESTS PASSED PERFECTLY!\n');
}

runTests().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
