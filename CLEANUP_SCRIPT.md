# Cleanup Script - Remove Unused Files

## Files to Delete

Run these commands to remove unused files:

```bash
# Remove generic seed/test templates (replaced by demo-specific versions)
rm seed_data.sql
rm seed_test_data.sql
rm create_test_accounts.sql

# Optional: Remove outdated setup guides if consolidated
# (Review first before deleting)
# rm SETUP_NOTES.md
# rm SETUP_TEST_ACCOUNTS.md
# rm CREATE_TEST_ACCOUNTS.md
```

## Files to Keep

**Essential SQL:**
- `schema.sql`
- `rls_policies.sql`
- `storage_policies.sql`
- `vehicle_inspections_schema.sql`
- `email_confirmation_trigger.sql`
- `update_cancellation_states.sql`
- `create_demo_accounts.sql` ✅ (Active)
- `seed_demo_data.sql` ✅ (Active)
- `test_vehicle_inspections.sql`
- `fix_rls_recursion.sql` (reference only)
- `fix_vehicles_rls.sql` (reference only)

**Essential Docs:**
- `README.md`
- `ARCHITECTURE.md`
- `SCREENS.md`
- `BUILD_STEPS.md`
- `TEST_PLAN.md`
- `YC_DEMO_SCRIPT.md`
- `OPERATIONAL_DOCS.md`
- `FINAL_GAP_AUDIT_COMPLETE.md`
- `QUICK_START_DEMO.md`
- `SETUP_DEMO_ACCOUNTS.md`
- `ENV_SETUP.md`
- `MAPBOX_SETUP.md`
- `DEPLOY_WEB.md`
- `EMAIL_CONFIRMATION_SETUP.md`
- `TEST_VEHICLE_INSPECTIONS.md`
- `AUDIT_REPORT.md`
- `dispatcher_pricing_pseudocode.md`
- `FILE_AUDIT.md` (this cleanup guide)

## After Cleanup

1. Update `README.md` to remove references to deleted files
2. Verify all links in docs still work
3. Test that demo setup still works
