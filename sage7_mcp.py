#!/usr/bin/env python3
import sys
import json
import requests
import asyncio
from typing import Any, Dict, List, Optional
from mcp.server.fastmcp import FastMCP

# Initialize FastMCP server
mcp = FastMCP("SAGE-7")

SAGE_API_URL = "http://localhost:8001"

@mcp.tool()
async def sage_chat(message: str) -> str:
    """
    Sends a message to the SAGE-7 agent and returns its reply.
    Use this to interact with the forensic analyst persona.
    """
    try:
        response = requests.post(
            f"{SAGE_API_URL}/sage/chat",
            json={"message": message},
            timeout=30
        )
        response.raise_for_status()
        data = response.json()
        return data.get("reply", "No reply received from SAGE-7.")
    except Exception as e:
        return f"Error communicating with SAGE-7: {str(e)}"

@mcp.tool()
async def get_sage_telemetry() -> str:
    """
    Retrieves hardware and system telemetry from the SAGE-7 substrate.
    """
    try:
        response = requests.get(f"{SAGE_API_URL}/api/hardware/telemetry", timeout=10)
        response.raise_for_status()
        return json.dumps(response.json(), indent=2)
    except Exception as e:
        return f"Error retrieving telemetry: {str(e)}"

if __name__ == "__main__":
    mcp.run()
