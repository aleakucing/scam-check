import sqlite3
import json
import os
import logging
from typing import Optional, List, Dict, Any
from datetime import datetime

logger = logging.getLogger("scamguard.case_store")

# Store database in backend/data or current directory
DB_DIR = os.getenv("SCAMGUARD_DATA_DIR", os.path.join(os.path.dirname(__file__), "..", "..", "data"))
os.makedirs(DB_DIR, exist_ok=True)
DB_PATH = os.path.join(DB_DIR, "scamguard_cases.db")

def get_connection() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH, timeout=10)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    """Initialize cases table schema according to PRD Section 33 & 34."""
    try:
        with get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS cases (
                    case_id TEXT PRIMARY KEY,
                    timestamp TEXT NOT NULL,
                    evidence_type TEXT NOT NULL,
                    evidence_content TEXT NOT NULL,
                    content_risk INTEGER NOT NULL,
                    confidence INTEGER NOT NULL,
                    user_exposure INTEGER DEFAULT 10,
                    risk_level TEXT NOT NULL,
                    summary TEXT NOT NULL,
                    indicators TEXT NOT NULL,
                    actions TEXT DEFAULT '[]',
                    opened_link INTEGER DEFAULT NULL,
                    entered_credentials INTEGER DEFAULT NULL,
                    entered_otp INTEGER DEFAULT NULL,
                    is_emergency INTEGER DEFAULT 0,
                    created_at TEXT NOT NULL,
                    updated_at TEXT NOT NULL
                )
            """)
            conn.commit()
    except Exception as e:
        logger.error(f"Failed to initialize SQLite case database: {e}")

# Initialize on module import
init_db()

def save_case(data: Dict[str, Any]) -> str:
    """Save or update an incident case record in the persistent evidence vault."""
    now_iso = datetime.utcnow().isoformat() + "Z"
    case_id = data.get("case_id")
    if not case_id:
        raise ValueError("case_id is required")

    indicators_json = json.dumps(data.get("indicators", []))
    actions_json = json.dumps(data.get("actions", []))

    try:
        with get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO cases (
                    case_id, timestamp, evidence_type, evidence_content,
                    content_risk, confidence, user_exposure, risk_level,
                    summary, indicators, actions, opened_link, entered_credentials,
                    entered_otp, is_emergency, created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT(case_id) DO UPDATE SET
                    user_exposure = excluded.user_exposure,
                    opened_link = COALESCE(excluded.opened_link, cases.opened_link),
                    entered_credentials = COALESCE(excluded.entered_credentials, cases.entered_credentials),
                    entered_otp = COALESCE(excluded.entered_otp, cases.entered_otp),
                    is_emergency = excluded.is_emergency,
                    actions = excluded.actions,
                    updated_at = excluded.updated_at
            """, (
                case_id,
                data.get("timestamp", now_iso),
                data.get("evidence_type", "url"),
                data.get("evidence_content", ""),
                data.get("content_risk", 0),
                data.get("confidence", 0),
                data.get("user_exposure", data.get("initial_exposure", 10)),
                data.get("risk_level", "MENENGAH"),
                data.get("summary", ""),
                indicators_json,
                actions_json,
                1 if data.get("opened_link") is True else (0 if data.get("opened_link") is False else None),
                1 if data.get("entered_credentials") is True else (0 if data.get("entered_credentials") is False else None),
                1 if data.get("entered_otp") is True else (0 if data.get("entered_otp") is False else None),
                1 if data.get("is_emergency") else 0,
                now_iso,
                now_iso
            ))
            conn.commit()
            return case_id
    except Exception as e:
        logger.error(f"Error saving case {case_id}: {e}")
        return case_id

def get_case(case_id: str) -> Optional[Dict[str, Any]]:
    """Retrieve full case details from evidence vault by case_id."""
    try:
        with get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM cases WHERE case_id = ?", (case_id,))
            row = cursor.fetchone()
            if not row:
                return None
            
            d = dict(row)
            d["indicators"] = json.loads(d.get("indicators") or "[]")
            d["actions"] = json.loads(d.get("actions") or "[]")
            d["opened_link"] = bool(d["opened_link"]) if d["opened_link"] is not None else None
            d["entered_credentials"] = bool(d["entered_credentials"]) if d["entered_credentials"] is not None else None
            d["entered_otp"] = bool(d["entered_otp"]) if d["entered_otp"] is not None else None
            d["is_emergency"] = bool(d["is_emergency"])
            return d
    except Exception as e:
        logger.error(f"Error fetching case {case_id}: {e}")
        return None

def list_recent_cases(limit: int = 15) -> List[Dict[str, Any]]:
    """List recent incident cases for investigator review and history."""
    try:
        with get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT case_id, timestamp, evidence_type, content_risk, 
                       confidence, user_exposure, risk_level, summary, 
                       is_emergency, created_at
                FROM cases 
                ORDER BY created_at DESC 
                LIMIT ?
            """, (limit,))
            rows = cursor.fetchall()
            return [dict(r) for r in rows]
    except Exception as e:
        logger.error(f"Error listing cases: {e}")
        return []
