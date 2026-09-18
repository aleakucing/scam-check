const BLOCKED_HOSTNAMES = new Set([
  "localhost",
  "127.0.0.1",
  "::1",
  "0.0.0.0",
  "metadata.google.internal",
  "instance-data"
]);

const CLOUD_METADATA_IPS = new Set([
  "169.254.169.254", // AWS / GCP / Azure metadata
  "100.100.100.200"  // Alibaba Cloud metadata
]);

function isPrivateIp(ip: string): boolean {
  const parts = ip.split(".").map(Number);
  if (parts.length !== 4 || parts.some(isNaN)) return false;

  const [a, b] = parts;
  // 127.0.0.0/8
  if (a === 127) return true;
  // 10.0.0.0/8
  if (a === 10) return true;
  // 172.16.0.0/12
  if (a === 172 && b >= 16 && b <= 31) return true;
  // 192.168.0.0/16
  if (a === 192 && b === 168) return true;
  // 169.254.0.0/16
  if (a === 169 && b === 254) return true;
  // 0.0.0.0/8
  if (a === 0) return true;

  return false;
}

export function validateUrlSafety(urlStr: string): { safe: boolean; isSafe: boolean; message: string } {
  if (!urlStr || urlStr.trim().length === 0) {
    return { safe: false, isSafe: false, message: "URL tidak boleh kosong." };
  }

  let fullUrl = urlStr.trim();
  if (!fullUrl.includes("://")) {
    fullUrl = "http://" + fullUrl;
  }

  let parsed: URL;
  try {
    parsed = new URL(fullUrl);
  } catch {
    return { safe: false, isSafe: false, message: "Format URL tidak valid." };
  }

  const scheme = (parsed.protocol || "").replace(":", "").toLowerCase();
  if (scheme !== "http" && scheme !== "https") {
    return {
      safe: false,
      isSafe: false,
      message: `Protokol '${scheme}' tidak diizinkan. Hanya http dan https yang diterima.`
    };
  }

  const hostname = (parsed.hostname || "").toLowerCase();
  if (!hostname) {
    return { safe: false, isSafe: false, message: "Nama host tidak ditemukan pada URL." };
  }

  if (BLOCKED_HOSTNAMES.has(hostname) || hostname.endsWith(".localhost")) {
    return {
      safe: false,
      isSafe: false,
      message: "Target mengarah ke localhost atau loopback internal yang dilarang."
    };
  }

  if (CLOUD_METADATA_IPS.has(hostname)) {
    return {
      safe: false,
      isSafe: false,
      message: "Percobaan akses ke endpoint metadata cloud (169.254.169.254) diblokir oleh proteksi SSRF."
    };
  }

  if (isPrivateIp(hostname)) {
    return {
      safe: false,
      isSafe: false,
      message: `Alamat IP '${hostname}' berada di jaringan internal/privat yang diblokir oleh kebijakan keamanan siber.`
    };
  }

  return { safe: true, isSafe: true, message: "URL valid untuk dianalisis." };
}
