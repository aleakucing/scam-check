import { isIP } from "net";

const BLOCKED_HOSTNAMES = new Set([
  "localhost",
  "127.0.0.1",
  "::1",
  "0.0.0.0",
  "metadata.google.internal",
  "instance-data",
  "metadata",
  "kubernetes.default",
  "host.docker.internal"
]);

const CLOUD_METADATA_IPS = new Set([
  "169.254.169.254", // AWS / GCP / Azure / OpenStack metadata
  "100.100.100.200"  // Alibaba Cloud metadata
]);

/**
 * Checks whether an IPv4 address is in a private, loopback, link-local,
 * CGNAT, or cloud-metadata range.
 */
function isPrivateIpv4(ip: string): boolean {
  const parts = ip.split(".").map(Number);
  if (parts.length !== 4 || parts.some(isNaN) || parts.some(p => p < 0 || p > 255)) {
    return true; // Invalid IPv4 structure, reject as unsafe
  }

  const [a, b] = parts;

  // 0.0.0.0/8 (Current network)
  if (a === 0) return true;
  // 10.0.0.0/8 (Private)
  if (a === 10) return true;
  // 100.64.0.0/10 (Carrier-grade NAT)
  if (a === 100 && b >= 64 && b <= 127) return true;
  // 127.0.0.0/8 (Loopback)
  if (a === 127) return true;
  // 169.254.0.0/16 (Link-local & cloud metadata)
  if (a === 169 && b === 254) return true;
  // 172.16.0.0/12 (Private)
  if (a === 172 && b >= 16 && b <= 31) return true;
  // 192.0.0.0/24 & 192.0.2.0/24 (TEST-NET-1)
  if (a === 192 && b === 0) return true;
  // 192.168.0.0/16 (Private)
  if (a === 192 && b === 168) return true;
  // 198.18.0.0/15 (Benchmarking)
  if (a === 198 && (b === 18 || b === 19)) return true;
  // 198.51.100.0/24 (TEST-NET-2)
  if (a === 198 && b === 51) return true;
  // 203.0.113.0/24 (TEST-NET-3)
  if (a === 203 && b === 0) return true;
  // 224.0.0.0/4 (Multicast) & 240.0.0.0/4 (Reserved)
  if (a >= 224) return true;

  return false;
}

/**
 * Checks whether an IPv6 address is in a private, loopback, or link-local range.
 */
function isPrivateIpv6(ip: string): boolean {
  const clean = ip.toLowerCase().replace(/^\[|\]$/g, "");
  // Loopback (::1)
  if (clean === "::1" || clean === "0:0:0:0:0:0:0:1") return true;
  // Unspecified (::)
  if (clean === "::" || clean === "0:0:0:0:0:0:0:0") return true;
  // IPv4-mapped IPv6 (::ffff:127.0.0.1)
  if (clean.includes("::ffff:")) {
    const ipv4 = clean.split("::ffff:")[1];
    if (ipv4 && isPrivateIpv4(ipv4)) return true;
  }
  // Unique Local Address (fc00::/7)
  if (clean.startsWith("fc") || clean.startsWith("fd")) return true;
  // Link-local (fe80::/10)
  if (clean.startsWith("fe80:") || clean.startsWith("fe8") || clean.startsWith("fe9") || clean.startsWith("fea") || clean.startsWith("feb")) return true;

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

  // 1. Strict Protocol Enforcement
  const scheme = (parsed.protocol || "").replace(":", "").toLowerCase();
  if (scheme !== "http" && scheme !== "https") {
    return {
      safe: false,
      isSafe: false,
      message: `Protokol '${scheme}' tidak diizinkan. Hanya http dan https yang diterima.`
    };
  }

  // 2. Hostname Validation
  const rawHostname = (parsed.hostname || "").toLowerCase().replace(/^\[|\]$/g, "");
  if (!rawHostname) {
    return { safe: false, isSafe: false, message: "Nama host tidak ditemukan pada URL." };
  }

  // Disallow decimal, octal, or hex IP encodings (e.g. http://2130706433 or 0x7f.1)
  if (/^(?:0x[0-9a-f]+|[0-9]+)$/i.test(rawHostname)) {
    return {
      safe: false,
      isSafe: false,
      message: "Target menggunakan format IP integer/heksadesimal yang diblokir demi keamanan siber."
    };
  }

  // Block obvious internal names and suffixes
  if (
    BLOCKED_HOSTNAMES.has(rawHostname) ||
    rawHostname.endsWith(".localhost") ||
    rawHostname.endsWith(".local") ||
    rawHostname.endsWith(".internal") ||
    rawHostname.endsWith(".lan") ||
    rawHostname.endsWith(".corp") ||
    rawHostname.endsWith(".home")
  ) {
    return {
      safe: false,
      isSafe: false,
      message: "Target mengarah ke localhost atau domain jaringan internal yang dilarang."
    };
  }

  // Check Cloud Metadata addresses
  if (CLOUD_METADATA_IPS.has(rawHostname)) {
    return {
      safe: false,
      isSafe: false,
      message: "Percobaan akses ke endpoint metadata cloud (169.254.169.254) diblokir oleh proteksi SSRF."
    };
  }

  // IP Address evaluation
  const ipVer = isIP(rawHostname);
  if (ipVer === 4 && isPrivateIpv4(rawHostname)) {
    return {
      safe: false,
      isSafe: false,
      message: `Alamat IP '${rawHostname}' berada di jaringan internal/privat yang diblokir oleh kebijakan keamanan siber.`
    };
  }

  if (ipVer === 6 && isPrivateIpv6(rawHostname)) {
    return {
      safe: false,
      isSafe: false,
      message: `Alamat IPv6 '${rawHostname}' berada di jaringan internal/link-local yang diblokir.`
    };
  }

  return { safe: true, isSafe: true, message: "URL valid untuk dianalisis." };
}
