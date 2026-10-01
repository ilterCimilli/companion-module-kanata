'use strict'

const { InstanceBase, runEntrypoint } = require('@companion-module/base')
const { getConfigFields }   = require('./src/config')
const { initTcp, destroyTcp, _connectTcp, _scheduleReconnect, _sendJson, _handleKanataMessage, _applyLayer } = require('./src/tcp')
const { initActions }       = require('./src/actions')
const { initFeedbacks }     = require('./src/feedbacks')
const { initVariables }     = require('./src/variables')
const { initPresets }       = require('./src/presets')

class KanataInstance extends InstanceBase {
	constructor(internal) {
		super(internal)

		// TCP state
		this.currentLayer       = null
		this._knownLayers       = []
		this._tcpSocket         = null
		this._tcpReconnectTimer = null
		this._tcpBuffer         = ''

		// Message / info state
		this._lastMessage    = ''
		this._currentCfgText = ''
	}

	async init(config) {
		await this.configUpdated(config)
	}

	async configUpdated(config) {
		this.config = config
		this.destroyTcp()
		this.initVariables()
		this.initActions()
		this.initFeedbacks()
		this.initPresets()
		this.initTcp()
	}

	async destroy() {
		this.destroyTcp()
	}

	getConfigFields() {
		return getConfigFields()
	}
}

Object.assign(KanataInstance.prototype, {
	initTcp, destroyTcp, _connectTcp, _scheduleReconnect,
	_sendJson, _handleKanataMessage, _applyLayer,
	initActions, initFeedbacks, initVariables, initPresets,
})

runEntrypoint(KanataInstance, [])
