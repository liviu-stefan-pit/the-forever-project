import json, sys, jsonschema
s=json.load(open(sys.argv[1])); d=json.load(open(sys.argv[2]))
v=jsonschema.Draft202012Validator(s)
errs=list(v.iter_errors(d))
for e in errs[:15]: print(list(e.absolute_path)[:4], e.message[:300])
print("errors:",len(errs))
