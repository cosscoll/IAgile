// Test-only Supabase implementation; never used on a deployed Academy site.
export function createClient() {
  const instructor = location.pathname.endsWith('/instructor.html');
  let isSignedIn = true;
  const person = {id:instructor?'FORMATEUR':'APPRENANT',email:instructor?'prof@example.test':'eleve@example.test'};
  const state = window.__academyTestState = {
    academy_profiles:[
      {user_id:'FORMATEUR',account_status:'active',display_name:'Formateur test'},
      {user_id:'APPRENANT',account_status:'active',display_name:'Apprenant test'}
    ],
    academy_instructor_courses:[{instructor_id:'FORMATEUR',course_slug:'agents'}],
    academy_enrollments:[{user_id:'APPRENANT',course_slug:'agents',active:true}],
    academy_courses:[
      {slug:'agents',title:'Créer des agents',summary:'Programme test',published:true},
      {slug:'automatisation',title:'Automatisation',summary:'Accès interdit',published:true}
    ],
    academy_course_modules:[{course_slug:'agents',module_index:0,title:'Premier module',body_markdown:'## Exercice\n- Réaliser une action',published:true}],
    academy_module_progress:instructor?[{user_id:'APPRENANT',course_slug:'agents',module_index:0,completed:true,notes:'Note de test'}]:[],
    academy_deliverable_prompts:[{course_slug:'agents',deliverable_index:0,title:'Projet final',instructions_markdown:'## Sujet\nPrésenter votre démarche',published:true}],
    academy_deliverable_answers:instructor?[{user_id:'APPRENANT',course_slug:'agents',deliverable_index:0,content:'Projet de démonstration',updated_at:'2026-10-10T16:50:00.000Z'}]:[],
    academy_deliverable_feedback:[],
    academy_course_assets:[{course_slug:'agents',asset_key:'test',title:'Support de test',storage_path:'agents/test.pdf',published:true}]
  };
  const from=table=>{
    let rows=state[table]||[];
    const filters=[];
    const filter=()=>rows.filter(row=>filters.every(([name,value])=>Array.isArray(value)?value.includes(row[name]):row[name]===value));
    const q={
      select(){return this;},
      eq(name,value){filters.push([name,value]);return this;},
      in(name,values){filters.push([name,values]);return this;},
      order(){return this;},
      maybeSingle(){return Promise.resolve({data:filter()[0]||null,error:null});},
      then(yes,no){return Promise.resolve({data:filter(),error:null}).then(yes,no);},
      async upsert(payload){const key=['academy_deliverable_answers','academy_deliverable_feedback'].includes(table)?'deliverable_index':'module_index';
        const old=rows.find(x=>x.user_id===payload.user_id&&x.course_slug===payload.course_slug&&x[key]===payload[key]);
        if(old)Object.assign(old,payload);else rows.push(payload);return {error:null};
      }
    };
    return q;
  };
  return {
    auth:{
      async getUser(){return {data:{user:isSignedIn?person:null},error:null};},
      async signInWithPassword(){isSignedIn=true;return {error:null};},
      async signOut(){isSignedIn=false;return {error:null};},
      async resetPasswordForEmail(){return {error:null};},
      async updateUser(){return {error:null};},
      onAuthStateChange(){return {data:{subscription:{unsubscribe(){}}}};}
    },
    from,
    storage:{from(bucket){if(bucket!=='iagile-course-files')throw Error('Wrong bucket');return {
      async createSignedUrl(path,seconds){return {data:{signedUrl:'https://example.test/temporary/'+path+'?expires='+seconds},error:null};}
    };}}
  };
}
