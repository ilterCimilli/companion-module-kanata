'use strict'

function initVariables() {
	const self = this

	self.setVariableDefinitions([
		// Current layer state
		{ variableId: 'layer',      name: 'Current layer name' },
		{ variableId: 'color_hex',  name: 'Layer color (CSS hex, e.g. #c84090)' },
		{ variableId: 'color_int',  name: 'Layer color (decimal int for combineRgb expressions)' },
		{ variableId: 'layer_icon',      name: 'Current layer icon (base64 PNG for png64 field)' },
		{ variableId: 'layer_icon_name', name: 'Current layer icon name (e.g. kanata-base — use in $(image:...) text expressions)' },

		// Config and messaging
		{ variableId: 'cfg_text',   name: 'Current layer config text (from RequestCurrentLayerInfo)' },
		{ variableId: 'message',    name: 'Last MessagePush value from kanata' },
	])

	self.setVariableValues({
		layer: '',
		color_hex: '',
		color_int: '',
		layer_icon: '',
		layer_icon_name: '',
		cfg_text: '',
		message: '',
	})
}

module.exports = { initVariables }
