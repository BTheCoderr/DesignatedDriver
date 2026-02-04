# File Audit - What to Keep vs Remove
**Date:** January 28, 2026

---

## ✅ ESSENTIAL FILES (KEEP)

### Core SQL Files (Required for App to Work)
1. **`schema.sql`** ✅ KEEP
   - Main database schema
   - Required for initial setup
   - Referenced in README.md

2. **`rls_policies.sql`** ✅ KEEP
   - Row-level security policies
   - Required for security
   - Referenced in README.md

3. **`storage_policies.sql`** ✅ KEEP
   - Storage bucket policies
   - Required for photo uploads
   - Referenced in AUDIT_REPORT.md

4. **`vehicle_inspections_schema.sql`** ✅ KEEP
   - Vehicle inspections table
   - Required for chase car mode
   - Referenced in TEST_VEHICLE_INSPECTIONS.md

5. **`email_confirmation_trigger.sql`** ✅ KEEP
   - Email confirmation trigger
   - Required for auth flow
   - Referenced in EMAIL_CONFIRMATION_SETUP.md

6. **`update_cancellation_states.sql`** ✅ KEEP
   - Adds cancellation statuses
   - Required for trip cancellation
   - Recently created

### Demo/Test SQL Files (For YC Demo)
7. **`create_demo_accounts.sql`** ✅ KEEP
   - Creates demo accounts for YC demo
   - Required for demo setup
   - Recently created/updated

8. **`seed_demo_data.sql`** ✅ KEEP
   - Seeds demo trips and claims
   - Required for YC demo
   - Recently created/updated

### Fix Scripts (One-Time Use)
9. **`fix_rls_recursion.sql`** ⚠️ KEEP (but mark as "already run")
   - Fixes RLS recursion issues
   - One-time fix, but keep for reference

10. **`fix_vehicles_rls.sql`** ⚠️ KEEP (but mark as "already run")
    - Fixes vehicles RLS issues
    - One-time fix, but keep for reference

### Test Scripts
11. **`test_vehicle_inspections.sql`** ✅ KEEP
    - Tests vehicle inspections setup
    - Useful for verification

---

## 📚 ESSENTIAL DOCUMENTATION (KEEP)

### Core Documentation
1. **`README.md`** ✅ KEEP
   - Main project readme
   - Entry point for new developers

2. **`ARCHITECTURE.md`** ✅ KEEP
   - System architecture overview
   - Referenced in README.md

3. **`SCREENS.md`** ✅ KEEP
   - Screen map & navigation
   - Referenced in README.md

4. **`BUILD_STEPS.md`** ✅ KEEP
   - Step-by-step setup guide
   - Referenced in README.md

5. **`TEST_PLAN.md`** ✅ KEEP
   - QA checklist
   - Referenced in README.md

### YC Demo Documentation
6. **`YC_DEMO_SCRIPT.md`** ✅ KEEP
   - YC demo script
   - Required for demo prep

7. **`OPERATIONAL_DOCS.md`** ✅ KEEP
   - Operational documentation
   - Required for YC Q&A

8. **`FINAL_GAP_AUDIT_COMPLETE.md`** ✅ KEEP
   - Final gap audit summary
   - Useful reference

9. **`QUICK_START_DEMO.md`** ✅ KEEP
   - Quick demo setup guide
   - Useful for quick reference

10. **`SETUP_DEMO_ACCOUNTS.md`** ✅ KEEP
    - Demo account setup guide
    - Useful for setup

### Setup Guides
11. **`ENV_SETUP.md`** ✅ KEEP
    - Environment variables guide
    - Useful for troubleshooting

12. **`MAPBOX_SETUP.md`** ✅ KEEP
    - Mapbox configuration
    - Useful for map setup

13. **`DEPLOY_WEB.md`** ✅ KEEP
    - Netlify deployment guide
    - Useful for deployment

14. **`EMAIL_CONFIRMATION_SETUP.md`** ✅ KEEP
    - Email confirmation setup
    - Useful for auth setup

---

## ⚠️ POTENTIALLY DUPLICATE/OUTDATED (REVIEW)

### SQL Files - Generic Templates (Can Remove)
1. **`seed_data.sql`** ❌ REMOVE
   - Generic seed data template (mostly commented out)
   - Replaced by `seed_demo_data.sql` (active, YC demo specific)
   - **Action:** Remove - not actively used

2. **`seed_test_data.sql`** ❌ REMOVE
   - Generic test data template (mostly commented out)
   - Replaced by `seed_demo_data.sql` (active, YC demo specific)
   - **Action:** Remove - not actively used

3. **`create_test_accounts.sql`** ❌ REMOVE
   - Generic test account creation (uses user@test.com)
   - Replaced by `create_demo_accounts.sql` (active, uses demo_user@test.com)
   - **Action:** Remove - not actively used

### Documentation - Check for Duplicates
4. **`BUILD_STATUS.md`** ⚠️ REVIEW
   - Build status tracking
   - May overlap with `AUDIT_REPORT.md`
   - **Action:** Compare, consolidate if duplicate

5. **`MVP_SUMMARY.md`** ⚠️ REVIEW
   - MVP summary
   - May overlap with `ARCHITECTURE.md` or `AUDIT_REPORT.md`
   - **Action:** Compare, consolidate if duplicate

6. **`NEXT_STEPS.md`** ⚠️ REVIEW
   - Next steps guide
   - May overlap with `AUDIT_REPORT.md` or `FINAL_GAP_AUDIT_COMPLETE.md`
   - **Action:** Compare, consolidate if duplicate

