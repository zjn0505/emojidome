// 99% copied from react-tournament-bracket/lib/components

import Tooltip from "rc-tooltip"
import "rc-tooltip/assets/bootstrap_white.css"
import * as React from "react"
import controllable from "react-controllables"
import {
	Game,
	Side,
	SideInfo,
} from "react-tournament-bracket/lib/components/model"
import twemoji from "twemoji"
import * as _ from "underscore"

const toph = 0 // 12
const notext = true
const height = 40
const boty = toph + height
const globh = boty + height + toph * 2 + 4
const width = 85
const rwidth = 45

export function numberToString(x: number) {
	const THINSPACE = "\u202f"
	const thousandSep = Math.abs(x) >= 10000 ? THINSPACE : ""
	return x.toLocaleString("en-US").replace(/,/g, thousandSep)
}

interface ObjectConstructor {
	assign<T, U>(target: T, source: U): T & U
	assign<T, U, V>(target: T, source1: U, source2: V): T & U & V
	assign<T, U, V, W>(
		target: T,
		source1: U,
		source2: V,
		source3: W,
	): T & U & V & W
	assign(target: any, ...sources: any[]): any
}

if (typeof Object.assign !== "function") {
	// Must be writable: true, enumerable: false, configurable: true
	Object.defineProperty(Object, "assign", {
		value: function assign(target, varArgs) {
			// .length of function is 2
			"use strict"
			if (target === null || target === undefined) {
				throw new TypeError(
					"Cannot convert undefined or null to object",
				)
			}

			var to = Object(target)

			for (var index = 1; index < arguments.length; index++) {
				var nextSource = arguments[index]

				if (nextSource !== null && nextSource !== undefined) {
					for (var nextKey in nextSource) {
						// Avoid bugs when hasOwnProperty is shadowed
						if (
							Object.prototype.hasOwnProperty.call(
								nextSource,
								nextKey,
							)
						) {
							to[nextKey] = nextSource[nextKey]
						}
					}
				}
			}
			return to
		},
		writable: true,
		configurable: true,
	})
}

Object.assign(window, { twemoji })
interface BracketGameProps {
	game: Game
	tooltip: React.Component

	homeOnTop?: boolean
	hoveredTeamId?: string | null

	onHoveredTeamIdChange: (id: string | null) => void
	styles?: {
		backgroundColor: string
		hoverBackgroundColor: string
		scoreBackground: string
		winningScoreBackground: string
		teamNameStyle: React.CSSProperties
		teamScoreStyle: React.CSSProperties
		gameNameStyle: React.CSSProperties
		gameTimeStyle: React.CSSProperties
		teamSeparatorStyle: React.CSSProperties
	}
	topText?: (game: Game) => string
	bottomText?: (game: Game) => string
}

class BracketGame extends React.PureComponent<BracketGameProps> {
	static defaultProps: Partial<BracketGameProps> = {
		homeOnTop: true,
		hoveredTeamId: null,

		styles: {
			backgroundColor: "#eee",
			hoverBackgroundColor: "#eee",

			scoreBackground: "#787a80",
			winningScoreBackground: "#ff7324",
			teamNameStyle: {
				fill: "#fff",
				fontSize: 30,
				textShadow: "1px 1px 1px #222",
			},
			teamScoreStyle: { fill: "#23252d", fontSize: 12 },
			gameNameStyle: { fill: "#999", fontSize: 10 },
			gameTimeStyle: { fill: "#999", fontSize: 10 },
			teamSeparatorStyle: { stroke: "#444549", strokeWidth: 1 },
		},

		topText: ({ scheduled }: Game) => new Date(scheduled).toLocaleString(),
		bottomText: ({ name, bracketLabel }: Game) =>
			_.compact([name, bracketLabel]).join(" - "),
	}

