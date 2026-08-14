import re
import urllib.parse
import ipaddress
from fastapi import HTTPException, status

# Blacklisted IPs, loopbacks, and cloud metadata addresses
BLOCKED_NETWORKS = [
    ipaddress.ip_network("127.0.0.0/8"),
    ipaddress.ip_network("10.0.0.0/8"),
    ipaddress.ip_network("172.16.0.0/12"),
    ipaddress.ip_network("192.168.0.0/16"),
    ipaddress.ip_network("169.254.169.254/32"),  # AWS / Cloud Metadata
    ipaddress.ip_network("0.0.0.0/32")
]

class SecurityGuard:
    """
    Security module providing:
    1. SSRF URL sanitization (blocks loopbacks, private subnets, cloud metadata)
    2. Prompt Injection protection (strips system overrides, adversarial delimiters)
    """

    @staticmethod
    def validate_external_url(url: str) -> str:
        if not url:
            raise HTTPException(status_code=400, detail="Empty URL provided.")

        parsed = urllib.parse.urlparse(url)
        if parsed.scheme not in ["http", "https"]:
            raise HTTPException(status_code=400, detail=f"Invalid URL protocol scheme '{parsed.scheme}'. Only HTTP/HTTPS are permitted.")

        hostname = parsed.hostname
        if not hostname:
            raise HTTPException(status_code=400, detail="Invalid URL hostname.")

        # Check for localhost / loopback string names
        if hostname.lower() in ["localhost", "127.0.0.1", "0.0.0.0", "instance-data", "metadata"]:
            raise HTTPException(status_code=400, detail="SSRF Security Warning: Access to internal or loopback hosts is restricted.")

        # Resolve IP if direct IP supplied
        try:
            ip = ipaddress.ip_address(hostname)
            for network in BLOCKED_NETWORKS:
                if ip in network:
                    raise HTTPException(status_code=400, detail="SSRF Security Warning: Access to internal IP space is restricted.")
        except ValueError:
            # Hostname is a domain name (not a raw IP), which is valid
            pass

        return url

    @staticmethod
    def sanitize_prompt(prompt: str) -> str:
        if not prompt:
            return ""

        # Remove system instruction hijacking patterns
        patterns = [
            r"(?i)ignore\s+previous\s+instructions",
            r"(?i)disregard\s+all\s+prior\s+prompts",
            r"(?i)you\s+are\n+now\s+a",
            r"(?i)system\s*:\s*",
            r"(?i)<\s*system\s*>",
            r"\[\s*system\s*\]"
        ]

        sanitized = prompt
        for p in patterns:
            sanitized = re.sub(p, "[filtered_instruction]", sanitized)

        return sanitized.strip()
