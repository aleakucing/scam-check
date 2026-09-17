import ipaddress
import urllib.parse
from typing import Tuple

BLOCKED_HOSTNAMES = {
    "localhost", "127.0.0.1", "::1", "0.0.0.0",
    "metadata.google.internal", "instance-data"
}

CLOUD_METADATA_IPS = {
    "169.254.169.254",  # AWS / GCP / Azure metadata service
    "100.100.100.200",  # Alibaba Cloud metadata
}

def validate_url_safety(url_str: str) -> Tuple[bool, str]:
    """
    Validates that a URL does not attempt Server-Side Request Forgery (SSRF)
    or target private networks / cloud metadata endpoints (PRD Section 42).
    Returns (is_safe, message).
    """
    if not url_str:
        return False, "URL tidak boleh kosong."

    if "://" not in url_str:
        url_str = "http://" + url_str

    try:
        parsed = urllib.parse.urlparse(url_str)
    except Exception:
        return False, "Format URL tidak valid."

    scheme = (parsed.scheme or "").lower()
    if scheme not in ("http", "https"):
        return False, f"Protokol '{scheme}' tidak diizinkan. Hanya http dan https yang diterima."

    hostname = (parsed.hostname or "").lower()
    if not hostname:
        return False, "Nama host tidak ditemukan pada URL."

    if hostname in BLOCKED_HOSTNAMES or hostname.endswith(".localhost"):
        return False, "Target mengarah ke localhost atau loopback internal yang dilarang."

    if hostname in CLOUD_METADATA_IPS:
        return False, "Percobaan akses ke endpoint metadata cloud (169.254.169.254) diblokir oleh proteksi SSRF."

    # Check IP addresses (private, link-local, loopback)
    try:
        ip = ipaddress.ip_address(hostname)
        if ip.is_private or ip.is_loopback or ip.is_link_local or ip.is_reserved:
            return False, f"Alamat IP '{hostname}' berada di jaringan internal/privat yang diblokir oleh kebijakan keamanan siber."
    except ValueError:
        # Not a raw IP address, which is standard for public domain names
        pass

    return True, "URL valid untuk dianalisis."
