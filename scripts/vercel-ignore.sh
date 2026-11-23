#!/usr/bin/env bash
# Vercel "Ignored Build Step" for the Next.js project: exit 0 skips the build, any other code builds.
# The build is skipped only when every change since the last successful deployment is in lab-rs/
# (the Rust site, deployed by its own project) or docs/. If the previous deployment is unknown or
# not in the clone, the build runs, so a needed build is never skipped.
prev="${VERCEL_GIT_PREVIOUS_SHA:-}"
if [ -z "$prev" ] || ! git cat-file -e "${prev}^{commit}" 2>/dev/null; then
  echo "No previous deployment to compare with; building."
  exit 1
fi
if git diff --quiet "$prev" HEAD -- . ':(exclude)lab-rs' ':(exclude)docs'; then
  echo "Only lab-rs/ or docs/ changed since ${prev}; skipping the Next.js build."
  exit 0
fi
echo "Next.js sources changed since ${prev}; building."
exit 1
