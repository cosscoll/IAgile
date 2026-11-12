-- Applied to IAgile Academy on 2026-10-10:
-- academy_limit_learner_payloads_and_stamp_answers
--
-- Back-end constraints, not merely HTML maxlength, protect storage and
-- server-side revision timestamps from direct REST clients.
alter table public.academy_deliverable_answers
  add constraint academy_answer_content_length
  check (char_length(btrim(content)) between 1 and 10000);

alter table public.academy_module_progress
  add constraint academy_progress_note_length
  check (char_length(notes) <= 4000);

create or replace function academy_private.stamp_answer_created()
returns trigger language plpgsql set search_path=''
as $fn$
begin
  new.updated_at=pg_catalog.clock_timestamp();
  return new;
end;
$fn$;

revoke all on function academy_private.stamp_answer_created()
  from public,anon,authenticated;

drop trigger if exists academy_answer_created_server_clock
  on public.academy_deliverable_answers;
create trigger academy_answer_created_server_clock
  before insert on public.academy_deliverable_answers
  for each row execute function academy_private.stamp_answer_created();
