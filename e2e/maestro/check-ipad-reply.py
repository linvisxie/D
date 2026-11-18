"""Verify the simulator's persisted RP turn and report only generation metrics."""
import json
import sqlite3
import sys
from pathlib import Path

db_path = Path(sys.argv[1]) / "Documents" / "pocketpalai.db"
with sqlite3.connect(f"{db_path.as_uri()}?mode=ro", uri=True) as database:
    turn = database.execute(
        """
        SELECT messages.metadata
          FROM messages
          JOIN chat_sessions ON messages.session_id = chat_sessions.id
          JOIN local_pals ON chat_sessions.active_pal_id = local_pals.id
         WHERE local_pals.name = ? AND messages.type = 'assistant_turn'
         ORDER BY messages.created_at DESC LIMIT 1
        """,
        ("莉娅",),
    ).fetchone()

if not turn:
    sys.exit("The expected character has no persisted assistant turn")
metadata = json.loads(turn[0])
result = metadata.get("completionResult", {})
text = "".join(step.get("content") or "" for step in metadata.get("steps", []))
if result.get("isRemote") is not False or not text.strip():
    sys.exit("The stored turn must contain a nonempty local model reply")
timings = metadata.get("timings", {})
print(json.dumps({
    "device": "iPad Simulator",
    "reply_characters": len(text.strip()),
    "output_tokens": result.get("tokensPredicted"),
    "time_to_first_token_ms": timings.get("time_to_first_token_ms"),
    "tokens_per_second": timings.get("predicted_per_second"),
}, indent=2))
