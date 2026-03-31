"""Pipeline execution endpoints — start / status / progress SSE."""

from __future__ import annotations

import asyncio
import json
from typing import Any

from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from ..services.runner import TaskStatus, get_task, list_tasks, start_task

router = APIRouter(prefix="/api/pipeline", tags=["pipeline"])


class GenerateRequest(BaseModel):
    bamPath: str
    outputDir: str
    threads: int = 4
    chroms: list[str] = []


class CallRequest(BaseModel):
    modelPath: str
    dataPath: str
    bamPath: str
    predictPath: str
    vcfOutputPath: str
    threads: int = 4
    chroms: list[str] = []
    gpus: int = 1


@router.post("/generate")
async def run_generate(req: GenerateRequest) -> dict[str, Any]:
    task_id = await start_task("generate", req.model_dump())
    return {"taskId": task_id, "status": "running"}


@router.post("/call")
async def run_call(req: CallRequest) -> dict[str, Any]:
    task_id = await start_task("call", req.model_dump())
    return {"taskId": task_id, "status": "running"}


@router.get("/tasks")
async def get_tasks() -> list[dict[str, Any]]:
    return list_tasks()


@router.get("/status/{task_id}")
async def task_status(task_id: str) -> dict[str, Any]:
    task = get_task(task_id)
    if task is None:
        raise HTTPException(404, "Task not found")
    elapsed = None
    if task.started_at:
        end = task.finished_at or __import__("time").time()
        elapsed = round(end - task.started_at, 1)
    return {
        "taskId": task.task_id,
        "mode": task.mode,
        "status": task.status.value,
        "elapsed": elapsed,
        "error": task.error,
        "logCount": len(task.logs),
    }


@router.get("/progress/{task_id}")
async def task_progress_sse(task_id: str) -> StreamingResponse:
    """SSE endpoint that streams log lines as they appear."""
    task = get_task(task_id)
    if task is None:
        raise HTTPException(404, "Task not found")

    async def event_stream():
        cursor = 0
        while True:
            # Emit any new log lines
            while cursor < len(task.logs):
                data = json.dumps({"type": "log", "line": task.logs[cursor]})
                yield f"data: {data}\n\n"
                cursor += 1

            # Check if task finished
            if task.status in (TaskStatus.SUCCESS, TaskStatus.FAILED):
                data = json.dumps(
                    {"type": "done", "status": task.status.value, "error": task.error}
                )
                yield f"data: {data}\n\n"
                break

            await asyncio.sleep(0.3)

    return StreamingResponse(event_stream(), media_type="text/event-stream")
