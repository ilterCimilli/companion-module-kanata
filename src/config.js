'use strict'

function getConfigFields() {
	return [
		{
			type: 'textinput',
			id: 'host',
			label: 'Kanata Host',
			default: '127.0.0.1',
			width: 8,
			tooltip: 'IP or hostname of the machine running kanata',
		},
		{
			type: 'number',
			id: 'port',
			label: 'Kanata TCP Port',
			default: 5829,
			min: 1,
			max: 65535,
			width: 4,
			tooltip: 'MacBook-Pro: 5829 | mmp13: 5830 | sandy: 5831',
		},
	]
}

module.exports = { getConfigFields }
