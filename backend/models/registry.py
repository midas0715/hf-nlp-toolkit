import torch
import gc

class ModelRegistry:
    def __init__(self, max_vram_mb=5000):
        self._cache = {}
        self.max_vram_mb = max_vram_mb
        self.gpu_available = torch.cuda.is_available()

    def _current_vram_mb(self):
        if not self.gpu_available:
            return 0  # no GPU ceiling to enforce on CPU-only machines
        return torch.cuda.memory_reserved() / 1024**2

    def _evict_oldest(self, protect_key=None):
        for key in list(self._cache.keys()):
            if key == protect_key:
                continue
            print(f"Evicting '{key}' to free memory...")
            del self._cache[key]
            gc.collect()
            if self.gpu_available:
                torch.cuda.empty_cache()
            return True
        return False

    def get(self, name, loader_fn):
        if name in self._cache:
            self._cache[name] = self._cache.pop(name)
            return self._cache[name]

        print(f"Loading '{name}' for the first time...")
        loaded = loader_fn()
        self._cache[name] = loaded

        if self.gpu_available:
            while self._current_vram_mb() > self.max_vram_mb:
                evicted = self._evict_oldest(protect_key=name)
                if not evicted:
                    print("Warning: over VRAM budget but nothing left to evict!")
                    break

        return loaded

registry = ModelRegistry(max_vram_mb=5000)