"""Manage SVHunter pipeline subprocess execution with stdout capture."""

from __future__ import annotations

import asyncio
import os
import subprocess
import time
import uuid
from dataclasses import dataclass, field
from enum import Enum
from pathlib import Path
from typing import Any


class TaskStatus(str, Enum):
    PENDING = "pending"
    RUNNING = "running"
    SUCCESS = "success"
    FAILED = "failed"


@dataclass
class PipelineTask:
    task_id: str
    mode: str  # "generate" or "call"
    params: dict[str, Any]
    status: TaskStatus = TaskStatus.PENDING
    logs: list[str] = field(default_factory=list)
    started_at: float | None = None
    finished_at: float | None = None
    error: str | None = None
    process: subprocess.Popen | None = field(default=None, repr=False)


# In-memory task store (single-process; sufficient for local use)
_tasks: dict[str, PipelineTask] = {}

# Path to the SVHunter repository root (parent.parent.parent.parent == SVHunter-1/)
SVHUNTER_ROOT = str(Path(__file__).resolve().parent.parent.parent.parent)

# Python interpreter in the inference conda environment
SVHUNTER_PYTHON = "/home/hisheep/miniconda3/envs/svhunter-infer/bin/python"

# CUDA library paths for TF 2.12.1 GPU support
_NVIDIA_BASE = "/home/hisheep/miniconda3/envs/svhunter-infer/lib/python3.11/site-packages/nvidia"
_CUDA_LIB_DIRS = [
    "/usr/lib/wsl/lib",
    f"{_NVIDIA_BASE}/cudnn/lib",
    f"{_NVIDIA_BASE}/cuda_runtime/lib",
    f"{_NVIDIA_BASE}/cublas/lib",
    f"{_NVIDIA_BASE}/cufft/lib",
    f"{_NVIDIA_BASE}/curand/lib",
    f"{_NVIDIA_BASE}/cusolver/lib",
    f"{_NVIDIA_BASE}/cusparse/lib",
]
_CUDA_LD_PATH = ":".join(_CUDA_LIB_DIRS)


def get_task(task_id: str) -> PipelineTask | None:
    return _tasks.get(task_id)


def list_tasks() -> list[dict[str, Any]]:
    return [
        {
            "taskId": t.task_id,
            "mode": t.mode,
            "status": t.status.value,
            "startedAt": t.started_at,
            "finishedAt": t.finished_at,
            "logCount": len(t.logs),
        }
        for t in _tasks.values()
    ]


def build_generate_cmd(params: dict[str, Any]) -> list[str]:
    """Build the shell command for ``SVHunter.py generate``."""
    cmd = [
        SVHUNTER_PYTHON,
        os.path.join(SVHUNTER_ROOT, "SVHunter.py"),
        "generate",
        params["bamPath"],
        params["outputDir"],
    ]
    if params.get("threads"):
        cmd.append(str(params["threads"]))
    if params.get("chroms"):
        cmd.append(str(params["chroms"]))
    return cmd


def build_call_cmd(params: dict[str, Any]) -> list[str]:
    """Build the shell command for ``SVHunter.py call``."""
    cmd = [
        SVHUNTER_PYTHON,
        os.path.join(SVHUNTER_ROOT, "SVHunter.py"),
        "call",
        params["modelPath"],
        params["dataPath"],
        params["bamPath"],
        params["predictPath"],
        params["vcfOutputPath"],
    ]
    if params.get("threads"):
        cmd.append(str(params["threads"]))
    if params.get("chroms"):
        cmd.append(str(params["chroms"]))
    if params.get("gpus"):
        cmd.append(str(params["gpus"]))
    return cmd


async def start_task(mode: str, params: dict[str, Any]) -> str:
    """Create a task, launch the subprocess in the background, return task_id."""
    task_id = uuid.uuid4().hex[:12]
    task = PipelineTask(task_id=task_id, mode=mode, params=params)
    _tasks[task_id] = task

    if mode == "generate":
        cmd = build_generate_cmd(params)
    elif mode == "call":
        cmd = build_call_cmd(params)
    else:
        task.status = TaskStatus.FAILED
        task.error = f"Unknown mode: {mode}"
        return task_id

    task.logs.append(f"[CMD] {' '.join(cmd)}")
    task.status = TaskStatus.RUNNING
    task.started_at = time.time()

    # Launch in a background thread so we don't block the event loop
    loop = asyncio.get_event_loop()
    loop.run_in_executor(None, _run_process, task, cmd)
    return task_id


def _run_process(task: PipelineTask, cmd: list[str]) -> None:
    """Execute the subprocess and capture stdout/stderr line by line."""
    try:
        env = os.environ.copy()
        existing = env.get("LD_LIBRARY_PATH", "")
        env["LD_LIBRARY_PATH"] = _CUDA_LD_PATH + (":" + existing if existing else "")
        proc = subprocess.Popen(
            cmd,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            text=True,
            bufsize=1,
            cwd=SVHUNTER_ROOT,
            env=env,
        )
        task.process = proc
        if proc.stdout:
            for line in proc.stdout:
                task.logs.append(line.rstrip("\n"))
        proc.wait()
        if proc.returncode == 0:
            task.status = TaskStatus.SUCCESS
        else:
            task.status = TaskStatus.FAILED
            task.error = f"Process exited with code {proc.returncode}"
    except Exception as exc:
        task.status = TaskStatus.FAILED
        task.error = str(exc)
    finally:
        task.finished_at = time.time()
