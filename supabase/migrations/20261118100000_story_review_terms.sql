-- Stories can also be offered a few terms from the Review queue. The choice is
-- saved per collection like the levels, and each story records which of its
-- terms came from Review so the reader can underline them differently.

alter table public.story_collection_prefs
  add column include_review boolean not null default false;

alter table public.stories
  add column review_term_ids uuid[] not null default '{}';

comment on column public.story_collection_prefs.include_review is 'Whether new stories may also use a few terms from the Review queue.';
comment on column public.stories.review_term_ids is 'The terms in term_ids that were offered from the Review queue rather than the Read queue.';
