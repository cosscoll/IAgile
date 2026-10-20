-- Already applied to project daabfmdlgcwcykevvrcm: academy_private_asset_manifest_draft_v01.
-- This file documents the schema, guard and 12 draft metadata rows. NO lesson content is in GitHub.
alter table public.academy_course_assets
  add column if not exists content_sha256 text,
  add column if not exists content_bytes integer,
  add column if not exists content_type text,
  add column if not exists source_version text,
  add column if not exists module_index integer;
alter table public.academy_course_assets
  add constraint academy_asset_sha256_valid check(content_sha256 is null or content_sha256 ~ '^[0-9a-f]{64}$'),
  add constraint academy_asset_bytes_valid check(content_bytes is null or content_bytes between 1 and 20971520),
  add constraint academy_asset_module_valid check(module_index is null or module_index between 0 and 199);
create or replace function academy_private.verify_asset_uploaded_before_publish()
returns trigger language plpgsql security definer set search_path=''
as $$
begin
  if new.published and not exists (
    select 1 from storage.objects o
    where o.bucket_id='iagile-course-files' and o.name=new.storage_path
  ) then
    raise exception 'Private asset must exist in Storage before publication'
    using errcode='23514';
  end if;
  return new;
end $$;
revoke all on function academy_private.verify_asset_uploaded_before_publish()
from public,anon,authenticated;
drop trigger if exists academy_verify_asset_uploaded on public.academy_course_assets;
create trigger academy_verify_asset_uploaded
before insert or update of published,storage_path on public.academy_course_assets
for each row execute function academy_private.verify_asset_uploaded_before_publish();

-- Metadata only: do not insert bytes in this public GitHub repository.
insert into public.academy_course_assets
(course_slug,asset_key,title,storage_path,published,content_sha256,content_bytes,content_type,source_version,module_index)
values
('processus','lumen-messages','Lumen — messages clients fictifs','processus/datasets/LUMEN-MESSAGES.md',false,'fea52bff67de4b0b1633084c084c5f5374a2d9faa633d466ebba3834ed526709',1759,'text/markdown','v0.1',3),
('processus','lumen-regles','Lumen — règles de fonctionnement','processus/datasets/LUMEN-REGLES.md',false,'73135d6dd13c0612d0f07514381259cd526164c949c0e6c63f144f215e4c26da',1634,'text/markdown','v0.1',3),
('processus','orbe-encaissements','Orbe — encaissements fictifs','processus/datasets/ORBE-ENCAISSEMENTS.csv',false,'116b13818acceae3a187777df99250cb30bc1ea3f21c21fe578e60cc955c1d00',359,'text/csv','v0.1',4),
('processus','orbe-evenements','Orbe — événements fictifs','processus/datasets/ORBE-EVENEMENTS.csv',false,'d21fe659a7c2f2bb338947f6622df62caa4f3f4b87d1ecf0697304dfb68e9dbd',877,'text/csv','v0.1',4),
('processus','orbe-regles','Orbe — règles de suivi','processus/datasets/ORBE-REGLES.md',false,'f0604cc2431be20fab0eaa97be0e052fcdf852c239ba00182c7b28b3c6bf62fb',1722,'text/markdown','v0.1',4),
('processus','sillage-agenda','Sillage — agenda fictif','processus/datasets/SILLAGE-AGENDA.csv',false,'7cbf10b08171b6474876fc1761bc4f62218cb285ffa1b0976b338f2a8083f0f8',669,'text/csv','v0.1',5),
('processus','sillage-confidentialite','Sillage — classification des données','processus/datasets/SILLAGE-CONFIDENTIALITE.csv',false,'d87ff4a5ba8a9b25e23f1b0b1254b4a5f515dd737922af4ad6bcd3ad25a85cae',1198,'text/csv','v0.1',8),
('processus','sillage-contraintes','Sillage — contraintes et capacité','processus/datasets/SILLAGE-CONTRAINTES.md',false,'d29aecd59607c5361722aabda184e003ffd546a2d88a6ea24916b0e2fd50df91',1494,'text/markdown','v0.1',6),
('processus','sillage-decisions','Sillage — registre des décisions','processus/datasets/SILLAGE-DECISIONS.md',false,'9657e8ab80330c048d4638fcb443928b816573ac3f1cad11890bbfee3adc1ca0',1220,'text/markdown','v0.1',5),
('processus','sillage-politique','Sillage — politique de confidentialité fictive','processus/datasets/SILLAGE-POLITIQUE.md',false,'0d8e6de955c95b64a517385d03f4abe39d5c05c306eb04cc7ed390b260b7bda5',2268,'text/markdown','v0.1',8),
('processus','sillage-reunion','Sillage — compte rendu fictif','processus/datasets/SILLAGE-REUNION.md',false,'aa24cac0ca12ac24a535749599533e1bc9efb6cffa411f18ae7eec3326c3009f',2024,'text/markdown','v0.1',5),
('processus','sillage-taches','Sillage — liste des tâches','processus/datasets/SILLAGE-TACHES.csv',false,'12bbb73c154c199cd483b5bcd318408267b1f56b6321a99bb6317ddc1f631847',776,'text/csv','v0.1',6)
on conflict (course_slug,asset_key) do nothing;
