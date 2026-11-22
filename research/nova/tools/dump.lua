QuestieDB = {}
QuestieLoader = {ImportModule=function() return QuestieDB end}
local function enc(v)
  local t=type(v)
  if t=="nil" then return "null" elseif t=="number" then return tostring(v) elseif t=="boolean" then return tostring(v)
  elseif t=="string" then return '"'..v:gsub('\\','\\\\'):gsub('"','\\"'):gsub('\n','\\n'):gsub('\r',''):gsub('%c','')..'"'
  else
    local maxn=0; local isarr=true
    for k,_ in pairs(v) do if type(k)~="number" then isarr=false else if k>maxn then maxn=k end end end
    local parts={}
    if isarr then for i=1,maxn do parts[#parts+1]=enc(v[i]) end return "["..table.concat(parts,",").."]"
    else for k,x in pairs(v) do parts[#parts+1]='"'..tostring(k)..'":'..enc(x) end return "{"..table.concat(parts,",").."}" end
  end
end
for _,n in ipairs({"Quest","Npc","Object","Item"}) do
  dofile("forever"..n.."DB.lua")
end
local out=io.open("forever.json","w")
local function dumpdb(name,keys,data)
  local f=loadstring(data)(); out:write('"'..name..'":{"keys":'..enc(keys)..',"rows":{')
  local first=true
  for id,row in pairs(f) do if not first then out:write(",") end first=false out:write('"'..id..'":'..enc(row)) end
  out:write("}}")
end
out:write("{")
dumpdb("quest",QuestieDB.questKeys,QuestieDB.questData) out:write(",")
dumpdb("npc",QuestieDB.npcKeys,QuestieDB.npcData) out:write(",")
dumpdb("object",QuestieDB.objectKeys,QuestieDB.objectData) out:write(",")
dumpdb("item",QuestieDB.itemKeys,QuestieDB.itemData)
out:write("}") out:close()
