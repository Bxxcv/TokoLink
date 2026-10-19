-- Drop anon read on profiles: storefront memakai view public_stores_v2 (tanpa PII).
drop policy if exists "profiles_anon_storefront" on profiles;
