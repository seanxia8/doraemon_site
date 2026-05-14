.PHONY: build docs docs-serve validate

NODE_BIN_DIRS := $(wildcard /opt/homebrew/opt/node@22/bin /opt/homebrew/opt/node/bin /usr/local/opt/node@22/bin /usr/local/opt/node/bin)
ifneq ($(NODE_BIN_DIRS),)
export PATH := $(firstword $(NODE_BIN_DIRS)):$(PATH)
endif

build: docs

docs: validate check-node
	yarn --cwd sites/docs build

docs-serve: check-node
	yarn --cwd sites/docs dev

check-node:
	@command -v node >/dev/null || { echo "Node.js is required for the docs site. Install it with: brew install node"; exit 127; }
	@command -v yarn >/dev/null || { echo "Yarn is required for the docs site. Install it with: brew install yarn"; exit 127; }

validate:
	uv run python scripts/validate_metadata.py
