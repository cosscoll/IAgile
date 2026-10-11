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
  let sequence = 0;

  const message = text => { status.textContent = text; };
  const resetContent = () => { if (modules) { modules.replaceChildren(); modules.hidden = true; } };
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

  function showModules(items) {
    resetContent();
    if (!modules) return;
    if (!Array.isArray(items) || items.length === 0) {
      message('Aucune leçon n’est encore disponible pour ce parcours.');
      return;
    }
    const heading = document.createElement('h3');
    heading.textContent = 'Modules accessibles';
    modules.append(heading);
    for (const item of items) {
      const section = document.createElement('section');
      section.className = 'lesson';
      const title = document.createElement('h4');
      title.textContent = String(item.title || 'Module');
      const body = document.createElement('div');
      body.className = 'lesson-body';
      // Never interpret database Markdown or learner text as HTML.
      body.textContent = String(item.body_markdown || '');
      section.append(title, body);
      modules.append(section);
    }
    modules.hidden = false;
    message(items.length + ' module(s) accessibles pour votre inscription active.');
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
        for (const card of document.querySelectorAll('.course-card')) {
          const match = card.getAttribute('href')?.match(/cours\/([^/]+)\//);
          if (!match) continue;
          card.classList.toggle('has-access',active.has(match[1]));
          card.setAttribute('aria-label', card.querySelector('strong')?.textContent + (active.has(match[1]) ? ' — inscription active' : ' — accès réservé'));
        }
        message(active.size ? 'Vos inscriptions actives ont été vérifiées.' : 'Vous n’avez aucune formation active pour le moment.');
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
      showModules(lessons);
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
