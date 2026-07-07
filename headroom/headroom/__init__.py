from headroom.compressors.core import Compressor, CompressorConfig, CompressionResult

def compress(text, **kwargs):
    cfg = CompressorConfig(**kwargs) if kwargs else None
    return Compressor(cfg).compress(text)
