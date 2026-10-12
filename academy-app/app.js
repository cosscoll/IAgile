/* IAgile Academy — private learner shell. Never embed paid lessons or secret keys. */
(() => {
  'use strict';
  const allow = new Set(['sites-3d','agents','automatisation','processus']);
  const course = document.body.dataset.course || '';
  const status = document.getElementById('status');
  const auth = document.getElementById('auth-section');
  const learner = document.getElementById('learner-section');
  const logout = document.getElementById('logout');
  const form = document.getElementById('login-form');
  const info = document.getElementById('account-info');
  const modules = document.getElementById('modules');
  const deliverables = document.getElementById('deliverables');
  const deliverablesContent = document.getElementById('deliverables-content');
  let sequence = 0;

  const message = text => { status.textContent = text; };
  const resetContent = () => {
    if (modules) { modules.replaceChildren(); modules.hidden = true; }
    if (deliverables) deliverables.hidden = true;
    if (deliverablesContent) deliverablesContent.replaceChildren();
  };
  const config = window.IAgileAcademyConfig;
  if ((course && !allow.has(course)) || !config?.url || !config?.publishableKey || !window.supabase?.createClient) {
    message('Le service apprenant n’est pas configuré. Aucun contenu privé ne peut être chargé.');
    return;
  }

  const client = window.supabase.createClient(config.url, config.publishableKey, {
    auth: { flowType: 'pkce', detectSessionInUrl: true, autoRefreshToken: true, persistSession: true }
  });

  const failClosed = (text) => {
    resetContent();
    info.textContent = '';
    learner.hidden = true;
    auth.hidden = false;
    logout.hidden = true;
    message(text || 'Accès non disponible. Réessayez plus tard.');
  };

  async function showModules(items, userId, request) {
    resetContent();
    if (!modules || request !== sequence) return;
    if (!Array.isArray(items) || items.length === 0) {
      message('Aucune leçon n’est encore disponible pour ce parcours.');
      return;
    }
    const {data: saved, error: progressError} = await client.from('academy_module_progress')
      .select('module_index,completed,notes').eq('user_id',userId).eq('course_slug',course);
    if (request !== sequence) return;
    const records = new Map((!progressError && Array.isArray(saved) ? saved : [])
      .map(entry => [entry.module_index, entry]));
    const progressReady = !progressError;
    const progressLine = document.createElement('p');
    progressLine.className = 'progress-summary';
    progressLine.setAttribute('aria-live','polite');
    const updateSummary = () => {
      const done = items.filter(item => records.get(item.module_index)?.completed).length;
      progressLine.textContent = done + ' module(s) terminés sur ' + items.length;
    };
    const heading = document.createElement('h3');
    heading.textContent = 'Votre progression';
    modules.append(heading, progressLine);
    updateSummary();
    for (const item of items) {
      const section = document.createElement('section');
      section.className = 'lesson';
      const title = document.createElement('h4');
      title.textContent = String(item.title || 'Module');
      const body = document.createElement('div');
      body.className = 'lesson-body';
      // Never interpret the lesson text as HTML; this is a safe initial reader.
      body.textContent = String(item.body_markdown || '');
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'complete-button';
      const updateButton = () => {
        const done = !!records.get(item.module_index)?.completed;
        button.textContent = done ? 'Terminé — marquer à reprendre' : 'Marquer comme terminé';
        button.setAttribute('aria-pressed',String(done));
      };
      updateButton();
      button.disabled = !progressReady;
      button.addEventListener('click', async () => {
        if (request !== sequence || !progressReady || button.disabled) return;
        const previous = records.get(item.module_index);
        const completed = !previous?.completed;
        button.disabled = true;
        try {
          // This cannot grant enrollment: RLS checks the owner, active
          // enrollment, active profile and published module server-side.
          const {error} = await client.from('academy_module_progress').upsert({
            user_id:userId, course_slug:course, module_index:item.module_index,
            completed, notes:previous?.notes || ''
          }, {onConflict:'user_id,course_slug,module_index'});
          if (request !== sequence) return;
          if (error) {
            message('La progression n’a pas été enregistrée. Réessayez.');
            return;
          }
          records.set(item.module_index,{...previous,completed});
          updateButton();
          updateSummary();
          message('Progression enregistrée.');
        } catch (_error) {
          if (request === sequence) message('Enregistrement indisponible. Aucun changement confirmé.');
        } finally {
          if (request === sequence) button.disabled = false;
        }
      });
      section.append(title,body,button);
      modules.append(section);
    }
    modules.hidden = false;
    message(progressReady
      ? 'Vos modules et votre progression ont été chargés.'
      : 'Modules chargés, mais la progression est momentanément indisponible.');
  }


  async function showDeliverables(userId, request) {
    if (!deliverables || !deliverablesContent || request !== sequence) return;
    const {data: tasks, error: taskError} = await client.from('academy_deliverable_prompts')
      .select('deliverable_index,title,instructions_markdown')
      .eq('course_slug',course).eq('published',true).order('deliverable_index',{ascending:true});
    if (request !== sequence) return;
    if (taskError) {
      // The modules remain readable but no private prompt is shown after refusal.
      return;
    }
    if (!Array.isArray(tasks) || !tasks.length) return;
    const {data: answers, error: answersError} = await client.from('academy_deliverable_answers')
      .select('deliverable_index,content,updated_at').eq('user_id',userId).eq('course_slug',course);
    if (request !== sequence) return;
    const saved = new Map((!answersError && Array.isArray(answers) ? answers : [])
      .map(record => [record.deliverable_index,record]));
    const {data: feedback, error: feedbackError} = await client.from('academy_deliverable_feedback')
      .select('deliverable_index,status,feedback_text').eq('user_id',userId).eq('course_slug',course);
    if (request !== sequence) return;
    const reviews = new Map((!feedbackError && Array.isArray(feedback) ? feedback : [])
      .map(record => [record.deliverable_index,record]));

    for (const task of tasks) {
      const article=document.createElement('article');
      article.className='deliverable-card';
      const title=document.createElement('h3');
      title.textContent=String(task.title||'Livrable');
      const directions=document.createElement('p');
      directions.className='deliverable-instructions';
      // Premium Markdown is displayed as plain text to prevent HTML injection.
      directions.textContent=String(task.instructions_markdown||'');
      article.append(title,directions);
      const form=document.createElement('form');
      form.className='deliverable-form';
      const label=document.createElement('label');
      const textarea=document.createElement('textarea');
      const fieldId='deliverable-'+course+'-'+task.deliverable_index;
      textarea.id=fieldId;
      textarea.rows=6;
      textarea.maxLength=10000;
      textarea.required=true;
      textarea.placeholder='Décrivez votre démarche et votre résultat…';
      textarea.value=String(saved.get(task.deliverable_index)?.content||'');
      label.htmlFor=fieldId;
      label.textContent='Votre travail (10 000 caractères maximum)';
      const save=document.createElement('button');
      save.type='submit';
      save.className='complete-button';
      save.textContent='Enregistrer mon travail';
      const state=document.createElement('p');
      state.className='deliverable-state';
      state.setAttribute('role','status');
      state.setAttribute('aria-live','polite');
      state.textContent=answersError
        ? 'Lecture des réponses indisponible. Enregistrement désactivé pour éviter un écrasement.'
        : (saved.has(task.deliverable_index) ? 'Travail déjà enregistré. Vous pouvez le modifier.' : 'Travail non encore enregistré.');
      save.disabled=!!answersError;
      textarea.disabled=!!answersError;
      form.append(label,textarea,save,state);
      form.addEventListener('submit', async event => {
        event.preventDefault();
        const value=textarea.value.trim();
        if (request!==sequence || answersError || save.disabled) return;
        if (!value || value.length>10000) {
          state.textContent='Votre travail doit contenir entre 1 et 10 000 caractères.';
          return;
        }
        const currentValue=value;
        save.disabled=true;
        state.textContent='Enregistrement en cours…';
        try {
          // RLS limits writes to the signed-in student and published assignment.
          // Never write enrollments or instructor feedback from the browser.
          const {error}=await client.from('academy_deliverable_answers').upsert({
            user_id:userId,course_slug:course,deliverable_index:task.deliverable_index,
            content:currentValue
          },{onConflict:'user_id,course_slug,deliverable_index'});
          if (request!==sequence) return;
          if (error) {
            state.textContent='Enregistrement refusé ou indisponible. Votre saisie reste visible.';
          } else {
            saved.set(task.deliverable_index,{content:currentValue});
            state.textContent='Travail enregistré. Vous pouvez reprendre cette réponse plus tard.';
          }
        } catch (_error) {
          if (request===sequence) state.textContent='Erreur réseau. Votre saisie n’a pas été confirmée.';
        } finally {
          if (request===sequence) save.disabled=false;
        }
      });
      article.append(form);
      const review=reviews.get(task.deliverable_index);
      if (review) {
        const assessment=document.createElement('aside');
        assessment.className='instructor-feedback';
        const assessmentTitle=document.createElement('h4');
        assessmentTitle.textContent='Retour du formateur';
        const assessmentText=document.createElement('p');
        assessmentText.textContent=(review.status ? 'Statut : '+String(review.status)+'. ' : '')+
          String(review.feedback_text||'');
        assessment.append(assessmentTitle,assessmentText);
        article.append(assessment);
      }
      deliverablesContent.append(article);
    }
    deliverables.hidden=false;
  }

  async function refresh() {
    const request = ++sequence;
    resetContent();
    message('Vérification de vos droits…');
    try {
      // getUser verifies the user with Auth; database RLS remains the real authorization boundary.
      const {data: userData, error: userError} = await client.auth.getUser();
      if (request !== sequence) return;
      if (userError || !userData?.user) {
        auth.hidden = false;
        learner.hidden = true;
        logout.hidden = true;
        message('Connectez-vous pour consulter vos droits d’accès.');
        return;
      }
      const user = userData.user;
      auth.hidden = true;
      learner.hidden = false;
      logout.hidden = false;
      info.textContent = 'Compte connecté : ' + (user.email || 'apprenant');

      const {data: profile, error: profileError} = await client.from('academy_profiles')
        .select('account_status').eq('user_id', user.id).maybeSingle();
      if (request !== sequence) return;
      if (profileError || !profile || profile.account_status !== 'active') {
        message('Votre compte apprenant doit encore être activé. Aucun cours n’est accessible.');
        return;
      }
      const {data: enrollments, error: enrollmentError} = await client.from('academy_enrollments')
        .select('course_slug,active').eq('user_id', user.id).eq('active', true);
      if (request !== sequence) return;
      if (enrollmentError) {
        message('Impossible de vérifier vos inscriptions. Aucun cours n’a été chargé.');
        return;
      }
      const active = new Set((enrollments || []).filter(e => e.active).map(e => e.course_slug));
      if (!course) {
        const {data: catalogue, error: catalogueError} = await client.from('academy_courses')
          .select('slug,published');
        if (request !== sequence) return;
        if (catalogueError || !Array.isArray(catalogue)) {
          message('Vos inscriptions sont vérifiées, mais le statut des formations est temporairement indisponible.');
          return;
        }
        const published = new Set(catalogue.filter(row => row.published).map(row => row.slug));
        const available = [...active].filter(slug => published.has(slug));
        let totalByCourse = new Map();
        let completedByCourse = new Map();
        if (available.length) {
          const {data: availableModules, error: moduleListError} = await client.from('academy_course_modules')
            .select('course_slug,module_index').eq('published',true);
          if (request !== sequence) return;
          const {data: progressRows, error: progressRowsError} = await client.from('academy_module_progress')
            .select('course_slug,module_index,completed').eq('user_id',user.id).eq('completed',true);
          if (request !== sequence) return;
          if (!moduleListError && !progressRowsError) {
            for (const row of availableModules || []) {
              if (!available.includes(row.course_slug)) continue;
              totalByCourse.set(row.course_slug,(totalByCourse.get(row.course_slug)||0)+1);
            }
            for (const row of progressRows || []) {
              if (!available.includes(row.course_slug)) continue;
              completedByCourse.set(row.course_slug,(completedByCourse.get(row.course_slug)||0)+1);
            }
          }
        }
        for (const card of document.querySelectorAll('.course-card')) {
          const match = card.getAttribute('href')?.match(/cours\/([^/]+)\//);
          if (!match) continue;
          const slug = match[1];
          const enrolled = active.has(slug);
          const open = enrolled && published.has(slug);
          card.classList.toggle('has-access',open);
          const detail = card.querySelector('small');
          let label = 'Accès réservé';
          if (enrolled && !open) label = 'Inscription active · formation en préparation';
          if (open) {
            label = 'Formation accessible';
            if (totalByCourse.has(slug)) {
              label += ' · '+(completedByCourse.get(slug)||0)+' / '+totalByCourse.get(slug)+' modules terminés';
            }
          }
          if (detail) detail.textContent=label;
          card.setAttribute('aria-label',(card.querySelector('strong')?.textContent||'Formation')+' — '+label);
        }
        message(available.length ? 'Vos formations accessibles et votre progression sont à jour.'
          : (active.size ? 'Vos inscriptions sont actives. Les formations sont encore en préparation.'
          : 'Vous n’avez aucune formation active pour le moment.'));
        return;
      }
      if (!active.has(course)) {
        message('Accès réservé : vous ne disposez pas d’une inscription active à cette formation.');
        return;
      }
      const {data: record, error: recordError} = await client.from('academy_courses')
        .select('slug,published').eq('slug',course).maybeSingle();
      if (request !== sequence) return;
      if (recordError || !record?.published) {
        message('Cette formation est encore en préparation et ses modules ne sont pas publiés.');
        return;
      }
      const {data: lessons, error: lessonsError} = await client.from('academy_course_modules')
        .select('module_index,title,body_markdown').eq('course_slug',course)
        .eq('published',true).order('module_index',{ascending:true});
      if (request !== sequence) return;
      if (lessonsError) {
        message('Les leçons n’ont pas pu être chargées. Aucun contenu n’est affiché.');
        return;
      }
      await showModules(lessons,user.id,request);
      if (request === sequence) await showDeliverables(user.id,request);
    } catch (_error) {
      if (request === sequence) failClosed('Vérification indisponible. Aucun cours privé n’a été chargé.');
    }
  }

  form.addEventListener('submit', async event => {
    event.preventDefault();
    const email = String(form.elements.email?.value || '').trim();
    if (!email || !form.reportValidity()) return;
    const button = form.querySelector('button[type=submit]');
    button.disabled = true;
    message('Envoi du lien de connexion…');
    try {
      const redirect = window.location.origin + window.location.pathname;
      const {error} = await client.auth.signInWithOtp({
        email,
        options: { shouldCreateUser: false, emailRedirectTo: redirect }
      });
      message(error ? 'Le lien n’a pas pu être envoyé. Vérifiez votre compte et réessayez.' :
        'Si un compte autorisé existe pour cette adresse, un lien vient de vous être envoyé.');
    } catch (_error) {
      message('Service de connexion temporairement indisponible.');
    } finally {
      button.disabled = false;
    }
  });

  logout.addEventListener('click', async () => {
    sequence++;
    resetContent();
    await client.auth.signOut();
    await refresh();
  });

  client.auth.onAuthStateChange(() => {
    // Avoid awaiting Supabase calls synchronously inside the auth callback.
    setTimeout(() => { void refresh(); }, 0);
  });
  void refresh();
})();