7. **`HOW_TO_TEST.md`** ⚠️ REVIEW
   - Testing guide
   - May overlap with `TESTING_GUIDE.md` or `TEST_PLAN.md`
   - **Action:** Compare, consolidate if duplicate

8. **`QUICK_TEST.md`** ⚠️ REVIEW
   - Quick test guide
   - May overlap with `HOW_TO_TEST.md` or `TESTING_GUIDE.md`
   - **Action:** Compare, consolidate if duplicate

9. **`TESTING_GUIDE.md`** ⚠️ REVIEW
   - Detailed testing guide
   - May overlap with `TEST_PLAN.md` or `HOW_TO_TEST.md`
   - **Action:** Compare, consolidate if duplicate

10. **`QUICK_REFERENCE.md`** ⚠️ REVIEW
    - Quick reference guide
    - May overlap with other docs
    - **Action:** Review, keep if unique content

11. **`SETUP_NOTES.md`** ⚠️ REVIEW
    - Setup notes
    - May overlap with `BUILD_STEPS.md` or `ENV_SETUP.md`
    - **Action:** Compare, consolidate if duplicate

12. **`SETUP_TEST_ACCOUNTS.md`** ⚠️ REVIEW
    - Test account setup
    - May overlap with `CREATE_TEST_ACCOUNTS.md` or `SETUP_DEMO_ACCOUNTS.md`
    - **Action:** Compare, consolidate if duplicate

13. **`CREATE_TEST_ACCOUNTS.md`** ⚠️ REVIEW
    - Test account creation guide
    - May overlap with `SETUP_TEST_ACCOUNTS.md` or `SETUP_DEMO_ACCOUNTS.md`
    - **Action:** Compare, consolidate if duplicate

14. **`TESTER_ONBOARDING.md`** ⚠️ REVIEW
    - Tester onboarding guide
    - May overlap with `TESTING_GUIDE.md`
    - **Action:** Compare, keep if unique content

15. **`TEST_VEHICLE_INSPECTIONS.md`** ✅ KEEP
    - Vehicle inspections testing guide
    - Specific feature documentation
    - Keep for reference

16. **`AUDIT_REPORT.md`** ✅ KEEP
    - Comprehensive audit report
    - Useful reference document

17. **`SCOOTER_CAPABILITY_STATUS.md`** ⚠️ REVIEW
    - Scooter capability status
    - May overlap with `ARCHITECTURE.md`
    - **Action:** Review, keep if unique content

18. **`dispatcher_pricing_pseudocode.md`** ✅ KEEP
    - Dispatcher & pricing logic
    - Referenced in README.md
    - Core logic documentation

19. **`DISABLE_EMAIL_CONFIRMATION.md`** ⚠️ REVIEW
    - Email confirmation disable guide
    - May be outdated if using email confirmation
    - **Action:** Review, remove if not needed

---

## 🗑️ RECOMMENDED FOR REMOVAL

### Duplicate/Outdated Files
1. **`create_demo_accounts_simple.sql`** ❌ REMOVE
   - Simple version (no validation)
   - User confirmed not needed
   - Already deleted ✅

### Files Confirmed for Removal
2. **`seed_data.sql`** ❌ REMOVE
   - Generic template, replaced by `seed_demo_data.sql`
   - **Action:** Delete file

3. **`seed_test_data.sql`** ❌ REMOVE
   - Generic template, replaced by `seed_demo_data.sql`
   - **Action:** Delete file

4. **`create_test_accounts.sql`** ❌ REMOVE
   - Generic template, replaced by `create_demo_accounts.sql`
   - **Action:** Delete file

---

## 📋 RECOMMENDED ACTIONS

### Step 1: Compare Duplicate Files
```bash
# Compare seed files
diff seed_data.sql seed_demo_data.sql
diff seed_test_data.sql seed_demo_data.sql

# Compare account creation files
diff create_test_accounts.sql create_demo_accounts.sql

# Compare test guides
diff HOW_TO_TEST.md TESTING_GUIDE.md
diff QUICK_TEST.md HOW_TO_TEST.md
```

### Step 2: Consolidate Documentation
- Review overlapping docs
- Merge into single comprehensive guides
- Remove duplicates

### Step 3: Organize Files
Create folders:
- `docs/` - All markdown documentation
- `sql/` - All SQL scripts
- `sql/setup/` - Setup scripts (schema, RLS, etc.)
- `sql/demo/` - Demo/test scripts
- `sql/fixes/` - One-time fix scripts

### Step 4: Update README.md
- Update file references
- Remove references to deleted files
- Add links to organized structure

---

## 📊 SUMMARY

**Total Files:**
- SQL Files: 14
- MD Files: 30

**Keep:**
- Essential SQL: 11 files
- Essential Docs: 14 files

**Review:**
- Potentially duplicate SQL: 3 files
- Potentially duplicate Docs: 9 files

**Remove:**
- Confirmed duplicates: 1 file (already deleted)
- Potential duplicates: 3-4 files (after comparison)

---

## 🎯 NEXT STEPS

1. **Run the demo flow** - Test everything works
2. **Compare duplicate files** - Use diff commands above
3. **Consolidate documentation** - Merge overlapping docs
4. **Organize file structure** - Create folders
5. **Update README.md** - Reflect new structure
6. **Remove duplicates** - Clean up confirmed duplicates

---

**Last Updated:** January 28, 2026
