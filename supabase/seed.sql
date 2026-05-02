-- =============================================================================
-- CogniTest — seed data for the tests catalogue
-- =============================================================================
-- Run AFTER schema.sql + policies.sql. Idempotent.
-- =============================================================================

insert into public.tests (id, name, domain, description) values
  ('test-symetrie-axiale',           'Symétrie axiale',                    'cognition-geometrie', 'Évaluation cognitive — symétrie axiale'),
  ('test-symetrie-centrale',         'Symétrie centrale',                  'cognition-geometrie', 'Évaluation cognitive — symétrie centrale'),
  ('test-geo-vectors-complete',      'Vecteurs & translation',             'cognition-geometrie', 'Évaluation — vecteurs et translation'),
  ('test-geo-produit-scalaire',      'Produit scalaire',                   'cognition-geometrie', 'Produit scalaire & géométrie analytique'),
  ('test-geo-space',                 'Géométrie dans l''espace',           'cognition-geometrie', 'Positions relatives et raisonnement spatial'),
  ('test-droite-plan',               'Droite dans le plan',                'cognition-geometrie', 'Géométrie analytique de la droite'),
  ('test-trig-unit-circle',          'Cercle trigonométrique',             'cognition-geometrie', 'Cercle unité et angles'),
  ('test-syllogism',                 'Syllogismes logiques',               'reasoning',           'Raisonnement déductif'),
  ('test-mental-rotation-2d',        'Rotation mentale 2D',                'spatial-reasoning',   'Vandenberg-style 2D rotation'),
  ('test-cognitive-flexibility',     'Flexibilité cognitive',              'attentional',         'Tâche de switching'),
  ('test-visuo-spatial-attention',   'Attention visuo-spatiale',           'attentional',         'Attention visuo-spatiale')
on conflict (id) do update
  set name        = excluded.name,
      domain      = excluded.domain,
      description = excluded.description,
      is_active   = true;
