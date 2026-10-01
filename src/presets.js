'use strict'

const fs = require('fs')
const path = require('path')
const os = require('os')
const { combineRgb } = require('@companion-module/base')
const { layerColorHex, layerColorRgb } = require('./colors')

const ICON_DIR = path.join(os.homedir(), '.config', 'kanata', 'icons', '256')

// Human-readable labels for known layers — unknown layers fall back to their name
const LAYER_LABELS = {
	base:           'Base',
	global:         'Global',
	go:             'Go',
	vim:            'Vim',
	shift:          'Shift',
	upper:          'Upper',
	control:        'Ctrl',
	command:        'Cmd',
	option:         'Opt',
	switch:         'Switch',
	extra:          'Extra',
	numbers:        'Num',
	symbols:        'Sym',
	mouse:          'Mouse',
	mouse2:         'Mouse 2',
	'mouse-grid':   'Grid',
	email:          'Email',
	macro:          'Macro',
	'macro-record': 'Rec',
	btt:            'BTT',
	'btt-tb-comp-page': 'BTT-TB',
	'n-page':       'N-Page',
	recall:         'Recall',
	'dot-dots':     'Dot …',
	'dot-dirs':     'Dirs',
	'dot-machine':  'Host',
	'dot-ip':       'IP',
	apps:           'Apps',
	tabs:           'Tabs',
	windows:        'Win',
	clipboard:      'Clip',
	copy:           'Copy',
	cut:            'Cut',
	paste:          'Paste',
	ptt:            'PTT',
	lai:            'LAI',
}

function loadIcon(layer) {
	try {
		return fs.readFileSync(path.join(ICON_DIR, `kanata-${layer}.png`)).toString('base64')
	} catch (_) {
		return ''
	}
}

// Dim color for "not active" state
function dimColor(layer, factor = 0.15) {
	const { r, g, b } = layerColorRgb(layer)
	return combineRgb(
		Math.floor(r * factor),
		Math.floor(g * factor),
		Math.floor(b * factor),
	)
}

function initPresets() {
	const self = this

	// Use discovered layer list; bootstrap with a common set if not yet known
	const layers = self._knownLayers.length > 0
		? self._knownLayers
		: Object.keys(LAYER_LABELS)

	const presets = []

	for (const layer of layers) {
		const label    = LAYER_LABELS[layer] || layer
		const bgColor  = parseInt((layerColorHex(layer) || '#505050').replace('#', ''), 16)
			| 0  // ensure int
		// combineRgb-compatible: extract and repack (handles colors.js hex correctly)
		const hex = (layerColorHex(layer) || '#505050').replace('#', '')
		const rgb = {
			r: parseInt(hex.slice(0, 2), 16),
			g: parseInt(hex.slice(2, 4), 16),
			b: parseInt(hex.slice(4, 6), 16),
		}
		const fullColor = combineRgb(rgb.r, rgb.g, rgb.b)
		const darkColor = combineRgb(
			Math.floor(rgb.r * 0.15),
			Math.floor(rgb.g * 0.15),
			Math.floor(rgb.b * 0.15),
		)
		const icon = loadIcon(layer)

		presets.push({
			type: 'button',
			category: 'Kanata Layers',
			name: label,
			style: {
				// Icons have names baked in — hide text when icon is present.
				text: icon ? '' : label,
				size: 'auto',
				alignment: 'center:center',
				color: combineRgb(255, 255, 255),
				bgcolor: fullColor,
				...(icon ? { png64: icon, pngalignment: 'center:center' } : {}),
			},
			steps: [
				{
					down: [{ actionId: 'change_layer', options: { layer } }],
					up: [],
				},
			],
			feedbacks: [
				{
					feedbackId: 'layer_is_not',
					options: { layer },
					style: { bgcolor: darkColor },
				},
			],
		})
	}

	// ── Status button: live-updating current layer indicator ─────────────────
	// png64 takes $(kanata:layer_icon) — a variable holding base64 PNG data
	// that _applyLayer updates on every layer change. The layer_color feedback
	// swaps the background to match the current layer color.
	presets.push({
		type: 'button',
		category: 'Kanata',
		name: 'Current Layer (live)',
		style: {
			text: '$(kanata:layer)',
			size: 14,
			color: combineRgb(255, 255, 255),
			bgcolor: combineRgb(40, 40, 40),
			alignment: 'center:bottom',
			png64: '$(kanata:layer_icon)',
			pngalignment: 'center:center',
		},
		steps: [{ down: [], up: [] }],
		feedbacks: [{ feedbackId: 'layer_color', options: {} }],
	})

	// ── Reload button ────────────────────────────────────────────────────────
	presets.push({
		type: 'button',
		category: 'Kanata',
		name: 'Reload Config',
		style: {
			text: 'Reload',
			size: 'auto',
			color: combineRgb(255, 255, 255),
			bgcolor: combineRgb(60, 40, 40),
		},
		steps: [{ down: [{ actionId: 'reload', options: {} }], up: [] }],
		feedbacks: [],
	})

	self.setPresetDefinitions(presets)
}

module.exports = { initPresets }
