# Made by humans and not crankers like for the frontend

from fastapi import FastAPI, WebSocket, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, StreamingResponse
from fastapi.staticfiles import StaticFiles
from typing import Dict
import duckdb
import json
import uuid
import io
import threading
import os
import httpx

app = FastAPI(
    title="Casemate API",
    description="API for managing detective cases, parties, evidences, theories, and timelines",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

_thread_local = threading.local()

def get_conn():
    """Get a thread-safe connection to DuckDB"""
    if not hasattr(_thread_local, 'conn') or _thread_local.conn is None:
        _thread_local.conn = duckdb.connect("database.db")
    return _thread_local.conn

conn = get_conn()

get_conn().sql("CREATE TABLE IF NOT EXISTS cases (name VARCHAR PRIMARY KEY, detective VARCHAR, short_description VARCHAR DEFAULT NULL)")
get_conn().sql("CREATE TABLE IF NOT EXISTS parties (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), name VARCHAR, role VARCHAR, description VARCHAR DEFAULT NULL, alibi VARCHAR DEFAULT NULL, image BLOB DEFAULT NULL)")
get_conn().sql("CREATE TABLE IF NOT EXISTS evidences (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), place VARCHAR, description VARCHAR, name VARCHAR, suspects UUID[], image BLOB DEFAULT NULL)")
get_conn().sql("CREATE TABLE IF NOT EXISTS theories (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), name VARCHAR, content VARCHAR)")
get_conn().sql("CREATE TABLE IF NOT EXISTS timelines_events (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), timestamp BIGINT, place VARCHAR, status VARCHAR, name VARCHAR, description VARCHAR)")


def fetch_dict(result, size=-1):
    if size == -1:
        rows = result.fetchall()
    else:
        rows = result.fetchmany(size)

    columns = [desc[0] for desc in result.description]
    data = []
    for row in rows:
        row_data = {}
        for i, value in enumerate(row):
            if type(value) == uuid.UUID:
                value = str(value)

            row_data[columns[i]] = value

        data.append(row_data)

    return data

@app.get("/favicon.ico", include_in_schema=False)
async def favicon():
    return FileResponse('favicon.ico')


@app.get("/api/case", tags=["cases"])
def get_case() -> dict:
    result = get_conn().execute("SELECT name, short_description, detective FROM cases LIMIT 1")
    data = fetch_dict(result)
    if not data:
        raise HTTPException(status_code=404, detail="Case not found")
    return data[0]

@app.get("/api/parties", tags=["parties"])
def get_parties() -> dict:
    result = get_conn().execute("SELECT id, name, role, description, alibi FROM parties")
    parties_data = fetch_dict(result)
    response_data = {}

    for row in parties_data:
        response_data[row['id']] = {
            "name": row['name'],
            "description": row.get('description'),
            "alibi": row.get('alibi'),
            "role": row.get('role'),
            "image": f"/api/parties/{row['id']}/image"
        }

    return response_data


@app.get("/api/parties/{id}/image", tags=["parties", "images"])
def get_party_image(id):
    get_conn().execute("SELECT image FROM parties WHERE id=?", (id, ))
    result = get_conn().fetchone()
    
    if result is None or result[0] is None:
        return {"success": False}
    
    image_data = result[0]
    return StreamingResponse(io.BytesIO(image_data), media_type="image/jpeg")


@app.get("/api/evidences", tags=["evidences"])
def get_evidences():
     result = get_conn().execute("SELECT id, place, description, name, suspects FROM evidences")
     data = fetch_dict(result)
     return data


@app.get("/api/theories", tags=["theories"])
def get_theories():
    result = get_conn().execute("SELECT id, name, content FROM theories")
    theories_data = fetch_dict(result)
    response_data = {}

    for row in theories_data:
        response_data[row['id']] = {
            "name": row['name'],
            "content": row['content']
        }
    
    return response_data


@app.get("/api/timelines", tags=["timelines"])
def get_timelines():
     result = get_conn().execute("SELECT id, timestamp, place, status, name, description FROM timelines_events ORDER BY timestamp")
     data = fetch_dict(result)
     return data


@app.post("/ai/completions", tags=["ai"])
async def ai_proxy(request_data: dict):
    """Proxy AI requests to Hack Club AI, keeping the API key secure server-side"""
    api_key = os.getenv("HACKCLUB_AI_TOKEN")
    if not api_key:
        raise HTTPException(status_code=500, detail="AI service not configured")
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://ai.hackclub.com/proxy/v1/chat/completions",
                json=request_data,
                headers={
                    "Authorization": f"Bearer {api_key}",
                    "Content-Type": "application/json"
                },
                timeout=30.0
            )
            return response.json()
    except httpx.HTTPError as e:
        raise HTTPException(status_code=502, detail=f"AI service error: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Proxy error: {str(e)}")


@app.websocket("/api/chat")
async def websocket_endpoint(websocket: WebSocket):
     await websocket.accept()
     opcount = 0
     try:
         while True:
             opcount += 1
             raw = await websocket.receive_text()
             data = json.loads(raw)

             op = data.get('op')

             if op == 'send_message':
                 message = data['message']
                 await websocket.send_text(json.dumps({'op': 'send_message', 'message': f'{opcount} {message}'}))
     except Exception as e:
         pass


dist_path = os.path.join(os.path.dirname(__file__), "..", "dist")
if os.path.isdir(dist_path):
    app.mount("/", StaticFiles(directory=dist_path, html=True), name="static")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
