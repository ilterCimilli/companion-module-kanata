'use strict'

function initActions() {
	const self = this

	// Layer choices: prefer discovered list, bootstrap with a minimal set
	const layerChoices = (self._knownLayers.length > 0 ? self._knownLayers : ['base'])
		.map((l) => ({ id: l, label: l }))

	self.setActionDefinitions({

		// ── Layer control ────────────────────────────────────────────────────

		change_layer: {
			name: 'Change Layer',
			options: [
				{
					type: 'dropdown',
					id: 'layer',
					label: 'Layer',
					default: layerChoices[0]?.id ?? 'base',
					choices: layerChoices,
					allowCustom: true,
				},
			],
			callback: async (action) => {
				self.log('info', `→ ChangeLayer: ${action.options.layer}`)
				self._sendJson({ ChangeLayer: { new: action.options.layer } })
			},
		},

		// ── Queries ──────────────────────────────────────────────────────────

		request_layer_names: {
			name: 'Refresh Layer List',
			options: [],
			callback: async () => {
				self._sendJson({ RequestLayerNames: {} })
			},
		},

		request_current_layer: {
			name: 'Query Current Layer Name',
			options: [],
			callback: async () => {
				self._sendJson({ RequestCurrentLayerName: {} })
			},
		},

		request_current_layer_info: {
			name: 'Query Current Layer Info (cfg_text)',
			options: [],
			callback: async () => {
				self._sendJson({ RequestCurrentLayerInfo: {} })
			},
		},

		// ── Virtual / fake keys ──────────────────────────────────────────────

		fake_key_tap: {
			name: 'Fake Key — Tap',
			options: [
				{ type: 'textinput', id: 'name', label: 'Virtual key name', default: '' },
			],
			callback: async (action) => {
				if (!action.options.name) return
				self._sendJson({ ActOnFakeKey: { name: action.options.name, action: 'Tap' } })
			},
		},

		fake_key_press: {
			name: 'Fake Key — Press (hold)',
			options: [
				{ type: 'textinput', id: 'name', label: 'Virtual key name', default: '' },
			],
			callback: async (action) => {
				if (!action.options.name) return
				self._sendJson({ ActOnFakeKey: { name: action.options.name, action: 'Press' } })
			},
		},

		fake_key_release: {
			name: 'Fake Key — Release',
			options: [
				{ type: 'textinput', id: 'name', label: 'Virtual key name', default: '' },
			],
			callback: async (action) => {
				if (!action.options.name) return
				self._sendJson({ ActOnFakeKey: { name: action.options.name, action: 'Release' } })
			},
		},

		fake_key_toggle: {
			name: 'Fake Key — Toggle',
			options: [
				{ type: 'textinput', id: 'name', label: 'Virtual key name', default: '' },
			],
			callback: async (action) => {
				if (!action.options.name) return
				self._sendJson({ ActOnFakeKey: { name: action.options.name, action: 'Toggle' } })
			},
		},

		// ── Mouse ────────────────────────────────────────────────────────────

		set_mouse: {
			name: 'Set Mouse Position',
			options: [
				{ type: 'number', id: 'x', label: 'X', default: 0, min: 0, max: 65535, width: 6 },
				{ type: 'number', id: 'y', label: 'Y', default: 0, min: 0, max: 65535, width: 6 },
			],
			callback: async (action) => {
				self._sendJson({ SetMouse: { x: action.options.x, y: action.options.y } })
			},
		},

		// ── Config reload ────────────────────────────────────────────────────

		reload: {
			name: 'Reload Config',
			options: [],
			callback: async () => { self._sendJson({ Reload: {} }) },
		},

		reload_next: {
			name: 'Reload — Next Config File',
			options: [],
			callback: async () => { self._sendJson({ ReloadNext: {} }) },
		},

		reload_prev: {
			name: 'Reload — Previous Config File',
			options: [],
			callback: async () => { self._sendJson({ ReloadPrev: {} }) },
		},

		reload_num: {
			name: 'Reload — Config by Index',
			options: [
				{ type: 'number', id: 'index', label: 'Config index (0-based)', default: 0, min: 0, max: 99, width: 4 },
			],
			callback: async (action) => {
				self._sendJson({ ReloadNum: { index: action.options.index } })
			},
		},

		reload_file: {
			name: 'Reload — Specific Config File',
			options: [
				{ type: 'textinput', id: 'path', label: 'Config file path', default: '' },
			],
			callback: async (action) => {
				if (!action.options.path) return
				self._sendJson({ ReloadFile: { path: action.options.path } })
			},
		},
	})
}

module.exports = { initActions }
