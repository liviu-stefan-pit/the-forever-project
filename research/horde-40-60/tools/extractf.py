import re, json, lupa
lua = lupa.LuaRuntime(unpack_returned_tuples=True)
def tolist(t, depth=0):
    if t is None: return None
    if lupa.lua_type(t) != 'table': return t
    keys = list(t.keys())
    if keys and all(isinstance(k,int) for k in keys):
        mx = max(keys)
        if mx <= len(keys)*2+5:
            return [tolist(t[i]) if i in keys else None for i in range(1, mx+1)]
    return {str(k): tolist(t[k]) for k in keys}
for name, var in [("foreverQuestDB","questData"),("foreverNpcDB","npcData"),("foreverObjectDB","objectData"),("foreverItemDB","itemData")]:
    s = open(f"/workspace/qdbf/{name}.lua", encoding="utf-8").read()
    m = re.search(r"QuestieDB\.%s = \[\[(.*)\]\]" % var, s, re.S)
    body = m.group(1)
    tbl = lua.execute(body)
    out = {}
    for k in tbl.keys():
        out[int(k)] = tolist(tbl[k])
    json.dump(out, open(f"/workspace/qdbf/{name}.json","w"))
    print(name, len(out))
