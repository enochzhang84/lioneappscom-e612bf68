# Architecture rules
- Module Manager is a Platform Core capability exposed within the existing Tools admin page, preserving the original tool workbench.
- Generate module metadata offline from source imports with `bun scripts/scan-modules.ts`; serve only the generated metadata through an authenticated admin server function, because the deployed Worker cannot scan a filesystem and source code must never reach the browser.
- V1 module manifests are review candidates, not portable package guarantees; unknown module versions and runtime/data dependencies must stay explicit.