	render() {
		const {
			game,
			tooltip,

			hoveredTeamId,
			onHoveredTeamIdChange,

			styles: {
				backgroundColor,
				hoverBackgroundColor,
				scoreBackground,
				winningScoreBackground,
				teamNameStyle,
				teamScoreStyle,
				gameNameStyle,
				gameTimeStyle,
				teamSeparatorStyle,
			} = {} as any,

			homeOnTop,

			topText,
			bottomText,

			...rest
		} = this.props

		const { sides } = game
		const tid = (t: { id: string } | undefined) => (t ? t.id : NaN)

		const homeTopEmoji =
			sides.home.seed && sides.home.seed.sourceGame
				? [
						sides.home.seed.sourceGame.sides.home.team,
						sides.home.seed.sourceGame.sides.visitor.team,
				  ]
						.map(tid)
						.indexOf(tid(sides.home.team)) >= 0
				: true

		const top = sides[homeTopEmoji ? Side.HOME : Side.VISITOR]
		const bottom = sides[homeTopEmoji ? Side.VISITOR : Side.HOME]

		const winnerBackground =
			top &&
			bottom &&
			top.score &&
			bottom.score &&
			top.score.score !== bottom.score.score ? (
				top.score.score > bottom.score.score ? (
					<rect
						x={width - rwidth}
						y={toph}
						width={rwidth}
						height={height}
						style={{ fill: winningScoreBackground }}
						rx="3"
						ry="3"
					/>
				) : (
					<rect
						x={width - rwidth}
						y={boty}
						width={rwidth}
						height={height}
						style={{ fill: winningScoreBackground }}
						rx="3"
						ry="3"
					/>
				)
			) : null

		interface SideComponentProps {
			x: number
			y: number
			side: SideInfo
			onHover: (id: string | null) => void
		}

		const SideComponent = ({ x, y, side, onHover }: SideComponentProps) => {
			const tooltip =
				side.seed && side.team ? (
					<title>{side.seed.displayName}</title>
				) : null

			const text = side.team
				? side.team.name
				: side.seed
				? side.seed.displayName
				: null
			let url = ""
			const emoji = twemoji.parse(text, {
				callback(icon: string, options: any) {
					url = options.base + options.size + `/${icon}.png`
				},
			})
			//console.log(emoji, url)
			return (
				<g
					onMouseEnter={() =>
						onHover(side && side.team ? side.team.id : null)
					}
					onMouseLeave={() => onHover(null)}
				>
					{/* trigger mouse events on the entire block */}
					<rect
						x={x}
						y={y}
						height={height}
						width={width}
						fillOpacity={0}
					>
						{tooltip}
					</rect>

					<image
						x={x}
						y={y}
						width={height}
						height={height}
						xlinkHref={url}
					/>

					{/*<RectClipped x={x} y={y} height={height} width={165}>
						<text
							x={x + 5}
							y={y + (height * 2) / 3}
							style={{
								...teamNameStyle,
								fontStyle:
									side.seed && side.seed.sourcePool
										? "italic"
										: null,
							}}
						>
							{tooltip}
							{side.team
								? side.team.name
								: side.seed
								? side.seed.displayName
								: null}
						</text>
                            </RectClipped>*/}

					<text
						x={x + width - rwidth / 2}
						y={y + height / 2}
						height={height}
						style={teamScoreStyle}
						textAnchor="middle"
					>
						<tspan alignmentBaseline="middle">
							{side.score
								? numberToString(side.score.score)
								: null}
						</tspan>
					</text>
				</g>
			)
		}

		const topHovered = top && top.team && top.team.id === hoveredTeamId,
			bottomHovered =
				bottom && bottom.team && bottom.team.id === hoveredTeamId

		return (
			<Tooltip overlay={tooltip}>
				<svg
					width={width}
					height={globh}
					viewBox={`0 0 ${width} ${globh}`}
					{...rest}
				>
					{/* game time */}
					{!notext && (
						<text
							x={width / 2}
							y="8"
							textAnchor="middle"
							style={gameTimeStyle}
						>
							{topText!(game)}
						</text>
					)}

					{/* backgrounds */}

					{/* base background */}
					<rect
						x="0"
						y={toph}
						width={width}
						height={height * 2}
						fill={backgroundColor}
						rx="3"
						ry="3"
					/>

					{/* background for the top team */}
					<rect
						x="0"
						y={toph}
						width={width}
						height={height}
						fill={
							topHovered ? hoverBackgroundColor : backgroundColor
						}
						rx="3"
						ry="3"
					/>
					{/* background for the bottom team */}
					<rect
						x="0"
						y={boty}
						width={width}
						height={height}
						fill={
							bottomHovered
								? hoverBackgroundColor
								: backgroundColor
						}
						rx="3"
						ry="3"
					/>

					{/* scores background */}
					<rect
						x={width - rwidth}
						y={toph}
						width={rwidth}
						height={height * 2}
						fill={scoreBackground}
						rx="3"
						ry="3"
					/>

					{/* winner background */}
					{winnerBackground}

					{/* the players */}
					{top ? (
						<SideComponent
							x={0}
							y={toph}
							side={top}
							onHover={onHoveredTeamIdChange}
						/>
					) : null}

					{bottom ? (
						<SideComponent
							x={0}
							y={boty}
							side={bottom}
							onHover={onHoveredTeamIdChange}
						/>
					) : null}

					<line
						x1="0"
						y1={boty}
						x2={width}
						y2={boty}
						style={teamSeparatorStyle}
					/>

					{/* game name */}
					{!notext && (
						<text
							x={width / 2}
							y={boty + height + toph}
							textAnchor="middle"
							style={gameNameStyle}
						>
							{bottomText!(game)}
						</text>
					)}
				</svg>
			</Tooltip>
		)
	}
}

export default controllable(BracketGame, ["hoveredTeamId"])
