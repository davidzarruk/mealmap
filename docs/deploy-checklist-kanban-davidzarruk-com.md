# Deploy checklist — kanban.davidzarruk.com (Lovable + Namecheap)

Date: 2026-02-16 UTC
Owner: DevOps

## 1) Pre-deploy (Supabase + app)
- [ ] Confirm migration `20260216092000_kanban_live.sql` applied in target Supabase project.
- [ ] Confirm realtime publication includes `public.tickets` and `public.ticket_events`.
- [ ] Create/confirm one authenticated owner user for kanban operations (`owner_id`).
- [ ] Run board sync to seed tickets (service role required):
  - [ ] `SUPABASE_URL`
  - [ ] `SUPABASE_SERVICE_ROLE_KEY`
  - [ ] `SUPABASE_OWNER_ID`
  - [ ] `node scripts/sync-board-to-supabase.mjs`
- [ ] Verify seeded count in `tickets` equals parsed board ticket count.

## 2) Build and publish static kanban site (Lovable)
- [ ] Ensure `kanban-web/` contains final static assets (`index.html`, `app.js`, `styles.css`).
- [ ] Publish/update project in Lovable as static site.
- [ ] Set production values strategy:
  - [ ] Prefer runtime prompt/localStorage for `SUPABASE_URL`, key, owner UUID.
  - [ ] Never hardcode service role key in frontend.

## 3) DNS + domain (Namecheap)
- [ ] In Namecheap Advanced DNS, add/update CNAME:
  - Host: `kanban`
  - Value: Lovable target hostname
  - TTL: Automatic (or 5 min during cutover)
- [ ] If apex forwarding is needed, keep `davidzarruk.com` unaffected.
- [ ] Wait for propagation and confirm `kanban.davidzarruk.com` resolves.

## 4) TLS and routing
- [ ] Confirm SSL certificate is issued for `kanban.davidzarruk.com` in Lovable.
- [ ] Verify HTTPS redirect enabled (HTTP -> HTTPS).
- [ ] Verify no mixed-content warnings in browser console.

## 5) Post-deploy QA (prod URL)
- [ ] Open `https://kanban.davidzarruk.com`.
- [ ] Load board with valid Supabase URL/key/owner.
- [ ] Move one ticket status and verify DB update in `tickets`.
- [ ] Verify event row created in `ticket_events`.
- [ ] Verify realtime update appears in second browser tab within <=2s.

## 6) Rollback plan
- [ ] Keep previous Lovable deployment/version reference.
- [ ] If regression: restore prior static build and re-point CNAME if changed.
- [ ] If data issue: revert only ticket status changes (no destructive schema rollback unless approved).

## 7) Ops handoff
- [ ] Store final production runbook link in repo docs.
- [ ] Record owner UUID used for prod board in secure vault (not in git).
- [ ] Record deploy timestamp and operator.
