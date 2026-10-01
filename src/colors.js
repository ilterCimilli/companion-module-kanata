'use strict'

// Colors are read from native deflayer opts in the kanata config:
//   (deflayer (base color "#c84090" icon "kanata-base")
//
// Config file: $KANATA_CONFIG || ~/.config/kanata/kanata.kbd
// To change a layer's color: edit the color opt on its (deflayer ...) line.

const fs = require('fs')
const path = require('path')
const os = require('os')

function _configPath() {
	if (process.env.KANATA_CONFIG) return process.env.KANATA_CONFIG
	const cfgDir = process.env.XDG_CONFIG_HOME || path.join(os.homedir(), '.config')
	return path.join(cfgDir, 'kanata', 'kanata.kbd')
}

// Parse deflayer color comments from the kanata config.
// Returns Map<layerName, "#rrggbb">
function _loadColors() {
	const map = new Map()
	const cfgPath = _configPath()
	let raw
	try {
		raw = fs.readFileSync(cfgPath, 'utf8')
	} catch (_) {
		return map
	}
	// Match: (deflayer (name color "#rrggbb" ...)  — native deflayer opts syntax
	const re = /^\s*\(deflayer\s+\(([\w-]+)[^)]*color\s+"(#[0-9a-fA-F]{6})"/gm
	let m
	while ((m = re.exec(raw)) !== null) {
		const [, layer, hex] = m
		if (!map.has(layer)) map.set(layer, hex.toLowerCase())  // first match wins (macOS section)
	}
	return map
}

let _cache = null

function _colors() {
	if (!_cache) _cache = _loadColors()
	return _cache
}

function reloadColors() {
	_cache = _loadColors()
}

function layerColorHex(layer) {
	return _colors().get(layer) || '#505050'
}

function layerColorInt(layer) {
	const hex = layerColorHex(layer).slice(1)
	const r = parseInt(hex.slice(0, 2), 16)
	const g = parseInt(hex.slice(2, 4), 16)
	const b = parseInt(hex.slice(4, 6), 16)
	return (r << 16) | (g << 8) | b
}

function layerColorName(layer) {
	return layerColorHex(layer)
}

function layerColorRgb(layer) {
	const hex = layerColorHex(layer).slice(1)
	return {
		r: parseInt(hex.slice(0, 2), 16),
		g: parseInt(hex.slice(2, 4), 16),
		b: parseInt(hex.slice(4, 6), 16),
	}
}

module.exports = { layerColorInt, layerColorHex, layerColorName, layerColorRgb, reloadColors }
