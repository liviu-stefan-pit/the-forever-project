local mods={}
QuestieLoader={ImportModule=function(_,n) mods[n]=mods[n] or {private={}} return mods[n] end, CreateModule=function(_,n) mods[n]=mods[n] or {private={}} return mods[n] end}
UnitFactionGroup=function() return "Horde" end
Expansions={}
local function ser(v, out)
  local t=type(v)
  if t=="nil" then out[#out+1]="null"
  elseif t=="number" then out[#out+1]=(v~=v) and "null" or string.format("%.14g",v)
  elseif t=="boolean" then out[#out+1]=tostring(v)
  elseif t=="string" then out[#out+1]='"'..v:gsub('[%c"\\]',function(c) if c=='"' then return '\\"' elseif c=='\\' then return '\\\\' else return string.format("\\u%04x",c:byte()) end end)..'"'
  else
    local n=0 for k in pairs(v) do n=n+1 end
    local maxi=0 for k in pairs(v) do if type(k)=="number" and k>maxi and k==math.floor(k) then maxi=k end end
    local arr = (n>0 and maxi>0 and maxi<=n*2+4)
    for k in pairs(v) do if type(k)~="number" then arr=false end end
    if n==0 then out[#out+1]="[]" return end
    if arr then out[#out+1]="[" for i=1,maxi do if i>1 then out[#out+1]="," end ser(v[i],out) end out[#out+1]="]"
    else out[#out+1]="{" local first=true for k,x in pairs(v) do if not first then out[#out+1]="," end first=false out[#out+1]='"'..tostring(k)..'":' ser(x,out) end out[#out+1]="}" end
  end
end
local function dump(tbl,fn) local out={} ser(tbl,out) local f=io.open(fn,"w") f:write(table.concat(out)) f:close() end
dofile("fv/foreverQuestDB.lua"); dofile("fv/foreverNpcDB.lua"); dofile("fv/foreverObjectDB.lua"); dofile("fv/foreverItemDB.lua")
local Q=mods.QuestieDB
local function asmap(t) local m={} for k,v in pairs(t) do m["k"..k]=v end return m end
dump(asmap(loadstring(Q.questData)()),"fv_quest.json")
dump(asmap(loadstring(Q.npcData)()),"fv_npc.json")
dump(asmap(loadstring(Q.objectData)()),"fv_object.json")
dump(asmap(loadstring(Q.itemData)()),"fv_item.json")
