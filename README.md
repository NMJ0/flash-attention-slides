# Case study: FlashAttention

A reveal.js slide deck from the ML Compilers guest lecture in **CS6886 Systems
for Deep Learning** (IIT Madras). It walks through a transformer one matrix at a
time, then explains FlashAttention through online softmax and
ends with measured results.

**Live deck:** https://nmj0.github.io/flash-attention-slides/

The arrow keys step through each animation; the deck moves to the next slide
once an animation reaches its last step. Every diagram is an interactive page in
`anim/`, and each also works opened on its own:

| page | what it shows |
|---|---|
| `anim/transformer.html` | a full forward pass of a toy transformer in 22 steps, from the embedding table to the KV cache, with the equations and GPT-2-small shapes for each step |
| `anim/online-softmax.html` | 16 steps, no mask: the walkthrough's head-2 Q, K, V tiled between HBM and on-chip SRAM; every load, every on-chip computation (S, m, α, P̃, ℓ, o) and the single write of O |
| `anim/results.html` | measured time, memory and TFLOP/s on an RTX 4090 |

Add `#s=N` to an animation's URL to open it N steps in, e.g. `anim/transformer.html#s=7`.

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
