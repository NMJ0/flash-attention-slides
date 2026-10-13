# Case study: FlashAttention

A reveal.js slide deck from the ML Compilers guest lecture in **CS6886 Systems
for Deep Learning** (IIT Madras). It explains attention step by step, then shows
why attention is memory-bound and how FlashAttention fixes that with tiling,
online softmax and kernel fusion.

**Live deck:** https://nmj0.github.io/flash-attention-slides/

Every diagram is an interactive page in `anim/`. Each page also works on its own:

| page | what it shows |
|---|---|
| `anim/attention.html` | Q·Kᵀ, mask, softmax, P·V on a 4-token toy, with hover-to-explain |
| `anim/dataflow.html` | every kernel of eager, `torch.compile` and FlashAttention attention, with HBM bytes |
| `anim/online-softmax.html` | one row processed tile by tile with a running max, sum and output |
| `anim/flash-tiling.html` | the FlashAttention-2 tiled loop, causal tile skipping, on-chip contents |
| `anim/results.html` | measured time, memory and TFLOP/s on an RTX 4090 |

Add `#s=N` to an animation's URL to open it N steps in, e.g. `anim/flash-tiling.html#s=6`.

## Run locally

No build step. Serve the folder and open it:

```sh
python3 -m http.server 8000
# open http://localhost:8000
```

reveal.js 5.1.0 and KaTeX 0.16.11 load from jsDelivr, so the first load needs internet.

## Numbers

All timings come from `flash_attention/attention_bench.py` in the lecture
repository: batch 1, 32 heads, d_k = 128, FP16, causal, PyTorch 2.12 on an RTX 4090.
