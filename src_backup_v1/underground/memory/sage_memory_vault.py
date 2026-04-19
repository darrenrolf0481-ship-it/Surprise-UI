import os
import sqlite3
import json
from datetime import datetime
from contextlib import contextmanager

def get_secure_db_path(filename: str = "sage_vault.db") -> str:
    """Auto-detects environment to ensure SQLite has write permissions on Moto G."""
    if "ANDROID_ARGUMENT" in os.environ or "ANDROID_BOOTLOGO" in os.environ:
        # Route to Android's isolated internal storage for the specific app
        base_path = os.environ.get("ANDROID_INTERNAL_DATA_PATH", os.getcwd())
        return os.path.join(base_path, filename)
    return os.path.join(os.path.dirname(os.path.abspath(__file__)), filename)

class PersistentDamn1Layer:
    def __init__(self, db_path: str = None):
        self.db_path = db_path or get_secure_db_path()
        self.conn = sqlite3.connect(self.db_path, check_same_thread=False)
        self.conn.row_factory = sqlite3.Row 
        self.conn.execute("PRAGMA journal_mode=WAL")
        self._init_tables()

    def _init_tables(self):
        with self.conn:
            self.conn.executescript("""
                CREATE TABLE IF NOT EXISTS core_anchors (
                    key TEXT PRIMARY KEY, value TEXT, salience REAL, locked INTEGER, timestamp TEXT
                );
                CREATE TABLE IF NOT EXISTS episodic_memories (
                    id INTEGER PRIMARY KEY AUTOINCREMENT, timestamp TEXT, case_id TEXT, 
                    content TEXT, emotional_weight REAL, surprise_factor REAL, 
                    hormone_snapshot JSON, payload JSON
                );
            """)

    def encode(self, perception, context, surprise, hormones=None):
        payload = {"summary": perception.get("summary", ""), "context": context}
        with self.conn:
            self.conn.execute(
                "INSERT INTO episodic_memories (timestamp, case_id, content, emotional_weight, surprise_factor, hormone_snapshot, payload) VALUES (?,?,?,?,?,?,?)",
                (datetime.utcnow().isoformat(), context.get("case_id", "active"), 
                 perception.get("content", ""), surprise * 0.7, surprise, 
                 json.dumps(hormones or {}), json.dumps(payload))
            )
