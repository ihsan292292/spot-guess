const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const certsDir = path.join(process.cwd(), 'generated', 'certs');

// Create directory if it doesn't exist
if (!fs.existsSync(certsDir)) {
  fs.mkdirSync(certsDir, { recursive: true });
}

// For Windows, we'll try using PowerShell to create a self-signed certificate
try {
  console.log('Creating self-signed certificate for local development...');
  
  // PowerShell command to create self-signed certificate
  const psCommand = `
    $cert = New-SelfSignedCertificate -DnsName "localhost", "192.168.1.35" -CertStoreLocation "cert:\\CurrentUser\\My" -NotAfter (Get-Date).AddYears(1)
    $password = ConvertTo-SecureString -String "password" -Force -AsPlainText
    $pfxPath = "${certsDir.replace(/\//g, '\\')}/cert.pfx"
    Export-PfxCertificate -Cert $cert -FilePath $pfxPath -Password $password
    
    # Convert PFX to PEM format
    openssl pkcs12 -in $pfxPath -out "${certsDir.replace(/\//g, '\\')}/certificate.crt" -clcerts -nokeys -password pass:password
    openssl pkcs12 -in $pfxPath -out "${certsDir.replace(/\//g, '\\')}/private.key" -nocerts -nodes -password pass:password
  `;
  
  execSync(`powershell -Command "${psCommand}"`, { stdio: 'inherit' });
  console.log('✅ Certificates created successfully!');
  
} catch (error) {
  console.log('❌ Failed to create certificates with PowerShell. Creating dummy certificates...');
  
  // Create dummy certificate files (not secure, but will work for development)
  const dummyCert = `-----BEGIN CERTIFICATE-----
MIICljCCAX4CCQDAOxKQjrJNqDANBgkqhkiG9w0BAQsFADATMREwDwYDVQQDDAhs
b2NhbGhvc3QwHhcNMjQwODE2MDAwMDAwWhcNMjUwODE2MDAwMDAwWjATMREwDwYD
VQQDDAhsb2NhbGhvc3QwggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQC7
dummy certificate content for development only
-----END CERTIFICATE-----`;

  const dummyKey = `-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC7
dummy private key content for development only
-----END PRIVATE KEY-----`;

  fs.writeFileSync(path.join(certsDir, 'certificate.crt'), dummyCert);
  fs.writeFileSync(path.join(certsDir, 'private.key'), dummyKey);
  
  console.log('⚠️  Created dummy certificates. For production, use proper certificates.');
}
