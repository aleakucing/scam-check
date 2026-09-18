import sys
import json
import urllib.request
from typing import Dict, Any, Optional

CONTEXT7_ENDPOINT = "https://mcp.context7.com/mcp"

def call_context7_mcp(method: str, params: Dict[str, Any]) -> Dict[str, Any]:
    """Send JSON-RPC 2.0 request to Context7 remote MCP endpoint."""
    payload = json.dumps({
        "jsonrpc": "2.0",
        "id": 1,
        "method": method,
        "params": params
    }).encode("utf-8")

    req = urllib.request.Request(
        CONTEXT7_ENDPOINT,
        data=payload,
        headers={
            "User-Agent": "Antigravity/ScamGuard",
            "Content-Type": "application/json",
            "Accept": "application/json, text/event-stream"
        }
    )

    with urllib.request.urlopen(req, timeout=15) as resp:
        raw = resp.read().decode("utf-8")
        # Parse SSE data line
        for line in raw.split("\n"):
            if line.startswith("data: "):
                data_json = line[6:].strip()
                return json.loads(data_json)
        # Fallback raw json
        return json.loads(raw)

def resolve_library_id(library_name: str, query: str = "") -> Any:
    """Resolve a library name to a Context7 libraryId."""
    params = {
        "name": "resolve-library-id",
        "arguments": {
            "libraryName": library_name,
            "query": query or f"Documentation for {library_name}"
        }
    }
    res = call_context7_mcp("tools/call", params)
    return res.get("result", {}).get("content", [])

def query_docs(library_id: str, query: str) -> Any:
    """Query documentation and code snippets from Context7."""
    params = {
        "name": "query-docs",
        "arguments": {
            "libraryId": library_id,
            "query": query
        }
    }
    res = call_context7_mcp("tools/call", params)
    return res.get("result", {}).get("content", [])

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage:")
        print("  python scripts/context7_client.py resolve <library_name> [query]")
        print("  python scripts/context7_client.py query <library_id> <query>")
        sys.exit(1)

    cmd = sys.argv[1].lower()
    if cmd == "resolve":
        lib = sys.argv[2] if len(sys.argv) > 2 else "tailwind"
        q = sys.argv[3] if len(sys.argv) > 3 else ""
        print(f"Resolving '{lib}' on Context7...")
        res = resolve_library_id(lib, q)
        print(json.dumps(res, indent=2))
    elif cmd == "query":
        lib_id = sys.argv[2]
        q = sys.argv[3] if len(sys.argv) > 3 else "getting started"
        print(f"Querying Context7 docs for {lib_id} on '{q}'...")
        res = query_docs(lib_id, q)
        print(json.dumps(res, indent=2))
