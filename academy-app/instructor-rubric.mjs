// Pure formatting rules. Not an automated grader or an access control.
const limits={criterion:[8,900],evidence:[20,2500],nextAction:[15,1200]};
const clean=value=>String(value??'').replace(/\r\n?/g,'\n').trim();
export function createStructuredFeedback(values={}){
 const fields={};
 for(const [key,[min,max]] of Object.entries(limits)){
   const value=clean(values[key]);
   if(value.length<min||value.length>max)
     return {ok:false,text:'',reason:key+' must be '+min+' to '+max+' characters'};
   fields[key]=value;
 }
 const text='Critère contrôlé :\n'+fields.criterion+'\n\nPreuve observée :\n'+fields.evidence+
   '\n\nProchaine action :\n'+fields.nextAction;
 if(text.length>5000)return {ok:false,text:'',reason:'feedback too long'};
 return {ok:true,text,reason:''};
}
export function parseStructuredFeedback(text){
 const raw=clean(text);
 const match=raw.match(/^Critère contrôlé :\n([\s\S]*?)\n\nPreuve observée :\n([\s\S]*?)\n\nProchaine action :\n([\s\S]*)$/);
 if(!match)return {criterion:'',evidence:raw,nextAction:'',legacy:!!raw};
 return {criterion:match[1],evidence:match[2],nextAction:match[3],legacy:false};
}
