import base64, zlib, re, sys, struct
toc = sys.argv[1]
meta = {}
for line in open(toc, encoding="utf-8"):
    if line.startswith("## X-"):
        k, _, v = line[3:].partition(":")
        meta[k.strip()] = v.strip()
def stored(k):
    v = meta.get(k)
    if v and v.startswith("~"):
        n = int(v.strip("~")); v = "".join(meta[f"{k}-{i}"] for i in range(1, n+1))
    return v
def cbor(b, i=0):
    ib = b[i]; mt, ai = ib >> 5, ib & 31; i += 1
    if ai < 24: val = ai
    elif ai == 24: val = b[i]; i += 1
    elif ai == 25: val = struct.unpack(">H", b[i:i+2])[0]; i += 2
    elif ai == 26:
        if mt == 7: return struct.unpack(">f", b[i:i+4])[0], i+4
        val = struct.unpack(">I", b[i:i+4])[0]; i += 4
    elif ai == 27:
        if mt == 7: return struct.unpack(">d", b[i:i+8])[0], i+8
        val = struct.unpack(">Q", b[i:i+8])[0]; i += 8
    if mt == 0: return val, i
    if mt == 1: return -1 - val, i
    if mt == 2: return b[i:i+val], i+val
    if mt == 3: return b[i:i+val].decode("utf-8", "replace"), i+val
    if mt == 4:
        out = []
        for _ in range(val): x, i = cbor(b, i); out.append(x)
        return out, i
    if mt == 5:
        out = {}
        for _ in range(val):
            k, i = cbor(b, i); x, i = cbor(b, i); out[k] = x
        return out, i
    if mt == 7:
        if ai == 25:  # half float
            h = val; s=(h>>15)&1; e=(h>>10)&31; f=h&1023
            v = (f/1024)*2**-14 if e==0 else (float('inf') if e==31 else (1+f/1024)*2**(e-15))
            return (-v if s else v), i
        return {20: False, 21: True, 22: None}.get(ai), i
    raise ValueError(mt)
def dec(k, z=False):
    s = stored(k)
    if s is None: return None
    raw = base64.b64decode(s)
    if z: raw = zlib.decompress(raw)
    return cbor(raw)[0]
print("keys", len(meta))
for ent in ("Quest", "Npc", "Object", "Item"):
    ids = dec(f"X-{ent}-IDS", True); print(ent, "ids", len(ids), ids[:5], max(ids))
for q in (4641, 97279, 788):
    print("Q", q, dec(f"X-Quest-{q}-S"), {f: dec(f"X-Quest-{q}-{f}") for f in (2,3,8,10) })
for n in (10176, 3143):
    print("NPC", n, dec(f"X-Npc-{n}-S"), [ (k, str(dec(k))[:200]) for k in meta if k.startswith(f"X-Npc-{n}-") and not k.endswith("S")])
