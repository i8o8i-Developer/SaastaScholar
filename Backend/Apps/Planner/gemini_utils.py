import json
import logging
import urllib.error
import urllib.request

logger = logging.getLogger(__name__)

FALLBACK_CANDIDATES = [
    ("v1beta", "gemini-2.5-flash"),
    ("v1beta", "gemini-2.0-flash"),
    ("v1beta", "gemini-1.5-flash-latest"),
    ("v1beta", "gemini-1.5-flash-002"),
    ("v1", "gemini-1.5-flash"),
    ("v1beta", "gemini-1.5-flash"),
    ("v1beta", "gemini-2.0-flash-exp"),
    ("v1beta", "gemini-1.5-pro"),
]


def discover_available_gemini_models(api_key: str):
    discovered = []
    for api_version in ["v1beta", "v1"]:
        try:
            url = f"https://generativelanguage.googleapis.com/{api_version}/models?key={api_key}"
            req = urllib.request.Request(url, headers={"Content-Type": "application/json"})
            with urllib.request.urlopen(req, timeout=8) as resp:
                data = json.loads(resp.read().decode("utf-8"))
                for m in data.get("models", []):
                    methods = m.get("supportedGenerationMethods", [])
                    if "generateContent" in methods:
                        raw_name = m.get("name", "")
                        clean_name = raw_name.replace("models/", "")
                        discovered.append((api_version, clean_name))
        except Exception as e:
            logger.debug(f"Failed to query {api_version} models list: {e}")

    if not discovered:
        return []

    def score_model(item):
        ver, name = item
        nl = name.lower()
        if "2.5-flash" in nl:
            return 0
        if "2.0-flash" in nl:
            return 1
        if "1.5-flash-latest" in nl:
            return 2
        if "1.5-flash" in nl:
            return 3
        if "flash" in nl:
            return 4
        if "pro" in nl:
            return 5
        return 6

    discovered.sort(key=score_model)
    return discovered


def call_gemini_generate_content(
    api_key: str,
    prompt_text: str,
    inline_data: dict = None,
    temperature: float = 0.15,
    response_mime_type: str = "application/json",
    timeout: int = 40,
):
    discovered = discover_available_gemini_models(api_key)
    candidates = discovered + [c for c in FALLBACK_CANDIDATES if c not in discovered]

    parts = [{"text": prompt_text}]
    if inline_data:
        parts.append({"inline_data": inline_data})

    payload = {
        "contents": [{"parts": parts}],
        "generationConfig": {
            "temperature": temperature,
        },
    }
    if response_mime_type:
        payload["generationConfig"]["responseMimeType"] = response_mime_type

    last_err = None
    last_err_msg = ""

    for api_version, model_name in candidates:
        url = f"https://generativelanguage.googleapis.com/{api_version}/models/{model_name}:generateContent?key={api_key}"
        try:
            req = urllib.request.Request(
                url,
                data=json.dumps(payload).encode("utf-8"),
                headers={"Content-Type": "application/json"},
                method="POST",
            )
            with urllib.request.urlopen(req, timeout=timeout) as resp:
                raw_data = resp.read().decode("utf-8")
                result_json = json.loads(raw_data)
                return result_json, model_name
        except urllib.error.HTTPError as http_err:
            last_err = http_err
            try:
                err_body = http_err.read().decode("utf-8")
                err_json = json.loads(err_body)
                last_err_msg = err_json.get("error", {}).get("message", str(http_err))
            except Exception:
                last_err_msg = str(http_err)

            if http_err.code in (404, 400) and (
                "not found" in last_err_msg.lower()
                or "not supported" in last_err_msg.lower()
                or "model" in last_err_msg.lower()
            ):
                logger.warning(f"Model {model_name} on {api_version} failed ({http_err.code}): {last_err_msg}. Trying next candidate...")
                continue
            if "api key" in last_err_msg.lower() or "api_key" in last_err_msg.lower() or http_err.code in (401, 403):
                raise ValueError(f"Gemini API Key Error: {last_err_msg}")
            
            if "responsemimetype" in last_err_msg.lower():
                payload_copy = dict(payload)
                payload_copy["generationConfig"] = {"temperature": temperature}
                try:
                    retry_req = urllib.request.Request(
                        url,
                        data=json.dumps(payload_copy).encode("utf-8"),
                        headers={"Content-Type": "application/json"},
                        method="POST",
                    )
                    with urllib.request.urlopen(retry_req, timeout=timeout) as resp:
                        raw_data = resp.read().decode("utf-8")
                        return json.loads(raw_data), model_name
                except Exception:
                    pass
                continue
        except Exception as e:
            last_err = e
            last_err_msg = str(e)
            logger.warning(f"Error calling {model_name} on {api_version}: {e}. Trying next candidate...")
            continue

    if last_err_msg:
        raise RuntimeError(f"All Gemini Models Failed. Last Error: {last_err_msg}")
    raise RuntimeError("All Gemini Models Failed To Generate Content.")
