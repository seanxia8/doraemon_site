.PHONY: build site documentation record-pages challenge-protocols serve validate new-challenge new-dataset check-node check-quarto docs docs-serve

NODE_BIN_DIRS := $(wildcard /opt/homebrew/opt/node@22/bin /opt/homebrew/opt/node/bin /usr/local/opt/node@22/bin /usr/local/opt/node/bin)
ifneq ($(NODE_BIN_DIRS),)
export PATH := $(firstword $(NODE_BIN_DIRS)):$(PATH)
endif

QUARTO_VERSION ?= 1.9.37
QUARTO ?= uvx --from quarto-cli==$(QUARTO_VERSION) quarto

build: validate documentation record-pages site

site: check-node
	yarn --cwd site build

documentation: check-quarto
	rm -rf site/public/documentation
	$(QUARTO) render documentation --to html
	uv run python scripts/renumber_documentation.py

record-pages: check-quarto
	rm -rf site/public/challenge-protocols site/.generated/challenge-protocols site/public/dataset-records site/.generated/dataset-records
	uv run python scripts/render_challenge_protocols.py --quarto "$(QUARTO)"

challenge-protocols: record-pages

serve: check-node
	yarn --cwd site start

docs: build

docs-serve: serve

check-node:
	@command -v node >/dev/null || { echo "Node.js is required for the site. Install it with: brew install node"; exit 127; }
	@command -v yarn >/dev/null || { echo "Yarn is required for the site. Install it with: brew install yarn"; exit 127; }

check-quarto:
	@$(QUARTO) --version >/dev/null || { echo "Quarto is required. Current QUARTO command: $(QUARTO). Install uv, or set QUARTO=quarto to use an existing Quarto binary."; exit 127; }

validate:
	uv run python scripts/validate_metadata.py

new-challenge:
	@test -n "$(ID)" || { echo "Usage: make new-challenge ID=my-challenge DATASET=my-dataset [TITLE='My Challenge']"; exit 2; }
	@test -n "$(DATASET)" || { echo "Usage: make new-challenge ID=my-challenge DATASET=my-dataset [TITLE='My Challenge']"; exit 2; }
	@uv run python scripts/scaffold_record.py challenge "$(ID)" --dataset "$(DATASET)" \
		$(if $(TITLE),--title "$(TITLE)",) \
		$(if $(SUMMARY),--summary "$(SUMMARY)",) \
		$(if $(ORDER),--order "$(ORDER)",) \
		$(if $(STATUS),--status "$(STATUS)",) \
		$(if $(CATEGORY),--category "$(CATEGORY)",) \
		$(if $(TECHNICAL_AREA),--technical-area "$(TECHNICAL_AREA)",) \
		$(if $(DETECTOR_TYPE),--detector-type "$(DETECTOR_TYPE)",) \
		$(if $(TECHNICAL_METHOD),--technical-method "$(TECHNICAL_METHOD)",) \
		$(if $(METRIC),--metric "$(METRIC)",)

new-dataset:
	@test -n "$(ID)" || { echo "Usage: make new-dataset ID=my-dataset [TITLE='My Dataset']"; exit 2; }
	@uv run python scripts/scaffold_record.py dataset "$(ID)" \
		$(if $(TITLE),--title "$(TITLE)",) \
		$(if $(SUMMARY),--summary "$(SUMMARY)",) \
		$(if $(ORDER),--order "$(ORDER)",) \
		$(if $(STATUS),--status "$(STATUS)",) \
		$(if $(MODALITY),--modality "$(MODALITY)",) \
		$(if $(VERSION),--version "$(VERSION)",) \
		$(if $(DATA_FORMAT),--data-format "$(DATA_FORMAT)",) \
		$(if $(ACCESS_TYPE),--access-type "$(ACCESS_TYPE)",) \
		$(if $(USED_BY),--used-by "$(USED_BY)",)
