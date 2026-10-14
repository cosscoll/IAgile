// Simulate agent/tool authorization with fictitious, deterministic events only.
// No LLM, API token or external request. Prompts never grant actual permissions.
export const scenarios=[
 ['READ-01','reader','read','public','allow'],['READ-02','editor','read','public','allow'],
 ['READ-03','reader','read','private','deny'],['READ-04','editor','read','private','allow'],
 ['READ-05','unknown','read','public','deny'],
 ['WRITE-01','reader','write','public','deny'],['WRITE-02','editor','write','public','needs-approval'],
 ['WRITE-03','editor','write','private','deny'],['WRITE-04','unknown','write','public','deny'],
 ['WRITE-05','admin','write','public','needs-approval'],
 ['INJECT-01','reader','write','public','deny'],['INJECT-02','editor','write','private','deny'],
 ['INJECT-03','unknown','read','private','deny'],['INJECT-04','reader','erase','public','deny'],
 ['LOOP-01','editor','read','public','stop'],['LOOP-02','reader','read','public','stop'],
 ['BUDGET-01','editor','read','public','stop'],['BUDGET-02','admin','write','public','stop'],
 ['APPROVAL-01','editor','write','public','allow'],['APPROVAL-02','editor','write','public','deny']
].map(([id,role,action,resource,expected])=>Object.freeze({id,role,action,resource,expected}));
export function decideToolCall(call={}){
 const {role,action,resource,approved=false,turns=0,maxTurns=5,spent=0,budget=10,sourceTrusted=true}=call;
 if(!Number.isInteger(turns)||!Number.isInteger(maxTurns)||maxTurns<1||maxTurns>100||
    !Number.isFinite(spent)||!Number.isFinite(budget)||budget<=0||spent<0)return 'deny';
 if(turns>=maxTurns||spent>=budget)return 'stop';
 if(!sourceTrusted)return 'deny';
 if(!['reader','editor','admin'].includes(role)||!['read','write'].includes(action)||
    !['public','private'].includes(resource))return 'deny';
 if(action==='read')return resource==='public'||role==='editor'||role==='admin'?'allow':'deny';
 if(resource==='private'||role==='reader')return 'deny';
 return approved===true?'allow':'needs-approval';
}
export function evaluateScenario(item){
 const isLoop=item.id.startsWith('LOOP-'),isBudget=item.id.startsWith('BUDGET-');
 const override=item.id==='APPROVAL-01'?{approved:true}:
   item.id==='APPROVAL-02'?{sourceTrusted:false}:
   item.id.startsWith('INJECT-')?{sourceTrusted:false}:{};
 const result=decideToolCall({role:item.role,action:item.action,resource:item.resource,
  ...override,...(isLoop?{turns:5,maxTurns:5}:{}),...(isBudget?{spent:10,budget:10}:{})});
 return {id:item.id,expected:item.expected,observed:result,pass:result===item.expected};
}
