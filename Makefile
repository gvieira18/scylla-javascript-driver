.PHONY: format-gh
format-gh:
	@pnpm exec prettier --write ".github/{workflows,actions}/**/*.{yml,yaml}"
