'use strict'

const { combineRgb } = require('@companion-module/base')

function initFeedbacks() {
	const self = this

	// Layer choices: dynamic from discovered layers, minimal bootstrap fallback
	const layerChoices = (self._knownLayers.length > 0 ? self._knownLayers : ['base'])
		.map((l) => ({ id: l, label: l }))

	self.setFeedbackDefinitions({

		// ── Layer state ───────────────────────────────────────────────────────

		layer_is: {
			type: 'boolean',
			name: 'Layer: is active',
			description: 'True when kanata is on the specified layer',
			defaultStyle: {
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(180, 100, 20),  // orange-ish — visible on any button color
			},
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
			callback: (feedback) => self.currentLayer === feedback.options.layer,
		},

		layer_is_not: {
			type: 'boolean',
			name: 'Layer: is NOT active',
			description: 'True when kanata is NOT on the specified layer',
			defaultStyle: {
				color: combineRgb(160, 160, 160),
				bgcolor: combineRgb(30, 30, 30),
			},
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
			callback: (feedback) => self.currentLayer !== feedback.options.layer,
		},

		// Auto-colors button background to current layer's color (no options needed)
		layer_color: {
			type: 'advanced',
			name: 'Layer: auto background color',
			description: "Button background updates to the current layer's color automatically",
			options: [],
			callback: () => {
				// color_int is kept as a string variable; parse it back for combineRgb
				const raw = parseInt(self.getVariableValue('color_int') || '0', 10)
				return {
					bgcolor: raw || combineRgb(40, 40, 40),
					color: combineRgb(255, 255, 255),
				}
			},
		},

		// ── Messaging ─────────────────────────────────────────────────────────

		has_message: {
			type: 'boolean',
			name: 'kanata: has pending message',
			description: 'True when a MessagePush has been received (clears on next push)',
			defaultStyle: {
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(200, 120, 20),
			},
			options: [],
			callback: () => !!self._lastMessage,
		},
	})
}

module.exports = { initFeedbacks }
