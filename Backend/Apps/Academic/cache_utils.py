import hashlib
import json
from django.core.cache import cache
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver

def make_cache_key(prefix, *args, **kwargs):
    """
    Generates a deterministic Redis cache key from arguments and query parameters.
    """
    raw_str = f"{prefix}:" + ":".join(str(a) for a in args)
    if kwargs:
        sorted_kw = sorted(kwargs.items())
        raw_str += ":" + json.dumps(sorted_kw)
    hashed = hashlib.md5(raw_str.encode("utf-8")).hexdigest()
    return f"{prefix}:{hashed}"

def get_or_set_redis_cache(key, fetch_fn, timeout=600):
    """
    Attempts to retrieve data from Redis cache.
    On cache miss, executes fetch_fn(), stores result in Redis, and returns it.
    """
    try:
        cached_data = cache.get(key)
        if cached_data is not None:
            return cached_data
    except Exception:
        pass

    data = fetch_fn()

    try:
        cache.set(key, data, timeout=timeout)
    except Exception:
        pass

    return data

def invalidate_redis_pattern(pattern_prefix):
    """
    Invalidates all Redis cache keys matching the given prefix pattern.
    """
    try:
        if hasattr(cache, "delete_pattern"):
            cache.delete_pattern(f"*{pattern_prefix}*")
        else:
            cache.clear()
    except Exception:
        pass

def register_cache_signals():
    """
    Registers Django model signals to auto-invalidate Redis cache on data mutations.
    """
    from .models import (
        Department,
        ProgramSpecialization,
        SectionBatch,
        Subject,
        AcademicMaterial,
        LabExperiment,
        DepartmentNotice,
    )
    from Apps.Planner.models import TimetableSlot, MilestoneCountdown
    from Apps.DrmProtection.models import GlobalDrmConfig

    def _invalidate_academic(sender, **kwargs):
        invalidate_redis_pattern("academic")

    def _invalidate_planner(sender, **kwargs):
        invalidate_redis_pattern("planner")

    def _invalidate_drm(sender, **kwargs):
        invalidate_redis_pattern("drm")

    for model in [Department, ProgramSpecialization, SectionBatch, Subject, AcademicMaterial, LabExperiment, DepartmentNotice]:
        post_save.connect(_invalidate_academic, sender=model, weak=False)
        post_delete.connect(_invalidate_academic, sender=model, weak=False)

    for model in [TimetableSlot, MilestoneCountdown]:
        post_save.connect(_invalidate_planner, sender=model, weak=False)
        post_delete.connect(_invalidate_planner, sender=model, weak=False)

    post_save.connect(_invalidate_drm, sender=GlobalDrmConfig, weak=False)

