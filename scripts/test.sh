#!/bin/bash

# Filter out Jest-specific flags that Vitest doesn't support
FILTERED_ARGS=()
for arg in "$@"; do
  case "$arg" in
    --watchAll=false|--watchAll=true|--watchAll)
      # Skip Jest watchAll flag - vitest run already runs in non-watch mode
      continue
      ;;
    *)
      FILTERED_ARGS+=("$arg")
      ;;
  esac
done

# Run vitest run with filtered arguments
# The directories and other flags are passed through
exec vitest run "${FILTERED_ARGS[@]}"

