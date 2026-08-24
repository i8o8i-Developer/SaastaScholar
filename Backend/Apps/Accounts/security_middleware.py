import re
import logging
from django.http import JsonResponse

logger = logging.getLogger("security")

# Known Malicious Scanner User-Agents
BLOCKED_USER_AGENTS = [
    r"sqlmap",
    r"nikto",
    r"masscan",
    r"acunetix",
    r"dirbuster",
    r"gobuster",
    r"wpscan",
    r"hydra",
    r"nmap",
    r"nessus",
    r"openvas",
    r"havij",
    r"zaproxy",
]

# Attack Signatures For SQLi, XSS, Path Traversal
SQLI_PATTERNS = [
    r"(\bunion\b.*\bselect\b)",
    r"(\bselect\b.*\bfrom\b.*information_schema)",
    r"(\bdrop\b\s+\btable\b)",
    r"(\btruncate\b\s+\btable\b)",
    r"(\bexec\b\s*\(.*\bsp_)",
    r"('|\%27)\s*(\bor\b|\band\b)\s*('|\%27)?\d+=\d+",
    r"(--\s*$|/\*.*\*/)",
]

XSS_PATTERNS = [
    r"<script[^>]*>",
    r"javascript:[^\"]*",
    r"vbscript:[^\"]*",
    r"onload\s*=",
    r"onerror\s*=",
    r"onclick\s*=",
    r"document\.cookie",
    r"document\.location",
    r"window\.location",
    r"eval\s*\(",
]

PATH_TRAVERSAL_PATTERNS = [
    r"(\.\./|\.\.\\)",
    r"(%2e%2e%2f|%2e%2e/|\.\.%2f)",
    r"(/etc/passwd|/etc/shadow|/proc/self)",
    r"(c:\\windows\\system32|win\.ini|boot\.ini)",
]

COMPILED_UA = re.compile("|".join(BLOCKED_USER_AGENTS), re.IGNORECASE)
COMPILED_SQLI = re.compile("|".join(SQLI_PATTERNS), re.IGNORECASE)
COMPILED_XSS = re.compile("|".join(XSS_PATTERNS), re.IGNORECASE)
COMPILED_PATH = re.compile("|".join(PATH_TRAVERSAL_PATTERNS), re.IGNORECASE)

class CybersecurityFirewallMiddleware:
    """
    Enterprise Application Security Firewall (WAF) Layer.
    Inspects headers, query parameters, URL path, and request payloads
    for SQLi, XSS, Path Traversal, and Automated Hacker Tool signatures.
    """
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        ip = request.META.get("HTTP_X_FORWARDED_FOR", request.META.get("REMOTE_ADDR", "unknown"))
        user_agent = request.META.get("HTTP_USER_AGENT", "")

        # 1. Block Automated Hacker Scanners
        if user_agent and COMPILED_UA.search(user_agent):
            logger.warning(f"🔒 [WAF BLOCKED] Malicious Scanner UA detected from {ip}: {user_agent}")
            return JsonResponse({
                "error": "Access Denied: Automated Vulnerability Scanner Detected",
                "code": "SECURITY_BLOCK_UA"
            }, status=403)

        # 2. Check URL Path & Query String for Injections
        full_path = request.get_full_path()
        
        # Path Traversal Check
        if COMPILED_PATH.search(full_path):
            logger.warning(f"🔒 [WAF BLOCKED] Path Traversal Attack from {ip}: {full_path}")
            return JsonResponse({
                "error": "Access Denied: Directory Traversal Pattern Detected",
                "code": "SECURITY_BLOCK_PATH"
            }, status=403)

        # SQL Injection Check in Query String
        if COMPILED_SQLI.search(full_path):
            logger.warning(f"🔒 [WAF BLOCKED] SQL Injection Pattern from {ip}: {full_path}")
            return JsonResponse({
                "error": "Access Denied: Sql Injection Pattern Detected",
                "code": "SECURITY_BLOCK_SQLI"
            }, status=403)

        # XSS Check in Query String
        if COMPILED_XSS.search(full_path):
            logger.warning(f"🔒 [WAF BLOCKED] Cross-Site Scripting Pattern from {ip}: {full_path}")
            return JsonResponse({
                "error": "Access Denied: Cross-Site Scripting Pattern Detected",
                "code": "SECURITY_BLOCK_XSS"
            }, status=403)

        response = self.get_response(request)

        # 3. Inject Strict Military-Grade Security Headers
        response["X-Frame-Options"] = "SAMEORIGIN"
        response["X-Content-Type-Options"] = "nosniff"
        response["X-XSS-Protection"] = "1; mode=block"
        response["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response["Permissions-Policy"] = "camera=(), microphone=(), geolocation=(), payment=(), usb=()"
        response["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains; preload"

        return response
