# PlantUML Parser HSL registration tasks

## Privacy and environment configuration

- [x] Audit commit `f317b79` for personal data, local paths and embedded credentials.
- [x] Confirm that workflow secret references contain names only, not secret values.
- [x] Keep `node_modules`, `.git`, build output and local `.env` files outside the deposit.
- [x] Preserve upstream author, repository URLs and Apache-2.0 license as provenance.
- [ ] Re-run the secret and personal-data scan against the final ZIP.

No private service value is embedded in this parser version, so no runtime
environment variable is required for registration. NPM and GitHub publication
tokens remain external secrets managed by their respective platforms.

## Deposit preparation

- [ ] Add an origin-and-modifications statement identifying base commit `966a72e`.
- [ ] Limit the registered scope to the structured use-case extension.
- [ ] Include source, grammar, relevant tests, package manifests and license.
- [ ] Generate deterministic ZIP, file manifest and SHA-256.
