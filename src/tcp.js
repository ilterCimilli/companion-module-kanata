'use strict'

const fs = require('fs')
const path = require('path')
const os = require('os')
const net = require('net')
const { InstanceStatus } = require('@companion-module/base')
const { layerColorHex } = require('./colors')

const ICON_DIR = path.join(os.homedir(), '.config', 'kanata', 'icons', '256')
const RECONNECT_DELAY_MS = 3000

// ── TCP lifecycle ─────────────────────────────────────────────────────────────

function initTcp() {
	const self = this
	self._tcpSocket = null
	self._tcpReconnectTimer = null
	self._tcpBuffer = ''
	self._knownLayers = []
	self._connectTcp()
}

function _connectTcp() {
	const self = this
	if (self._tcpSocket) {
		self._tcpSocket.destroy()
		self._tcpSocket = null
	}

	const host = self.config.host || '127.0.0.1'
	const port = self.config.port || 5829

	self.updateStatus(InstanceStatus.Connecting)
	self.log('info', `Connecting to kanata at ${host}:${port}`)

	const sock = net.createConnection({ host, port })
	self._tcpSocket = sock
	self._tcpBuffer = ''

	sock.on('connect', () => {
		self.log('info', 'Connected to kanata')
		self.updateStatus(InstanceStatus.Ok)
		self._sendJson({ RequestLayerNames: {} })
		self._sendJson({ RequestCurrentLayerName: {} })
	})

	sock.on('data', (data) => {
		self._tcpBuffer += data.toString()
		const lines = self._tcpBuffer.split('\n')
		self._tcpBuffer = lines.pop()
		for (const line of lines) {
			const trimmed = line.trim()
			if (trimmed) self._handleKanataMessage(trimmed)
		}
	})

	sock.on('error', (err) => {
		self.log('warn', `kanata TCP error: ${err.message}`)
	})

	sock.on('close', () => {
		self.log('info', 'kanata TCP closed — reconnecting')
		self.updateStatus(InstanceStatus.Connecting)
		self._tcpSocket = null
		self._scheduleReconnect()
	})
}

function _scheduleReconnect() {
	const self = this
	if (self._tcpReconnectTimer) return
	self._tcpReconnectTimer = setTimeout(() => {
		self._tcpReconnectTimer = null
		self._connectTcp()
	}, RECONNECT_DELAY_MS)
}

function _sendJson(obj) {
	const self = this
	if (!self._tcpSocket || self._tcpSocket.destroyed) return
	try {
		self._tcpSocket.write(JSON.stringify(obj) + '\n')
	} catch (err) {
		self.log('warn', `kanata send failed: ${err.message}`)
	}
}

// ── Message handler ───────────────────────────────────────────────────────────

function _handleKanataMessage(raw) {
	const self = this
	let msg
	try { msg = JSON.parse(raw) } catch (_) { return }

	if (msg.LayerChange) {
		const { new: layer, color, icon } = msg.LayerChange
		self._applyLayer(layer, color, icon)

	} else if (msg.CurrentLayerName) {
		const { name: layer, color, icon } = msg.CurrentLayerName
		self._applyLayer(layer, color, icon)

	} else if (msg.CurrentLayerInfo) {
		const { name: layer, color, icon, cfg_text } = msg.CurrentLayerInfo
		self._currentCfgText = cfg_text || ''
		self.setVariableValues({ cfg_text: self._currentCfgText })
		self._applyLayer(layer, color, icon)

	} else if (msg.LayerNames) {
		const layers = msg.LayerNames.names || []
		self.log('info', `Layers (${layers.length}): ${layers.join(', ')}`)
		self._knownLayers = layers
		// Rebuild everything that depends on the layer list
		self.initActions()
		self.initFeedbacks()
		self.initPresets()

	} else if (msg.ConfigFileReload) {
		self.log('info', `Config reloaded: ${msg.ConfigFileReload.new}`)
		// Re-query to pick up new layers and current layer
		self._sendJson({ RequestLayerNames: {} })
		self._sendJson({ RequestCurrentLayerName: {} })

	} else if (msg.MessagePush) {
		const value = msg.MessagePush.message
		const text = (typeof value === 'string') ? value : JSON.stringify(value)
		self._lastMessage = text
		self.setVariableValues({ message: text })
		self.checkFeedbacks('has_message')

	} else if (msg.Error) {
		self.log('error', `kanata: ${msg.Error.msg}`)
	}
}

// ── Layer application ─────────────────────────────────────────────────────────

function _loadIcon(iconName) {
	try {
		return fs.readFileSync(path.join(ICON_DIR, `${iconName}.png`)).toString('base64')
	} catch (_) {
		return ''
	}
}

function _applyLayer(layer, tcpColor, tcpIcon) {
	const self = this
	self.currentLayer = layer

	// Color priority: TCP color field → kbd native opts (colors.js) → gray
	const color_hex = tcpColor || layerColorHex(layer)
	const hex = color_hex.replace('#', '')
	const r = parseInt(hex.slice(0, 2), 16)
	const g = parseInt(hex.slice(2, 4), 16)
	const b = parseInt(hex.slice(4, 6), 16)
	const color_int = String((r << 16) | (g << 8) | b)

	// Icon name from TCP (e.g. "kanata-base") or derived from layer name
	const layer_icon_name = tcpIcon || `kanata-${layer}`
	// base64 PNG for use in png64 fields; falls back to empty string if file absent
	const layer_icon = _loadIcon(layer_icon_name)

	self.setVariableValues({ layer, color_hex, color_int, layer_icon, layer_icon_name })
	self.checkFeedbacks('layer_is', 'layer_is_not', 'layer_color')
}

// ── Teardown ──────────────────────────────────────────────────────────────────

function destroyTcp() {
	const self = this
	if (self._tcpReconnectTimer) {
		clearTimeout(self._tcpReconnectTimer)
		self._tcpReconnectTimer = null
	}
	if (self._tcpSocket) {
		self._tcpSocket.destroy()
		self._tcpSocket = null
	}
}

module.exports = {
	initTcp, destroyTcp,
	_connectTcp, _scheduleReconnect, _sendJson,
	_handleKanataMessage, _applyLayer,
}
