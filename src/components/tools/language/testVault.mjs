import assert from 'node:assert';

// Verification test for PBKDF2 + AES-GCM encryption/decryption cycle
async function testCrypto() {
  const enc = new TextEncoder();
  const dec = new TextDecoder();
  const password = 'test-secure-password-123';
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));

  const passwordKey = await crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  const key = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: 100000,
      hash: 'SHA-256',
    },
    passwordKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );

  const samplePayload = {
    apiKey: 'AIzaSyTestKey12345',
    environments: [{ id: 'env_1', title: 'Danish DU3' }],
  };

  const plaintext = enc.encode(JSON.stringify(samplePayload));
  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    plaintext
  );

  assert(ciphertext.byteLength > 0, 'Ciphertext must not be empty');

  // Decrypt with correct key
  const decryptedBuf = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    ciphertext
  );
  const decryptedObj = JSON.parse(dec.decode(decryptedBuf));
  assert.deepStrictEqual(decryptedObj, samplePayload, 'Decrypted object must match original');

  // Attempt decrypt with wrong key (tampered password)
  const wrongPassKey = await crypto.subtle.importKey(
    'raw',
    enc.encode('wrong-password'),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );
  const wrongKey = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: 100000,
      hash: 'SHA-256',
    },
    wrongPassKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );

  let caught = false;
  try {
    await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      wrongKey,
      ciphertext
    );
  } catch {
    caught = true;
  }
  assert(caught, 'Decryption with incorrect password must fail authentication tag check');

  console.log('✓ Cryptographic WebCrypto AES-256-GCM test passed successfully.');
}

testCrypto();
