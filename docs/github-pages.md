# Configure GitHub Pages

This repository already contains the complete deployment action in [`.github/workflows/deploy.yml`](../.github/workflows/deploy.yml). Its name in GitHub is **Deploy to GitHub Pages**. It builds the Vite app before deploying `dist`.

## 1. Enable Pages

1. Open the repository: https://github.com/glbookshare/levinsandbox.
2. Select **Settings → Pages**.
3. Under **Build and deployment → Source**, select **GitHub Actions**. If it already says GitHub Actions, this step is complete.
4. Leave the suggested **GitHub Pages Jekyll** and **Static HTML** Configure buttons alone. Those create new workflows; this repository already has the correct workflow.
5. Leave **Custom domain** empty when using the default GitHub URL. Keep **Enforce HTTPS** enabled.

No Cloudflare account, backend, deployment token, custom secret, or third-party hosting setup is needed. The workflow uses GitHub's built-in `GITHUB_TOKEN` with Pages and OpenID Connect permissions.

## 2. Run the existing action

1. Open the repository's **Actions** tab (the top repository tab, rather than the Actions settings submenu): https://github.com/glbookshare/levinsandbox/actions.
2. In the workflow list, select **Deploy to GitHub Pages**.
3. Click **Run workflow**, select branch **main**, and click the green **Run workflow** button.
4. Open the new run and wait for both **build** and **deploy** to turn green. If an environment approval is requested, an authorized repository reviewer must approve that deployment.
5. Click the URL shown by the **deploy** job, or return to **Settings → Pages** and click **Visit site**.

The expected default address for this repository is:

https://glbookshare.github.io/levinsandbox/

A successful deployment is required before that address serves the game. Every later push to `main`, including documentation changes, automatically runs this action again. You can also manually run it again using the same steps.

## 3. What the action does

- Checks out `main` and installs Node 22.
- Reads the Pages configuration using `actions/configure-pages`.
- Installs the exact dependencies with `npm ci`.
- Runs automated tests and the TypeScript/Vite production build.
- Sets `VITE_BASE_PATH` from Pages' `base_path`, resulting in `/levinsandbox/` for this repository.
- Uploads **dist** and deploys it using the official Pages actions.

The configurable base keeps scripts, styles, icons, the PWA manifest and service worker working under the repository subdirectory. There is no need for a `gh-pages` branch or a deploy-from-branch setting.

## Troubleshooting

| What you see | What to check |
| --- | --- |
| Only Jekyll and Static HTML suggestions on the Pages screen | This is normal before the first successful deployment. Keep Source set to GitHub Actions and run the existing action from the Actions tab. |
| Workflow not listed | Confirm `.github/workflows/deploy.yml` exists on `main`. In **Settings → Actions → General**, verify Actions are enabled and repository/organization policy permits the official actions used by the workflow. |
| No Run workflow button | Open the individual workflow, confirm its file is on the default branch and includes `workflow_dispatch`, and ensure you have repository write access. |
| Configure Pages step fails / Pages not enabled | Confirm **Settings → Pages → Source → GitHub Actions**, then rerun the failed workflow. Check repository plan/visibility eligibility if GitHub reports Pages is unavailable. |
| Permission or policy error | Read the failing step's log. The workflow already declares `contents: read`, `pages: write`, and `id-token: write`. Check organization policies and any deployment restrictions on the `github-pages` environment; do not add a personal token as a workaround. |
| A build or test fails | Open the red step under **Actions → workflow run → build** and inspect the error. Reproduce locally with `npm ci`, `npm test`, then `VITE_BASE_PATH=/levinsandbox/ npm run build`. |
| Deployment waits for approval | Review the `github-pages` environment rules and ask the configured reviewer to approve the run. |
| Site returns 404 | Wait for a green deploy job, check the job's actual URL and include `/levinsandbox/`. Refresh the Pages settings page after deployment. |
| An older game version still appears | Close all open game tabs and installed app windows, then reopen online so the waiting service worker can activate. Avoid clearing site data: it removes local saves. |

## Install, play offline, and keep saves

Open the deployed HTTPS address online and wait for the offline-ready message. On Android Chrome, use **Install app** (or **Add to Home screen**); on iPad Safari, use **Share → Add to Home Screen**. Menu wording varies by browser version.

World snapshots and the language preference are stored in IndexedDB on the device. Ordinary code updates and service worker cache replacement do not delete IndexedDB. Changing the domain, clearing browser site data, browser eviction, or some uninstall options can make saves unavailable. There is no server copy of local saves in Phase 1.

## GitHub Actions Node.js runtime warnings

The runtime that executes an action is separate from the Node version installed for `npm ci`, tests and the Vite build. Changing `node-version` alone does not fix a warning about an action using deprecated Node 20.

The workflow uses Node 24 action releases: `checkout@v7`, `setup-node@v7`, `configure-pages@v6`, `upload-pages-artifact@v5`, and `deploy-pages@v5`. The Pages upload action also uses a Node 24 version of `upload-artifact` internally. The application build continues to use Node 22.

After updating action versions, use the new run triggered by the commit on `main`. Re-running an older workflow run uses its original workflow and can still show the old warning. No Pages settings change is needed.
