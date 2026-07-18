# Releases

ChatGPT Styler uses [`.github/workflows/release.yml`](../.github/workflows/release.yml) to validate, build, and publish tagged commits.

## What the workflow publishes

Pushing any tag starts the **Release** workflow:

1. Validation runs once: typecheck, lint, format check, and tests.
2. Development and production builds run concurrently.
3. Each build is available as a workflow artifact on the Actions run.
4. A GitHub Release is created for the tag with both zip files attached:
   - `dist-<tag>.zip` — minified production build for Chrome Web Store submission.
   - `dist-<tag>-dev.zip` — development build with source maps and dev-only tools; use only for sideloading and debugging.

The workflow does **not** publish to the Chrome Web Store.

## Release candidate

Use an incrementing tag such as `1.3.1-RC1`. A hyphenated tag is automatically published as a GitHub **pre-release**.

The tag must point to a pushed commit that includes the release workflow. From the release branch:

```bash
git push -u origin HEAD
git tag 1.3.1-RC1
git push origin 1.3.1-RC1
```

After the workflow passes:

1. Open the pre-release on GitHub.
2. Download and unpack `dist-1.3.1-RC1.zip`.
3. Load its `dist/` directory as an unpacked extension and smoke-test it on `chatgpt.com`.
4. Use `dist-1.3.1-RC1-dev.zip` only when testing dev-only diagnostics.

Use a new tag (`RC2`, `RC3`, and so on) for each candidate. Do not move or reuse a published tag.

## Final release

Before tagging the final release:

1. Merge the approved release changes to `main` and pull the latest `main`.
2. Update [`CHANGELOG.md`](../CHANGELOG.md).
3. Keep the version identical in `package.json`, the top-level `package-lock.json`, and `dist/manifest.json`.
4. Run `npm run build:prod` and smoke-test the unpacked `dist/` directory. Webpack does not recreate the tracked manifest, popup HTML, or icons.
5. Run `npm run validate && npm run test:ci`.
6. Commit and push all release changes.

Create a final tag without a hyphen:

```bash
git switch main
git pull --ff-only
git tag 1.3.1
git push origin 1.3.1
```

The workflow publishes a normal GitHub Release, generates release notes, and attaches the production and development zips. Download the production zip for Chrome Web Store submission.

## Failed or incorrect tags

Prefer fixing the branch and creating the next RC tag. If an unpublished local tag is wrong, delete it with:

```bash
git tag -d 1.3.1-RC1
```

Deleting a pushed tag or published GitHub Release is disruptive and should be reserved for genuinely invalid releases.
