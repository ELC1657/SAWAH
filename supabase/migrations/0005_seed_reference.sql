-- SAWAH 0005: reference data
-- Sasak to English is the primary pair. Indonesian rides along as an optional
-- second gloss so Sasak speakers have a bridge into the English.
-- Dialect names follow the standard meno-mene classification of Sasak.
-- Colours are the product's entire chroma budget: one hue per dialect,
-- drawn from Lombok landscape rather than picked at random.

insert into public.dictionaries
  (slug, name, source_language, target_language, source_label, target_label,
   secondary_language, secondary_label, sort_order)
values
  ('sasak-en', 'Sasak to English', 'Sasak', 'English',
   'Sasak word or phrase', 'English translation',
   'Indonesian', 'Indonesian translation', 1)
on conflict (slug) do nothing;

insert into public.regions (dictionary_id, slug, name, area, color, sort_order)
select d.id, v.slug, v.name, v.area, v.color, v.sort_order
from public.dictionaries d,
  (values
    ('kuto-kute',     'Kuto-Kute',     'North Lombok: Bayan, Tanjung, the slopes of Rinjani', '#2E4A63', 1::smallint),
    ('ngeto-ngete',   'Ngeto-Ngete',   'Northeast Lombok: Suela, Sembalun',                   '#3F6F6A', 2::smallint),
    ('ngeno-ngene',   'Ngeno-Ngene',   'East Lombok and parts of Central Lombok',             '#B4553A', 3::smallint),
    ('meno-mene',     'Meno-Mene',     'Central and West Lombok: Praya, Mataram',             '#4F7A46', 4::smallint),
    ('meriaq-meriku', 'Meriaq-Meriku', 'Southern Central Lombok: Pujut, Praya Barat',         '#B8862F', 5::smallint)
  ) as v(slug, name, area, color, sort_order)
where d.slug = 'sasak-en'
on conflict (dictionary_id, slug) do nothing;
